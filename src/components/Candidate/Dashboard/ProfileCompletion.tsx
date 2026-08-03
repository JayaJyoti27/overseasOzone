import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import type { ProfileSections } from "@/lib/candidate/types";

interface Props {
  completion: number;
  sections: ProfileSections;
}

const STEP_LABELS: { key: keyof ProfileSections; label: string }[] = [
  { key: "personalInfo", label: "Personal Information" },
  { key: "passportDetails", label: "Passport Details" },
  { key: "education", label: "Education" },
  { key: "workExperience", label: "Work Experience" },
  { key: "resumeUploaded", label: "Resume Uploaded" },
];

export default function ProfileCompletion({ completion, sections }: Props) {
  return (
    <Card className="rounded-2xl border-none bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-navy">Profile Completion</h2>

          <p className="text-sm text-muted-foreground">
            Complete your profile to improve your chances of getting hired.
          </p>
        </div>

        <span className="text-3xl font-bold text-blue">{completion}%</span>
      </div>

      <Progress value={completion} className="mt-6 h-3" />

      <div className="mt-6 space-y-3">
        {STEP_LABELS.map(({ key, label }) => {
          const done = sections[key];

          return (
            <div key={key} className="flex items-center gap-3">
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}

              <span className={done ? "font-medium text-navy" : "text-muted-foreground"}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <Button asChild className="mt-6 w-full">
        <Link to="/Candidates/profile">
          Complete Profile
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </Card>
  );
}
