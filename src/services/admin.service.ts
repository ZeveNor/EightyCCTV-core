import  pool  from "../models/db";
import bcrypt from "bcrypt";

export async function getAllUsers() {
  const result = await pool.query("SELECT id, name, email, role, status FROM users WHERE status != 3");
  return result.rows;
}

export async function getUserById(id: number) {
  const result = await pool.query("SELECT id, name, email, role, status FROM users WHERE id = $1", [id]);
  return result.rows[0];
}

export async function createUser(data: any) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const result = await pool.query(
    `INSERT INTO users (name, email, password, phone_number, role, status, created_at)
     VALUES ($1, $2, $3, $4, $5, 1, NOW()) RETURNING id, name, email, role`,
    [data.name, data.email, hashedPassword, data.phone_number, data.role || 'user']
  );
  return result.rows[0];
}

export async function updateUser(id: number, data: any) {
  await pool.query(
    `UPDATE users SET name = $1, email = $2, phone_number = $3, role = $4, update_at = NOW() WHERE id = $5`,
    [data.name, data.email, data.phone_number, data.role, id]
  );
  const result = await pool.query("SELECT id, name, email, role FROM users WHERE id = $1", [id]);
  return result.rows[0];
}

export async function deleteUser(id: number) {
  await pool.query(
    `UPDATE users SET status = 2, delete_at = NOW() WHERE id = $1`,
    [id]
  );
}
