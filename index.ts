import { handleAuthRoutes } from "./src/controllers/auth.controller";
import { handleUserRoutes } from "./src/controllers/user.controller";
import { handleAdminRoutes } from "./src/controllers/admin.controller";
import { handleSlotRoutes } from "./src/controllers/slot.controller";
import { handleSecurityRoutes } from "./src/controllers/security.controller";
import { withCORS } from "./src/utils/cors";
import dotenv from "dotenv";
dotenv.config();

const clients = new Set<Bun.ServerWebSocket<{ upgrade: true }>>();

Bun.serve<{ upgrade: true }, {}>({
  port: Number(process.env.PORT) || 3000,
  fetch(req, server) {
    const url = new URL(req.url);

    // CORS preflight
    if (req.method === "OPTIONS") {
      return withCORS(new Response(null, { status: 204 }));
    }

    // WebSocket upgrade
    if (url.pathname === "/ws") {
      if (server.upgrade) {
        server.upgrade(req);
        return; // หรือ return undefined;
      }
      return new Response("Upgrade required", { status: 426 });
    }

    // API routes
    if (url.pathname.startsWith("/api/auth")) {
      return handleAuthRoutes(req).then(withCORS);
    }
    if (url.pathname.startsWith("/api/user")) {
      return handleUserRoutes(req).then(withCORS);
    }
    if (url.pathname.startsWith("/api/admin")) {
      return handleAdminRoutes(req).then(withCORS);
    }
    if (url.pathname.startsWith("/api/slots")) {
      return handleSlotRoutes(req, clients).then(withCORS);
    }
    if (url.pathname.startsWith("/api/security")) {
      return handleSecurityRoutes(req).then(withCORS);
    }

    return withCORS(new Response("Not found", { status: 404 }));
  },
  websocket: {
    open(ws) {
      clients.add(ws);
      ws.send(JSON.stringify({ message: "WebSocket connected" }));
    },
    close(ws) {
      clients.delete(ws);
    },
    message(ws, message) {
      // รับข้อความจาก client
    },
  },
});