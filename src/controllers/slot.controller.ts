import * as slotService from "../services/slot.service";
import { verifyToken } from "../utils/jwt";

export async function handleSlotRoutes(
  req: Request,
  clients?: Set<Bun.ServerWebSocket<{ upgrade: true }>>
): Promise<Response> {
  const url = new URL(req.url);

  // Auth (ทุก role)
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ message: "No token provided" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  try {
    verifyToken(token);
  } catch {
    return Response.json({ message: "Invalid token" }, { status: 401 });
  }

  // POST /api/slots/status
  if (req.method === "POST" && url.pathname === "/api/slots/status") {
    const body = await req.json();
    if (!Array.isArray(body.status)) {
      return Response.json({ error: "Invalid status data" }, { status: 400 });
    }
    try {
      const slots = await slotService.updateSlotStatus(body.status);
      // Broadcast ไปยังทุก client ที่เชื่อมต่อ WebSocket
  if (clients) {
    const msg = JSON.stringify({ type: "slots_update", slots });
      for (const ws of clients) {
        if (ws.readyState === 1) ws.send(msg);
      }
    }
      return Response.json({ message: "Updated slot status in DB", slots });
    } catch {
      return Response.json({ error: "Database update failed" }, { status: 500 });
    }
  }

  // GET /api/slots
  if (req.method === "GET" && url.pathname === "/api/slots") {
    try {
      const slots = await slotService.getAllSlots();
      return Response.json(slots);
    } catch {
      return Response.json({ error: "Database fetch failed" }, { status: 500 });
    }
  }
  
  return new Response("Not found", { status: 404 });
}