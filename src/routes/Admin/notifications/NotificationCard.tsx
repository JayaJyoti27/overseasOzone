import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, CheckCircle2 } from "lucide-react";
import { getEmployer, approveEmployer } from "@/lib/admin/api";
import { DocumentPreviewList } from "@/components/Admin/DocumentPreview";
interface Props {
  notification: any;
  onRead: () => void;
  onDelete: () => void;
}

export default function NotificationCard({ notification, onRead, onDelete }: Props) {
  const isEmployerReview = notification.type === "employer_registration";
  const employerId = notification.related_entity_id;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{notification.title}</h3>
            <p className="text-muted-foreground">{notification.message}</p>
          </div>

          <div className="flex gap-2">
            {!notification.is_read && !isEmployerReview && (
              <Button size="sm" onClick={onRead}>
                Mark Read
              </Button>
            )}

            <Button size="sm" variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>

        {isEmployerReview && employerId && (
          <EmployerReviewPanel employerId={employerId} onApproved={onRead} />
        )}
      </CardContent>
    </Card>
  );
}

function EmployerReviewPanel({
  employerId,
  onApproved,
}: {
  employerId: string;
  onApproved: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [employer, setEmployer] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const data = await getEmployer(employerId);
        if (!cancelled) setEmployer(data);
      } catch (err: any) {
        if (!cancelled) {
          setLoadError(err?.response?.data?.message ?? "Unable to load this employer.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [employerId]);

  async function approve() {
    setApproving(true);
    setApproveError(null);

    try {
      await approveEmployer(employerId);
      setApproved(true);
      onApproved();
    } catch (err: any) {
      setApproveError(err?.response?.data?.message ?? "Unable to approve this employer.");
    } finally {
      setApproving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-border p-4 text-sm text-ink">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading employer…
      </div>
    );
  }

  if (loadError) {
    return <p className="rounded-2xl border border-border p-4 text-sm text-red-600">{loadError}</p>;
  }

  if (!employer) return null;

  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink">Company</p>
          <p className="font-semibold text-navy">{employer.company_name || "—"}</p>
        </div>

        {approved || employer.approval_status === "approved" ? (
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Approved
          </span>
        ) : (
          <Button size="sm" onClick={approve} disabled={approving}>
            {approving ? "Approving…" : "Approve"}
          </Button>
        )}
      </div>

      <div className="mt-3">
        <DocumentPreviewList documents={employer.documents ?? []} />
      </div>
      {approveError && <p className="mt-2 text-sm text-red-600">{approveError}</p>}
    </div>
  );
}
