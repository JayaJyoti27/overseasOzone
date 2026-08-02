import { useEffect, useState } from "react";

import { Search, X } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function JobSearch({ value, onChange }: Props) {
  const [draft, setDraft] = useState(value);

  // Debounced so every keystroke doesn't fire a request - 300ms is enough
  // to feel instant without hammering the API while someone's still typing.
  useEffect(() => {
    const timer = setTimeout(() => onChange(draft), 300);
    return () => clearTimeout(timer);
  }, [draft]);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <Card className="rounded-2xl p-5">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

        <Input
          className="pl-10 pr-9"
          placeholder="Search by job title, country..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />

        {draft && (
          <button
            type="button"
            onClick={() => setDraft("")}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </Card>
  );
}
