import { verifyToken } from "../utils/jwt";
import { JwtPayloadCustom } from "../types/jwt";


// ✅ 1. ตรวจสอบ token (อนุญาตทุกคนที่ login แล้ว)
export function requireAuth(req: Request): JwtPayloadCustom | Response {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ message: "No token provided" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token) as JwtPayloadCustom;
    if (typeof decoded !== "object" || !decoded.role || !decoded.id) {
      return Response.json({ message: "Invalid token format" }, { status: 401 });
    }
    return decoded;
  } catch {
    return Response.json({ message: "Invalid token" }, { status: 401 });
  }
}

// ✅ 2. ตรวจสอบ role เดียว เช่น requireRole("admin")
export function requireRole(req: Request, requiredRole: "admin" | "user" | "security"): JwtPayloadCustom | Response {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ message: "No token provided" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token) as JwtPayloadCustom;
    if (typeof decoded !== "object" || !decoded.role || !decoded.id) {
      return Response.json({ message: "Invalid token format" }, { status: 401 });
    }
    if (decoded.role !== requiredRole) {
      return Response.json({ message: "Forbidden" }, { status: 403 });
    }
    return decoded;
  } catch {
    return Response.json({ message: "Invalid token" }, { status: 401 });
  }
}

// ✅ 3. ตรวจสอบหลาย role เช่น requireRoles(req, "admin", "security")
export function requireRoles(req: Request, ...allowedRoles: ("admin" | "user" | "security")[]): JwtPayloadCustom | Response {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ message: "No token provided" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token) as JwtPayloadCustom;
    if (typeof decoded !== "object" || !decoded.role || !decoded.id) {
      return Response.json({ message: "Invalid token format" }, { status: 401 });
    }
    if (!allowedRoles.includes(decoded.role)) {
      return Response.json({ message: "Forbidden" }, { status: 403 });
    }
    return decoded;
  } catch {
    return Response.json({ message: "Invalid token" }, { status: 401 });
  }
}