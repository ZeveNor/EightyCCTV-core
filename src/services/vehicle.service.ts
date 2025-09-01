import db from "../models/db";

export async function getVehicleAvatar(id: string) {
  try {
    const sql = `SELECT avatar_url FROM "vehicles" WHERE id=$1`;


    // const res = await db.query(
    //   `SELECT avatar_url FROM "users" WHERE id=$1`,
    //   [id]
    // );
    // if (res.rowCount === 0) return { status: 404, result: "User not found" };
    // return { status: 200, result: { avatar_url: res.rows[0].avatar_url } };
  } catch {
    return { status: 400, result: "Get avatar failed" };
  }
}
