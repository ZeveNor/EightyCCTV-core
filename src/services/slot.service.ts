import pool from "../models/db";

export async function updateSlotStatus(status: boolean[]) {
  for (let i = 0; i < status.length; i++) {
    await pool.query(
      "UPDATE parking_slots SET is_occupied = $1 WHERE slot_number = $2",
      [status[i], i + 1]
    );
  }
  const result = await pool.query("SELECT * FROM parking_slots ORDER BY slot_number");
  return result.rows;
}

export async function getAllSlots() {
  const result = await pool.query("SELECT * FROM parking_slots ORDER BY slot_number");
  return result.rows;
}