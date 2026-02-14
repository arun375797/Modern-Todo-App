import { Hono } from "hono";
import { cors } from "hono/cors";
import authRoutes from "./routes/auth.js";
import todoRoutes from "./routes/todos.js";
import ruleRoutes from "./routes/rules.js";
import userRoutes from "./routes/users.js";

const app = new Hono();

// CORS configuration
app.use(
  "/*",
  cors({
    origin: (origin) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return "*";

      // Allow Vercel preview deployments
      if (origin.includes(".vercel.app")) return origin;

      // Allow localhost for development
      if (
        origin.includes("localhost:3000") ||
        origin.includes("localhost:5173")
      ) {
        return origin;
      }

      // Allow configured frontend URL
      // (FRONTEND_URL is set in wrangler.toml or via env vars)
      return origin;
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    maxAge: 86400,
  }),
);

// Health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: "cloudflare-workers",
  });
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
  const headers = {
    "Access-Control-Allow-Origin": (() => {
      const origin = c.req.header("Origin");
      if (!origin) return "*";
      if (origin.includes(".vercel.app") || origin.includes("localhost"))
        return origin;
      return origin; // Fallback to allowing the origin
    })(),
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };

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
  return c.json({ message: "Not Found" }, 404);
});

export default app;
