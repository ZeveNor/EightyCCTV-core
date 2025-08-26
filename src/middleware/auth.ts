import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "secret";

export function verifyToken(req: Request): { userId?: number, email?: string } | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number, email: string };
  } catch {
    return null;
  }
}