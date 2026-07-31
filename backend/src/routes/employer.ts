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
} from "../controllers/employer";
import { verifyAuth, requireRole } from "../middleware/verifyAuth";

import { getCandidate, getCandidates } from "../controllers/employer";
const router = Router();
<<<<<<< HEAD
router.use(verifyAuth, requireRole("employer"));
=======

router.use(verifyAuth, requireRole("employer"));

>>>>>>> bfb50e0e7f772bb182945a4adf0a1341b4ed4d8e
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
router.get("/candidates", getCandidates);
router.get("/candidates/:id", getCandidate);
export default router;
