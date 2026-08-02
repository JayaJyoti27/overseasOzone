import { useMemo } from "react";

import { X } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { useJobs } from "@/lib/candidate/hooks";

interface Props {
  country: string;
  category: string;
  onCountryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onClear: () => void;
}

export default function JobFilters({
  country,
  category,
  onCountryChange,
  onCategoryChange,
  onClear,
}: Props) {
  // Options come from whatever jobs are actually posted, not a fixed
  // guessed list - so this never shows a country/sector with zero jobs
  // in it, and never omits a real one.
  const { data: allJobs } = useJobs();

  const countries = useMemo(
    () => [...new Set((allJobs ?? []).map((j) => j.country).filter(Boolean))].sort(),
    [allJobs],
  );

  const sectors = useMemo(
    () => [...new Set((allJobs ?? []).map((j) => j.sector).filter(Boolean))].sort(),
    [allJobs],
  );

  const hasActiveFilters = !!country || !!category;

  return (
    <Card className="rounded-2xl p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-semibold">Filters</h2>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" onClick={onClear}>
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <Select value={country || undefined} onValueChange={onCountryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Country" />
          </SelectTrigger>

          <SelectContent>
            {countries.length === 0 && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">No jobs posted yet</div>
            )}

            {countries.map((c) => (
              <SelectItem key={c} value={c as string}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={category || undefined} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sector" />
          </SelectTrigger>

          <SelectContent>
            {sectors.length === 0 && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">No jobs posted yet</div>
            )}

            {sectors.map((s) => (
              <SelectItem key={s} value={s as string}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}
