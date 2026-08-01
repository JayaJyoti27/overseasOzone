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

import * as EmployerRequirementService from "../requirement";

const EMPLOYER_ID = "employer-123";

beforeEach(() => {
  responseQueue.length = 0;
  builder = createBuilder();
});

describe("createRequirement", () => {
  it("persists every field of a fully filled-out intake form", async () => {
    const insertedRow = {
      id: "req-1",
      status: "submitted",
    };

    queueResponses(
      { data: insertedRow, error: null }, // requirements insert -> select -> single
      { data: null, error: null }, // activity_logs insert
    );

    const payload = {
      company_name: "Acme Staffing",
      role: "Site Electrician",
      country: "UAE",
      sector: "Construction",
      headcount: 5,
      timeline: "Within 30 days",
      message: "Urgent hire",
      contact_person: "Jane Doe",
      contact_email: "jane@acme.com",
      contact_phone: "+971500000000",
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

    await EmployerRequirementService.createRequirement(EMPLOYER_ID, payload);

    const insertedPayload = builder.insert.mock.calls[0][0];

    expect(insertedPayload).toMatchObject({
      employer_id: EMPLOYER_ID,
      company_name: "Acme Staffing",
      role: "Site Electrician",
      contact_person: "Jane Doe",
      contact_email: "jane@acme.com",
      contact_phone: "+971500000000",
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
      status: "submitted",
    });
  });

  it("defaults optional intake fields to null/false when omitted", async () => {
    queueResponses({ data: { id: "req-2" }, error: null }, { data: null, error: null });

    await EmployerRequirementService.createRequirement(EMPLOYER_ID, {
      company_name: "Acme Staffing",
      role: "Site Electrician",
      country: "UAE",
      sector: "Construction",
      headcount: 5,
      timeline: "Within 30 days",
    });

    const insertedPayload = builder.insert.mock.calls[0][0];

    expect(insertedPayload.contact_person).toBeNull();
    expect(insertedPayload.salary_min).toBeNull();
    expect(insertedPayload.accommodation).toBe(false);
    expect(insertedPayload.transport).toBe(false);
    expect(insertedPayload.food).toBe(false);
  });
});
