import { CalendarDays, DollarSign, Download, MapPin } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useAcceptOffer, useRejectOffer } from "@/lib/candidate/hooks";
import type { CandidateOffer } from "@/lib/candidate/hooks";

interface Props {
  offer: CandidateOffer;
}

export default function OfferCard({ offer }: Props) {
  const accept = useAcceptOffer();
  const reject = useRejectOffer();

  return (
    <Card className="rounded-2xl p-6">
      <div className="flex justify-between">
        <div>
          <h2 className="text-xl font-bold">{offer.job_title}</h2>

          <p className="text-muted-foreground">{offer.company_name}</p>
        </div>

        <Badge>{offer.status}</Badge>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          {offer.salary} {offer.currency}
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />

          {offer.location}
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          Joining: {offer.joining_date}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {offer.offer_letter_url && (
          <Button variant="outline" asChild>
            <a href={offer.offer_letter_url} target="_blank">
              <Download className="mr-2 h-4 w-4" />
              Offer Letter
            </a>
          </Button>
        )}

        {offer.status === "sent" && (
          <>
            <Button
              onClick={() =>
                accept.mutate({
                  id: offer.id,
                })
              }
            >
              Accept
            </Button>

            <Button
              variant="destructive"
              onClick={() =>
                reject.mutate({
                  id: offer.id,
                })
              }
            >
              Reject
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
