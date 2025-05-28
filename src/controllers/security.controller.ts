import { Request, Response } from "express";
import * as securityService from "../services/security.service";

export async function getAllUsersExceptAdmin(req: Request, res: Response) {
  const users = await securityService.getAllUsersExceptAdmin();
  res.json(users);
}

export async function getUserById(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const user = await securityService.getUserById(id);
  if (!user || user.role === "admin") {
    res.status(403).json({ message: "Access denied" });
  }
  res.json(user);
}
