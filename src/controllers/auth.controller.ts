import { registerService, loginService, sendVerification,sendResetPassword, resetPassword } from "../services/auth.service";

// POST ONLY! check if the request body is JSON before sending it to the service
export async function isJSONBody(data: any) {
  if (!data.headers.get("Content-Type")?.includes("application/json")) {
    return Response.json({ message: "Invalid content type." }, { status: 400 });
  }
  return data.json();
}

export async function handleAuthRoutes(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // Register
  if (req.method === "POST" && url.pathname === "/api/auth/register") {
    const body = await isJSONBody(req);
    try {
      const user = await registerService(body);
      return Response.json({ user }, { status: 201 });
    } catch (err: any) {
      return Response.json({ message: err.message }, { status: 400 });
    }
  }

  // Login
  if (req.method === "POST" && url.pathname === "/api/auth/login") {
    const body = await isJSONBody(req);
    try {
      const result = await loginService(body.email, body.password);
      return Response.json(result);
    } catch (err: any) {
      return Response.json({ message: err.message }, { status: 400 });
    }
  }

// Request OTP
if (req.method === "POST" && url.pathname === "/api/auth/verify-request") {
  const body = await req.json();
  try {
    await sendVerification(body.email);
    return Response.json({ message: "OTP ถูกส่งไปที่อีเมลแล้ว" });
  } catch (err: any) {
    return Response.json({ message: err.message }, { status: 400 });
  }
}




  // Forgot password
  if (req.method === "POST" && url.pathname === "/api/auth/forgot-password") {
    const body = await isJSONBody(req);
    try {
      await sendResetPassword(body.email);
      return Response.json({ message: "Reset password email sent" });
    } catch (err: any) {
      return Response.json({ message: err.message }, { status: 400 });
    }
  }

  // Reset password
  if (req.method === "POST" && url.pathname === "/api/auth/reset-password") {
    const body = await isJSONBody(req);
    try {
      await resetPassword(body.token, body.newPassword);
      return Response.json({ message: "Password reset successful" });
    } catch (err: any) {
      return Response.json({ message: err.message }, { status: 400 });
    }
  }

  return new Response("Not found", { status: 404 });
}