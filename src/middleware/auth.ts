import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { JwtPayloadCustom } from "../types/jwt";

// ✅ 1. อนุญาตทุกคนที่ login แล้ว (มี token ที่ถูกต้อง)
export function authUser(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token) as JwtPayloadCustom;

    if (typeof decoded !== "object" || !decoded.role || !decoded.id) {
      res.status(401).json({ message: "Invalid token format" });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
}

// ✅ 2. อนุญาตเฉพาะ role เดียวเท่านั้น เช่น authRole("admin")
export function authRole(requiredRole: "admin" | "user" | "security") {
  return function (req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = verifyToken(token) as JwtPayloadCustom;

      if (typeof decoded !== "object" || !decoded.role || !decoded.id) {
        res.status(401).json({ message: "Invalid token format" });
        return;
      }

      if (decoded.role !== requiredRole) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }

      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  };
}

// ✅ 3. อนุญาตหลาย role ได้ เช่น authRoles("admin", "security")
export function authRoles(...allowedRoles: ("admin" | "user" | "security")[]) {
  return function (req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = verifyToken(token) as JwtPayloadCustom;

      if (typeof decoded !== "object" || !decoded.role || !decoded.id) {
        res.status(401).json({ message: "Invalid token format" });
        return;
      }

      if (!allowedRoles.includes(decoded.role)) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }

      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  };
}
