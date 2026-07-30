import { Router } from "express";
import { verifySession } from "../middleware/verifyAuth";
import { completeCandidateSignup } from "../controllers/auth";
import { completeEmployerSignup } from "../controllers/auth";

const router = Router();

router.post("/complete-candidate-signup", verifySession, completeCandidateSignup);
router.post("/complete-employer-signup", verifySession, completeEmployerSignup); // <-- add

export default router;
