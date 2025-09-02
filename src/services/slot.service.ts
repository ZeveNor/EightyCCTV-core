import pool from "../models/db";

export async function updateSlotStatus(slots: { slot_name: string, is_parked: boolean }[]) {
  for (const slot of slots) {
    await pool.query(
      "UPDATE parking_slots SET is_parked = $1 WHERE slot_name = $2",
      [slot.is_parked, slot.slot_name]
    );
  }
  const result = await pool.query("SELECT * FROM parking_slots ORDER BY id");
  return result.rows;
}

export async function createSlot(slotName: string, slotRows: string) {
  const result = await pool.query(
    "INSERT INTO parking_slots (slot_name, is_parked, slot_rows_name) VALUES ($1, $2, $3) RETURNING *",
    [slotName, false, slotRows]
  );
  return result.rows;
}

export async function getSlotByName(slotName: string) {
  const result = await pool.query(
    "SELECT * FROM parking_slots WHERE slot_name = $1",
    [slotName]
  );

  return result.rows;
}

export async function getAllSlots() {
  const result = await pool.query("SELECT * FROM parking_slots ORDER BY id");
  return result.rows;
}

export default { updateSlotStatus, createSlot, getSlotByName, getAllSlots };