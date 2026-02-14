import { Hono } from "hono";
import { cors } from "hono/cors";
import { getDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import todoRoutes from "./routes/todos.js";
import ruleRoutes from "./routes/rules.js";
import userRoutes from "./routes/users.js";

const app = new Hono();

// Helper function to get CORS origin
function getCorsOrigin(origin, env) {
  if (!origin) return null;

  // Get FRONTEND_URL from environment (supports comma-separated list)
  const frontendUrl = env?.FRONTEND_URL || "";

  // If FRONTEND_URL is "*", allow all origins (for testing only!)
  if (frontendUrl === "*") {
    return origin;
  }

  // Parse comma-separated origins from FRONTEND_URL
  const allowedOrigins = frontendUrl
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

  // Normalize origin (remove trailing slash)
  const normalizedOrigin = origin.replace(/\/$/, "");

  // Check if origin is in the explicit allowlist
  for (const allowed of allowedOrigins) {
    const normalizedAllowed = allowed.replace(/\/$/, "");
    if (normalizedOrigin === normalizedAllowed) {
      return origin;
    }
  }

  // Allow Vercel preview deployments (e.g., https://todo-xyz-username.vercel.app)
  if (origin.includes(".vercel.app")) {
    return origin;
  }

  // Allow Render deployments (e.g., https://myapp.onrender.com)
  if (origin.includes(".onrender.com")) {
    return origin;
  }

  // Allow localhost for development
  if (
    origin.includes("localhost:") ||
    origin.startsWith("http://localhost:") ||
    origin.startsWith("https://localhost:")
  ) {
    return origin;
  }

  // If not matched, return null (will be rejected)
  return null;
}

// CORS configuration - MUST be applied before routes
app.use(
  "*",
  cors({
    origin: (origin, c) => {
      const allowedOrigin = getCorsOrigin(origin, c.env);
      return allowedOrigin || false; // Return false instead of null to reject
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: false, // Changed to false - we use JWT in headers, not cookies
    maxAge: 86400,
  }),
);

// Health check endpoint with DB test
app.get("/health", async (c) => {
  try {
    const db = await getDB(c.env);
    // Simple ping
    const ping = await db.command({ ping: 1 });
    return c.json({
      status: "ok",
      database: "connected",
      ping,
      timestamp: new Date().toISOString(),
      environment: "cloudflare-workers",
    });
  } catch (err) {
    return c.json(
      {
        status: "error",
        database: "failed",
        error: err.message,
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
});

// Root endpoint
app.get("/", (c) => {
  return c.json({
    message: "Antigravity API — Powered by Cloudflare Workers",
    version: "1.0.0",
  });
});

// Mount routes
app.route("/api/v1/auth", authRoutes);
app.route("/api/v1/todos", todoRoutes);
app.route("/api/v1/rules", ruleRoutes);
app.route("/api/v1/users", userRoutes);

// Global error handler
app.onError((err, c) => {
  console.error("Unhandled error:", err);

  // Ensure CORS headers are present even on error
  // so the frontend can read the error message
  const origin = c.req.header("Origin");
  const allowedOrigin = getCorsOrigin(origin, c.env);

  const headers = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "false",
  };

  // Set Access-Control-Allow-Origin if we have a valid origin
  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
  }

  return c.json(
    {
      message: err.message || "Internal Server Error",
      stack: c.env.NODE_ENV === "production" ? undefined : err.stack,
    },
    500,
    headers,
  );
});

// 404 handler
app.notFound((c) => {
  // Add CORS headers to 404 responses
  const origin = c.req.header("Origin");
  const allowedOrigin = getCorsOrigin(origin, c.env);

  const headers = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "false",
  };

  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
  }

  return c.json({ message: "Not Found" }, 404, headers);
});

export default app;
