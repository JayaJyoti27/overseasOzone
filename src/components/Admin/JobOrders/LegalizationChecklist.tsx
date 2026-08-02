import { useEffect, useState } from "react";
import { getJobOrderLegalization, updateJobOrderLegalizationDocument } from "@/lib/admin/api";
import {
  documentStatusLabel,
  documentStatusStyle,
  isChecklistComplete,
  isEmployerOwnedDocument,
  LEGALIZATION_DOCUMENT_STATUSES,
  type LegalizationDocument,
  type LegalizationDocumentStatus,
} from "@/lib/admin/legalizationDocument";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FileText, ExternalLink } from "lucide-react";

interface LegalizationChecklistProps {
  jobOrderId: string;
  onCompletenessChange?: (complete: boolean) => void;
}

interface RowDraft {
  status: LegalizationDocumentStatus;
  reference_number: string;
  notes: string;
}

function toDraft(item: LegalizationDocument): RowDraft {
  return {
    status: item.status,
    reference_number: item.reference_number ?? "",
    notes: item.notes ?? "",
  };
}

export function LegalizationChecklist({
  jobOrderId,
  onCompletenessChange,
}: LegalizationChecklistProps) {
  const [items, setItems] = useState<LegalizationDocument[]>([]);
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

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
      setDrafts(Object.fromEntries(data.map((item) => [item.id, toDraft(item)])));
      onCompletenessChange?.(isChecklistComplete(data));
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load checklist.");
    } finally {
      setLoading(false);
    }
  }

  function updateDraft(id: string, patch: Partial<RowDraft>) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  async function save(id: string) {
    const draft = drafts[id];
    if (!draft) return;

    setSavingId(id);
    try {
      await updateJobOrderLegalizationDocument(jobOrderId, id, {
        status: draft.status,
        reference_number: draft.reference_number || undefined,
        notes: draft.notes || undefined,
      });
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to update document.");
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-ink">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading checklist…
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

      <div className="space-y-3">
        {items.map((item) => {
          const draft = drafts[item.id] ?? toDraft(item);
          const employerOwned = isEmployerOwnedDocument(item.document_type);

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

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink">Status</label>
                  <Select
                    value={draft.status}
                    onValueChange={(value) =>
                      updateDraft(item.id, { status: value as LegalizationDocumentStatus })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEGALIZATION_DOCUMENT_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {documentStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-ink">
                    Reference Number
                  </label>
                  <Input
                    value={draft.reference_number}
                    onChange={(e) => updateDraft(item.id, { reference_number: e.target.value })}
                    placeholder="e.g. Form VI ref."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-ink">Notes</label>
                  <Input
                    value={draft.notes}
                    onChange={(e) => updateDraft(item.id, { notes: e.target.value })}
                    placeholder="Optional notes"
                  />
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <Button
                  size="sm"
                  className="rounded-full bg-navy hover:bg-blue"
                  disabled={savingId === item.id}
                  onClick={() => save(item.id)}
                >
                  {savingId === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
