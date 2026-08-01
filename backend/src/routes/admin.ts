import { Router } from "express";
import { verifyAuth, requireRole } from "../middleware/verifyAuth";
import {
  getDashboard,
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
/*
|--------------------------------------------------------------------------
| Candidate Management
|--------------------------------------------------------------------------
*/

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

router.use("/notifications", notificationRoutes);
/*
|--------------------------------------------------------------------------
| Employer Management
|--------------------------------------------------------------------------
*/

router.get("/employers", getEmployers);

router.get("/employers/pending", getPendingEmployers);

router.get("/employers/:id", getEmployer);

router.get("/employers/:id/documents", getEmployerDocuments);

router.patch("/employers/:id/approve", approveEmployer);

router.patch("/employers/:id/suspend", suspendEmployer);

router.patch("/employers/:id/activate", activateEmployer);
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

router.get("/job-orders", getJobOrders);

router.get("/job-orders/:id", getJobOrder);

router.patch("/job-orders/:id", updateJobOrder);

router.patch("/job-orders/:id/review", startAdminReview);

router.patch("/job-orders/:id/clarification", requestJobOrderClarification);

router.patch("/job-orders/:id/send-for-approval", sendForEmployerApproval);

router.patch("/job-orders/:id/start-legalization", startLegalization);

router.patch("/job-orders/:id/approve-for-recruitment", approveForRecruitment);

router.patch("/job-orders/:id/open", openRecruitment);

router.patch("/job-orders/:id/close", closeRecruitment);

export default router;
