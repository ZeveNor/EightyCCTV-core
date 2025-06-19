import { getUserProfile, updateUserProfile } from "../services/user.service";
import { requireAuth } from "../middleware/auth";

export async function handleUserRoutes(req: Request): Promise<Response> {
  const user = requireAuth(req);
  if (user instanceof Response) return user;

  const url = new URL(req.url);

  // GET /api/user/me
  if (req.method === "GET" && url.pathname === "/api/user/me") {
    const profile = await getUserProfile(Number(user.id));
    if (!profile) return Response.json({ message: "User not found" }, { status: 404 });
    return Response.json(profile);
  }

  // PUT /api/user/me
  if (req.method === "PUT" && url.pathname === "/api/user/me") {
    const body = await req.json();
    await updateUserProfile(Number(user.id), body);
    return Response.json({ message: "Profile updated" });
  }

  return new Response("Not found", { status: 404 });
}