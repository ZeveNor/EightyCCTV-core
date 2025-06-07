import express from "express";
import { updateSlotStatus, getAllSlots } from "../controllers/slot.controller";

const router = express.Router();

router.post("/status", updateSlotStatus);
router.get("/", getAllSlots);

export default router;