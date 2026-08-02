import { supabase } from "../config/supabase";
import { CreateJobOrderDto, UpdateJobOrderDto } from "../validators/jobOrderSchema";
import { JobOrder, JobOrderStatus } from "../types/jobOrder";

/*
|--------------------------------------------------------------------------
| Status Flow
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Validation Helpers
|--------------------------------------------------------------------------
*/

function canTransition(current: JobOrderStatus, next: JobOrderStatus): boolean {
  return STATUS_FLOW[current].includes(next);
}

function editable(status: JobOrderStatus): boolean {
  return status === "requirement_submitted" || status === "clarification_required";
}

/*
|--------------------------------------------------------------------------
| Queries
|--------------------------------------------------------------------------
*/

export async function findById(id: string): Promise<JobOrder> {
  const { data, error } = await supabase.from("job_orders").select("*").eq("id", id).single();

  if (error) throw error;

  return data as JobOrder;
}

export async function getAll() {
  const { data, error } = await supabase
    .from("job_orders")
    .select(
      `
        *,
        employer:employers(
          id,
          company_name,
          contact_person,
          email
        )
      `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}

export async function getByEmployer(employerId: string) {
  const { data, error } = await supabase
    .from("job_orders")
    .select("*")
    .eq("employer_id", employerId)
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}

/*
|--------------------------------------------------------------------------
| Create Job Order
|--------------------------------------------------------------------------
*/

export async function create(employerId: string, body: CreateJobOrderDto) {
  const payload = {
    employer_id: employerId,

    requirement_id: body.requirement_id ?? null,

    title: body.title,

    category: body.category ?? null,

    country: body.country ?? null,

    vacancies: body.vacancies,

    salary_min: body.salary_min ?? null,

    salary_max: body.salary_max ?? null,

    currency: body.currency ?? null,

    contract_duration: body.contract_duration ?? null,

    working_hours: body.working_hours ?? null,

    accommodation: body.accommodation ?? false,

    transport: body.transport ?? false,

    food: body.food ?? false,

    job_description: body.job_description ?? null,

    requirements: body.requirements ?? null,

    benefits: body.benefits ?? null,

    remarks: body.remarks ?? null,

    status: "requirement_submitted",

    submitted_at: new Date().toISOString(),

    is_deleted: false,
  };

  const { data, error } = await supabase.from("job_orders").insert(payload).select().single();

  if (error) throw error;

  /*
   Activity Log
  */

  await supabase.from("activity_logs").insert({
    user_id: employerId,

    action: "Created Job Order",

    entity: "job_order",

    entity_id: data.id,

    metadata: payload,
  });

  /*
   Notification
  */

  await supabase.from("notifications").insert({
    candidate_id: employerId,

    title: "Job Order Submitted",

    message: "Your Job Order has been submitted successfully.",

    type: "system",
  });

  return data;
}

const STATUS_FLOW: Record<JobOrderStatus, JobOrderStatus[]> = {
  requirement_submitted: ["under_admin_review", "cancelled"],

  under_admin_review: [
    "clarification_required",
    "employer_approval_pending",
    "approved_for_recruitment",
    "cancelled",
  ],

  clarification_required: ["under_admin_review", "cancelled"],

  employer_approval_pending: ["legalization_in_progress", "cancelled"],

  legalization_in_progress: ["approved_for_recruitment", "cancelled"],

  approved_for_recruitment: ["recruitment_open", "cancelled"],

  recruitment_open: ["candidate_selected", "recruitment_closed"],

  recruitment_closed: ["cancelled"],

  candidate_selected: ["visa_processing"],

  visa_processing: ["deployment_completed", "cancelled"],

  deployment_completed: [],

  cancelled: [],
};

export async function updateJobOrderStatus(
  jobOrderId: string,
  adminId: string,
  nextStatus: JobOrderStatus,
  remarks?: string,
) {
  /*
  ------------------------------------------------------
  Get Existing
  ------------------------------------------------------
  */

  const { data: existing, error } = await supabase
    .from("job_orders")
    .select("*")
    .eq("id", jobOrderId)
    .single();

  if (error) throw error;

  /*
  ------------------------------------------------------
  Validate Transition
  ------------------------------------------------------
  */

  const currentStatus = existing.status as JobOrderStatus;

  const allowed = STATUS_FLOW[currentStatus];

  if (!allowed.includes(nextStatus)) {
    throw new Error(`Cannot move Job Order from ${currentStatus} to ${nextStatus}`);
  }
  /*
  ------------------------------------------------------
  Update Status
  ------------------------------------------------------
  */

  const { data: updated, error: updateError } = await supabase
    .from("job_orders")
    .update({
      status: nextStatus,
      remarks,
    })
    .eq("id", jobOrderId)
    .select()
    .single();

  if (updateError) throw updateError;

  /*
  ------------------------------------------------------
  History
  ------------------------------------------------------
  */

  await supabase.from("job_order_status_history").insert({
    job_order_id: jobOrderId,

    old_status: existing.status,

    new_status: nextStatus,

    remarks,

    changed_by: adminId,
  });

  /*
  ------------------------------------------------------
  Activity
  ------------------------------------------------------
  */

  await supabase.from("activity_logs").insert({
    user_id: adminId,

    action: "Job Order Status Changed",

    entity: "job_order",

    entity_id: jobOrderId,

    metadata: {
      previous: existing.status,

      current: nextStatus,
    },
  });

  /*
  ------------------------------------------------------
  Employer Notification
  ------------------------------------------------------
  */

  await supabase.from("notifications").insert({
    user_id: existing.employer_id,

    title: "Job Order Updated",

    message: `Job Order moved to ${nextStatus.replaceAll("_", " ")}`,

    type: "status",

    related_entity: "job_order",

    related_entity_id: jobOrderId,
  });

  /*
  ------------------------------------------------------
  Requirement Sync
  ------------------------------------------------------
  */

  if (existing.requirement_id) {
    await supabase
      .from("requirements")
      .update({
        converted_job_order_id: jobOrderId,
      })
      .eq("id", existing.requirement_id);
  }

  /*
  ------------------------------------------------------
  Auto Publish Job
  ------------------------------------------------------
  */

  if (nextStatus === "approved_for_recruitment") {
    await supabase.from("jobs").insert({
      employer_id: existing.employer_id,

      job_order_id: existing.id,

      title: existing.title,

      country: existing.country,

      description: existing.job_description,

      status: "active",
    });
  }

  return updated;
}

export async function deleteJobOrder(jobOrderId: string, employerId: string) {
  /*
  ------------------------------------------------------------------
  Fetch Existing Job Order
  ------------------------------------------------------------------
  */

  const { data: existing, error } = await supabase
    .from("job_orders")
    .select("*")
    .eq("id", jobOrderId)
    .single();

  if (error) {
    throw new Error("Job Order not found.");
  }

  /*
  ------------------------------------------------------------------
  Already Deleted
  ------------------------------------------------------------------
  */

  if (existing.is_deleted) {
    throw new Error("Job Order has already been deleted.");
  }

  /*
  ------------------------------------------------------------------
  Ownership Validation
  ------------------------------------------------------------------
  */

  if (existing.employer_id !== employerId) {
    throw new Error("You are not allowed to delete this Job Order.");
  }

  /*
  ------------------------------------------------------------------
  Business Rule Validation
  ------------------------------------------------------------------
  */

  const protectedStatuses = [
    "approved_for_recruitment",
    "recruitment_open",
    "candidate_selected",
    "visa_processing",
    "deployment_completed",
  ];

  if (protectedStatuses.includes(existing.status)) {
    throw new Error(`Cannot delete Job Order while status is "${existing.status}".`);
  }

  /*
  ------------------------------------------------------------------
  Soft Delete
  ------------------------------------------------------------------
  */
  const { error: deleteError } = await supabase
    .from("job_orders")
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    })
    .eq("id", jobOrderId);

  if (deleteError) {
    throw deleteError;
  }

  await supabase.from("activity_logs").insert({
    user_id: employerId,
    action: "Deleted Job Order",
    entity: "job_order",
    entity_id: jobOrderId,
  });

  /*
------------------------------------------------------------------
Return
------------------------------------------------------------------
*/

  return {
    success: true,
    message: "Job Order deleted successfully.",
  };
}
export async function getJobOrder(jobOrderId: string) {
  const { data, error } = await supabase
    .from("job_orders")
    .select(
      `
      *,
      employer:employers(
        id,
        company_name,
        contact_person,
        email,
        phone
      ),
      requirement:requirements!requirement_id(
        id,
        role,
        sector
      )
    `,
    )
    .eq("id", jobOrderId)
    .or("is_deleted.is.null,is_deleted.eq.false")
    .single();

  if (error) {
    throw error;
  }

  const { data: history } = await supabase
    .from("job_order_status_history")
    .select(
      `
      id,
      old_status,
      new_status,
      remarks,
      changed_by,
      created_at
    `,
    )
    .eq("job_order_id", jobOrderId)
    .order("created_at", {
      ascending: false,
    });

  return {
    ...data,
    history: history ?? [],
  };
}

