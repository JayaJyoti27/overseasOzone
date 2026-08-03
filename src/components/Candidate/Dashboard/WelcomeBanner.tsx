import { Link } from "@tanstack/react-router";
import { PartyPopper, UserRound, FileUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function WelcomeBanner() {
  return (
    <Card className="relative overflow-hidden rounded-2xl border-none bg-navy p-6 text-white shadow-card sm:p-8">
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10">
            <PartyPopper className="h-6 w-6 text-gold" />
          </div>

          <div>
            <h2 className="font-display text-xl font-bold">Welcome to Ozone Overseas!</h2>
            <p className="mt-1 max-w-md text-sm text-white/80">
              You're all signed up. Complete your profile and upload your documents so
              employers can see you're ready to be shortlisted.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button asChild variant="secondary" className="bg-white text-navy hover:bg-white/90">
            <Link to="/Candidates/profile">
              <UserRound className="mr-2 h-4 w-4" />
              Complete Profile
            </Link>
          </Button>

          <Button asChild variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
            <Link to="/Candidates/documents">
              <FileUp className="mr-2 h-4 w-4" />
              Upload Documents
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
