
import { getSlotByName, getAllSlots, updateSlotStatus, createSlot } from "../services/slot.service";

export async function handleSlotRoutes(
  req: Request,
  clients?: Set<Bun.ServerWebSocket<{ upgrade: true }>>
): Promise<Response> {
  const url = new URL(req.url);

  // POST /api/slots/init
  if (req.method === "POST" && url.pathname === "/api/slots/init") {
    const body = await req.json();
    const newslot = body.newSlotName;
    const newrows = body.newRows;
    try {
      const existingSlots = await getSlotByName(newslot);
      if (existingSlots.length > 0) {
        return Response.json({ message: "Slots already initialized" }, { status: 200 });
      }
      const res = await createSlot(newslot, newrows);
      return Response.json({ message: "Initialized slots in DB", slot: res });

    } catch (e) {
      return Response.json({ error: "Database initialization failed" }, { status: 500 });
    }
  }

  // POST /api/slots/status
  if (req.method === "POST" && url.pathname === "/api/slots/status") {
    const body = await req.json();
    if (!Array.isArray(body.status)) {
      return Response.json({ error: "Invalid status data" }, { status: 400 });
    }
    try {
      const slots = await updateSlotStatus(body.status);
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
      const slots = await getAllSlots();
      return Response.json(slots);
    } catch {
      return Response.json({ error: "Database fetch failed" }, { status: 500 });
    }
  }

  return new Response("Not found", { status: 404 });
}