import express from "express";
import { register,login } from "../controllers/auth.controller";
import { requestEmailVerification, confirmEmail } from "../controllers/auth.controller";
import { requestPasswordReset, confirmResetPassword } from "../controllers/auth.controller";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-request", requestEmailVerification);
router.get("/verify-email", confirmEmail);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", confirmResetPassword);

export default router;