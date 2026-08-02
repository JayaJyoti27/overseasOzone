import { describe, it, expect, vi, beforeEach } from "vitest";

/*
|--------------------------------------------------------------------------
| Supabase Mock
|--------------------------------------------------------------------------
| The service always calls supabase in a fixed order for a transition:
|   1. from("job_orders").select("status").eq(...).single()   -> current row
|   2. from("job_orders").update({...}).eq(...).select().single() -> updated row
|   3. from("activity_logs").insert({...})                    -> audit log
|
| queueResponses() lets each test script exactly what each of those calls
| should resolve to, in order.
|--------------------------------------------------------------------------
*/

const responseQueue: any[] = [];

function queueResponses(...responses: any[]) {
  responseQueue.push(...responses);
}

vi.mock("../../../config/supabase", () => {
  const builder: any = {
    from: vi.fn(() => builder),
    select: vi.fn(() => builder),
    update: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    insert: vi.fn(() => Promise.resolve(responseQueue.shift())),
    single: vi.fn(() => Promise.resolve(responseQueue.shift())),
    maybeSingle: vi.fn(() => Promise.resolve(responseQueue.shift())),
    order: vi.fn(() => Promise.resolve(responseQueue.shift())),
  };

  return { supabase: builder };
});

import { ConflictError, NotFoundError } from "../../../utils/AppError";
import * as JobOrderService from "../jobOrders";
import { supabase } from "../../../config/supabase";

const ADMIN_ID = "admin-123";
const JOB_ORDER_ID = "job-order-abc";

beforeEach(() => {
  responseQueue.length = 0;
  vi.clearAllMocks();
});

