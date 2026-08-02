import { Bookmark } from "lucide-react";

import { Card } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

export default function SavedJobsSidebar() {
  return (
    <Card className="rounded-2xl border-none bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold text-navy">
          <Bookmark className="h-4 w-4 text-blue" />
          Saved Jobs
        </h2>

        <Badge variant="secondary" className="bg-blue-wash text-navy">
          Coming Soon
        </Badge>
      </div>

      <div className="mt-6 text-sm text-muted-foreground">Saved jobs will appear here.</div>
    </Card>
  );
}
