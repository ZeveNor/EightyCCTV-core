import express from "express";
import { getAllUsersExceptAdmin, getUserById } from "../controllers/security.controller";
import { authRole } from "../middleware/auth";

const router = express.Router();

router.use(authRole("security"));

router.get("/users", getAllUsersExceptAdmin);
router.get("/users/:id", getUserById);

export default router;
