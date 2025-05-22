import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // เปลี่ยนเป็น .env ภายหลัง

export function generateToken(payload: object, expiresIn: string = "1h") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}
