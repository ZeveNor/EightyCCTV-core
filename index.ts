import express from "express";
import authRoutes from "./src/routes/auth.routes";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());

// routes
app.use("/api/auth", authRoutes);

// server
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
