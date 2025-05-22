import bcrypt from "bcrypt";
import  pool  from "../models/db";

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
  // ตรวจสอบ email ซ้ำ
  const exist = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  if (exist.rows.length > 0) {
    throw new Error("Email นี้ถูกใช้แล้ว");
  }
  if (password !== confirmPassword) {
      throw new Error("ยืนยันรหัสไม่ถูกต้อง");
    }
  // เข้ารหัสรหัสผ่าน
  const hashedPassword = await bcrypt.hash(password, 10);

  // เพิ่มผู้ใช้ใหม่
  const result = await pool.query(
    `INSERT INTO users (name, email, password, phone_number)
     VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone_number, role`,
    [name, email, hashedPassword, phone_number]
  );

  return result.rows[0];
};

//token na kerb
import { generateToken } from "../utils/jwt";

export async function loginService(email: string, password: string) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  const user = result.rows[0];

  if (!user) throw new Error("อีเมลหรือรหัสไม่ถูกต้อง");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("อีเมลหรือรหัสไม่ถูกต้อง");

  const token = generateToken({ id: user.id, role: user.role });

  return { token, role: user.role, name: user.name };
}
