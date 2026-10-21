import invoiceRoutes from "../Routers/invoiceRoutes.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "../routers/authRoutes.js";
import userRoutes from "../routers/userRoutes.js";
import courseRoutes from "../routers/courseRoutes.js";
import quizRoutes from "../Routers/quizRoutes.js";
import {
  notFoundHandler,
  errorHandler,
} from "../middlewares/errorHandler.js";

const app = express();

app.disable("x-powered-by");

app.use(cors({}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/quizzes", quizRoutes);
app.use("/api/v1/invoices", invoiceRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
