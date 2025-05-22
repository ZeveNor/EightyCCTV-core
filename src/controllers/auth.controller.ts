import { Request, Response } from "express";
import { registerService } from "../services/auth.service";
import { loginService } from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  const { name, email, password, phone_number,confirmPassword} = req.body;

  try {
    const user = await registerService({ name, email, password, phone_number,confirmPassword });
    res.status(201).json({ user })
    return ;
  } catch (err: any) {
    res.status(400).json({ message: err.message })
    return ;
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await loginService(email, password);
    res.json({ token: result.token, role: result.role, name: result.name })
    return ;
  } catch (err: any) {
    res.status(400).json({ message: err.message })
    return ;
  }
};