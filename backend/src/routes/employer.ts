import { Router } from "express";
import { verifyAuth, requireRole } from "../middleware/verifyAuth";

import {
  getDashboard,
  getProfile,
  updateProfile,
  getRequirements,
  getRequirement,
  createRequirement,
  updateRequirement,
  withdrawRequirement,
  getInterviews,
  confirmInterview,
  getDeployments,
  getDeployment,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getDocuments,
  uploadDocument,
  submitForReview,
  getCandidate,
  getCandidates,
} from "../controllers/employer";
import { upload } from "../middleware/upload";

const router = Router();

router.use(verifyAuth, requireRole("employer"));

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

router.get("/dashboard", getDashboard);

/*
|--------------------------------------------------------------------------
| Company Profile
|--------------------------------------------------------------------------
*/

router.get("/profile", getProfile);

router.patch("/profile", updateProfile);

/*
|--------------------------------------------------------------------------
| Requirements
|--------------------------------------------------------------------------
*/

router.get("/requirements", getRequirements);

router.post("/requirements", createRequirement);

router.get("/requirements/:id", getRequirement);

router.patch("/requirements/:id", updateRequirement);

router.patch("/requirements/:id/withdraw", withdrawRequirement);

/*
|--------------------------------------------------------------------------
| Interviews
|--------------------------------------------------------------------------
*/

router.get("/interviews", getInterviews);

router.patch("/interviews/:id/confirm", confirmInterview);

/*
|--------------------------------------------------------------------------
| Deployments
|--------------------------------------------------------------------------
*/

router.get("/deployments", getDeployments);

router.get("/deployments/:id", getDeployment);

/*
|--------------------------------------------------------------------------
| Notifications
|--------------------------------------------------------------------------
*/

router.get("/notifications", getNotifications);

router.patch("/notifications/read-all", markAllNotificationsRead);

router.patch("/notifications/:id/read", markNotificationRead);
router.get("/documents", getDocuments);
router.post("/documents", upload.single("file"), uploadDocument);
router.post("/submit-for-review", submitForReview);

router.get("/candidates", getCandidates);
router.get("/candidates/:id", getCandidate);
export default router;
