import pool from "../models/db";

export async function getAllUsersExceptAdmin() {
  const result = await pool.query(
    "SELECT id, name, email, role FROM users WHERE role != 'admin' AND status != 3"
  );
  return result.rows;
}

export async function getUserById(id: number) {
  const result = await pool.query(
    "SELECT id, name, email, role FROM users WHERE id = $1 AND status != 3",
    [id]
  );
  return result.rows[0];
}
