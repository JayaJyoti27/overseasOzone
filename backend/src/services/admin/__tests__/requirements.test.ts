import { describe, it, expect, vi, beforeEach } from "vitest";

const responseQueue: any[] = [];

function queueResponses(...responses: any[]) {
  responseQueue.push(...responses);
}

function createBuilder() {
  const builder: any = {
    from: vi.fn(() => builder),
    select: vi.fn(() => builder),
    update: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(responseQueue.shift())),
    then: (resolve: any) => resolve(responseQueue.shift()),
  };
  return builder;
}

let builder: any;

vi.mock("../../../config/supabase", () => ({
  get supabase() {
    return builder;
  },
}));

import { convertRequirementToJobOrder } from "../requirements";

const ADMIN_ID = "admin-1";

beforeEach(() => {
  responseQueue.length = 0;
  builder = createBuilder();
});

describe("convertRequirementToJobOrder", () => {
  it("carries every intake field over to the new job order, not just the original 4", async () => {
    const approvedRequirement = {
      id: "req-1",
      employer_id: "employer-1",
      status: "approved",
      converted_job_order_id: null,
      role: "Site Electrician",
      sector: "Construction",
      country: "UAE",
      headcount: 5,
      salary_min: 1200,
      salary_max: 1800,
      currency: "AED",
      contract_duration: "2 years, renewable",
      working_hours: "48 hrs/week",
      accommodation: true,
      transport: true,
      food: false,
      job_description: "Install and maintain electrical systems on site.",
      qualifications: "5+ years experience, valid trade certificate.",
      benefits: "Annual airfare, medical insurance",
    };

    queueResponses(
      { data: approvedRequirement, error: null }, // load requirement
      { data: { id: "job-1", status: "requirement_submitted" }, error: null }, // create job order
      { data: null, error: null }, // update requirement -> converted
      { data: null, error: null }, // activity log
    );

    await convertRequirementToJobOrder("req-1", ADMIN_ID);

    // insert.mock.calls[0] is the requirements select's own eq/insert chain isn't used for select,
    // so the first insert call is the job_orders insert.
    const jobOrderPayload = builder.insert.mock.calls[0][0];

    expect(jobOrderPayload).toMatchObject({
      employer_id: "employer-1",
      requirement_id: "req-1",
      title: "Site Electrician",
      category: "Construction",
      country: "UAE",
      vacancies: 5,
      salary_min: 1200,
      salary_max: 1800,
      currency: "AED",
      contract_duration: "2 years, renewable",
      working_hours: "48 hrs/week",
      accommodation: true,
      transport: true,
      food: false,
      job_description: "Install and maintain electrical systems on site.",
      requirements: "5+ years experience, valid trade certificate.",
      benefits: "Annual airfare, medical insurance",
      status: "requirement_submitted",
    });
  });

  it("refuses to convert a requirement that isn't approved", async () => {
    queueResponses({ data: { id: "req-2", status: "submitted" }, error: null });

    await expect(convertRequirementToJobOrder("req-2", ADMIN_ID)).rejects.toThrow(
      "Only approved requirements can be converted.",
    );
  });

  it("refuses to convert a requirement that was already converted", async () => {
    queueResponses({
      data: { id: "req-3", status: "approved", converted_job_order_id: "job-99" },
      error: null,
    });

    await expect(convertRequirementToJobOrder("req-3", ADMIN_ID)).rejects.toThrow(
      "Requirement has already been converted.",
    );
  });
});
