
import dotenv from "dotenv";

import app from "./app.js";
import { connectDB } from "../Config/mongoDBConnect.js";
dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

    async function shutdown(signal) {
      console.log(`${signal} received. Closing server...`);

      server.close(async () => {
        const mongoose = await import("mongoose");
        await mongoose.default.disconnect();
        process.exit(0);
      });
    }

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
