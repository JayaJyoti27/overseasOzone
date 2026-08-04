import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import { completeCandidateInterview } from "@/lib/employer/api";

interface Props {
  candidateId: string;
  onCompleted: () => void;
}

export function CompleteInterviewDialog({ candidateId, onCompleted }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  async function submit(result: "selected" | "rejected") {
    setSubmitting(true);
    setError(null);
    try {
      await completeCandidateInterview(candidateId, result, feedback || undefined);
      setOpen(false);
      setFeedback("");
      onCompleted();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Unable to mark the interview as done.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Mark Interview Done
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Interview Outcome</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="feedback">Feedback (optional)</Label>
            <Textarea
              id="feedback"
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Notes on how the interview went..."
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="destructive" disabled={submitting} onClick={() => submit("rejected")}>
            {submitting ? "Saving..." : "Not Selected"}
          </Button>

          <Button disabled={submitting} onClick={() => submit("selected")}>
            {submitting ? "Saving..." : "Selected"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
