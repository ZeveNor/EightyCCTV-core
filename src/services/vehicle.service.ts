import db from "../models/db";

export async function getAllVehicles() {
  try {
    const sql = `
      SELECT uv.user_id ,uv.license_plate, u.name, u.surname, uv.brand, uv.model, uv.color, uv.province, uv.created_at, uv.deleted_at
      FROM user_vehicles uv
      JOIN users u ON u.id = uv.user_id;
    `;
    const res = await db.query(sql);

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
  province: string;
}

export async function addVehicle({ userId, plate, province, brand, model, color }: VehicleInterface) {
  try {
    const sql = `
      INSERT INTO user_vehicles (user_id, license_plate, province, brand, model, color)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const res = await db.query(sql, [userId, plate, province, brand, model, color]);
    return { status: 200, result: res.rows[0] };
  } catch (err) {
    return { status: 400, result: "Add vehicle failed" };
  }
}

export async function addMyVehicleById(
  userId: number,
  { plate, brand, model, color, province }: VehicleInterface
) {
  try {
    const sql = `
      INSERT INTO user_vehicles (user_id, license_plate, brand, model, color, province)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
    `;
    const res = await db.query(sql, [userId, plate, brand, model, color, province]);

    return { status: 200, result: res.rows };
  } catch {
    return { status: 400, result: "Add my vehicle failed" };
  }
}

interface UpdateVehicleInterface {
  plate: string;
  newPlate: string;
  brand: string;
  model: string;
  color: string;
  province: string;
}

export async function updateVehicles({ plate, newPlate, brand, model, color, province }: UpdateVehicleInterface) {
  try {
    const sql = `
      UPDATE user_vehicles
      SET license_plate = $2, brand = $3, model = $4, color = $5, province = $6
      WHERE license_plate = $1 RETURNING *;
    `;
    const res = await db.query(sql, [plate, newPlate, brand, model, color, province]);

    return { status: 200, result: { result: res.rows } };
  } catch {
    return { status: 400, result: "Update vehicle failed" };
  }
}

interface RemoveVehicleInterface {
  plate: string;
}

interface RemoveVehicleInterface {
  plate: string;
}

export async function removeVehicles({ plate }: RemoveVehicleInterface) {
  try {
    const sql = `
      UPDATE user_vehicles
      SET deleted_at = NOW()
      WHERE license_plate = $1
      RETURNING *;
    `;
    const res = await db.query(sql, [plate]);

    if (res.rows.length === 0) {
      return { status: 404, result: "Vehicle not found" };
    }

    return { status: 200, result: res.rows[0] };
  } catch (err) {
    console.error("removeVehicles error:", err);
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
export async function getVehiclesByUserId(userId: number) {
  try {
    const sql = `
      SELECT uv.id, uv.license_plate, uv.brand, uv.model, uv.color, uv.province, uv.created_at
      FROM user_vehicles uv
      WHERE uv.deleted_at IS NULL AND uv.user_id = $1;
    `;
    const res = await db.query(sql, [userId]);
    return { status: 200, result: res.rows };
  } catch {
    return { status: 400, result: "Get vehicle failed" };
  }
}


export default {
  getAllVehicles,
  getVehiclesbyPlate,
  getVehiclesbyPlateCloset,
  addVehicle,
  updateVehicles,
  removeVehicles,
  unremoveVehicles
}