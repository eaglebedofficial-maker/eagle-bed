"""Claude API (Anthropic SDK) for extraction, analysis and the research assistant.

All AI output is classified `ai` and must cite the retrieved records it used.
"""
from __future__ import annotations

import base64
import json

from ..config import get_settings
from .base import ConfigField, Provider, ProviderError, Result


class ClaudeProvider(Provider):
    key = "anthropic"
    name = "Claude (Anthropic API)"
    category = "ai"
    description = "AI extraction from documents and web pages, review analysis, listing writing and the research assistant. Answers cite the data they used."
    classification = "ai"
    docs_url = "https://platform.claude.com/docs"
    signup_url = "https://platform.claude.com/"
    cost = "Pay per token"
    capabilities = ["structured_extraction", "pdf_extraction", "analysis", "assistant"]
    fields = [ConfigField("api_key", "API key", secret=True), ConfigField("model", "Model", required=False, placeholder="claude-opus-5-5")]

    def __init__(self, config=None, org_id=None, transport=None, client=None):
        super().__init__(config, org_id, transport)
        if not self.config.get("api_key") and get_settings().anthropic_api_key:
            self.config = {**self.config, "api_key": get_settings().anthropic_api_key}
        self._sdk = client

    @property
    def model(self) -> str:
        return self.config.get("model") or get_settings().anthropic_model

    def _client(self):  # type: ignore[override]
        if self._sdk is None:
            import anthropic
            self._sdk = anthropic.Anthropic(api_key=self.config["api_key"], max_retries=2, timeout=300)
        return self._sdk

    def health_check(self):
        self.ensure_configured()
        self._client().models.retrieve(self.model)
        return {"ok": True, "model": self.model}

    def json(self, *, system: str, prompt: str, schema: dict, pdf_bytes: bytes | None = None, effort: str = "medium", max_tokens: int = 16000) -> Result:
        """Structured JSON output validated against `schema`."""
        self.ensure_configured()
        import anthropic
        content: list = []
        if pdf_bytes:
            content.append({"type": "document", "source": {"type": "base64", "media_type": "application/pdf", "data": base64.b64encode(pdf_bytes).decode()}})
        content.append({"type": "text", "text": prompt})
        try:
            resp = self._client().beta.messages.create(
                model=self.model, max_tokens=max_tokens, system=system,
                messages=[{"role": "user", "content": content}],
                output_config={"effort": effort, "format": {"type": "json_schema", "schema": schema}},
                betas=["server-side-fallback-2026-07-01"], fallbacks="default",
            )
        except anthropic.RateLimitError:
            raise ProviderError("rate_limited", "Claude is rate limiting requests; try again shortly.", self.key, retry_after=30)
        except anthropic.AuthenticationError:
            raise ProviderError("auth_failed", "The Anthropic API key was rejected.", self.key)
        except anthropic.APIStatusError as e:
            raise ProviderError("upstream", f"Claude API error {e.status_code}: {getattr(e, 'message', '')[:200]}", self.key)
        except anthropic.APIConnectionError:
            raise ProviderError("upstream", "Could not reach the Claude API.", self.key)
        if resp.stop_reason == "refusal":
            raise ProviderError("upstream", "Claude declined this request.", self.key)
        if resp.stop_reason == "max_tokens":
            raise ProviderError("bad_response", "The AI answer was cut short; ask for less at a time.", self.key)
        text = next((b.text for b in resp.content if b.type == "text"), "")
        try:
            data = json.loads(text)
        except ValueError:
            raise ProviderError("bad_response", "The AI answer could not be read as data.", self.key)
        usage = {"input_tokens": resp.usage.input_tokens, "output_tokens": resp.usage.output_tokens, "model": resp.model}
        return Result(data, self.provenance(note=f"model {resp.model}"), usage=usage)


# Shared output contract for every AI recommendation (spec §11).
EVIDENCE_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["answer", "evidence", "assumptions", "confidence", "missing_information", "risks"],
    "properties": {
        "answer": {"type": "string", "description": "Markdown answer for the user."},
        "evidence": {"type": "array", "items": {"type": "object", "additionalProperties": False, "required": ["claim", "record_ids"],
                                                "properties": {"claim": {"type": "string"}, "record_ids": {"type": "array", "items": {"type": "string"}}}}},
        "assumptions": {"type": "array", "items": {"type": "string"}},
        "confidence": {"type": "string", "enum": ["high", "medium", "low"]},
        "missing_information": {"type": "array", "items": {"type": "string"}},
        "risks": {"type": "array", "items": {"type": "string"}},
    },
}
