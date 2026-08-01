import { useEffect, useState } from "react";
import { Mail, Pencil, Phone, Save, UserRound, X } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useEmployerProfile, useUpdateEmployerProfile } from "@/lib/employer/hooks";

interface HRContactForm {
  contact_person: string;
  designation: string;
  email: string;
  phone: string;
}

function toForm(company: any): HRContactForm {
  return {
    contact_person: company?.contact_person ?? "",
    designation: company?.designation ?? "",
    email: company?.email ?? "",
    phone: company?.phone ?? "",
  };
}

export function HRContactCard() {
  const { data: company, isLoading } = useEmployerProfile();
  const updateProfile = useUpdateEmployerProfile();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<HRContactForm>({
    contact_person: "",
    designation: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (company) setForm(toForm(company));
  }, [company]);

  function update<K extends keyof HRContactForm>(key: K, value: HRContactForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleCancel() {
    if (company) setForm(toForm(company));
    setEditing(false);
  }

  async function handleSave() {
    await updateProfile.mutateAsync({
      contact_person: form.contact_person.trim(),
      designation: form.designation.trim(),
      phone: form.phone.trim(),
      // email intentionally left out — it's tied to the login/auth account,
      // changing it here would desync from Supabase auth.
    });
    setEditing(false);
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>HR Contact</CardTitle>
        </CardHeader>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>HR Contact</CardTitle>

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

      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <UserRound className="h-7 w-7 text-primary" />
          </div>

          <div className="flex-1 space-y-1">
            {editing ? (
              <>
                <Input
                  value={form.contact_person}
                  placeholder="Contact person name"
                  onChange={(e) => update("contact_person", e.target.value)}
                />
                <Input
                  value={form.designation}
                  placeholder="Designation (e.g. HR Manager)"
                  className="mt-2"
                  onChange={(e) => update("designation", e.target.value)}
                />
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold">{form.contact_person || "—"}</h3>
                <p className="text-muted-foreground">{form.designation || "HR Contact"}</p>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span>{form.email || "—"}</span>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            {editing ? (
              <Input
                value={form.phone}
                placeholder="+971 50 1234567"
                onChange={(e) => update("phone", e.target.value)}
              />
            ) : (
              <span>{form.phone || "—"}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
