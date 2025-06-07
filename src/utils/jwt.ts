import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { JwtPayloadCustom } from "../types/jwt";

dotenv.config(); 

const JWT_SECRET = process.env.JWT_SECRET || "default_dev_secret";

export function generateToken(payload: object, expiresIn: string = "1h") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
}

export function verifyToken(token: string): JwtPayloadCustom {
  return jwt.verify(token, JWT_SECRET) as JwtPayloadCustom;
}
