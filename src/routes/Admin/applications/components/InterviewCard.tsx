import { useEffect, useState } from "react";
import { CalendarDays, ExternalLink, Loader2, MapPin, User } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

import { getInterviews, scheduleInterview } from "@/lib/recruitment/api";

interface Props {
  applicationId: string;
  // Needed by the backend to link the interview to the job order being
  // interviewed for - without it scheduleInterview fails silently.
  jobOrderId?: string;
}

const INTERVIEW_MODES = [
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
  { value: "phone", label: "Phone" },
] as const;

export default function InterviewCard({ applicationId, jobOrderId }: Props) {
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<any[]>([]);

  const [scheduling, setScheduling] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [scheduledAt, setScheduledAt] = useState("");
  const [mode, setMode] = useState<(typeof INTERVIEW_MODES)[number]["value"] | "">("");
  const [meetingLink, setMeetingLink] = useState("");
  const [location, setLocation] = useState("");
  const [interviewerName, setInterviewerName] = useState("");
  const [interviewerEmail, setInterviewerEmail] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    load();
  }, [applicationId]);

  async function load() {
    setLoading(true);
    try {
      const data = await getInterviews(applicationId);
      setInterviews(data.interviews ?? []);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setScheduledAt("");
    setMode("");
    setMeetingLink("");
    setLocation("");
    setInterviewerName("");
    setInterviewerEmail("");
    setNotes("");
    setError(null);
  }

  async function handleSchedule() {
    if (!scheduledAt || !mode) return;

    if (!jobOrderId) {
      setError("This application has no linked job order - can't schedule an interview.");
      return;
    }

    setScheduling(true);
    setError(null);
    try {
      await scheduleInterview(applicationId, {
        job_order_id: jobOrderId,
        interview_date: new Date(scheduledAt).toISOString(),
        mode,
        meeting_link: mode === "online" ? meetingLink || undefined : undefined,
        location: mode === "offline" ? location || undefined : undefined,
        interviewer_name: interviewerName || undefined,
        interviewer_email: interviewerEmail || undefined,
        notes: notes || undefined,
      });
      setDialogOpen(false);
      resetForm();
      await load(); // refresh list
    } catch (err: any) {
      console.error("Failed to schedule interview", err);
      setError(err?.response?.data?.message ?? "Unable to schedule interview. Please try again.");
    } finally {
      setScheduling(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Interviews</CardTitle>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm">Schedule</Button>
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
                <Select
                  value={mode}
                  onValueChange={(v) => setMode(v as (typeof INTERVIEW_MODES)[number]["value"])}
                >
                  <SelectTrigger id="mode">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERVIEW_MODES.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
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
                  <p className="mt-1 text-xs text-muted-foreground">
                    Shown to both the candidate and the employer once scheduled.
                  </p>
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
                <Textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            <DialogFooter>
              <Button onClick={handleSchedule} disabled={scheduling || !scheduledAt || !mode}>
                {scheduling ? "Scheduling..." : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin" />
          </div>
        ) : interviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No interviews scheduled.</p>
        ) : (
          <div className="space-y-4">
            {interviews.map((interview) => (
              <div key={interview.id} className="rounded-lg border p-4">
                <div className="flex justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      <span className="font-medium">
                        {interview.interviewer_name ?? "Interview"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {interview.interview_date
                        ? new Date(interview.interview_date).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                  <Badge>{interview.status}</Badge>
                </div>

                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {interview.interviewer_email && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {interview.interviewer_email}
                    </div>
                  )}

                  {interview.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {interview.location}
                    </div>
                  )}
                </div>

                {interview.meeting_link && (
                  <Button size="sm" className="mt-3" asChild>
                    <a href={interview.meeting_link} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Join Interview
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
