import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import { scheduleCandidateInterview, type ScheduleInterviewPayload } from "@/lib/employer/api";

interface Props {
  candidateId: string;
  onScheduled: () => void;
}

export function ScheduleInterviewDialog({ candidateId, onScheduled }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [scheduledAt, setScheduledAt] = useState("");
  const [mode, setMode] = useState<ScheduleInterviewPayload["mode"] | "">("");
  const [meetingLink, setMeetingLink] = useState("");
  const [location, setLocation] = useState("");
  const [interviewerName, setInterviewerName] = useState("");
  const [interviewerEmail, setInterviewerEmail] = useState("");
  const [notes, setNotes] = useState("");

  function reset() {
    setScheduledAt("");
    setMode("");
    setMeetingLink("");
    setLocation("");
    setInterviewerName("");
    setInterviewerEmail("");
    setNotes("");
    setError(null);
  }

  async function handleSubmit() {
    if (!scheduledAt || !mode) return;

    setSubmitting(true);
    setError(null);
    try {
      await scheduleCandidateInterview(candidateId, {
        interview_date: new Date(scheduledAt).toISOString(),
        mode,
        meeting_link: meetingLink || undefined,
        location: location || undefined,
        interviewer_name: interviewerName || undefined,
        interviewer_email: interviewerEmail || undefined,
        notes: notes || undefined,
      });
      setOpen(false);
      reset();
      onScheduled();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Unable to schedule interview.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>Schedule Interview</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="scheduled_at">Date & Time</Label>
            <Input
              id="scheduled_at"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="mode">Mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as ScheduleInterviewPayload["mode"])}>
              <SelectTrigger id="mode">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === "online" && (
            <div>
              <Label htmlFor="meeting_link">Meeting Link</Label>
              <Input
                id="meeting_link"
                placeholder="https://meet.google.com/..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
            </div>
          )}

          {mode === "offline" && (
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Office address"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          )}

          <div>
            <Label htmlFor="interviewer_name">Interviewer Name</Label>
            <Input
              id="interviewer_name"
              value={interviewerName}
              onChange={(e) => setInterviewerName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="interviewer_email">Interviewer Email</Label>
            <Input
              id="interviewer_email"
              type="email"
              value={interviewerEmail}
              onChange={(e) => setInterviewerEmail(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={submitting || !scheduledAt || !mode}>
            {submitting ? "Scheduling..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
