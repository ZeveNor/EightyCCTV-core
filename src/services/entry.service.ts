import db from "../models/db";

export async function getAllEntry() {
  try {
    const sql = `SELECT * FROM vehicle_logs;`;
    const res = await db.query(`SELECT * FROM vehicle_logs;`);
    console.log("res", res);

    return { status: 200, result: { result: res.rows } };
  } catch {
    return { status: 400, result: "Get vehicle failed" };
  }
}

export async function getEntryByPlate(plate: string) {
  try {
    const sql = `SELECT * from vehicle_logs WHERE license_plate = $1;`;
    const values = [plate];
    const res = await db.query(sql, values);

    return { status: 200, result: { result: res.rows } };
  } catch {
    return { status: 400, result: "Get vehicle by plate failed" };
  }
}

export async function startEntry(plate: string) {
  try {
    const sql = `INSERT INTO vehicle_logs (license_plate, entry_time) VALUES ($1, NOW()) RETURNING *;`;
    const values = [plate];
    const res = await db.query(sql, values);

    return { status: 200, result: { result: res.rows[0] } };
  } catch {
    return { status: 400, result: "Start vehicle entry failed" };
  }
}

export async function endEntry(plate: string) {
  try {
    const sql = `UPDATE vehicle_logs SET exit_time = NOW() WHERE license_plate = $1 AND exit_time IS NULL RETURNING *;`;
    const values = [plate];
    const res = await db.query(sql, values);

    if (res.rowCount === 0) {
      return { status: 404, result: "No active entry found for this plate" };
    }

    return { status: 200, result: { result: res.rows[0] } };
  } catch {
    return { status: 400, result: "End vehicle entry failed" };
  }
}


export default {
  getAllEntry,
  getEntryByPlate,
  startEntry,
  endEntry,
}