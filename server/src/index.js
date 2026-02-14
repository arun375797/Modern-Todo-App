import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import todoRoutes from "./routes/todo.routes.js";
import ruleRoutes from "./routes/rule.routes.js";
import userRoutes from "./routes/user.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

function normalizeOrigin(origin) {
  return (origin || "").replace(/\/$/, "");
}

function parseAllowedFromEnv(value) {
  const v = (value || "").trim();
  if (!v) return [];
  if (v === "*") return ["*"];
  return v
    .split(",")
    .map((s) => normalizeOrigin(s.trim()))
    .filter(Boolean);
}

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
];

// Add any explicit frontends from env (comma-separated)
const envAllowed = parseAllowedFromEnv(process.env.FRONTEND_URL);
allowedOrigins.push(...envAllowed);

app.use(
  cors({
    origin: (origin, callback) => {
      const o = normalizeOrigin(origin);

      // Allow requests with no origin (Postman, server-to-server, etc.)
      if (!o) return callback(null, true);

      // Allow all during setup if FRONTEND_URL="*"
      if (envAllowed.includes("*")) return callback(null, true);

      // Allow Vercel preview deployments and Render frontends
      if (o.endsWith(".vercel.app") || o.endsWith(".onrender.com")) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(o)) return callback(null, true);

      return callback(new Error(`Not allowed by CORS: ${o}`));
    },
    // This app uses Authorization: Bearer <token>, so cookies are not required.
    credentials: false,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/todos", todoRoutes);
app.use("/api/v1/rules", ruleRoutes);
app.use("/api/v1/users", userRoutes);

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});