interface ListFilters {
  employerId?: string;
  country?: string;
  category?: string;
  status?: JobOrderStatus;
  page?: number;
  limit?: number;
}

export async function listJobOrders(filters: ListFilters = {}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  let query = supabase
    .from("job_orders")
    .select(
      `
      *,
      employer:employers(
        id,
        company_name
      )
    `,
      {
        count: "exact",
      },
    )
    .eq("is_deleted", false);

  if (filters.employerId) {
    query = query.eq("employer_id", filters.employerId);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.country) {
    query = query.ilike("country", `%${filters.country}%`);
  }

  if (filters.category) {
    query = query.ilike("category", `%${filters.category}%`);
  }

  query = query
    .order("created_at", {
      ascending: false,
    })
    .range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return {
    data,
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  };
}
export async function updateJobOrder(jobOrderId: string, body: UpdateJobOrderDto) {
  const { data, error } = await supabase
    .from("job_orders")
    .update({
      title: body.title,
      category: body.category,
      country: body.country,
      vacancies: body.vacancies,
      salary_min: body.salary_min,
      salary_max: body.salary_max,
      currency: body.currency,
      contract_duration: body.contract_duration,
      working_hours: body.working_hours,
      accommodation: body.accommodation,
      transport: body.transport,
      food: body.food,
      job_description: body.job_description,
      requirements: body.requirements,
      benefits: body.benefits,
      remarks: body.remarks,
    })
    .eq("id", jobOrderId)
    .select()
    .single();

  if (error) throw error;

  return data;
}
