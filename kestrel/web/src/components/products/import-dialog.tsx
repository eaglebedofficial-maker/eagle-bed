"use client";
/* CSV / Product Pilot extension import → POST /api/products/import (multipart: file or text, marketplace). */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, FileUp, Upload } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import type { ProductBrief } from "@/components/app/product";
import { ProductThumb } from "@/components/app/product";
import { Dialog } from "@/components/ui/overlay";
import { Badge, Button, Field, Segmented, Textarea } from "@/components/ui/primitives";
import { api, errorMessage } from "@/lib/api";
import { useSession } from "@/lib/session";
import { cn, money } from "@/lib/utils";

const CSV_COLUMNS = ["ASIN (required)", "Title", "Brand", "Price", "BSR / Sales rank", "Category", "Rating", "Reviews", "Offers", "Weight g / Weight kg", "EAN", "UPC", "Unit cost", "Bought past month"];

export function ImportDialog({ open, onOpenChange, onImported }: { open: boolean; onOpenChange: (v: boolean) => void; onImported?: (items: ProductBrief[]) => void }) {
  const qc = useQueryClient();
  const { marketplace, marketplaces, can } = useSession();
  const [mode, setMode] = React.useState<"file" | "paste">("file");
  const [file, setFile] = React.useState<File | null>(null);
  const [text, setText] = React.useState("");
  const [mkt, setMkt] = React.useState(marketplace);
  const [drag, setDrag] = React.useState(false);
  const [result, setResult] = React.useState<{ imported: number; items: ProductBrief[] } | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => { if (open) { setResult(null); setMkt(marketplace); } }, [open, marketplace]);

  const run = useMutation({
    mutationFn: () => {
      const form = new FormData();
      if (mode === "file" && file) form.append("file", file);
      else form.append("text", text);
      form.append("marketplace", mkt);
      return api<{ imported: number; items: ProductBrief[] }>("/products/import", { form });
    },
    onSuccess: (r) => {
      setResult(r);
      toast.success(r.imported ? `Imported ${r.imported} product${r.imported === 1 ? "" : "s"}` : "No rows with a valid ASIN were found");
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product-facets"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      onImported?.(r.items);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const ready = mode === "file" ? !!file : text.trim().length > 0;
  const reset = () => { setFile(null); setText(""); setResult(null); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="lg" title="Import products"
      description="Bring in products from a CSV or the Product Pilot browser extension. Imported figures are marked “Your data”; Kestrel then calculates estimates, fees and a score from them."
      footer={result ? <><Button variant="secondary" onClick={reset}>Import more</Button><Button onClick={() => onOpenChange(false)}>Done</Button></> : (
        <><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={!ready || !can("analyst")} loading={run.isPending} onClick={() => run.mutate()}><Upload />Import</Button></>
      )}>
      {result ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-4">
            <CheckCircle2 className="size-5 shrink-0 text-success" />
            <div className="text-sm"><b className="num">{result.imported}</b> product{result.imported === 1 ? "" : "s"} imported or updated. Estimates and scores were recalculated.</div>
          </div>
          {result.items.length > 0 && (
            <ul className="max-h-72 divide-y divide-line overflow-y-auto rounded-xl border border-line">
              {result.items.slice(0, 50).map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-3 py-2">
                  <ProductThumb src={p.image_url} size={32} />
                  <Link href={`/products/${p.id}`} className="min-w-0 flex-1 truncate text-[13px] hover:text-primary">{p.title || p.asin}</Link>
                  <span className="font-mono text-2xs text-subtle">{p.asin}</span>
                  <span className="w-20 text-right text-[13px] num">{money(p.price, p.currency)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented value={mode} onChange={setMode} options={[{ value: "file", label: "Upload CSV" }, { value: "paste", label: "Paste CSV or extension JSON" }]} />
            <label className="flex items-center gap-2 text-[13px] text-muted">Marketplace
              <select value={mkt} onChange={(e) => setMkt(e.target.value)} className="h-8 rounded-lg border border-line bg-surface px-2 text-[13px] text-fg" aria-label="Marketplace for CSV rows">
                {(marketplaces.length ? marketplaces : [{ code: marketplace, name: marketplace }]).map((m) => <option key={m.code} value={m.code}>{m.code}</option>)}
              </select>
            </label>
          </div>
          {mode === "file" ? (
            <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) setFile(f); }}
              className={cn("flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors", drag ? "border-primary bg-primary-soft/40" : "border-line-strong bg-surface-2")}>
              <FileUp className="mb-3 size-6 text-muted" />
              {file ? <div className="text-sm"><b>{file.name}</b> <span className="text-muted">· {(file.size / 1024).toFixed(1)} KB</span></div> : <div className="text-sm text-muted">Drop a .csv file here, or</div>}
              <Button variant="secondary" size="sm" className="mt-3" onClick={() => inputRef.current?.click()}>{file ? "Choose another file" : "Choose file"}</Button>
              <input ref={inputRef} type="file" accept=".csv,.json,text/csv,application/json" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
          ) : (
            <Field label="CSV rows or extension JSON" hint="JSON copied from the Product Pilot extension starts with “{” and carries its own marketplace.">
              <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[180px] font-mono text-xs" placeholder={"ASIN,Title,Price,BSR,Reviews\nB0EXAMPLE1,Bamboo cutting board,19.99,1450,320"} />
            </Field>
          )}
          <div className="rounded-xl border border-line p-3">
            <div className="mb-2 text-xs font-medium text-muted">Recognised CSV columns (header names are case-insensitive)</div>
            <div className="flex flex-wrap gap-1.5">{CSV_COLUMNS.map((c) => <Badge key={c} size="sm">{c}</Badge>)}</div>
          </div>
          {!can("analyst") && <p className="text-xs text-warning">Viewers can't import data. Ask an analyst or admin.</p>}
        </div>
      )}
    </Dialog>
  );
}
