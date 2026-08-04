import { useEffect, useState } from "react";
import { HeartPulse, Loader2, CheckCircle2, RotateCcw, XCircle } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  getMedicals,
  markMedicalFit,
  markMedicalRetest,
  markMedicalUnfit,
  scheduleMedical,
} from "@/lib/recruitment/api";

interface Props {
  applicationId: string;
}

export default function MedicalCard({ applicationId }: Props) {
  const [loading, setLoading] = useState(true);
  const [medicals, setMedicals] = useState<any[]>([]);

  const [scheduling, setScheduling] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hospitalName, setHospitalName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [applicationId]);

  async function load() {
    setLoading(true);
    try {
      const data = await getMedicals(applicationId);
      setMedicals(data.medicals ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function handleSchedule() {
    if (!hospitalName || !examDate) return;

    setScheduling(true);
    setScheduleError(null);
    try {
      await scheduleMedical(applicationId, {
        hospital_name: hospitalName,
        exam_date: new Date(examDate).toISOString(),
      });
      setDialogOpen(false);
      setHospitalName("");
      setExamDate("");
      await load();
    } catch (err) {
      console.error("Failed to schedule medical", err);
      setScheduleError(
        err instanceof Error ? err.message : "Couldn't schedule the medical. Try again.",
      );
    } finally {
      setScheduling(false);
    }
  }

  async function fit(id: string) {
    await markMedicalFit(id);
    load();
  }

  async function unfit(id: string) {
    const remarks = prompt("Reason") ?? "";
    await markMedicalUnfit(id, remarks);
    load();
  }

  async function retest(id: string) {
    const remarks = prompt("Retest remarks") ?? "";
    await markMedicalRetest(id, remarks);
    load();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medical</CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin" />
          </div>
        ) : medicals.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">No medical scheduled.</p>

            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) setScheduleError(null);
              }}
            >
              <DialogTrigger asChild>
                <Button>Schedule Medical</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Medical</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div>
                    <Label htmlFor="hospital_name">Hospital</Label>
                    <Input
                      id="hospital_name"
                      placeholder="Hospital name"
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="exam_date">Exam Date</Label>
                    <Input
                      id="exam_date"
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                    />
                  </div>

                  {scheduleError && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                      {scheduleError}
                    </p>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    onClick={handleSchedule}
                    disabled={scheduling || !hospitalName || !examDate}
                  >
                    {scheduling ? "Scheduling..." : "Confirm"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-4">
            {medicals.map((medical) => (
              <div key={medical.id} className="rounded-lg border p-4">
                <div className="flex justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <HeartPulse className="h-4 w-4" />
                      <span className="font-medium">{medical.hospital_name ?? "Medical"}</span>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {medical.exam_date ? new Date(medical.exam_date).toLocaleDateString() : "-"}
                    </p>
                  </div>

                  <Badge>{medical.status}</Badge>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => fit(medical.id)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Fit
                  </Button>

                  <Button size="sm" variant="secondary" onClick={() => retest(medical.id)}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Retest
                  </Button>

                  <Button size="sm" variant="destructive" onClick={() => unfit(medical.id)}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Unfit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
