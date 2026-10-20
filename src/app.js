
import express from "express";
import cors from "cors";

import authRoutes from "../routers/authRoutes.js";
import {
  notFoundHandler,
  errorHandler,
} from "../middlewares/errorHandler.js";

const app = express();

app.disable("x-powered-by");

app.use(cors({}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));


app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

app.use("/api/v1/auth", authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
