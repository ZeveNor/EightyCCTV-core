import { updateSlotStatus, getSlotLog, getAllSlotStatus } from "../services/slot.service";
import { authenticateFetchRequest } from "../utils/jwt";

export async function handleSlotRoutes(
  req: Request,
  clients?: Set<Bun.ServerWebSocket<{ upgrade: true }>>
): Promise<Response> {
  const url = new URL(req.url);

  // POST /api/slots/status
  if (req.method === "POST" && url.pathname === "/api/slots/status") {
    // ตรวจสอบ token
    const auth = await authenticateFetchRequest(req as any);
    if (!auth.ok) return Response.json(auth.body, { status: auth.status });

    const body = await req.json();
    if (!Array.isArray(body.slots)) {
      return Response.json({ error: "Invalid slots data" }, { status: 400 });
    }
    try {
      const slots = await updateSlotStatus(body.slots);
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


  // GET /api/slots/log
  if (req.method === "GET" && url.pathname === "/api/slots/log") {
    // ตรวจสอบ token
    const auth = await authenticateFetchRequest(req as any);
    if (!auth.ok) return Response.json(auth.body, { status: auth.status });
    const user = auth.user!;
    // เฉพาะ admin หรือ security เท่านั้น
    if (!["admin", "security"].includes(user.role)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    const logs = await getSlotLog();
    return Response.json({ result: logs }, { status: 200 });
  }

  // GET /api/slots/status
  if (req.method === "GET" && url.pathname === "/api/slots/status") {
    const slots = await getAllSlotStatus();
    return Response.json({ result: slots }, { status: 200 });
  }

  return new Response("Not found", { status: 404 });
}

