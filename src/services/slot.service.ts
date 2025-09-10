import pool from "../models/db";

export async function updateSlotStatus(slots: { slot_name: string, is_parked: boolean }[]) {
  try {
    for (const slot of slots) {
      // ดึงสถานะเดิมก่อน
      const res = await pool.query(
        "SELECT is_parked FROM parking_slots WHERE slot_name = $1",
        [slot.slot_name]
      );
      if ((res.rowCount ?? 0) > 0 && res.rows[0].is_parked !== slot.is_parked) {
        // ถ้าสถานะเปลี่ยน ให้บันทึก log
        await logSlotCreate(slot.slot_name, slot.is_parked);
      }
      await pool.query(
        "UPDATE parking_slots SET is_parked = $1 WHERE slot_name = $2",
        [slot.is_parked, slot.slot_name]
      );
    }
    const result = await pool.query("SELECT * FROM parking_slots ORDER BY id");
    return result.rows;
  } catch (e) {
    console.error("updateSlotStatus error:", e);
    throw e;
  }
}

export async function getSlotLog() {
  try {
    const result = await pool.query(
      "SELECT id, slot_name, is_parked, changed_at FROM slot_log ORDER BY changed_at DESC"
    );
    return result.rows;
  } catch (e) {
    console.error("getSlotLog error:", e);
    throw e;
  }
}

export async function logSlotCreate(slot_name: string, is_parked: boolean) {
  try {
    await pool.query(
      "INSERT INTO slot_log (slot_name, is_parked) VALUES ($1, $2)",
      [slot_name, is_parked]
    );
  } catch (e) {
    console.error("logSlotCreate error:", e);
    throw e;
  }
}

export async function getAllSlotStatus() {
  try {
    const result = await pool.query(
      "SELECT id, slot_name, is_parked FROM parking_slots ORDER BY id"
    );
    return result.rows;
  } catch (e) {
    console.error("getAllSlotStatus error:", e);
  }
}