import { useEffect, useRef, useState } from "react";
import { getJobOrderLegalization, uploadJobOrderLegalizationDocument } from "@/lib/employer/api";
import {
  documentStatusLabel,
  documentStatusStyle,
  type LegalizationDocument,
} from "@/lib/admin/legalizationDocument";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, ExternalLink, Upload } from "lucide-react";

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

  if (error) {
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

  const allSubmitted = items.every((item) => item.status !== "pending");

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

      <div className="space-y-3">
        {items.map((item) => {
          const isUploading = uploadingId === item.id;
          const rowError = uploadError[item.id];

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-border p-4 transition hover:border-blue"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-navy">{item.label}</h4>
                    {item.is_required && (
                      <Badge variant="outline" className="border-red-200 text-red-600">
                        Required
                      </Badge>
                    )}
                  </div>
                </div>

                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${documentStatusStyle(
                    item.status,
                  )}`}
                >
                  {documentStatusLabel(item.status)}
                </span>
              </div>

              {item.file_url && (
                <a
                  href={item.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  View uploaded file
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}

              {rowError && <p className="mt-2 text-xs text-red-600">{rowError}</p>}

              <div className="mt-4 flex items-center gap-3">
                <input
                  ref={(el) => {
                    fileInputs.current[item.id] = el;
                  }}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(item, e.target.files?.[0])}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  disabled={isUploading}
                  onClick={() => fileInputs.current[item.id]?.click()}
                >
                  {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {item.file_url ? "Replace file" : "Upload file"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
