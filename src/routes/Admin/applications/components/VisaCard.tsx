import { useEffect, useState } from "react";
import { BadgeCheck, Loader2, IdCard } from "lucide-react";

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
  getVisas,
  createVisa,
  submitVisa,
  approveVisa,
  issueVisa,
  rejectVisa,
} from "@/lib/recruitment/api";

interface Props {
  applicationId: string;
}

export default function VisaCard({ applicationId }: Props) {
  const [loading, setLoading] = useState(true);
  const [visas, setVisas] = useState<any[]>([]);

  const [creating, setCreating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [passportNumber, setPassportNumber] = useState("");
  const [embassyName, setEmbassyName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const [approving, setApproving] = useState(false);
  const [approveDialogVisaId, setApproveDialogVisaId] = useState<string | null>(null);
  const [visaNumber, setVisaNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [approveError, setApproveError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [applicationId]);

  async function load() {
    setLoading(true);

    try {
      const data = await getVisas(applicationId);
      setVisas(data.visas ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!passportNumber || !embassyName) return;

    setCreating(true);
    setCreateError(null);
    try {
      await createVisa(applicationId, {
        passport_number: passportNumber,
        embassy_name: embassyName,
      });
      setCreateDialogOpen(false);
      setPassportNumber("");
      setEmbassyName("");
      await load();
    } catch (err) {
      console.error("Failed to create visa", err);
      setCreateError(
        err instanceof Error ? err.message : "Couldn't create the visa record. Try again.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function submit(id: string) {
    await submitVisa(id);
    load();
  }

  function openApproveDialog(id: string) {
    setApproveDialogVisaId(id);
    setVisaNumber("");
    setIssueDate("");
    setExpiryDate("");
    setApproveError(null);
  }

  async function handleApprove() {
    if (!approveDialogVisaId || !visaNumber || !issueDate || !expiryDate) return;

    setApproving(true);
    setApproveError(null);
    try {
      await approveVisa(approveDialogVisaId, {
        visaNumber,
        issueDate,
        expiryDate,
      });
      setApproveDialogVisaId(null);
      await load();
    } catch (err) {
      console.error("Failed to approve visa", err);
      setApproveError(err instanceof Error ? err.message : "Couldn't approve the visa. Try again.");
    } finally {
      setApproving(false);
    }
  }

  async function issue(id: string) {
    await issueVisa(id);
    load();
  }

  async function reject(id: string) {
    const remarks = prompt("Reason") ?? "";

    await rejectVisa(id, remarks);

    load();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visa</CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin" />
          </div>
        ) : visas.length === 0 ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">No visa created.</p>

            <Dialog
              open={createDialogOpen}
              onOpenChange={(open) => {
                setCreateDialogOpen(open);
                if (!open) setCreateError(null);
              }}
            >
              <DialogTrigger asChild>
                <Button>Create Visa</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Visa</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div>
                    <Label htmlFor="passport_number">Passport Number</Label>
                    <Input
                      id="passport_number"
                      placeholder="Passport number"
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="embassy_name">Embassy</Label>
                    <Input
                      id="embassy_name"
                      placeholder="Embassy name"
                      value={embassyName}
                      onChange={(e) => setEmbassyName(e.target.value)}
                    />
                  </div>

                  {createError && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                      {createError}
                    </p>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    onClick={handleCreate}
                    disabled={creating || !passportNumber || !embassyName}
                  >
                    {creating ? "Creating..." : "Confirm"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-4">
            {visas.map((visa) => (
              <div key={visa.id} className="rounded-lg border p-4">
                <div className="flex justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <IdCard className="h-4 w-4" />

                      <span className="font-medium">{visa.visa_number ?? "Pending"}</span>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">{visa.embassy_name}</p>
                  </div>

                  <Badge>{visa.status}</Badge>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => submit(visa.id)}>
                    Submit
                  </Button>

                  <Dialog
                    open={approveDialogVisaId === visa.id}
                    onOpenChange={(open) => {
                      if (open) {
                        openApproveDialog(visa.id);
                      } else {
                        setApproveDialogVisaId(null);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm" variant="secondary">
                        <BadgeCheck className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Approve Visa</DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4 py-2">
                        <div>
                          <Label htmlFor="visa_number">Visa Number</Label>
                          <Input
                            id="visa_number"
                            placeholder="Visa number"
                            value={visaNumber}
                            onChange={(e) => setVisaNumber(e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="issue_date">Issue Date</Label>
                          <Input
                            id="issue_date"
                            type="date"
                            value={issueDate}
                            onChange={(e) => setIssueDate(e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="expiry_date">Expiry Date</Label>
                          <Input
                            id="expiry_date"
                            type="date"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                          />
                        </div>

                        {approveError && (
                          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                            {approveError}
                          </p>
                        )}
                      </div>

                      <DialogFooter>
                        <Button
                          onClick={handleApprove}
                          disabled={approving || !visaNumber || !issueDate || !expiryDate}
                        >
                          {approving ? "Approving..." : "Confirm"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button size="sm" onClick={() => issue(visa.id)}>
                    Issue
                  </Button>

                  <Button size="sm" variant="destructive" onClick={() => reject(visa.id)}>
                    Reject
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
