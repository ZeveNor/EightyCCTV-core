import { Request, Response } from "express";
import { registerService } from "../services/auth.service";
import { loginService } from "../services/auth.service";
import { sendVerification, verifyEmail } from "../services/auth.service";
import { sendResetPassword, resetPassword } from "../services/auth.service";


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

export const requestEmailVerification = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    await sendVerification(email);
    res.json({ message: "Verification email sent" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const confirmEmail = async (req: Request, res: Response) => {
  const { token } = req.query;
  try {
    await verifyEmail(token as string);
    res.json({ message: "Email verified" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    await sendResetPassword(email);
    res.json({ message: "Reset password email sent" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const confirmResetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  try {
    await resetPassword(token, newPassword);
    res.json({ message: "Password reset successful" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};