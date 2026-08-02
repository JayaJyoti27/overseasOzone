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

    throw new DatabaseError(`Unable to load job order: ${error.message}`, {
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
  }

  if (!data) {
    throw new NotFoundError("Job order not found.");
  }

  // Self-heal: job orders that reached approved_for_recruitment/recruitment_open
  // before the publish step existed (or where a publish attempt silently
  // failed) would otherwise stay invisible to candidates forever, since
  // nothing else re-triggers the publish for a job order already past that
  // point. Fixing it up here means simply opening the job order in the
  // admin panel repairs it - no manual DB work, same pattern as the
  // legalization checklist self-heal.
  if (data.status === "approved_for_recruitment" || data.status === "recruitment_open") {
    const { data: published } = await supabase
      .from("jobs")
      .select("id")
      .eq("job_order_id", jobOrderId)
      .eq("status", "active")
      .maybeSingle();

    if (!published) {
      await publishJobOrderToCandidates(jobOrderId);
    }
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

export async function requestJobOrderClarification(
  jobOrderId: string,
  adminId: string,
  notes: string,
) {
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

  const result = await transitionJobOrderStatus(
    jobOrderId,
    ["legalization_in_progress"],
    "approved_for_recruitment",
    adminId,
    "Approved For Recruitment",
    {
      approved_at: new Date().toISOString(),
    },
  );

  await publishJobOrderToCandidates(jobOrderId);

  return result;
}

/*
|--------------------------------------------------------------------------
| Publish / Unpublish to Candidate-Facing Job Board
|--------------------------------------------------------------------------
| The candidate "Apply for Jobs" pages read from the separate `jobs` table
| (filtered to status = "active"), not from `job_orders` directly. Fires
| from approveForRecruitment below, so candidates see the listing as soon
| as it's approved - openRecruitment also re-fires it (upsert, so it's a
| no-op if already published) purely as a safety net in case a listing
| ever gets closed and reopened without going back through approval.
|
| Upserts on job_order_id so re-opening a previously-closed job order
| reactivates the same listing instead of creating a duplicate. Failure to
| publish is logged but never blocks the status transition itself - the
| job_orders row is the source of truth, `jobs` is just a derived read
| cache for the candidate portal.
|--------------------------------------------------------------------------
*/

async function publishJobOrderToCandidates(jobOrderId: string) {
  const { data: jobOrder, error } = await supabase
    .from("job_orders")
    .select("*")
    .eq("id", jobOrderId)
    .single();

  if (error || !jobOrder) {
    console.error("Unable to load job order for publishing:", error);
    return;
  }

  const { data: existing } = await supabase
    .from("jobs")
    .select("id")
    .eq("job_order_id", jobOrderId)
    .maybeSingle();

  // Mapped against the real `jobs` table schema (confirmed via
  // information_schema.columns) - it does not have company/category/
  // requirements/benefits/salary/contact_*/posted_at columns like an
  // earlier version of this function assumed, which meant every publish
  // was silently failing. Only fields with a real source on the job order
  // are set; city/employer_type/license_required have no equivalent
  // field on job_orders yet, so they're left alone (omitted, not
  // nulled-out) rather than guessed.
  const payload = {
    employer_id: jobOrder.employer_id,
    job_order_id: jobOrder.id,
    title: jobOrder.title,
    country: jobOrder.country ?? null,
    sector: jobOrder.category ?? null,
    salary_min: jobOrder.salary_min ?? null,
    salary_max: jobOrder.salary_max ?? null,
    currency: jobOrder.currency ?? null,
    experience_required: jobOrder.requirements ?? null,
    description: jobOrder.job_description ?? null,
    status: "active",
  };

  const { error: publishError } = existing
    ? await supabase.from("jobs").update(payload).eq("id", existing.id)
    : await supabase.from("jobs").insert(payload);

  if (publishError) {
    console.error("Unable to publish job order to candidate job board:", publishError);
  }
}

async function unpublishJobOrderFromCandidates(jobOrderId: string) {
  const { error } = await supabase
    .from("jobs")
    .update({ status: "closed" })
    .eq("job_order_id", jobOrderId);

  if (error) {
    console.error("Unable to unpublish job order from candidate job board:", error);
  }
}

/*
|--------------------------------------------------------------------------
| Open Recruitment
|--------------------------------------------------------------------------
| approved_for_recruitment -> recruitment_open
|
| Candidates already see the listing from the approval step above; this
| just re-fires the (idempotent) publish as a safety net.
|--------------------------------------------------------------------------
*/

export async function openRecruitment(jobOrderId: string, adminId: string) {
  const result = await transitionJobOrderStatus(
    jobOrderId,
    ["approved_for_recruitment"],
    "recruitment_open",
    adminId,
    "Recruitment Opened",
  );

  await publishJobOrderToCandidates(jobOrderId);

  return result;
}

/*
|--------------------------------------------------------------------------
| Close Recruitment
|--------------------------------------------------------------------------
| recruitment_open -> recruitment_closed
|
| Pulls the listing back off the candidate job board so it stops showing
| as open once recruitment is closed.
|--------------------------------------------------------------------------
*/

export async function closeRecruitment(jobOrderId: string, adminId: string) {
  const result = await transitionJobOrderStatus(
    jobOrderId,
    ["recruitment_open"],
    "recruitment_closed",
    adminId,
    "Recruitment Closed",
  );

  await unpublishJobOrderFromCandidates(jobOrderId);

  return result;
}
