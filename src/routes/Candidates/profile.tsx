import { createFileRoute } from "@tanstack/react-router";

import ProfileHeader from "@/components/Candidate/Profile/ProfileHeader";
import PersonalInformation from "@/components/Candidate/Profile/PersonalInformation";
import PassportInformation from "@/components/Candidate/Profile/PassportInformation";
import EducationSection from "@/components/Candidate/Profile/EducationSection";
import ExperienceSection from "@/components/Candidate/Profile/ExperienceSection";
import SkillsSection from "@/components/Candidate/Profile/SkillsSection";
import LanguagesSection from "@/components/Candidate/Profile/LanguagesSection";
import ResumeSection from "@/components/Candidate/Profile/ResumeSection";
import ProfileSidebar from "@/components/Candidate/Profile/ProfileSidebar";
import CertificatesSection from "@/components/Candidate/Profile/CertificatesSection";
import { useProfile } from "@/lib/candidate/hooks";

export const Route = createFileRoute("/Candidates/profile")({
  component: CandidateProfile,
});

function CandidateProfile() {
  const { data, isLoading, isError } = useProfile();

  if (isLoading) {
    return <div className="flex items-center justify-center py-20">Loading profile...</div>;
  }

  if (isError || !data) {
    return <div className="rounded-xl border p-8">Unable to load profile.</div>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-4">
      <div>
        <ProfileSidebar candidate={data.data} />
      </div>

      <div className="space-y-6 xl:col-span-3">
        <ProfileHeader candidate={data.data} />

        <PersonalInformation candidate={data.data} />

        <PassportInformation candidate={data.data} />

        <EducationSection candidate={data.data} />

        <ExperienceSection candidate={data.data} />

        <SkillsSection candidate={data.data} />

        <LanguagesSection candidate={data.data} />

        <ResumeSection />
      </div>
    </div>
  );
}
