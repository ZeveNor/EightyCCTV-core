import { Request, Response } from "express";
import * as slotService from "../services/slot.service";

export async function updateSlotStatus(req: Request, res: Response) {
  const { status } = req.body;
  if (!Array.isArray(status)) {
    res.status(400).json({ error: "Invalid status data" });
    return 
  }
  try {
    const slots = await slotService.updateSlotStatus(status);
    // ส่ง event ผ่าน socket.io ถ้ามี io ใน req
    if ((req as any).io) {
      (req as any).io.emit("slots_update", slots);
    }
    res.status(200).json({ message: "Updated slot status in DB" });
  } catch (err) {
    console.error("Error updating DB:", err);
    res.status(500).json({ error: "Database update failed" });
  }
}

export async function getAllSlots(req: Request, res: Response) {
  try {
    const slots = await slotService.getAllSlots();
    res.json(slots);
  } catch (err) {
    console.error("Error fetching slot status:", err);
    res.status(500).json({ error: "Database fetch failed" });
  }
}