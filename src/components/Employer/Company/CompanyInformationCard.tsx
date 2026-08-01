import { useEffect, useState } from "react";
import { Building2, Pencil, Save, X } from "lucide-react";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useEmployerProfile, useUpdateEmployerProfile } from "@/lib/employer/hooks";

interface CompanyInfoForm {
  company_name: string;
  industry: string;
  country: string;
  head_office: string;
  employee_count: string;
  website: string;
  license_number: string;
  license_expiry: string;
}

const emptyForm: CompanyInfoForm = {
  company_name: "",
  industry: "",
  country: "",
  head_office: "",
  employee_count: "",
  website: "",
  license_number: "",
  license_expiry: "",
};

function toForm(company: any): CompanyInfoForm {
  return {
    company_name: company?.company_name ?? "",
    industry: company?.industry ?? "",
    country: company?.country ?? "",
    head_office: company?.head_office ?? "",
    employee_count: company?.employee_count != null ? String(company.employee_count) : "",
    website: company?.website ?? "",
    license_number: company?.license_number ?? "",
    license_expiry: company?.license_expiry ? String(company.license_expiry).slice(0, 10) : "",
  };
}

export function CompanyInformationCard() {
  const { data: company, isLoading } = useEmployerProfile();
  const updateProfile = useUpdateEmployerProfile();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<CompanyInfoForm>(emptyForm);

  useEffect(() => {
    if (company) setForm(toForm(company));
  }, [company]);

  function update<K extends keyof CompanyInfoForm>(key: K, value: CompanyInfoForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleCancel() {
    if (company) setForm(toForm(company));
    setEditing(false);
  }

  async function handleSave() {
    await updateProfile.mutateAsync({
      company_name: form.company_name.trim(),
      industry: form.industry.trim(),
      country: form.country.trim(),
      head_office: form.head_office.trim(),
      employee_count: form.employee_count ? Number(form.employee_count) : null,
      website: form.website.trim(),
      license_number: form.license_number.trim(),
      license_expiry: form.license_expiry || null,
    });
    setEditing(false);
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Information
        </CardTitle>

        {!editing ? (
          <Button size="sm" onClick={() => setEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={updateProfile.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {updateProfile.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Company Name</Label>
          <Input
            disabled={!editing}
            value={form.company_name}
            onChange={(e) => update("company_name", e.target.value)}
          />
        </div>

        <div>
          <Label>Industry</Label>
          <Input
            disabled={!editing}
            value={form.industry}
            onChange={(e) => update("industry", e.target.value)}
          />
        </div>

        <div>
          <Label>Country</Label>
          <Input
            disabled={!editing}
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
          />
        </div>

        <div>
          <Label>City / Head Office</Label>
          <Input
            disabled={!editing}
            value={form.head_office}
            onChange={(e) => update("head_office", e.target.value)}
          />
        </div>

        <div>
          <Label>Number of Employees</Label>
          <Input
            type="number"
            min={0}
            disabled={!editing}
            value={form.employee_count}
            onChange={(e) => update("employee_count", e.target.value)}
          />
        </div>

        <div>
          <Label>Website</Label>
          <Input
            disabled={!editing}
            placeholder="https://"
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
          />
        </div>

        <div>
          <Label>License Number</Label>
          <Input
            disabled={!editing}
            value={form.license_number}
            onChange={(e) => update("license_number", e.target.value)}
          />
        </div>

        <div>
          <Label>License Expiry</Label>
          <Input
            type="date"
            disabled={!editing}
            value={form.license_expiry}
            onChange={(e) => update("license_expiry", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