describe("startAdminReview", () => {
  it("moves requirement_submitted -> under_admin_review", async () => {
    queueResponses(
      { data: { status: "requirement_submitted" }, error: null },
      { data: { id: JOB_ORDER_ID, status: "under_admin_review" }, error: null },
      { data: null, error: null },
    );

    const result = await JobOrderService.startAdminReview(JOB_ORDER_ID, ADMIN_ID);

    expect(result.status).toBe("under_admin_review");
  });

  it("moves clarification_required -> under_admin_review (employer responded)", async () => {
    queueResponses(
      { data: { status: "clarification_required" }, error: null },
      { data: { id: JOB_ORDER_ID, status: "under_admin_review" }, error: null },
      { data: null, error: null },
    );

    const result = await JobOrderService.startAdminReview(JOB_ORDER_ID, ADMIN_ID);

    expect(result.status).toBe("under_admin_review");
  });

  it("rejects the move from any other status", async () => {
    queueResponses({ data: { status: "recruitment_open" }, error: null });

    await expect(JobOrderService.startAdminReview(JOB_ORDER_ID, ADMIN_ID)).rejects.toBeInstanceOf(
      ConflictError,
    );
  });

  it("throws NotFoundError when the job order does not exist", async () => {
    queueResponses({ data: null, error: { message: "no rows" } });

    await expect(JobOrderService.startAdminReview(JOB_ORDER_ID, ADMIN_ID)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});

describe("requestJobOrderClarification", () => {
  it("moves under_admin_review -> clarification_required and stores the notes as remarks", async () => {
    queueResponses(
      { data: { status: "under_admin_review" }, error: null },
      {
        data: {
          id: JOB_ORDER_ID,
          status: "clarification_required",
          remarks: "Missing salary range",
        },
        error: null,
      },
      { data: null, error: null },
    );

    const result = await JobOrderService.requestJobOrderClarification(
      JOB_ORDER_ID,
      ADMIN_ID,
      "Missing salary range",
    );

    expect(result.status).toBe("clarification_required");
    expect(result.remarks).toBe("Missing salary range");
  });

  it("rejects the move when not currently under_admin_review", async () => {
    queueResponses({ data: { status: "requirement_submitted" }, error: null });

    await expect(
      JobOrderService.requestJobOrderClarification(JOB_ORDER_ID, ADMIN_ID, "notes"),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});

describe("sendForEmployerApproval", () => {
  it("moves under_admin_review -> employer_approval_pending", async () => {
    queueResponses(
      { data: { status: "under_admin_review" }, error: null },
      { data: { id: JOB_ORDER_ID, status: "employer_approval_pending" }, error: null },
      { data: null, error: null },
    );

    const result = await JobOrderService.sendForEmployerApproval(JOB_ORDER_ID, ADMIN_ID);

    expect(result.status).toBe("employer_approval_pending");
  });

  it("rejects the move from clarification_required (must go through review first)", async () => {
    queueResponses({ data: { status: "clarification_required" }, error: null });

    await expect(
      JobOrderService.sendForEmployerApproval(JOB_ORDER_ID, ADMIN_ID),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});

describe("startLegalization", () => {
  it("moves employer_approval_pending -> legalization_in_progress", async () => {
    queueResponses(
      { data: { status: "employer_approval_pending" }, error: null },
      { data: { id: JOB_ORDER_ID, status: "legalization_in_progress" }, error: null },
      { data: null, error: null },
      // Checklist not yet seeded for this job order.
      { data: null, error: { code: "PGRST116" } },
      // Default checklist rows inserted.
      { error: null },
    );

    const result = await JobOrderService.startLegalization(JOB_ORDER_ID, ADMIN_ID);

    expect(result.status).toBe("legalization_in_progress");
  });

  it("notifies the employer to upload their 3 documents when employer_id is present", async () => {
    queueResponses(
      { data: { status: "employer_approval_pending" }, error: null },
      {
        data: {
          id: JOB_ORDER_ID,
          status: "legalization_in_progress",
          employer_id: "employer-1",
          title: "Welder",
        },
        error: null,
      },
      { data: null, error: null },
      // Checklist not yet seeded for this job order.
      { data: null, error: { code: "PGRST116" } },
      // Default checklist rows inserted.
      { error: null },
      // Employer notification inserted.
      { data: null, error: null },
    );

    const insertSpy = (supabase as any).insert;

    await JobOrderService.startLegalization(JOB_ORDER_ID, ADMIN_ID);

    const notificationCall = insertSpy.mock.calls.find(
      (call: any[]) => call[0]?.related_entity === "job_order" && call[0]?.type === "legalization",
    );

    expect(notificationCall).toBeTruthy();
    expect(notificationCall![0].user_id).toBe("employer-1");
    expect(notificationCall![0].message).toContain("Welder");
  });
});

describe("approveForRecruitment", () => {
  it("moves legalization_in_progress -> approved_for_recruitment and stamps approved_at when every required document is attested", async () => {
    queueResponses(
      // isLegalizationComplete -> getLegalizationChecklist
      {
        data: [
          { is_required: true, status: "attested" },
          { is_required: true, status: "attested" },
          { is_required: false, status: "pending" },
        ],
        error: null,
      },
      { data: { status: "legalization_in_progress" }, error: null },
      {
        data: {
          id: JOB_ORDER_ID,
          status: "approved_for_recruitment",
          approved_at: "2026-08-01T00:00:00.000Z",
        },
        error: null,
      },
      { data: null, error: null },
      // publishJobOrderToCandidates: load job order (+employer), check for
      // an existing jobs row, then insert since none exists yet.
      {
        data: { id: JOB_ORDER_ID, employer_id: "employer-1", title: "Nurse" },
        error: null,
      },
      { data: null, error: null },
      { error: null },
    );

    const result = await JobOrderService.approveForRecruitment(JOB_ORDER_ID, ADMIN_ID);

    expect(result.status).toBe("approved_for_recruitment");
    expect(result.approved_at).toBeTruthy();
  });

  it("rejects the move when a required document is still not attested", async () => {
    queueResponses({
      data: [
        { is_required: true, status: "attested" },
        { is_required: true, status: "submitted" },
      ],
      error: null,
    });

    await expect(
      JobOrderService.approveForRecruitment(JOB_ORDER_ID, ADMIN_ID),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("rejects the move when the checklist was never seeded", async () => {
    queueResponses({ data: [], error: null });

    await expect(
      JobOrderService.approveForRecruitment(JOB_ORDER_ID, ADMIN_ID),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});

describe("openRecruitment", () => {
  it("moves approved_for_recruitment -> recruitment_open", async () => {
    queueResponses(
      { data: { status: "approved_for_recruitment" }, error: null },
      { data: { id: JOB_ORDER_ID, status: "recruitment_open" }, error: null },
      { data: null, error: null },
      // publishJobOrderToCandidates: load job order (+employer), check for
      // an existing jobs row, then insert since none exists yet.
      {
        data: { id: JOB_ORDER_ID, employer_id: "employer-1", title: "Nurse" },
        error: null,
      },
      { data: null, error: null },
      { error: null },
    );

    const result = await JobOrderService.openRecruitment(JOB_ORDER_ID, ADMIN_ID);

    expect(result.status).toBe("recruitment_open");
  });

  it("can no longer be opened straight from requirement_submitted (regression guard)", async () => {
    queueResponses({ data: { status: "requirement_submitted" }, error: null });

    await expect(JobOrderService.openRecruitment(JOB_ORDER_ID, ADMIN_ID)).rejects.toBeInstanceOf(
      ConflictError,
    );
  });
});

describe("closeRecruitment", () => {
  it("moves recruitment_open -> recruitment_closed", async () => {
    queueResponses(
      { data: { status: "recruitment_open" }, error: null },
      { data: { id: JOB_ORDER_ID, status: "recruitment_closed" }, error: null },
      { data: null, error: null },
    );

    const result = await JobOrderService.closeRecruitment(JOB_ORDER_ID, ADMIN_ID);

    expect(result.status).toBe("recruitment_closed");
  });

  it("rejects closing a job order that was never opened (regression guard)", async () => {
    queueResponses({ data: { status: "approved_for_recruitment" }, error: null });

    await expect(JobOrderService.closeRecruitment(JOB_ORDER_ID, ADMIN_ID)).rejects.toBeInstanceOf(
      ConflictError,
    );
  });
});

describe("full happy-path chain", () => {
  it("walks a job order through every status in order", async () => {
    const chain: Array<[string, (id: string, admin: string, notes?: string) => Promise<any>]> = [
      ["under_admin_review", JobOrderService.startAdminReview],
      ["employer_approval_pending", JobOrderService.sendForEmployerApproval],
      ["legalization_in_progress", JobOrderService.startLegalization],
      ["approved_for_recruitment", JobOrderService.approveForRecruitment],
      ["recruitment_open", JobOrderService.openRecruitment],
      ["recruitment_closed", JobOrderService.closeRecruitment],
    ];

    let currentStatus = "requirement_submitted";

    for (const [nextStatus, fn] of chain) {
      if (nextStatus === "approved_for_recruitment") {
        // approveForRecruitment checks the checklist BEFORE the transition,
        // unlike startLegalization's seeding which happens after.
        queueResponses({
          data: [
            { is_required: true, status: "attested" },
            { is_required: true, status: "attested" },
          ],
          error: null,
        });
      }

      queueResponses(
        { data: { status: currentStatus }, error: null },
        { data: { id: JOB_ORDER_ID, status: nextStatus }, error: null },
        { data: null, error: null },
      );

      if (nextStatus === "legalization_in_progress") {
        queueResponses(
          // Checklist not yet seeded for this job order.
          { data: null, error: { code: "PGRST116" } },
          // Default checklist rows inserted.
          { error: null },
        );
      }

      if (nextStatus === "approved_for_recruitment") {
        queueResponses(
          // publishJobOrderToCandidates: load job order (+employer), check
          // for an existing jobs row, then insert since none exists yet.
          {
            data: { id: JOB_ORDER_ID, employer_id: "employer-1", title: "Nurse" },
            error: null,
          },
          { data: null, error: null },
          { error: null },
        );
      }

      if (nextStatus === "recruitment_open") {
        queueResponses(
          // publishJobOrderToCandidates (safety-net re-fire): load job
          // order (+employer), then an existing jobs row IS found
          // (published back at approval), so it takes the update() path -
          // which, unlike insert(), never terminates on a queue-resolving
          // method in this mock (no trailing .single()), so no third
          // response is consumed here.
          {
            data: { id: JOB_ORDER_ID, employer_id: "employer-1", title: "Nurse" },
            error: null,
          },
          { data: { id: "jobs-row-1" }, error: null },
        );
      }

      const result = await fn(JOB_ORDER_ID, ADMIN_ID);

      expect(result.status).toBe(nextStatus);
      currentStatus = nextStatus;
    }
  });
});
