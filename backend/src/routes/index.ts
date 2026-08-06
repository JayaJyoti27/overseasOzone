import { Router } from "express";

import { verifyAuth, requireRole, requirePermission } from "../middleware/verifyAuth";
import adminRoutes from "./admin";
import authRoutes from "./auth";
import candidateRoutes from "./candidates";
import employerRoutes from "./employer";

import recruitmentRoutes from "./recruitment";

import jobsRoutes from "./jobs";
import documentsRoutes from "./documents";
import interviewRoutes from "./interview";
import medicalRoutes from "./medical";
import visaRoutes from "./visa";
import deploymentRoutes from "./deployment";
import offerRoutes from "./offer";
import notificationRoutes from "./notifications";
import reportsRoutes from "./reports";
import settingsRoutes from "./settings";
const router = Router();

/*
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/

router.use("/jobs", jobsRoutes);
router.use("/settings", settingsRoutes);
/*
|--------------------------------------------------------------------------
| Candidate Portal
|--------------------------------------------------------------------------
*/

router.use("/candidate", candidateRoutes);

/*
|--------------------------------------------------------------------------
| Employer Portal
|--------------------------------------------------------------------------
*/

router.use("/employer", employerRoutes);

/*
|--------------------------------------------------------------------------
| Admin
|--------------------------------------------------------------------------
*/

router.use("/admin", adminRoutes);

/*
|--------------------------------------------------------------------------
| Recruitment
|--------------------------------------------------------------------------
*/

router.use("/recruitment", recruitmentRoutes);

/*
|--------------------------------------------------------------------------
| Standalone Modules
|--------------------------------------------------------------------------
*/

router.use("/documents", documentsRoutes);

router.use("/interviews", interviewRoutes);

router.use("/medicals", medicalRoutes);

router.use("/visas", visaRoutes);

router.use("/deployments", deploymentRoutes);

router.use("/offers", offerRoutes);

router.use("/notifications", verifyAuth, notificationRoutes);

router.use(
  "/admin/reports",
  verifyAuth,
  requireRole("admin"),
  requirePermission("reports"),
  reportsRoutes,
);
router.use("/auth", authRoutes);
export default router;
