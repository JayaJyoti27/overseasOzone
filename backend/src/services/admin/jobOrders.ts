import { supabase } from "../../config/supabase";
import { ConflictError, DatabaseError, NotFoundError } from "../../utils/AppError";
import { initializeLegalizationChecklist, isLegalizationComplete } from "./legalizationDocuments";

interface JobOrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  employerId?: string;
  country?: string;
  search?: string;
}

/*
|--------------------------------------------------------------------------
| Job Order List
|--------------------------------------------------------------------------
*/

export async function getJobOrders(filters: JobOrderFilters) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  let query = supabase.from("job_orders").select(
    `
      *,
      employer:employers(
        id,
        company_name,
        contact_person,
        email
      )
      `,
    {
      count: "exact",
    },
  );

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.employerId) {
    query = query.eq("employer_id", filters.employerId);
  }

  if (filters.country) {
    query = query.eq("country", filters.country);
  }

  if (filters.search) {
    query = query.or(
      `
      title.ilike.%${filters.search}%,
      country.ilike.%${filters.search}%,
      category.ilike.%${filters.search}%
      `,
    );
  }

  query = query
    .order("created_at", {
      ascending: false,
    })
    .range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new DatabaseError("Unable to fetch job orders.", error);
  }

  return {
    jobOrders: data ?? [],

    pagination: {
      page,

      limit,

      total: count ?? 0,

      totalPages: Math.ceil((count ?? 0) / limit),
    },
  };
}

/*
|--------------------------------------------------------------------------
| Job Order Details
|--------------------------------------------------------------------------
*/

export async function getJobOrder(jobOrderId: string) {
  const { data, error } = await supabase
    .from("job_orders")
    .select(
      `
      *,

      employer:employers(*),

      requirement:requirements!requirement_id(*)
    `,
    )
    .eq("id", jobOrderId)
    .single();

  if (error) {
    // PGRST116 = "no rows" from PostgREST's .single() - genuinely missing/deleted row.
    // Anything else (bad embed, RLS/permissions, column mismatch, etc.) is a real
    // server error and should say so instead of masquerading as "not found".
    if (error.code === "PGRST116") {
      throw new NotFoundError("Job order not found.");
    }

    throw new DatabaseError(
      `Unable to load job order: ${error.message}`,
      { code: error.code, details: error.details, hint: error.hint },
    );
  }

  if (!data) {
    throw new NotFoundError("Job order not found.");
  }

  return data;
}
/*
|--------------------------------------------------------------------------
| Update Job Order
|--------------------------------------------------------------------------
*/

export async function updateJobOrder(
  jobOrderId: string,
  payload: Partial<{
    salary_min: number;

    salary_max: number;

    currency: string;

    contract_duration: string;

    working_hours: string;

    accommodation: boolean;

    transport: boolean;

    food: boolean;

    job_description: string;

    requirements: string;

    benefits: string;

    remarks: string;

    title: string;

    category: string;

    vacancies: number;
  }>,
) {
  const { data, error } = await supabase
    .from("job_orders")
    .update({
      ...payload,

      updated_at: new Date().toISOString(),
    })
    .eq("id", jobOrderId)
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to update job order.", error);
  }

  return data;
}
/*
|--------------------------------------------------------------------------
| Status Transition Guard
|--------------------------------------------------------------------------
| Shared by every workflow transition below: loads the current status,
| rejects the move if it isn't a valid "from" state for that transition,
| updates the row, and drops an activity_logs entry - same audit trail
| pattern used by the Requirements module.
|--------------------------------------------------------------------------
*/

async function transitionJobOrderStatus(
  jobOrderId: string,
  allowedFrom: string[],
  toStatus: string,
  adminId: string,
  action: string,
  extra: Record<string, unknown> = {},
) {
  const { data: current, error: fetchError } = await supabase
    .from("job_orders")
    .select("status")
    .eq("id", jobOrderId)
    .single();

  if (fetchError || !current) {
    throw new NotFoundError("Job order not found.");
  }

  if (!allowedFrom.includes(current.status)) {
    throw new ConflictError(
      `Job order cannot move to "${toStatus}" from its current status ("${current.status}").`,
    );
  }

  const { data, error } = await supabase
    .from("job_orders")
    .update({
      status: toStatus,

      updated_at: new Date().toISOString(),

      ...extra,
    })
    .eq("id", jobOrderId)
    .select()
    .single();

  if (error) {
    throw new DatabaseError(`Unable to ${action.toLowerCase()}.`, error);
  }

  await supabase.from("activity_logs").insert({
    user_id: adminId,

    action,

    entity: "job_order",

    entity_id: jobOrderId,
  });

  return data;
}

