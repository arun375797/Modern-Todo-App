import { Hono } from "hono";
import { cors } from "hono/cors";
import { getDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import todoRoutes from "./routes/todos.js";
import ruleRoutes from "./routes/rules.js";
import userRoutes from "./routes/users.js";

const app = new Hono();

// ---- CORS ----
// Notes:
// - This API uses Authorization: Bearer <token>, not cookies, so credentials are NOT required.
// - If you later move auth to cookies, set credentials: true and DO NOT use origin: "*".
function normalizeOrigin(origin) {
  if (!origin) return "";
  // Remove trailing slash to avoid "https://site.com/" vs "https://site.com" mismatch
  return origin.replace(/\/$/, "");
}

function parseAllowedFromEnv(frontendUrl) {
  const v = (frontendUrl || "").trim();
  if (!v) return [];
  if (v === "*") return ["*"];
  return v
    .split(",")
    .map((s) => normalizeOrigin(s.trim()))
    .filter(Boolean);
}

function isAllowedDynamicOrigin(origin) {
  // Allow common deployment hosts (adjust if you prefer to lock down)
  return (
    origin.endsWith(".vercel.app") ||
    origin.endsWith(".onrender.com") ||
    origin.includes("localhost:")
  );
}

function getCorsOrigin(origin, env) {
  const o = normalizeOrigin(origin);
  if (!o) return null;

  const allowed = parseAllowedFromEnv(env?.FRONTEND_URL);

  // Allow all during early setup if FRONTEND_URL="*"
  if (allowed.includes("*")) return "*";

  // Allow common hosts (Vercel previews, Render frontends, localhost)
  if (isAllowedDynamicOrigin(o)) return o;

  // Allow explicit origins from env (comma-separated list)
  if (allowed.includes(o)) return o;

  return null;
}

// Apply CORS to every route (including OPTIONS preflight)
app.use(
  "*",
  cors({
    origin: (origin, c) => getCorsOrigin(origin, c.env),
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  }),
);

// Health check endpoint with DB test
app.get("/health", async (c) => {
  try {
    const db = await getDB(c.env);
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

// Global error handler (keeps a JSON response; CORS middleware above will add headers)
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json(
    {
      message: err.message || "Internal Server Error",
      stack: c.env.NODE_ENV === "production" ? undefined : err.stack,
    },
    500,
  );
});

// 404 handler
app.notFound((c) => c.json({ message: "Not Found" }, 404));

export default app;
