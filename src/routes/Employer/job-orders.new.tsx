import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { createRequirement } from "@/lib/employer/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/Employer/job-orders/new")({
  component: NewJobOrderPage,
});

const CURRENCIES = ["USD", "AED", "SAR", "QAR", "KWD", "OMR", "BHD", "EUR", "GBP", "INR"];

const TIMELINES = [
  "Within 30 days",
  "1-2 months",
  "2-3 months",
  "3-6 months",
  "Flexible / no fixed deadline",
];

const initialForm = {
  // Position details
  company_name: "",
  role: "",
  country: "",
  sector: "",
  headcount: 1,
  timeline: "",
  contract_duration: "",
  working_hours: "",

  // Compensation & benefits
  salary_min: "",
  salary_max: "",
  currency: "USD",
  accommodation: false,
  transport: false,
  food: false,
  benefits: "",

  // Role details
  job_description: "",
  qualifications: "",

  // Point of contact for this requirement
  contact_person: "",
  contact_email: "",
  contact_phone: "",

  // Anything else
  message: "",
};

function NewJobOrderPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      await createRequirement({
        ...form,
        headcount: Number(form.headcount),
        salary_min: form.salary_min ? Number(form.salary_min) : undefined,
        salary_max: form.salary_max ? Number(form.salary_max) : undefined,
      });

      navigate({
        to: "/Employer/job-orders",
      });
    } catch (err) {
      console.error(err);
      alert("Unable to submit requirement.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Submit a Job Requirement</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} className="space-y-8">
            {/* Position Details */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Position Details
              </h3>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Company Name</Label>
                  <Input
                    value={form.company_name}
                    onChange={(e) => update("company_name", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Job Title / Role</Label>
                  <Input
                    placeholder="e.g. Site Electrician"
                    value={form.role}
                    onChange={(e) => update("role", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Country of Deployment</Label>
                  <Input
                    value={form.country}
                    onChange={(e) => update("country", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Sector / Industry</Label>
                  <Input
                    placeholder="e.g. Construction, Hospitality"
                    value={form.sector}
                    onChange={(e) => update("sector", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Number of Vacancies</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.headcount}
                    onChange={(e) => update("headcount", Number(e.target.value))}
                    required
                  />
                </div>

                <div>
                  <Label>Contract Duration</Label>
                  <Input
                    placeholder="e.g. 2 years, renewable"
                    value={form.contract_duration}
                    onChange={(e) => update("contract_duration", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Working Hours</Label>
                  <Input
                    placeholder="e.g. 48 hrs/week, 6 days"
                    value={form.working_hours}
                    onChange={(e) => update("working_hours", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Hiring Timeline</Label>
                  <Select value={form.timeline} onValueChange={(v) => update("timeline", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMELINES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <Separator />

            {/* Compensation & Benefits */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Compensation &amp; Benefits
              </h3>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <Label>Salary (Min)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.salary_min}
                    onChange={(e) => update("salary_min", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Salary (Max)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.salary_max}
                    onChange={(e) => update("salary_max", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Currency</Label>
                  <Select value={form.currency} onValueChange={(v) => update("currency", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm text-navy">
                  <Checkbox
                    checked={form.accommodation}
                    onCheckedChange={(v) => update("accommodation", Boolean(v))}
                  />
                  Accommodation provided
                </label>

                <label className="flex items-center gap-2 text-sm text-navy">
                  <Checkbox
                    checked={form.transport}
                    onCheckedChange={(v) => update("transport", Boolean(v))}
                  />
                  Transport provided
                </label>

                <label className="flex items-center gap-2 text-sm text-navy">
                  <Checkbox
                    checked={form.food}
                    onCheckedChange={(v) => update("food", Boolean(v))}
                  />
                  Food provided
                </label>
              </div>

              <div>
                <Label>Other Benefits</Label>
                <Textarea
                  rows={3}
                  placeholder="e.g. Annual airfare, medical insurance, overtime pay"
                  value={form.benefits}
                  onChange={(e) => update("benefits", e.target.value)}
                />
              </div>
            </section>

            <Separator />

            {/* Role Details */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Role Details
              </h3>

              <div>
                <Label>Job Description</Label>
                <Textarea
                  rows={4}
                  placeholder="Day-to-day responsibilities of this role"
                  value={form.job_description}
                  onChange={(e) => update("job_description", e.target.value)}
                />
              </div>

              <div>
                <Label>Required Qualifications / Experience</Label>
                <Textarea
                  rows={4}
                  placeholder="Certifications, years of experience, language requirements, etc."
                  value={form.qualifications}
                  onChange={(e) => update("qualifications", e.target.value)}
                />
              </div>
            </section>

            <Separator />

            {/* Point of Contact */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Point of Contact for This Requirement
              </h3>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <Label>Contact Person</Label>
                  <Input
                    value={form.contact_person}
                    onChange={(e) => update("contact_person", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={form.contact_email}
                    onChange={(e) => update("contact_email", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Contact Phone</Label>
                  <Input
                    type="tel"
                    value={form.contact_phone}
                    onChange={(e) => update("contact_phone", e.target.value)}
                    required
                  />
                </div>
              </div>
            </section>

            <div>
              <Label>Additional Notes</Label>
              <Textarea
                rows={4}
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navigate({
                    to: "/Employer/job-orders",
                  })
                }
              >
                Cancel
              </Button>

              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Requirement"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
