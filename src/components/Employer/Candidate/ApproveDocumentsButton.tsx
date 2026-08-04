import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

import { approveCandidateDocuments } from "@/lib/employer/api";

interface Props {
  candidateId: string;
  onApproved: () => void;
}

export function ApproveDocumentsButton({ candidateId, onApproved }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    setSubmitting(true);
    setError(null);
    try {
      await approveCandidateDocuments(candidateId);
      onApproved();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Unable to approve documents.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" disabled={submitting} onClick={handleApprove}>
        <CheckCircle2 className="mr-2 h-4 w-4" />
        {submitting ? "Approving..." : "Approve Documents"}
      </Button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
