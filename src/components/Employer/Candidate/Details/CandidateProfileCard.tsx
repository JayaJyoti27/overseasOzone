import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import type { ExperienceEntry, EducationEntry } from "@/lib/candidate/types";

interface Props {
  candidate: {
    nationality?: string | null;
    dob?: string | null;
    experience?: ExperienceEntry[] | null;
    education?: EducationEntry[] | null;
    skills?: string[] | null;
    current_location?: string | null;
    passport_expiry_date?: string | null;
  };
  application: { job?: { title?: string } | null } | null;
}

export function CandidateProfileCard({ candidate, application }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidate Profile</CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-6">
        <Info label="Position" value={application?.job?.title} />
        <Info label="Nationality" value={candidate.nationality} />
        <Info label="Age" value={formatAge(candidate.dob)} />
        <Info label="Current Location" value={candidate.current_location} />
        <Info label="Experience" value={formatExperience(candidate.experience)} />
        <Info label="Education" value={formatEducation(candidate.education)} />
        <Info label="Skills" value={formatSkills(candidate.skills)} />
        <Info label="Passport Expiry" value={formatDate(candidate.passport_expiry_date)} />
      </CardContent>
    </Card>
  );
}

function formatAge(dob?: string | null): string {
  if (!dob) return "—";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "—";
  const diff = Date.now() - birth.getTime();
  return String(Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000)));
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

function formatSkills(value?: string[] | null): string {
  return value?.length ? value.join(", ") : "—";
}

function formatExperience(entries?: ExperienceEntry[] | null): string {
  if (!entries?.length) return "—";
  return entries
    .map((e) => [e.designation, e.company].filter(Boolean).join(" at "))
    .filter(Boolean)
    .join(", ");
}

function formatEducation(entries?: EducationEntry[] | null): string {
  if (!entries?.length) return "—";
  return entries
    .map((e) => [e.degree, e.field].filter(Boolean).join(" in "))
    .filter(Boolean)
    .join(", ");
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>

      <p className="font-semibold">{value || "—"}</p>
    </div>
  );
}
