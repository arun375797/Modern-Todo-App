import { Hono } from "hono";
import { cors } from "hono/cors";
import { getDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import todoRoutes from "./routes/todos.js";
import ruleRoutes from "./routes/rules.js";
import userRoutes from "./routes/users.js";

const app = new Hono();

// Helper function to get CORS origin
function getCorsOrigin(origin) {
  // Allow requests with no origin (mobile apps, Postman, etc.)
  // Note: When credentials: true, we can't use "*", so we need to handle this carefully
  if (!origin) {
    // For requests without origin, return null - CORS middleware will handle it
    // But we'll allow it for non-credential requests
    return null;
  }

  // Allow Vercel preview deployments (including modern-todo-app-ten.vercel.app)
  if (origin.includes(".vercel.app")) {
    return origin;
  }

  // Allow localhost for development
  if (
    origin.includes("localhost:3000") ||
    origin.includes("localhost:5173") ||
    origin.startsWith("http://localhost:") ||
    origin.startsWith("https://localhost:")
  ) {
    return origin;
  }

  // Allow any origin for now (can be restricted later via env var)
  // Since credentials: true, we must return the specific origin, not "*"
  return origin;
}

// CORS configuration
app.use(
  "/*",
  cors({
    origin: (origin) => {
      const allowedOrigin = getCorsOrigin(origin);
      // When credentials: true, we cannot use "*"
      // Return the origin if we have one, otherwise return null
      // Hono will handle null by not setting CORS headers for that request
      // But we want to allow the request, so we'll return the origin if provided
      if (allowedOrigin) {
        return allowedOrigin;
      }
      // For requests without origin, we can't use "*" with credentials: true
      // So we'll return null, which means no CORS headers (but request will still work for same-origin)
      // Actually, let's be more permissive and return the origin if it exists
      return origin || null;
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
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
  let allowedOrigin = getCorsOrigin(origin);
  
  // If we have an origin but getCorsOrigin returned null, use the origin anyway
  // (This shouldn't happen for valid origins, but be defensive)
  if (origin && !allowedOrigin) {
    allowedOrigin = origin;
  }
  
  // When credentials: true, we cannot use "*", must use specific origin
  const headers = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
  
  // Set Access-Control-Allow-Origin if we have a valid origin
  // When credentials: true, we cannot use "*"
  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
  } else if (origin) {
    // Fallback: if origin exists but wasn't allowed, still set it to avoid CORS error
    // (This allows the browser to at least see the error message)
    headers["Access-Control-Allow-Origin"] = origin;
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
  let allowedOrigin = getCorsOrigin(origin);
  
  // If we have an origin but getCorsOrigin returned null, use the origin
  if (origin && !allowedOrigin) {
    allowedOrigin = origin;
  }
  
  const headers = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
  
  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
  } else if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  
  return c.json({ message: "Not Found" }, 404, headers);
});

export default app;
