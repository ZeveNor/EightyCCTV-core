import express from "express";
import authRoutes from "./src/routes/auth.routes";
import adminRouter from "./src/routes/admin.routes"; 
import securityRouter from "./src/routes/security.routes";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(bodyParser.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/security", securityRouter);

// server
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

