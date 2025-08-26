import { withCORS } from "./src/utils/cors";
import dotenv from "dotenv";
dotenv.config();

// Import controllers
import { handleAuthRoutes } from "./src/controllers/auth.controller";
import { handleUserRoutes } from "./src/controllers/user.controller";
import { handleAdminRoutes } from "./src/controllers/admin.controller";
import { handleSlotRoutes } from "./src/controllers/slot.controller";
import { handleSecurityRoutes } from "./src/controllers/security.controller";

// Import WebSocket utilities
import {
  startRtspStreamFor,
  addRtspClientTo,
  removeRtspClientFrom,
} from "./src/utils/stream";

// Start RTSP streams for cameras
startRtspStreamFor(
  "cam1",
  process.env.RTSP_USER?? "admin",
  process.env.RTSP_PASS?? "L2DF3010",
  process.env.RTSP_IP?? "192.168.1.46",
  process.env.RTSP_PORT?? "554",
  process.env.RTSP_QUALITY?? "0"
);
startRtspStreamFor(
  "cam2",
  process.env.RTSP_USER?? "admin",
  process.env.RTSP_PASS?? "L2DF3010",
  process.env.RTSP_IP?? "192.168.1.46",
  process.env.RTSP_PORT?? "554",
  process.env.RTSP_QUALITY?? "0"
);

// Create a WebSocket server
const clients = new Set<Bun.ServerWebSocket<{ upgrade: true; rtsp?: boolean }>>();

// Serve API and handle WebSocket connections
const server = Bun.serve<{ upgrade: true; rtsp?: boolean; camKey?: string }, {}>({
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
        server.upgrade(req, { data: { upgrade: true, rtsp: true } });
        return;
      }
      return new Response("Upgrade required", { status: 426 });
    }
    if (req.method === "GET" && url.pathname.startsWith("/uploads/")) {
      const filePath = `.${url.pathname}`;
      try {
        return new Response(Bun.file(filePath));
      } catch {
        return new Response("Not found", { status: 404 });
      }
    }

    // RTSP WebSocket upgrade for cam1
    if (url.pathname === "/ws/rtsp") {
      if (server.upgrade) {
        server.upgrade(req, { data: { upgrade: true, rtsp: true, camKey: "cam1" } });
        return;
      }
      return new Response("Upgrade required", { status: 426 });
    }

    // RTSP WebSocket upgrade for cam2
    if (url.pathname === "/ws/rtsp2") {
      if (server.upgrade) {
        server.upgrade(req, { data: { upgrade: true, rtsp: true, camKey: "cam2" } });
        return;
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
      if (ws.data?.rtsp && ws.data?.camKey) {
        addRtspClientTo(ws.data.camKey, ws);
        console.log(`RTSP streaming on (${ws.data.camKey})`);
        ws.send(JSON.stringify({ message: `RTSP WebSocket connected (${ws.data.camKey})` }));
      } else {
        clients.add(ws);
        console.log(`WebSocket connected`);
        ws.send(JSON.stringify({ message: "WebSocket connected" }));
      }
    },
    close(ws) {
      if (ws.data?.rtsp && ws.data?.camKey) {
        removeRtspClientFrom(ws.data.camKey, ws);
      }
      clients.delete(ws);
    },
    message(ws, message) {
      // รับข้อความจาก client
    },
  },
});

console.log(`Server running at http://localhost:${server.port}`);