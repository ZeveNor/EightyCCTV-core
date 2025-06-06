import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import slotRoutes from "./src/routes/slot.routes";
import authRoutes from "./src/routes/auth.routes";
import adminRouter from "./src/routes/admin.routes";
import securityRouter from "./src/routes/security.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());


app.use((req: any, res, next) => {
  req.io = io;
  next();
});

app.use("/api/slots", slotRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/security", securityRouter);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});