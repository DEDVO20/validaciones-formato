import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());

// Rutas principales
app.use("/api", routes);

// Ruta de estado
app.use("/status", (req, res) => {
  res.json({ message: "API funcionando 🚀" });
});

export default app;