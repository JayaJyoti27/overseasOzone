import { Request, Response } from "express";
import * as NotificationService from "../services/admin/notifications";

function currentUserId(req: Request): string {
  return (req.adminId || req.employerId || req.candidateId)!;
}

/*
|--------------------------------------------------------------------------
| Get Notifications
|--------------------------------------------------------------------------
*/

export async function getNotifications(req: Request, res: Response) {
  try {
    const data = await NotificationService.getNotifications({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      userId: currentUserId(req),
      isRead: req.query.isRead !== undefined ? req.query.isRead === "true" : undefined,
      type: req.query.type as string,
    });

    res.json({
      success: true,
      ...data,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

/*
|--------------------------------------------------------------------------
| Get Notification
|--------------------------------------------------------------------------
*/

export async function getNotification(req: Request, res: Response) {
  try {
    const data = await NotificationService.getNotification(String(req.params.id));

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
}

/*
|--------------------------------------------------------------------------
| Create Notification
|--------------------------------------------------------------------------
*/

export async function createNotification(req: Request, res: Response) {
  try {
    const data = await NotificationService.createNotification({
      user_id: req.body.userId,
      title: req.body.title,
      message: req.body.message,
      type: req.body.type,
      priority: req.body.priority,
      related_entity: req.body.relatedEntity,
      related_entity_id: req.body.relatedEntityId,
    });

    res.status(201).json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

/*
|--------------------------------------------------------------------------
| Mark Read
|--------------------------------------------------------------------------
*/

export async function markAsRead(req: Request, res: Response) {
  try {
    const data = await NotificationService.markAsRead(String(req.params.id));

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

/*
|--------------------------------------------------------------------------
| Mark All Read
|--------------------------------------------------------------------------
*/

export async function markAllAsRead(req: Request, res: Response) {
  try {
    const data = await NotificationService.markAllAsRead(currentUserId(req));

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

/*
|--------------------------------------------------------------------------
| Unread Count
|--------------------------------------------------------------------------
*/

export async function getUnreadCount(req: Request, res: Response) {
  try {
    const data = await NotificationService.getUnreadCount(currentUserId(req));

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

/*
|--------------------------------------------------------------------------
| Delete Notification
|--------------------------------------------------------------------------
*/

export async function deleteNotification(req: Request, res: Response) {
  try {
    const data = await NotificationService.deleteNotification(String(req.params.id));

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}
