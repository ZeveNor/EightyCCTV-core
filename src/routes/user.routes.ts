import express from "express";
import { getMyProfile,  updateMyProfile } from "../controllers/user.controller";
import { authRole } from "../middleware/auth";


const router = express.Router();

router.use(authRole("user")); // จำกัดเฉพาะ user

router.get("/me", getMyProfile);
router.put("/me", updateMyProfile);


export default router;
