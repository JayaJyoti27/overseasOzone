import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase";
import { AdminRole, AdminSection, roleCanAccess } from "../constants/adminPermissions";
import { recordAdminLoginIfNeeded } from "../services/admin/loginHistory";

// Extend Express's Request so every controller can read the logged-in user's id
declare global {
  namespace Express {
    interface Request {
      candidateId?: string;
      employerId?: string;
      adminId?: string;
      userRole?: "admin" | "employer" | "candidate";
      adminRole?: AdminRole;
      authUserId?: string;
      authUserEmail?: string;
    }
  }
}

/**
 * Verifies the Supabase access token sent as `Authorization: Bearer <token>`.
 * On success, attaches the caller's id to req.candidateId / req.employerId / req.adminId
 * (based on their role in the `profiles` table) so controllers stop using hardcoded demo ids.
 */
export async function verifyAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Missing or invalid Authorization header.",
      });
    }

    const token = authHeader.split(" ")[1];

    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session. Please log in again.",
      });
    }
    req.authUserId = userData.user.id;
    req.authUserEmail = userData.user.email ?? undefined;
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, admin_role, status")
      .eq("id", userData.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({
        success: false,
        message: "This account has no role assigned yet.",
      });
    }

    if (profile.role === "admin" && profile.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "This admin account has been suspended.",
      });
    }

    // Invited admin just used their invite link for the first time — flip
    // them to active now that they have a real session.
    if (profile.role === "admin" && profile.status === "invited") {
      await supabase.from("profiles").update({ status: "active" }).eq("id", profile.id);
      profile.status = "active";
    }

    req.userRole = profile.role;

    if (profile.role === "candidate") req.candidateId = profile.id;
    if (profile.role === "employer") req.employerId = profile.id;
    if (profile.role === "admin") {
      req.adminId = profile.id;
      req.adminRole = (profile.admin_role as AdminRole) ?? "super_admin";

      // Fire-and-forget: don't hold up the request waiting on this.
      recordAdminLoginIfNeeded({
        userId: profile.id,
        email: req.authUserEmail,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
    }

    return next();
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Authentication check failed.",
    });
  }
}

/** Use after verifyAuth to lock a route group to a specific role. */
export function requireRole(role: "admin" | "employer" | "candidate") {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.userRole !== role) {
      return res.status(403).json({
        success: false,
        message: `This endpoint requires a ${role} account.`,
      });
    }
    return next();
  };
}

/**
 * Use after verifyAuth + requireRole("admin") to lock a route group to admins
 * whose role includes this section. super_admin always passes. See
 * backend/src/constants/adminPermissions.ts for what each role can see.
 */
export function requirePermission(section: AdminSection) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roleCanAccess(req.adminRole, section)) {
      return res.status(403).json({
        success: false,
        message: "Your admin role doesn't have access to this section.",
      });
    }
    return next();
  };
}

/**
 * Lighter check than verifyAuth: confirms the Supabase session is real, but does NOT
 * require a profiles row to exist yet. Use this only for the signup-completion endpoint —
 * every other route should use verifyAuth + requireRole.
 */
export async function verifySession(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Missing or invalid Authorization header.",
      });
    }

    const token = authHeader.split(" ")[1];

    const { data: userData, error } = await supabase.auth.getUser(token);

    if (error || !userData.user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session. Please log in again.",
      });
    }

    req.authUserId = userData.user.id;
    req.authUserEmail = userData.user.email ?? undefined;

    return next();
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Authentication check failed.",
    });
  }
}
