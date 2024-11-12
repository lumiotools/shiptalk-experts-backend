import Express from "express";
import Cors from "cors";
import initializeDatabase from "./utils/initializeDatabase.js";
import expertRoutes from "./routes/expert.js";
import fs from "fs";

const app = Express();
app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));
app.use(
  Cors({
    origin: "*",
  })
);

initializeDatabase();
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Routes
app.use("/api", expertRoutes);

export default app;
