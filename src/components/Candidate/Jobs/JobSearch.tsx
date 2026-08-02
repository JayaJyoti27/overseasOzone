import { Search, X } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function JobSearch({ value, onChange }: Props) {
  return (
    <Card className="rounded-2xl border-none bg-white p-5 shadow-card">
      <label htmlFor="job-search" className="mb-2 block text-sm font-semibold text-navy">
        Search jobs
      </label>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          id="job-search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Job title, company, or country"
          className="h-11 rounded-xl border-border bg-blue-wash/60 pl-10 pr-9 text-sm placeholder:text-muted-foreground focus-visible:bg-white"
        />

        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange("")}
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-navy"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
