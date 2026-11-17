import { api } from "@/lib/api";

export type UploadResult = { id: number; pages: number; has_text: boolean; meta: Record<string, string | number> };

export const ACCEPTED_DOCS = "application/pdf,image/png,image/jpeg,.pdf,.png,.jpg,.jpeg";

/** POST /documents (multipart): file, kind, supplier_id. */
export function uploadDocument(file: File, opts: { kind?: string; supplierId?: number | null } = {}) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("kind", opts.kind ?? "invoice");
  if (opts.supplierId) fd.append("supplier_id", String(opts.supplierId));
  return api<UploadResult>("/documents", { form: fd });
}

/** Opens GET /documents/{id}/file in a new tab, sending the organisation header. */
export async function openDocument(id: number) {
  const w = window.open("", "_blank");
  try {
    const r = await api<Response>(`/documents/${id}/file`, { raw: true });
    const url = URL.createObjectURL(await r.blob());
    if (w) w.location.href = url; else window.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (e) {
    w?.close();
    throw e;
  }
}

export function fileSize(n?: number | null) {
  if (n == null) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
