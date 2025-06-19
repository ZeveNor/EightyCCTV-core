import * as adminService from "../services/admin.service";
import { requireRole } from "../middleware/auth";

export async function handleAdminRoutes(req: Request): Promise<Response> {
  const user = requireRole(req, "admin");
  if (user instanceof Response) return user;

  const url = new URL(req.url);

  // GET /api/admin/users
  if (req.method === "GET" && url.pathname === "/api/admin/users") {
    try {
      const users = await adminService.getAllUsers();
      return Response.json(users);
    } catch {
      return Response.json({ message: "Internal server error" }, { status: 500 });
    }
  }

  // GET /api/admin/users/:id
  const userIdMatch = url.pathname.match(/^\/api\/admin\/users\/(\d+)$/);
  if (req.method === "GET" && userIdMatch) {
    const id = Number(userIdMatch[1]);
    try {
      const userData = await adminService.getUserById(id);
      if (!userData) return Response.json({ message: "User not found" }, { status: 404 });
      return Response.json(userData);
    } catch {
      return Response.json({ message: "Internal server error" }, { status: 500 });
    }
  }

  // POST /api/admin/users
  if (req.method === "POST" && url.pathname === "/api/admin/users") {
    const body = await req.json();
    try {
      const userData = await adminService.createUser(body);
      return Response.json(userData, { status: 201 });
    } catch {
      return Response.json({ message: "Internal server error" }, { status: 500 });
    }
  }

  // PUT /api/admin/users/:id
  if (req.method === "PUT" && userIdMatch) {
    const id = Number(userIdMatch[1]);
    const body = await req.json();
    try {
      const userData = await adminService.updateUser(id, body);
      return Response.json(userData);
    } catch {
      return Response.json({ message: "Internal server error" }, { status: 500 });
    }
  }

  // DELETE /api/admin/users/:id
  if (req.method === "DELETE" && userIdMatch) {
    const id = Number(userIdMatch[1]);
    try {
      await adminService.deleteUser(id);
      return new Response(null, { status: 204 });
    } catch {
      return Response.json({ message: "Internal server error" }, { status: 500 });
    }
  }

  return new Response("Not found", { status: 404 });
}