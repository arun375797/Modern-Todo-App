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
    crossOriginResourcePolicy: false, // Allow loading images from /uploads
  }),
);

// CORS configuration
// Parse FRONTEND_URL (supports comma-separated list)
const frontendUrlEnv = process.env.FRONTEND_URL || "";
const envOrigins = frontendUrlEnv
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://modern-todo-app-ten.vercel.app", // Production Vercel URL
  ...envOrigins, // Additional URLs from environment
].filter(Boolean); // Remove any undefined values

// Normalize origin (remove trailing slash)
const normalizeOrigin = (origin) => {
  if (!origin) return origin;
  return origin.replace(/\/$/, "");
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Normalize the origin
      const normalizedOrigin = normalizeOrigin(origin);

      // Check if FRONTEND_URL is "*" (allow all for testing)
      if (frontendUrlEnv === "*") {
        return callback(null, true);
      }

      // Allow Vercel preview deployments (e.g., https://todo-xyz-username.vercel.app)
      if (origin.includes(".vercel.app")) {
        return callback(null, true);
      }

      // Allow Render deployments (e.g., https://myapp.onrender.com)
      if (origin.includes(".onrender.com")) {
        return callback(null, true);
      }

      // Check against normalized allowed origins
      const isAllowed = allowedOrigins.some(
        (allowed) => normalizeOrigin(allowed) === normalizedOrigin,
      );

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: false, // Changed to false - we use JWT in headers, not cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
