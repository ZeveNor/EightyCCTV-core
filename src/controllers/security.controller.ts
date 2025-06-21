import * as securityService from "../services/security.service";
import { requireRole } from "../middleware/auth";

export async function handleSecurityRoutes(req: Request): Promise<Response> {
  const user = requireRole(req, "security");
  if (user instanceof Response) return user;

  const url = new URL(req.url);

  // GET /api/security/users
  if (req.method === "GET" && url.pathname === "/api/security/users") {
    const users = await securityService.getAllUsersExceptAdmin();
    return Response.json(users);
  }

  // GET /api/security/users/:id
  const userIdMatch = url.pathname.match(/^\/api\/security\/users\/(\d+)$/);
  if (req.method === "GET" && userIdMatch) {
    const id = Number(userIdMatch[1]);
    const userData = await securityService.getUserById(id);
    if (!userData || userData.role === "admin") {
      return Response.json({ message: "Access denied" }, { status: 403 });
    }
    return Response.json(userData);
  }

  return new Response("Not found", { status: 404 });
}