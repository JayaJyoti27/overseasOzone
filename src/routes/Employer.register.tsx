import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, FormEvent } from "react";
import { Building2, Upload, Loader2, FileCheck } from "lucide-react";
import { updateProfile, uploadEmployerDocument, submitForReview } from "@/lib/employer/api";

export const Route = createFileRoute("/Employer/register")({
  component: EmployerRegisterPage,
});

function EmployerRegisterPage() {
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!companyName.trim()) {
      setError("Company name is required.");
      return;
    }
    if (!file) {
      setError("Please upload your company verification document.");
      return;
    }

    setSubmitting(true);
    try {
      console.log("[EmployerRegister] step 1: updateProfile");
      await updateProfile({ company_name: companyName.trim() });

      console.log("[EmployerRegister] step 2: uploadEmployerDocument");
      await uploadEmployerDocument(file, "company_verification");

      console.log("[EmployerRegister] step 3: submitForReview");
      await submitForReview();

      navigate({ to: "/Employer/pending-approval" });
    } catch (err: any) {
      // Axios's err.message is a generic "Request failed with status code 500"
      // The real reason from the backend lives in err.response.data
      console.error("[EmployerRegister] FULL ERROR:", err);
      console.error("[EmployerRegister] response status:", err?.response?.status);
      console.error("[EmployerRegister] response data:", err?.response?.data);

      const backendMessage = err?.response?.data?.message;
      setError(backendMessage || err?.message || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-bold text-navy">Complete your employer profile</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We need a couple of details to verify your company before you can start posting
        requirements.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy">
            Company Name
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-blue-wash/40 px-4 py-3 focus-within:border-blue">
            <Building2 className="h-4 w-4 text-blue" />
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Recruitment Pvt Ltd"
              className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-navy/40"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy">
            Company Verification Document
          </label>
          <label
            htmlFor="verification-doc"
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-blue-wash/20 px-4 py-6 text-sm text-navy/70 hover:border-blue"
          >
            {file ? (
              <>
                <FileCheck className="h-5 w-5 text-green-600" />
                <span className="truncate">{file.name}</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 text-blue" />
                <span>Click to upload (PDF, JPG, or PNG)</span>
              </>
            )}
          </label>
          <input
            id="verification-doc"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Submitting..." : "Submit for Review"}
        </button>
      </form>
    </div>
  );
}
