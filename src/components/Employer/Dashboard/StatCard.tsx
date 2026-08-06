import { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: "blue" | "green" | "amber" | "purple";
  href?: string;
}

// Static class strings (not built dynamically) so Tailwind's compiler picks them up.
const COLOR_STYLES: Record<StatCardProps["color"], string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  purple: "bg-violet-50 text-violet-600",
};

export function StatCard({ title, value, icon: Icon, color, href }: StatCardProps) {
  const content = (
    <CardContent className="flex items-center justify-between p-6">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>

        <h2 className="mt-2 text-3xl font-bold">{value}</h2>
      </div>

      <div className={`rounded-xl p-4 ${COLOR_STYLES[color]}`}>
        <Icon className="h-7 w-7" />
      </div>
    </CardContent>
  );

  if (href) {
    return (
      <Link
        to={href}
        className={cn(
          "block rounded-xl border bg-card text-card-foreground shadow transition hover:-translate-y-0.5 hover:shadow-md",
        )}
      >
        {content}
      </Link>
    );
  }

  return <Card className="transition hover:shadow-md">{content}</Card>;
}
