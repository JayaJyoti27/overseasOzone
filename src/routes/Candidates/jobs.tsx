import { useMemo, useState } from "react";

import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

import JobFilters from "@/components/Candidate/Jobs/JobFilters";
import JobSearch from "@/components/Candidate/Jobs/JobSearch";
import JobList from "@/components/Candidate/Jobs/JobList";
import SavedJobsSidebar from "@/components/Candidate/Jobs/SavedJobsSidebar";
import RecommendedJobs from "@/components/Candidate/Jobs/RecommendedJobs";

import { useJobs } from "@/lib/candidate/hooks";
import type { CandidateJob } from "@/lib/candidate/types";

export const Route = createFileRoute("/Candidates/jobs")({
  component: JobsPage,
});

function JobsPage() {
  const { pathname } = useLocation();

  // This route is the parent of /Candidates/jobs/$id. Without this check,
  // clicking "View Details" changes the URL but never renders the detail
  // page, because this component always rendered the list and never
  // rendered the matched child route.
  const isDetailView = pathname !== "/Candidates/jobs" && pathname !== "/Candidates/jobs/";

  const { data: jobsData, isLoading } = useJobs();
  const jobs = jobsData as CandidateJob[] | undefined;

  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("all");
  const [minSalary, setMinSalary] = useState("all");

  const countries = useMemo(() => {
    const set = new Set((jobs ?? []).map((job) => job.country).filter(Boolean));
    return Array.from(set).sort();
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    if (!jobs) return jobs;

    const query = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !query ||
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.country.toLowerCase().includes(query);

      const matchesCountry = country === "all" || job.country === country;

      const matchesSalary = minSalary === "all" || job.salary >= Number(minSalary);

      return matchesSearch && matchesCountry && matchesSalary;
    });
  }, [jobs, search, country, minSalary]);

  if (isDetailView) {
    return <Outlet />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-4">
      <div className="space-y-6">
        <JobSearch value={search} onChange={setSearch} />

        <JobFilters
          countries={countries}
          country={country}
          onCountryChange={setCountry}
          minSalary={minSalary}
          onMinSalaryChange={setMinSalary}
        />

        <SavedJobsSidebar />
      </div>

      <div className="space-y-6 xl:col-span-3">
        <RecommendedJobs />
        <JobList jobs={filteredJobs} isLoading={isLoading} totalCount={jobs?.length ?? 0} />
      </div>
    </div>
  );
}
