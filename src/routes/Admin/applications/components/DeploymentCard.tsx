import { useEffect, useState } from "react";
import { Plane, Loader2, CheckCircle2, Ticket } from "lucide-react";

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
  getDeployments,
  createDeployment,
  addTicket,
  confirmTravel,
  markDeparted,
  markArrived,
  completeDeployment,
} from "@/lib/recruitment/api";

interface Props {
  applicationId: string;
}

const emptyTicketForm = {
  ticket_number: "",
  airline_name: "",
  flight_number: "",
  departure_airport: "",
  arrival_airport: "",
  departure_time: "",
  arrival_time: "",
};

export default function DeploymentCard({ applicationId }: Props) {
  const [loading, setLoading] = useState(true);
  const [deployments, setDeployments] = useState<any[]>([]);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [ticketDialogDeploymentId, setTicketDialogDeploymentId] = useState<string | null>(null);
  const [ticketForm, setTicketForm] = useState(emptyTicketForm);
  const [savingTicket, setSavingTicket] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [applicationId]);

  async function load() {
    setLoading(true);

    try {
      const data = await getDeployments(applicationId);

      setDeployments(data.deployments ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setCreating(true);
    setCreateError(null);
    try {
      await createDeployment(applicationId);
      await load();
    } catch (err) {
      console.error("Failed to create deployment", err);
      setCreateError(
        err instanceof Error ? err.message : "Couldn't create the deployment. Try again.",
      );
    } finally {
      setCreating(false);
    }
  }

  function openTicketDialog(id: string) {
    setTicketDialogDeploymentId(id);
    setTicketForm(emptyTicketForm);
    setTicketError(null);
  }

  const ticketFormComplete = Object.values(ticketForm).every((v) => v.trim() !== "");

  async function handleAddTicket() {
    if (!ticketDialogDeploymentId || !ticketFormComplete) return;

    setSavingTicket(true);
    setTicketError(null);
    try {
      await addTicket(ticketDialogDeploymentId, ticketForm);
      setTicketDialogDeploymentId(null);
      await load();
    } catch (err) {
      console.error("Failed to add ticket", err);
      setTicketError(
        err instanceof Error ? err.message : "Couldn't save ticket details. Try again.",
      );
    } finally {
      setSavingTicket(false);
    }
  }

  async function travel(id: string) {
    await confirmTravel(id);
    load();
  }

  async function departed(id: string) {
    await markDeparted(id);
    load();
  }

  async function arrived(id: string) {
    await markArrived(id);
    load();
  }

  async function complete(id: string) {
    const remarks = prompt("Deployment completion remarks") ?? "";

    await completeDeployment(id, remarks);

    load();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deployment</CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin" />
          </div>
        ) : deployments.length === 0 ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">No deployment created yet.</p>

            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "Creating..." : "Create Deployment"}
            </Button>

            {createError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{createError}</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {deployments.map((deployment) => (
              <div key={deployment.id} className="rounded-lg border p-4">
                <div className="flex justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Plane className="h-4 w-4" />

                      <span className="font-medium">
                        {deployment.flight_number ?? "Deployment"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {deployment.departure_time
                        ? new Date(deployment.departure_time).toLocaleString()
                        : "No ticket added yet"}
                    </p>
                  </div>

                  <Badge>{deployment.status}</Badge>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Dialog
                    open={ticketDialogDeploymentId === deployment.id}
                    onOpenChange={(open) => {
                      if (open) {
                        openTicketDialog(deployment.id);
                      } else {
                        setTicketDialogDeploymentId(null);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm" variant="secondary">
                        <Ticket className="mr-2 h-4 w-4" />
                        Add Ticket
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Ticket Details</DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4 py-2">
                        <div>
                          <Label htmlFor="ticket_number">Ticket Number</Label>
                          <Input
                            id="ticket_number"
                            value={ticketForm.ticket_number}
                            onChange={(e) =>
                              setTicketForm((f) => ({ ...f, ticket_number: e.target.value }))
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="airline_name">Airline</Label>
                          <Input
                            id="airline_name"
                            value={ticketForm.airline_name}
                            onChange={(e) =>
                              setTicketForm((f) => ({ ...f, airline_name: e.target.value }))
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="flight_number">Flight Number</Label>
                          <Input
                            id="flight_number"
                            value={ticketForm.flight_number}
                            onChange={(e) =>
                              setTicketForm((f) => ({ ...f, flight_number: e.target.value }))
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="departure_airport">Departure Airport</Label>
                          <Input
                            id="departure_airport"
                            value={ticketForm.departure_airport}
                            onChange={(e) =>
                              setTicketForm((f) => ({ ...f, departure_airport: e.target.value }))
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="arrival_airport">Arrival Airport</Label>
                          <Input
                            id="arrival_airport"
                            value={ticketForm.arrival_airport}
                            onChange={(e) =>
                              setTicketForm((f) => ({ ...f, arrival_airport: e.target.value }))
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="departure_time">Departure Time</Label>
                          <Input
                            id="departure_time"
                            type="datetime-local"
                            value={ticketForm.departure_time}
                            onChange={(e) =>
                              setTicketForm((f) => ({ ...f, departure_time: e.target.value }))
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="arrival_time">Arrival Time</Label>
                          <Input
                            id="arrival_time"
                            type="datetime-local"
                            value={ticketForm.arrival_time}
                            onChange={(e) =>
                              setTicketForm((f) => ({ ...f, arrival_time: e.target.value }))
                            }
                          />
                        </div>

                        {ticketError && (
                          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                            {ticketError}
                          </p>
                        )}
                      </div>

                      <DialogFooter>
                        <Button
                          onClick={handleAddTicket}
                          disabled={savingTicket || !ticketFormComplete}
                        >
                          {savingTicket ? "Saving..." : "Confirm"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button size="sm" onClick={() => travel(deployment.id)}>
                    Confirm Travel
                  </Button>

                  <Button size="sm" variant="secondary" onClick={() => departed(deployment.id)}>
                    Departed
                  </Button>

                  <Button size="sm" onClick={() => arrived(deployment.id)}>
                    Arrived
                  </Button>

                  <Button size="sm" variant="default" onClick={() => complete(deployment.id)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Complete
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
