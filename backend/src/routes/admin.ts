import { Router } from "express";
import { verifyAuth, requireRole, requirePermission } from "../middleware/verifyAuth";
import {
  getDashboard,
  getAdminUsers,
  inviteAdminUser,
  updateAdminUserRole,
  suspendAdminUser,
  activateAdminUser,
  getMyAdminProfile,
  getAdminLoginHistory,
  getEmployers,
  getEmployer,
  getPendingEmployers,
  getEmployerDocuments,
  approveEmployer,
  suspendEmployer,
  getRequirements,
  getRequirement,
  reviewRequirement,
  requestClarification,
  approveRequirement,
  rejectRequirement,
  convertRequirement,
  activateEmployer,
  getJobOrders,
  getJobOrder,
  updateJobOrder,
  startAdminReview,
  requestJobOrderClarification,
  sendForEmployerApproval,
  startLegalization,
  approveForRecruitment,
  openRecruitment,
  closeRecruitment,
  getJobOrderLegalizationChecklist,
  updateJobOrderLegalizationDocument,
} from "../controllers/admin";
const router = Router();
import {
  getCandidates,
  getCandidate,
  activateCandidate,
  suspendCandidate,
} from "../controllers/admin";
import notificationRoutes from "./notifications";

router.use(verifyAuth, requireRole("admin"));
/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

// Every admin role can see the dashboard, so no requirePermission here.
router.get("/me", getMyAdminProfile);

/*
|--------------------------------------------------------------------------
| Admin Users (User Management) — super_admin only
|--------------------------------------------------------------------------
*/

router.use("/users", requirePermission("admin-users"));
router.get("/users", getAdminUsers);
router.post("/users/invite", inviteAdminUser);
router.patch("/users/:id/role", updateAdminUserRole);
router.patch("/users/:id/suspend", suspendAdminUser);
router.patch("/users/:id/activate", activateAdminUser);
router.get("/users/:id/login-history", getAdminLoginHistory);

/*
|--------------------------------------------------------------------------
| Candidate Management
|--------------------------------------------------------------------------
*/

router.use("/candidates", requirePermission("candidates"));
router.get("/candidates", getCandidates);

router.get("/candidates/:id", getCandidate);

router.patch("/candidates/:id/activate", activateCandidate);

router.patch("/candidates/:id/suspend", suspendCandidate);

router.get("/dashboard", getDashboard);
/*
|--------------------------------------------------------------------------
| Notifications
|--------------------------------------------------------------------------
*/

router.use("/notifications", requirePermission("notifications"), notificationRoutes);
/*
|--------------------------------------------------------------------------
| Employer Management
|--------------------------------------------------------------------------
*/

router.use("/employers", requirePermission("employers"));
router.get("/employers", getEmployers);

router.get("/employers/pending", getPendingEmployers);

router.get("/employers/:id", getEmployer);

router.get("/employers/:id/documents", getEmployerDocuments);

router.patch("/employers/:id/approve", approveEmployer);

router.patch("/employers/:id/suspend", suspendEmployer);

router.patch("/employers/:id/activate", activateEmployer);

router.use("/requirements", requirePermission("requirements"));
router.get("/requirements", getRequirements);
router.get("/requirements/:id", getRequirement);

router.patch("/requirements/:id/review", reviewRequirement);
router.patch("/requirements/:id/clarification", requestClarification);
router.patch("/requirements/:id/approve", approveRequirement);
router.patch("/requirements/:id/reject", rejectRequirement);
router.patch("/requirements/:id/convert", convertRequirement);
/*
|--------------------------------------------------------------------------
| Job Orders
|--------------------------------------------------------------------------
*/

router.use("/job-orders", requirePermission("job-orders"));
router.get("/job-orders", getJobOrders);

router.get("/job-orders/:id", getJobOrder);

router.patch("/job-orders/:id", updateJobOrder);

router.patch("/job-orders/:id/review", startAdminReview);

router.patch("/job-orders/:id/clarification", requestJobOrderClarification);

router.patch("/job-orders/:id/send-for-approval", sendForEmployerApproval);

router.patch("/job-orders/:id/start-legalization", startLegalization);

router.get("/job-orders/:id/legalization", getJobOrderLegalizationChecklist);

router.patch("/job-orders/:id/legalization/:docId", updateJobOrderLegalizationDocument);

router.patch("/job-orders/:id/approve-for-recruitment", approveForRecruitment);

router.patch("/job-orders/:id/open", openRecruitment);

router.patch("/job-orders/:id/close", closeRecruitment);

/*
|--------------------------------------------------------------------------
| Reports
|--------------------------------------------------------------------------
| The actual /admin/reports/* handlers are mounted separately in
| routes/index.ts (reportsRoutes) and fall through to here first because
| they share the /admin prefix — this just adds the permission check before
| that fallthrough happens.
*/

router.use("/reports", requirePermission("reports"));

export default router;
