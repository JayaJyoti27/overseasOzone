import { supabase } from "../../../config/supabase";
import { DatabaseError, NotFoundError } from "../../../utils/AppError";
import { recordStatusChange } from "./statusHistory";

interface DeploymentFilters {
  page?: number;
  limit?: number;
  status?: string;
  employerId?: string;
  jobOrderId?: string;
}

/*
|--------------------------------------------------------------------------
| Deployment List
|--------------------------------------------------------------------------
*/

export async function getDeployments(filters: DeploymentFilters) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  let query = supabase.from("deployments").select(
    `
      *,
      candidate:candidates(
        id,
        full_name,
        phone,
        email
      ),
      application:applications(
        id,
        internal_status
      ),
      visa:visas(
        id,
        visa_number,
        status
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

  if (filters.jobOrderId) {
    query = query.eq("job_order_id", filters.jobOrderId);
  }

  query = query
    .order("created_at", {
      ascending: false,
    })
    .range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new DatabaseError("Unable to fetch deployments.", error);
  }

  return {
    deployments: data ?? [],
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
| Deployment Details
|--------------------------------------------------------------------------
*/

export async function getDeployment(deploymentId: string) {
  const { data, error } = await supabase
    .from("deployments")
    .select(
      `
      *,
      candidate:candidates(*),
      application:applications(*),
      visa:visas(*)
    `,
    )
    .eq("id", deploymentId)
    .single();

  if (error || !data) {
    throw new NotFoundError("Deployment not found.");
  }

  return data;
}
/*
|--------------------------------------------------------------------------
| Create Deployment
|--------------------------------------------------------------------------
*/

export async function createDeployment(
  applicationId: string,
  createdBy: string,
  payload: {
    candidate_id: string;
    employer_id: string;
    job_order_id: string;
    visa_id: string;
  },
) {
  const { data, error } = await supabase
    .from("deployments")
    .insert({
      application_id: applicationId,

      created_by: createdBy,

      ...payload,

      status: "pending",
    })
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to create deployment.", error);
  }

  return data;
}
/*
|--------------------------------------------------------------------------
| Add Ticket Details
|--------------------------------------------------------------------------
*/

export async function addTicket(
  deploymentId: string,
  payload: {
    ticket_number: string;
    airline_name: string;
    flight_number: string;
    departure_airport: string;
    arrival_airport: string;
    departure_time: string;
    arrival_time: string;
    ticket_document_id?: string;
  },
) {
  const { data, error } = await supabase
    .from("deployments")
    .update({
      ...payload,

      status: "ticket_booked",

      updated_at: new Date().toISOString(),
    })
    .eq("id", deploymentId)
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to update ticket.", error);
  }

  return data;
}
/*
|--------------------------------------------------------------------------
| Mark Departed
|--------------------------------------------------------------------------
*/

export async function markDeparted(deploymentId: string) {
  const { data, error } = await supabase
    .from("deployments")
    .update({
      status: "departed",

      updated_at: new Date().toISOString(),
    })
    .eq("id", deploymentId)
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to update deployment.", error);
  }

  return data;
}
/*
|--------------------------------------------------------------------------
| Complete Deployment
|--------------------------------------------------------------------------
*/

export async function completeDeployment(deploymentId: string, remarks?: string, changedBy?: string) {
  const { data, error } = await supabase
    .from("deployments")
    .update({
      status: "deployed",

      remarks,

      updated_at: new Date().toISOString(),
    })
    .eq("id", deploymentId)
    .select()
    .single();

  if (error || !data) {
    throw new DatabaseError("Unable to complete deployment.", error);
  }

  await supabase
    .from("applications")
    .update({
      internal_status: "deployed",

      last_status_change: new Date().toISOString(),

      updated_at: new Date().toISOString(),
    })
    .eq("id", data.application_id);

  await recordStatusChange(data.application_id, "deployed", { changedBy, notes: remarks });

  return data;
}
/*
|--------------------------------------------------------------------------
| Confirm Travel
|--------------------------------------------------------------------------
*/

export async function confirmTravel(deploymentId: string) {
  const { data, error } = await supabase
    .from("deployments")
    .update({
      status: "travel_confirmed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", deploymentId)
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to confirm travel.", error);
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Mark Arrived
|--------------------------------------------------------------------------
*/

export async function markArrived(deploymentId: string) {
  const { data, error } = await supabase
    .from("deployments")
    .update({
      status: "arrived",
      updated_at: new Date().toISOString(),
    })
    .eq("id", deploymentId)
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to mark arrival.", error);
  }

  return data;
}
