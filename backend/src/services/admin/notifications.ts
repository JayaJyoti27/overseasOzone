import { supabase } from "../../config/supabase";
import { DatabaseError, NotFoundError } from "../../utils/AppError";

interface NotificationFilters {
  page?: number;
  limit?: number;
  userId?: string;
  isRead?: boolean;
  type?: string;
}

/*
|--------------------------------------------------------------------------
| Get Notifications
|--------------------------------------------------------------------------
*/

export async function getNotifications(filters: NotificationFilters) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  let query = supabase.from("notifications").select("*", {
    count: "exact",
  });

  if (filters.userId) {
    query = query.eq("user_id", filters.userId);
  }

  if (filters.isRead !== undefined) {
    query = query.eq("is_read", filters.isRead);
  }

  if (filters.type) {
    query = query.eq("type", filters.type);
  }

  query = query
    .order("created_at", {
      ascending: false,
    })
    .range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new DatabaseError("Unable to fetch notifications.", error);
  }

  return {
    notifications: data ?? [],
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
| Get Notification
|--------------------------------------------------------------------------
*/

export async function getNotification(id: string) {
  const { data, error } = await supabase.from("notifications").select("*").eq("id", id).single();

  if (error || !data) {
    throw new NotFoundError("Notification not found.");
  }

  return data;
}
/*
|--------------------------------------------------------------------------
| Create Notification
|--------------------------------------------------------------------------
*/

export async function createNotification(payload: {
  user_id: string;
  user_type?: string;
  title: string;
  message: string;
  type: string;
  priority?: number;
  related_entity?: string;
  related_entity_id?: string;
}) {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      ...payload,
      is_read: false,
    })
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to create notification.", error);
  }

  return data;
}
/*
|--------------------------------------------------------------------------
| Mark Read
|--------------------------------------------------------------------------
*/

export async function markAsRead(id: string) {
  const { data, error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new DatabaseError("Unable to update notification.", error);
  }

  return data;
}
/*
|--------------------------------------------------------------------------
| Mark All Read
|--------------------------------------------------------------------------
*/

export async function markAllAsRead(userId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    throw new DatabaseError("Unable to mark notifications.", error);
  }

  return {
    success: true,
  };
}
/*
|--------------------------------------------------------------------------
| Unread Count
|--------------------------------------------------------------------------
*/

export async function getUnreadCount(userId: string) {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", {
      head: true,
      count: "exact",
    })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    throw new DatabaseError("Unable to fetch unread count.", error);
  }

  return {
    unread: count ?? 0,
  };
}
/*
|--------------------------------------------------------------------------
| Delete Notification
|--------------------------------------------------------------------------
*/

export async function deleteNotification(id: string) {
  const { error } = await supabase.from("notifications").delete().eq("id", id);

  if (error) {
    throw new DatabaseError("Unable to delete notification.", error);
  }

  return {
    success: true,
  };
}
