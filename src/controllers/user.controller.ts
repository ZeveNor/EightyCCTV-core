import { Request, Response } from "express";
import * as userService from "../services/user.service";

export async function getMyProfile(req: Request, res: Response) {
  const id = req.user?.id;

  if (!id)  res.status(401).json({ message: "Unauthorized" });

  const user = await userService.getUserProfile(Number(id));
  if (!user)  res.status(404).json({ message: "User not found" });

  res.json(user);
}

export async function updateMyProfile(req: Request, res: Response) {
  const id = req.user?.id;
  if (!id)  res.status(401).json({ message: "Unauthorized" });

  const data = req.body;
  await userService.updateUserProfile(Number(id), data);
  res.json({ message: "Profile updated" });
}


