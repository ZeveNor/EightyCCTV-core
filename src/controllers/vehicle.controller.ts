// import { } from "../services/vehicle.service";
import { withCORS } from "../utils/cors";

export async function handleVehicleRoutes(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // if (url.pathname === "/api/auth/send-otp" && req.method === "POST") {
  //   const body = await req.json();
  //   const result = await sendOtp(body);
  //   return withCORS(Response.json({ result }));
  // }

  return new Response("Not found", { status: 404 });
}