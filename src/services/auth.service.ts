import bcrypt from "bcrypt";
import pool from "../models/db";
import { generateToken } from "../utils/jwt";
import { sendMail } from "../utils/email";
import crypto from "crypto";

// สมัครสมาชิก
export const registerService = async ({
  name,
  email,
  password,
  phone_number,
  confirmPassword
}: {
  name: string;
  email: string;
  password: string;
  phone_number: string;
  confirmPassword: string;
}) => {
  const exist = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  if (exist.rows.length > 0) throw new Error("Email นี้ถูกใช้แล้ว");
  if (password !== confirmPassword) throw new Error("ยืนยันรหัสไม่ถูกต้อง");
  const hashedPassword = await bcrypt.hash(password, 10);

const result = await pool.query(
  `INSERT INTO users (name, email, password, phone_number, status)
   VALUES ($1, $2, $3, $4, 0) RETURNING id, name, email, phone_number, role, status`,
  [name, email, hashedPassword, phone_number]
);

  return result.rows[0];
};

// login
export async function loginService(email: string, password: string) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  const user = result.rows[0];
  if (!user) throw new Error("อีเมลหรือรหัสไม่ถูกต้อง");
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("อีเมลหรือรหัสไม่ถูกต้อง");
  const token = generateToken({ id: user.id, role: user.role });
  return { token, role: user.role, name: user.name };
}

// ส่งอีเมลยืนยัน
export async function sendVerification(email: string) {
  const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  const user = userRes.rows[0];
  if (!user) throw new Error("ไม่พบผู้ใช้");
  const token = crypto.randomBytes(32).toString("hex");
  // ลบ token เก่า (ถ้ามี)
  await pool.query(
    `DELETE FROM user_tokens WHERE user_id = $1 AND type = 'verify'`,
    [user.id]
  );
  // เพิ่ม token ใหม่
  await pool.query(
    `INSERT INTO user_tokens (user_id, token, type, expires_at)
     VALUES ($1, $2, 'verify', NOW() + INTERVAL '1 day')`,
    [user.id, token]
  );
  const url = `https://yourdomain.com/verify-email?token=${token}`;
  await sendMail(email, "Verify your email", `<p>Click <a href="${url}">here</a> to verify your email.</p>`);
}

// ยืนยันอีเมล
export async function verifyEmail(token: string) {
  const result = await pool.query(
    `SELECT user_id FROM user_tokens WHERE token = $1 AND type = 'verify' AND expires_at > NOW()`,
    [token]
  );
  const row = result.rows[0];
  if (!row) throw new Error("Invalid or expired token");
  await pool.query(
    `UPDATE users SET status = 1 WHERE id = $1`,
    [row.user_id]
  );
  await pool.query(
    `DELETE FROM user_tokens WHERE token = $1 AND type = 'verify'`,
    [token]
  );
}

// ส่งอีเมล reset password
export async function sendResetPassword(email: string) {
  const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  const user = userRes.rows[0];
  if (!user) throw new Error("ไม่พบผู้ใช้");
  const token = crypto.randomBytes(32).toString("hex");
  // ลบ token เก่า (ถ้ามี)
  await pool.query(
    `DELETE FROM user_tokens WHERE user_id = $1 AND type = 'reset'`,
    [user.id]
  );
  // เพิ่ม token ใหม่
  await pool.query(
    `INSERT INTO user_tokens (user_id, token, type, expires_at)
     VALUES ($1, $2, 'reset', NOW() + INTERVAL '1 hour')`,
    [user.id, token]
  );
  const url = `https://yourdomain.com/reset-password?token=${token}`;
  await sendMail(email, "Reset your password", `<p>Click <a href="${url}">here</a> to reset your password.</p>`);
}

// รีเซ็ตรหัสผ่าน
export async function resetPassword(token: string, newPassword: string) {
  const result = await pool.query(
    `SELECT user_id FROM user_tokens WHERE token = $1 AND type = 'reset' AND expires_at > NOW()`,
    [token]
  );
  const row = result.rows[0];
  if (!row) throw new Error("Invalid or expired token");
  const hashed = await bcrypt.hash(newPassword, 10);
  await pool.query(
    `UPDATE users SET password = $1 WHERE id = $2`,
    [hashed, row.user_id]
  );
  await pool.query(
    `DELETE FROM user_tokens WHERE token = $1 AND type = 'reset'`,
    [token]
  );
}