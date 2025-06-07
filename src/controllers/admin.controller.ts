import { Request, Response } from "express";
import * as adminService from "../services/admin.service";

export async function getAllUsers(req: Request , res: Response) {
  try {
    const users = await adminService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const user = await adminService.getUserById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    const data = req.body;
    const user = await adminService.createUser(data);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    const user = await adminService.updateUser(id, data);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    await adminService.deleteUser(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
}