import { useEffect, useState } from "react";
import { getJobOrderLegalization, updateJobOrderLegalizationDocument } from "@/lib/admin/api";
import {
  documentStatusLabel,
  documentStatusStyle,
  isChecklistComplete,
  isEmployerOwnedDocument,
  type LegalizationDocument,
} from "@/lib/admin/legalizationDocument";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, FileText, ExternalLink, Check, X } from "lucide-react";

interface LegalizationChecklistProps {
  jobOrderId: string;
  onCompletenessChange?: (complete: boolean) => void;
}

export function LegalizationChecklist({
  jobOrderId,
  onCompletenessChange,
}: LegalizationChecklistProps) {
  const [items, setItems] = useState<LegalizationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Track which document is mid-request so we can disable just that row's
  // controls without locking the whole list.
  const [pendingId, setPendingId] = useState<string | null>(null);

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
      onCompletenessChange?.(isChecklistComplete(data));
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load checklist.");
    } finally {
      setLoading(false);
    }
  }

  async function updateDocument(id: string, patch: Record<string, unknown>) {
    setPendingId(id);
    setError(null);
    try {
      await updateJobOrderLegalizationDocument(jobOrderId, id, patch);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to update document.");
    } finally {
      setPendingId(null);
    }
  }

  const approve = (id: string) => updateDocument(id, { status: "attested" });
  const reject = (id: string) => updateDocument(id, { status: "rejected" });
  const toggleRequired = (item: LegalizationDocument) =>
    updateDocument(item.id, { is_required: !item.is_required });

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-ink">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading checklist…
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
      <p className="py-4 text-sm text-ink">
        Legalization hasn't been started for this job order yet.
      </p>
    );
  }

  const complete = isChecklistComplete(items);

  return (
    <div className="space-y-4">
      <div
        className={`rounded-2xl px-4 py-3 text-sm font-medium ${
          complete ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
        }`}
      >
        {complete
          ? "All required documents are attested. This job order can be approved for recruitment."
          : "Approval for recruitment is blocked until every required document below is marked Attested."}
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <div className="space-y-3">
        {items.map((item) => {
          const employerOwned = isEmployerOwnedDocument(item.document_type);
          const isPending = pendingId === item.id;
          const isAttested = item.status === "attested";
          const isRejected = item.status === "rejected";

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
                    {employerOwned && (
                      <Badge variant="outline" className="border-blue-200 text-blue">
                        Employer-uploaded
                      </Badge>
                    )}
                  </div>
                  {item.authority && <p className="mt-1 text-sm text-ink">{item.authority}</p>}
                </div>

                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${documentStatusStyle(
                    item.status,
                  )}`}
                >
                  {documentStatusLabel(item.status)}
                </span>
              </div>

              {item.file_url ? (
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
              ) : (
                <p className="mt-3 text-sm text-ink">Not uploaded yet.</p>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                <label className="flex items-center gap-2 text-xs font-medium text-ink">
                  <Switch
                    checked={item.is_required}
                    disabled={isPending}
                    onCheckedChange={() => toggleRequired(item)}
                  />
                  Required for this job order
                </label>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full border-red-200 text-red-600 hover:bg-red-50"
                    disabled={isPending || !item.file_url || isRejected}
                    onClick={() => reject(item.id)}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <X className="mr-1.5 h-4 w-4" />
                        Reject
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-full bg-navy hover:bg-blue"
                    disabled={isPending || !item.file_url || isAttested}
                    onClick={() => approve(item.id)}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="mr-1.5 h-4 w-4" />
                        {isAttested ? "Attested" : "Approve"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
