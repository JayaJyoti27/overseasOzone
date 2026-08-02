import { describe, it, expect } from "vitest";
import { requirementStatusLabel, requirementStatusStyle } from "../requirementStatus";

describe("requirementStatusLabel", () => {
  it("labels every real requirement status", () => {
    expect(requirementStatusLabel("submitted")).toBe("Requirement Submitted");
    expect(requirementStatusLabel("under_review")).toBe("Under Admin Review");
    expect(requirementStatusLabel("clarification_required")).toBe("Clarification Required");
    expect(requirementStatusLabel("approved")).toBe("Approved by Admin");
    expect(requirementStatusLabel("rejected")).toBe("Rejected");
    expect(requirementStatusLabel("converted")).toBe("Converted to Job Order");
    expect(requirementStatusLabel("withdrawn")).toBe("Withdrawn");
  });

  it("is case-insensitive", () => {
    expect(requirementStatusLabel("SUBMITTED")).toBe("Requirement Submitted");
  });

  it("falls back gracefully for unknown/missing status", () => {
    expect(requirementStatusLabel(undefined)).toBe("-");
    expect(requirementStatusLabel("something_else")).toBe("something_else");
  });

  it("does not reuse job_order status strings - these are a different lifecycle", () => {
    // requirement statuses use "under_review", job_orders use "under_admin_review" -
    // if this ever starts passing, someone accidentally merged the two enums.
    expect(requirementStatusLabel("under_admin_review")).toBe("under_admin_review");
  });
});

describe("requirementStatusStyle", () => {
  it("gives every real status a non-default style", () => {
    const statuses = [
      "under_review",
      "clarification_required",
      "approved",
      "rejected",
      "converted",
      "withdrawn",
    ];
    for (const status of statuses) {
      expect(requirementStatusStyle(status)).not.toBe("bg-blue-wash text-blue");
    }
  });

  it("falls back to the default style for unknown status", () => {
    expect(requirementStatusStyle("something_else")).toBe("bg-blue-wash text-blue");
  });
});
