import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { JwtPayloadCustom } from "../types/jwt";

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
