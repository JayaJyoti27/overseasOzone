import { useEffect, useRef, useState } from "react";
import { getJobOrderLegalization, uploadJobOrderLegalizationDocument } from "@/lib/employer/api";
import {
  documentStatusLabel,
  documentStatusStyle,
  type LegalizationDocument,
} from "@/lib/admin/legalizationDocument";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Upload } from "lucide-react";

interface LegalizationDocumentsCardProps {
  jobOrderId: string;
}

export function LegalizationDocumentsCard({ jobOrderId }: LegalizationDocumentsCardProps) {
  const [items, setItems] = useState<LegalizationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<Record<string, string>>({});

  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobOrderId]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data: LegalizationDocument[] = await getJobOrderLegalization(jobOrderId);
      setItems(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileChange(item: LegalizationDocument, file: File | undefined) {
    if (!file) return;

    setUploadingId(item.id);
    setUploadError((prev) => ({ ...prev, [item.id]: "" }));
    try {
      await uploadJobOrderLegalizationDocument(jobOrderId, item.id, file);
      await load();
    } catch (err: any) {
      setUploadError((prev) => ({
        ...prev,
        [item.id]: err?.response?.data?.message || err?.message || "Upload failed.",
      }));
    } finally {
      setUploadingId(null);
      const input = fileInputs.current[item.id];
      if (input) input.value = "";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading documents…
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="space-y-2 py-4 text-center">
        <p className="text-sm font-medium text-red-600">{error}</p>
        <Button variant="outline" size="sm" className="rounded-full" onClick={load}>
          Try again
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        Legalization hasn't been started for this job order yet.
      </p>
    );
  }

  const requiredItems = items.filter((item) => item.is_required);
  const allSubmitted = (requiredItems.length > 0 ? requiredItems : items).every(
    (item) => item.status !== "pending",
  );

  return (
    <div className="space-y-4">
      <div
        className={`rounded-2xl px-4 py-3 text-sm font-medium ${
          allSubmitted ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
        }`}
      >
        {allSubmitted
          ? "You've submitted all required documents. Our team will review and attest them shortly."
          : "Please upload the documents below so we can proceed with legalization."}
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => {
          const isUploading = uploadingId === item.id;
          const rowError = uploadError[item.id];

          return (
            <div
              key={item.id}
              className="flex aspect-square flex-col justify-between rounded-2xl border border-border p-3 transition hover:border-blue"
            >
              <div className="flex items-start justify-between gap-1">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${documentStatusStyle(
                    item.status,
                  )}`}
                >
                  {documentStatusLabel(item.status)}
                </span>
                {item.is_required && (
                  <span className="mt-0.5 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-red-500">
                    Required
                  </span>
                )}
              </div>

              <h4
                className="mt-2 line-clamp-3 text-xs font-semibold leading-snug text-navy"
                title={item.label}
              >
                {item.label}
              </h4>

              <div className="mt-2 flex items-center gap-1.5">
                <input
                  ref={(el) => {
                    fileInputs.current[item.id] = el;
                  }}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(item, e.target.files?.[0])}
                />

                {item.file_url && (
                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noreferrer"
                    title="View uploaded file"
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-border text-blue transition hover:border-blue"
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </a>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 flex-1 rounded-full px-2 text-[11px]"
                  disabled={isUploading}
                  onClick={() => fileInputs.current[item.id]?.click()}
                  title={item.file_url ? "Replace file" : "Upload file"}
                >
                  {isUploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Upload className="mr-1 h-3.5 w-3.5" />
                      {item.file_url ? "Replace" : "Upload"}
                    </>
                  )}
                </Button>
              </div>

              {rowError && <p className="mt-1 line-clamp-2 text-[10px] text-red-600">{rowError}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