/*
|--------------------------------------------------------------------------
| Start / Resume Admin Review
|--------------------------------------------------------------------------
| requirement_submitted -> under_admin_review
| clarification_required -> under_admin_review (employer has responded)
|--------------------------------------------------------------------------
*/

export async function startAdminReview(jobOrderId: string, adminId: string) {
  return transitionJobOrderStatus(
    jobOrderId,
    ["requirement_submitted", "clarification_required"],
    "under_admin_review",
    adminId,
    "Job Order Review Started",
  );
}

/*
|--------------------------------------------------------------------------
| Request Employer Clarification
|--------------------------------------------------------------------------
| under_admin_review -> clarification_required
|--------------------------------------------------------------------------
*/

export async function requestJobOrderClarification(jobOrderId: string, adminId: string, notes: string) {
  return transitionJobOrderStatus(
    jobOrderId,
    ["under_admin_review"],
    "clarification_required",
    adminId,
    "Job Order Clarification Requested",
    {
      remarks: notes,
    },
  );
}

/*
|--------------------------------------------------------------------------
| Send For Employer Approval
|--------------------------------------------------------------------------
| under_admin_review -> employer_approval_pending
|--------------------------------------------------------------------------
*/

export async function sendForEmployerApproval(jobOrderId: string, adminId: string) {
  return transitionJobOrderStatus(
    jobOrderId,
    ["under_admin_review"],
    "employer_approval_pending",
    adminId,
    "Sent For Employer Approval",
  );
}

/*
|--------------------------------------------------------------------------
| Start Legalization
|--------------------------------------------------------------------------
| employer_approval_pending -> legalization_in_progress
|--------------------------------------------------------------------------
*/

export async function startLegalization(jobOrderId: string, adminId: string) {
  const result = await transitionJobOrderStatus(
    jobOrderId,
    ["employer_approval_pending"],
    "legalization_in_progress",
    adminId,
    "Legalization Started",
  );

  await initializeLegalizationChecklist(jobOrderId);

  if (result.employer_id) {
    await supabase.from("notifications").insert({
      user_id: result.employer_id,

      title: "Documents needed for legalization",

      message: `Please upload the Demand Letter, Specimen Employment Contract, and Power of Attorney for "${result.title ?? "your job order"}" so we can proceed with legalization.`,

      type: "legalization",

      related_entity: "job_order",

      related_entity_id: jobOrderId,
    });
  }

  return result;
}

/*
|--------------------------------------------------------------------------
| Approve For Recruitment
|--------------------------------------------------------------------------
| legalization_in_progress -> approved_for_recruitment
|--------------------------------------------------------------------------
*/

export async function approveForRecruitment(jobOrderId: string, adminId: string) {
  const complete = await isLegalizationComplete(jobOrderId);

  if (!complete) {
    throw new ConflictError(
      "Cannot approve for recruitment until every required legalization document is attested.",
    );
  }

  return transitionJobOrderStatus(
    jobOrderId,
    ["legalization_in_progress"],
    "approved_for_recruitment",
    adminId,
    "Approved For Recruitment",
    {
      approved_at: new Date().toISOString(),
    },
  );
}

/*
|--------------------------------------------------------------------------
| Open Recruitment
|--------------------------------------------------------------------------
| approved_for_recruitment -> recruitment_open
|--------------------------------------------------------------------------
*/

export async function openRecruitment(jobOrderId: string, adminId: string) {
  return transitionJobOrderStatus(
    jobOrderId,
    ["approved_for_recruitment"],
    "recruitment_open",
    adminId,
    "Recruitment Opened",
  );
}

/*
|--------------------------------------------------------------------------
| Close Recruitment
|--------------------------------------------------------------------------
| recruitment_open -> recruitment_closed
|--------------------------------------------------------------------------
*/

export async function closeRecruitment(jobOrderId: string, adminId: string) {
  return transitionJobOrderStatus(
    jobOrderId,
    ["recruitment_open"],
    "recruitment_closed",
    adminId,
    "Recruitment Closed",
  );
}
