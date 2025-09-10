import app from "./app";
import { connectDB } from "./config/db";
import { syncModels } from "./models";

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB();
    await syncModels();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar servidor:", error);
  }
};

startServer();
