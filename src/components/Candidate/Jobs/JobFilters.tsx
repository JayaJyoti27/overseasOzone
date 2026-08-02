import { SlidersHorizontal } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const SALARY_FLOORS = [
  { value: "1000", label: "1,000+" },
  { value: "2000", label: "2,000+" },
  { value: "3000", label: "3,000+" },
  { value: "5000", label: "5,000+" },
];

interface Props {
  countries: string[];
  country: string;
  onCountryChange: (value: string) => void;
  minSalary: string;
  onMinSalaryChange: (value: string) => void;
}

export default function JobFilters({
  countries,
  country,
  onCountryChange,
  minSalary,
  onMinSalaryChange,
}: Props) {
  const isFiltered = country !== "all" || minSalary !== "all";

  return (
    <Card className="rounded-2xl border-none bg-white p-5 shadow-card">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold text-navy">
          <SlidersHorizontal className="h-4 w-4 text-blue" />
          Filters
        </h2>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs font-medium text-blue hover:bg-transparent hover:underline"
            onClick={() => {
              onCountryChange("all");
              onMinSalaryChange("all");
            }}
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Location</span>

          <Select value={country} onValueChange={onCountryChange}>
            <SelectTrigger className="h-11 rounded-xl bg-blue-wash/60">
              <SelectValue placeholder="Any location" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Any location</SelectItem>

              {countries.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Minimum salary</span>

          <Select value={minSalary} onValueChange={onMinSalaryChange}>
            <SelectTrigger className="h-11 rounded-xl bg-blue-wash/60">
              <SelectValue placeholder="Any salary" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Any salary</SelectItem>

              {SALARY_FLOORS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
