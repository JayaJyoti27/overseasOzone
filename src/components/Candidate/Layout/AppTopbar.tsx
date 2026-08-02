import { Bell, Search, Sun, Moon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AppTopbar() {
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b bg-background px-6">
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          placeholder="Search..."
          className="h-10 rounded-full border-none bg-blue-wash/60 pl-10 shadow-none focus-visible:ring-1 focus-visible:ring-blue"
        />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button size="icon" variant="ghost" className="rounded-full">
          <Bell className="h-5 w-5" />
        </Button>

        <Button size="icon" variant="ghost" className="rounded-full">
          <Sun className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
