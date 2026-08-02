import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import JobFilters from "@/components/Candidate/Jobs/JobFilters";
import JobSearch from "@/components/Candidate/Jobs/JobSearch";
import JobList from "@/components/Candidate/Jobs/JobList";
import SavedJobsSidebar from "@/components/Candidate/Jobs/SavedJobsSidebar";
import RecommendedJobs from "@/components/Candidate/Jobs/RecommendedJobs";

export const Route = createFileRoute("/Candidates/jobs")({
  component: JobsPage,
});

function JobsPage() {
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [category, setCategory] = useState("");

  const filters = {
    search: search || undefined,
    country: country || undefined,
    category: category || undefined,
  };

  const hasActiveFilters = !!search || !!country || !!category;

  return (
    <div className="grid gap-6 xl:grid-cols-4">
      <div className="space-y-6">
        <JobSearch value={search} onChange={setSearch} />

        <JobFilters
          country={country}
          category={category}
          onCountryChange={setCountry}
          onCategoryChange={setCategory}
          onClear={() => {
            setSearch("");
            setCountry("");
            setCategory("");
          }}
        />

        <SavedJobsSidebar />
      </div>

      <div className="space-y-6 xl:col-span-3">
        {!hasActiveFilters && <RecommendedJobs />}

        <JobList filters={filters} />
      </div>
    </div>
  );
}
