import { Badge } from "@/components/ui/badge";
import { APPLICATION_STATUS_LABELS, isApplicationStatus } from "@/lib/admin/applicationStatus";

interface Props {
  candidate: { id: string; full_name: string };
  application: { internal_status: string } | null;
}

export function CandidateHeader({ candidate, application }: Props) {
  const status = application?.internal_status;

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">{candidate.full_name}</h1>

        <p className="text-muted-foreground">{candidate.id}</p>
      </div>

      <Badge className="px-4 py-2">
        {isApplicationStatus(status) ? APPLICATION_STATUS_LABELS[status] : (status ?? "—")}
      </Badge>
    </div>
  );
}
