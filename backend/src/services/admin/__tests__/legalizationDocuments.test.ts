import { describe, it, expect, vi, beforeEach } from "vitest";

/*
|--------------------------------------------------------------------------
| Supabase Mock
|--------------------------------------------------------------------------
| Same queue-based pattern as jobOrders.test.ts: script each terminal call
| (single/order/insert) in the exact order the service will make them.
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
    in: vi.fn(() => builder),
    insert: vi.fn(() => Promise.resolve(responseQueue.shift())),
    single: vi.fn(() => Promise.resolve(responseQueue.shift())),
    order: vi.fn(() => Promise.resolve(responseQueue.shift())),
  };

  return { supabase: builder };
});

import * as LegalizationService from "../legalizationDocuments";

const JOB_ORDER_ID = "job-order-abc";

beforeEach(() => {
  responseQueue.length = 0;
  vi.clearAllMocks();
});

describe("getLegalizationChecklist self-heal", () => {
  it("seeds the checklist when a job order reached legalization_in_progress with no rows yet", async () => {
    queueResponses(
      // 1. initial checklist read -> empty (never seeded, e.g. pre-dates this feature)
      { data: [], error: null },
      // 2. job order status lookup -> already past the seeding point
      { data: { status: "legalization_in_progress" }, error: null },
      // 3. initializeLegalizationChecklist's own existence check -> none found
      { data: null, error: { code: "PGRST116" } },
      // 4. the insert of the 8 default rows
      { error: null },
      // 5. re-read after seeding -> the newly inserted rows
      {
        data: [
          { id: "doc-1", document_type: "demand_letter", status: "pending" },
          { id: "doc-2", document_type: "specimen_employment_contract", status: "pending" },
        ],
        error: null,
      },
    );

    const result = await LegalizationService.getLegalizationChecklist(JOB_ORDER_ID);

    expect(result).toHaveLength(2);
    expect(result[0].document_type).toBe("demand_letter");
  });

  it("does not seed a job order that never reached legalization", async () => {
    queueResponses(
      { data: [], error: null },
      { data: { status: "under_admin_review" }, error: null },
    );

    const result = await LegalizationService.getLegalizationChecklist(JOB_ORDER_ID);

    expect(result).toEqual([]);
  });

  it("returns existing rows without any extra lookups when already seeded", async () => {
    queueResponses({
      data: [{ id: "doc-1", document_type: "demand_letter", status: "attested" }],
      error: null,
    });

    const result = await LegalizationService.getLegalizationChecklist(JOB_ORDER_ID);

    expect(result).toHaveLength(1);
    // Only one call was queued - if the service made an extra call, it would
    // have thrown trying to destructure `undefined` instead of returning.
  });
});
