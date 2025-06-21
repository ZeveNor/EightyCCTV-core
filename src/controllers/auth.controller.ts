import { registerService, loginService, sendVerification, verifyEmail, sendResetPassword, resetPassword } from "../services/auth.service";

export async function handleAuthRoutes(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // Register
  if (req.method === "POST" && url.pathname === "/api/auth/register") {
    const body = await req.json();
    try {
      const user = await registerService(body);
      return Response.json({ user }, { status: 201 });
    } catch (err: any) {
      return Response.json({ message: err.message }, { status: 400 });
    }
  }

  // Login
  if (req.method === "POST" && url.pathname === "/api/auth/login") {
    const body = await req.json();
    try {
      const result = await loginService(body.email, body.password);
      return Response.json(result);
    } catch (err: any) {
      return Response.json({ message: err.message }, { status: 400 });
    }
  }

  // Request email verification
  if (req.method === "POST" && url.pathname === "/api/auth/verify-request") {
    const body = await req.json();
    try {
      await sendVerification(body.email);
      return Response.json({ message: "Verification email sent" });
    } catch (err: any) {
      return Response.json({ message: err.message }, { status: 400 });
    }
  }

  // Confirm email
  if (req.method === "GET" && url.pathname === "/api/auth/verify-email") {
    const token = new URL(req.url).searchParams.get("token");
    try {
      await verifyEmail(token!);
      return Response.json({ message: "Email verified" });
    } catch (err: any) {
      return Response.json({ message: err.message }, { status: 400 });
    }
  }

  // Forgot password
  if (req.method === "POST" && url.pathname === "/api/auth/forgot-password") {
    const body = await req.json();
    try {
      await sendResetPassword(body.email);
      return Response.json({ message: "Reset password email sent" });
    } catch (err: any) {
      return Response.json({ message: err.message }, { status: 400 });
    }
  }

  // Reset password
  if (req.method === "POST" && url.pathname === "/api/auth/reset-password") {
    const body = await req.json();
    try {
      await resetPassword(body.token, body.newPassword);
      return Response.json({ message: "Password reset successful" });
    } catch (err: any) {
      return Response.json({ message: err.message }, { status: 400 });
    }
  }

  return new Response("Not found", { status: 404 });
}