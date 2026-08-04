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
  deleteDocument,
  submitForReview,
  getCandidate,
  getCandidates,
  rejectCandidate,
  scheduleCandidateInterview,
  completeCandidateInterview,
  issueCandidateOfferLetter,
  approveCandidateDocuments,
  getJobOrderLegalizationDocuments,
  uploadJobOrderLegalizationDocument,
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
router.delete("/documents/:id", deleteDocument);
router.post("/submit-for-review", submitForReview);

router.get("/candidates", getCandidates);
router.get("/candidates/:id", getCandidate);
router.patch("/candidates/:id/reject", rejectCandidate);
router.post("/candidates/:id/schedule-interview", scheduleCandidateInterview);
router.patch("/candidates/:id/complete-interview", completeCandidateInterview);
router.post("/candidates/:id/offer-letter", upload.single("file"), issueCandidateOfferLetter);
router.patch("/candidates/:id/approve-documents", approveCandidateDocuments);

/*
|--------------------------------------------------------------------------
| Legalization Documents (Demand Letter, Specimen Contract, POA)
|--------------------------------------------------------------------------
*/

router.get("/job-orders/:id/legalization", getJobOrderLegalizationDocuments);

router.post(
  "/job-orders/:id/legalization/:docId/upload",
  upload.single("file"),
  uploadJobOrderLegalizationDocument,
);

export default router;
