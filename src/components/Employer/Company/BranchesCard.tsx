import { useEffect, useState } from "react";
import { Building2, Pencil, Plus, Save, Trash2, X } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useEmployerProfile, useUpdateEmployerProfile } from "@/lib/employer/hooks";

export interface BranchEntry {
  id: string;
  name: string;
  city: string;
  address: string;
  employee_count: string;
}

function emptyBranch(): BranchEntry {
  return {
    id: `${Date.now()}-${Math.random()}`,
    name: "",
    city: "",
    address: "",
    employee_count: "",
  };
}

function fromProfile(raw: unknown): BranchEntry[] {
  if (!Array.isArray(raw) || raw.length === 0) return [emptyBranch()];
  return raw.map((b: any) => ({
    id: b.id ?? `${Date.now()}-${Math.random()}`,
    name: b.name ?? "",
    city: b.city ?? "",
    address: b.address ?? "",
    employee_count: b.employee_count != null ? String(b.employee_count) : "",
  }));
}

export function BranchesCard() {
  const { data: company, isLoading } = useEmployerProfile();
  const updateProfile = useUpdateEmployerProfile();

  const [editing, setEditing] = useState(false);
  const [branches, setBranches] = useState<BranchEntry[]>([emptyBranch()]);

  useEffect(() => {
    if (company) setBranches(fromProfile(company.branches));
  }, [company]);

  function update<K extends keyof BranchEntry>(index: number, key: K, value: BranchEntry[K]) {
    setBranches((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  }

  function addBranch() {
    setBranches((prev) => [...prev, emptyBranch()]);
  }

  function removeBranch(id: string) {
    setBranches((prev) => prev.filter((b) => b.id !== id));
  }

  function handleCancel() {
    if (company) setBranches(fromProfile(company.branches));
    setEditing(false);
  }

  async function handleSave() {
    const filled = branches.filter((b) => b.name.trim() || b.city.trim());
    const cleaned = filled.map((b) => ({
      id: b.id,
      name: b.name.trim(),
      city: b.city.trim(),
      address: b.address.trim(),
      employee_count: b.employee_count ? Number(b.employee_count) : null,
    }));

    await updateProfile.mutateAsync({ branches: cleaned });
    setBranches(filled.length ? filled : [emptyBranch()]);
    setEditing(false);
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Branches</CardTitle>
        </CardHeader>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  const savedBranches = branches.filter((b) => b.name.trim() || b.city.trim());

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Company Branches</CardTitle>

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

      <CardContent>
        {!editing && savedBranches.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No branches added yet. Click Edit to add one.
          </p>
        ) : !editing ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {savedBranches.map((branch) => (
              <div key={branch.id} className="rounded-xl border p-5 transition hover:border-primary">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{branch.name || branch.city}</h3>
                    <p className="text-sm text-muted-foreground">{branch.city}</p>
                  </div>
                </div>

                {branch.address && (
                  <p className="mb-2 text-sm text-muted-foreground">{branch.address}</p>
                )}

                <div className="text-sm text-muted-foreground">Employees</div>
                <div className="mt-1 text-3xl font-bold">{branch.employee_count || "—"}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {branches.map((branch, index) => (
              <Card key={branch.id} className="border p-5">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="font-semibold">Branch #{index + 1}</h3>
                  {branches.length > 1 && (
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeBranch(branch.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <Label>Branch Name</Label>
                    <Input
                      value={branch.name}
                      onChange={(e) => update(index, "name", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>City</Label>
                    <Input
                      value={branch.city}
                      onChange={(e) => update(index, "city", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Address</Label>
                    <Input
                      value={branch.address}
                      onChange={(e) => update(index, "address", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Number of Employees</Label>
                    <Input
                      type="number"
                      min={0}
                      value={branch.employee_count}
                      onChange={(e) => update(index, "employee_count", e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            ))}

            <Button variant="outline" onClick={addBranch}>
              <Plus className="mr-2 h-4 w-4" />
              Add Branch
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
