import db from "../models/db";

export async function getAllVehicles() {
  try {
    const sql = `
      SELECT uv.license_plate, u.name, u.surname, uv.license_plate, uv.brand, uv.model, uv.color, uv.created_at
      FROM user_vehicles uv
      JOIN users u ON u.id = uv.user_id
      WHERE uv.deleted_at IS NULL;
    `;
    const res = await db.query(sql);

    return { status: 200, result: { result: res.rows } };
  } catch {
    return { status: 400, result: "Get vehicle failed" };
  }
}

export async function getVehiclesbyOwner(name: string) {
  try {
    const sql = `
      SELECT uv.license_plate, u.name, u.surname, uv.license_plate, uv.brand, uv.model, uv.color, uv.created_at
      FROM user_vehicles uv
      JOIN users u ON u.id = uv.user_id
      WHERE uv.deleted_at IS NULL AND (u.name ILIKE $1 OR u.surname ILIKE $1);
    `;
    const res = await db.query(sql, [name]);

    return { status: 200, result: { result: res.rows } };
  } catch {
    return { status: 400, result: "Get vehicle failed" };
  }
}

export async function getVehiclesbyPlate(plate: string) {
  try {
    const sql = `
      SELECT uv.license_plate, u.name, u.surname, uv.license_plate, uv.brand, uv.model, uv.color, uv.created_at
      FROM user_vehicles uv
      JOIN users u ON u.id = uv.user_id
      WHERE uv.deleted_at IS NULL AND uv.license_plate ILIKE '%' || $1 || '%';
    `;
    const res = await db.query(sql, [plate]);

    return { status: 200, result: { result: res.rows } };
  } catch {
    return null;
  }
}

export async function getVehiclesbyPlateCloset(plate: string) {
  try {
    const sql = `
      SELECT uv.license_plate, u.name, u.surname, uv.license_plate, uv.brand, uv.model, uv.color, uv.created_at
      FROM user_vehicles uv
      JOIN users u ON u.id = uv.user_id
      WHERE uv.deleted_at IS NULL AND uv.license_plate ILIKE '%' || $1 || '%';
    `;
    const res = await db.query(sql, [plate]);

    return { status: 200, result: { result: res.rows } };
  } catch {
    return { status: 400, result: "Get vehicle failed" };
  }
}

interface VehicleInterface {
  userId: number;
  plate: string;
  brand: string;
  model: string;
  color: string;
}

export async function addVehicles({ userId, plate, brand, model, color }: VehicleInterface) {
  try {
    const sql = `
      INSERT INTO user_vehicles (user_id, license_plate, brand, model, color)
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    const res = await db.query(sql, [userId, plate, brand, model, color]);

    return { status: 200, result: { result: res.rows } };
  } catch {
    return { status: 400, result: "Add vehicle failed" };
  }
}

interface UpdateVehicleInterface {
  plate: string;
  newPlate: string;
  brand: string;
  model: string;
  color: string;
}

export async function updateVehicles({ plate, newPlate, brand, model, color }: UpdateVehicleInterface) {
  try {
    const sql = `
      UPDATE user_vehicles
      SET license_plate = $2, brand = $3, model = $4, color = $5
      WHERE license_plate = $1 RETURNING *;
    `;
    const res = await db.query(sql, [plate, newPlate, brand, model, color]);

    return { status: 200, result: { result: res.rows } };
  } catch {
    return { status: 400, result: "Update vehicle failed" };
  }
}

interface RemoveVehicleInterface {
  plate: string;
}

export async function removeVehicles({ plate }: RemoveVehicleInterface) {
  try {
    const sql = `
      UPDATE user_vehicles SET deleted_at = NOW() WHERE license_plate = $1;
    `;
    await db.query(sql, [plate]);

    return { status: 200 };
  } catch {
    return { status: 400, result: "Update vehicle failed" };
  }
}

export async function unremoveVehicles({ plate }: RemoveVehicleInterface) {
  try {
    const sql = `
      UPDATE user_vehicles SET deleted_at = NULL WHERE license_plate = $1;
    `;
    await db.query(sql, [plate]);

    return { status: 200 };
  } catch {
    return { status: 400, result: "Update vehicle failed" };
  }
}


export default {
  getAllVehicles,
  getVehiclesbyOwner,
  getVehiclesbyPlate,
  getVehiclesbyPlateCloset,
  addVehicles,
  updateVehicles,
  removeVehicles,
  unremoveVehicles
}