import { Router } from "express";
import { verifyAuth, requireRole } from "../middleware/verifyAuth";

import {
  // Applications
  getApplications,
  getApplication,
  updateApplicationStage,
  assignRecruiter,
  rejectApplication,
  withdrawApplication,

  // Interviews
  getInterviews,
  scheduleInterview,
  completeInterview,
  cancelInterview,

  // Documents
  getDocuments,
  verifyDocument,
  rejectDocument,

  // Medical
  getMedicals,
  scheduleMedical,
  markMedicalFit,
  markMedicalUnfit,
  markMedicalRetest,

  // Visa
  getVisas,
  getVisa,
  createVisa,
  submitVisa,
  approveVisa,
  issueVisa,
  rejectVisa,

  // Deployment
  getDeployments,
  getDeployment,
  createDeployment,
  addTicket,
  confirmTravel,
  markDeparted,
  markArrived,
  completeDeployment,

  // Timeline
  getTimeline,
} from "../controllers/recruitment";

const router = Router();

router.use(verifyAuth, requireRole("admin"));

/*
|--------------------------------------------------------------------------
| Applications
|--------------------------------------------------------------------------
*/

router.get("/applications", getApplications);

router.get("/applications/:id", getApplication);

router.patch("/applications/:id/stage", updateApplicationStage);

router.patch("/applications/:id/assign", assignRecruiter);

router.patch("/applications/:id/reject", rejectApplication);

router.patch("/applications/:id/withdraw", withdrawApplication);

/*
|--------------------------------------------------------------------------
| Interviews
|--------------------------------------------------------------------------
*/

router.get("/interviews", getInterviews);

router.post("/applications/:applicationId/interview", scheduleInterview);

router.patch("/interviews/:id/complete", completeInterview);

router.patch("/interviews/:id/cancel", cancelInterview);

/*
|--------------------------------------------------------------------------
| Documents
|--------------------------------------------------------------------------
*/

router.get("/documents", getDocuments);

router.patch("/documents/:id/verify", verifyDocument);

router.patch("/documents/:id/reject", rejectDocument);

/*
|--------------------------------------------------------------------------
| Medical
|--------------------------------------------------------------------------
*/

router.get("/medicals", getMedicals);

router.post("/applications/:applicationId/medical", scheduleMedical);

router.patch("/medicals/:id/fit", markMedicalFit);

router.patch("/medicals/:id/unfit", markMedicalUnfit);

router.patch("/medicals/:id/retest", markMedicalRetest);

/*
|--------------------------------------------------------------------------
| Visa
|--------------------------------------------------------------------------
*/

router.get("/visas", getVisas);

router.get("/visas/:id", getVisa);

router.post("/applications/:applicationId/visa", createVisa);

router.patch("/visas/:id/submit", submitVisa);

router.patch("/visas/:id/approve", approveVisa);

router.patch("/visas/:id/issue", issueVisa);

router.patch("/visas/:id/reject", rejectVisa);

/*
|--------------------------------------------------------------------------
| Deployment
|--------------------------------------------------------------------------
*/

router.get("/deployments", getDeployments);

router.get("/deployments/:id", getDeployment);

router.post("/applications/:applicationId/deployment", createDeployment);

router.patch("/deployments/:id/ticket", addTicket);

router.patch("/deployments/:id/travel-confirmed", confirmTravel);

router.patch("/deployments/:id/departed", markDeparted);

router.patch("/deployments/:id/arrived", markArrived);

router.patch("/deployments/:id/complete", completeDeployment);

/*
|--------------------------------------------------------------------------
| Recruitment Timeline
|--------------------------------------------------------------------------
*/

router.get("/applications/:applicationId/timeline", getTimeline);

export default router;
