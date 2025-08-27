import { sendOtp, verifyOtp, register, login, forgotPassword, resetPassword, logout } from "../services/auth.service";
import { withCORS } from "../utils/cors";

export async function handleAuthRoutes(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (url.pathname === "/api/auth/send-otp" && req.method === "POST") {
    const body = await req.json();
    const result = await sendOtp(body);
    return withCORS(Response.json({ result }));
  }

  if (url.pathname === "/api/auth/verify-otp" && req.method === "POST") {
    const body = await req.json();
    const result = await verifyOtp(body);
    return withCORS(Response.json({ result }));
  }

  if (url.pathname === "/api/auth/register" && req.method === "POST") {
    const body = await req.json();
    const result = await register(body);
    return withCORS(Response.json({ result }));
  }

  if (url.pathname === "/api/auth/login" && req.method === "POST") {
    const body = await req.json();
    const result = await login(body);
    return withCORS(Response.json({ result }));
  }

  if (url.pathname === "/api/auth/logout" && req.method === "POST") {
    const body = await req.json();
    const result = await logout(body);
    return withCORS(Response.json({ result }));
  }

  if (url.pathname === "/api/auth/forgot" && req.method === "POST") {
    const body = await req.json();
    const result = await forgotPassword(body);
    return withCORS(Response.json({ result }));
  }

  if (url.pathname === "/api/auth/reset" && req.method === "POST") {
    const body = await req.json();
    const result = await resetPassword(body);
    return withCORS(Response.json({ result }));
  }

  return new Response("Not found", { status: 404 });
}