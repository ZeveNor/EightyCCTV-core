import pool from "../models/db";

export async function getUserProfile(id: number) {
  const result = await pool.query(
    `SELECT id, name, email, role, phone_number FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

export async function updateProfileImage(id: number, filename: string) {
  await pool.query(
    `UPDATE users SET profile_image = $1, update_at = NOW() WHERE id = $2`,
    [filename, id]
  );
}

export async function updateUserProfile(id: number, data: any) {
  await pool.query(
    `UPDATE users SET name = $1, email = $2, phone_number = $3, update_at = NOW() WHERE id = $4`,
    [data.name, data.email, data.phone_number, id]
  );
}
