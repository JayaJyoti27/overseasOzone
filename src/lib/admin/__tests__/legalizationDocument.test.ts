import { describe, it, expect } from "vitest";
import {
  documentStatusLabel,
  isChecklistComplete,
  isEmployerOwnedDocument,
  type LegalizationDocument,
} from "../legalizationDocument";

function makeItem(overrides: Partial<LegalizationDocument> = {}): LegalizationDocument {
  return {
    id: "doc-1",
    job_order_id: "job-1",
    document_type: "demand_letter",
    label: "Demand Letter",
    is_required: true,
    status: "pending",
    created_at: "2026-08-01T00:00:00.000Z",
    updated_at: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("isChecklistComplete", () => {
  it("is false for an empty/never-seeded checklist", () => {
    expect(isChecklistComplete([])).toBe(false);
  });

  it("is false if any required item is not attested", () => {
    const checklist = [
      makeItem({ id: "1", is_required: true, status: "attested" }),
      makeItem({ id: "2", is_required: true, status: "submitted" }),
    ];
    expect(isChecklistComplete(checklist)).toBe(false);
  });

  it("is true when every required item is attested, regardless of optional items", () => {
    const checklist = [
      makeItem({ id: "1", is_required: true, status: "attested" }),
      makeItem({ id: "2", is_required: true, status: "attested" }),
      makeItem({ id: "3", is_required: false, status: "pending" }),
    ];
    expect(isChecklistComplete(checklist)).toBe(true);
  });
});

describe("isEmployerOwnedDocument", () => {
  it("flags exactly the 3 employer-owned document types", () => {
    expect(isEmployerOwnedDocument("demand_letter")).toBe(true);
    expect(isEmployerOwnedDocument("specimen_employment_contract")).toBe(true);
    expect(isEmployerOwnedDocument("power_of_attorney")).toBe(true);
  });

  it("does not flag authority-side attestations", () => {
    expect(isEmployerOwnedDocument("indian_mission_attestation")).toBe(false);
    expect(isEmployerOwnedDocument("poe_recruitment_permission")).toBe(false);
  });
});

describe("documentStatusLabel", () => {
  it("labels every real status", () => {
    expect(documentStatusLabel("pending")).toBe("Pending");
    expect(documentStatusLabel("submitted")).toBe("Submitted");
    expect(documentStatusLabel("attested")).toBe("Attested");
    expect(documentStatusLabel("rejected")).toBe("Rejected");
  });

  it("falls back gracefully for unknown/missing status", () => {
    expect(documentStatusLabel(undefined)).toBe("Unknown");
    expect(documentStatusLabel("something_else")).toBe("something_else");
  });
});
