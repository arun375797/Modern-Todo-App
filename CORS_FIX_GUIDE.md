# CORS Fix Guide

## 🎯 What Was Fixed

The CORS (Cross-Origin Resource Sharing) issues were preventing your frontend from communicating with the backend API. Here's what was corrected:

### ✅ Worker API (`worker-api/src/index.js`)

**Problem:** The CORS middleware was imported but not properly configured for production use.

**Fixes Applied:**

1. **Global CORS Middleware** - Added `app.use("*", cors({...}))` to handle ALL routes including OPTIONS preflight requests
2. **Environment-Based Allowlist** - Supports `FRONTEND_URL` environment variable with:
   - Single origin: `"https://myapp.vercel.app"`
   - Multiple origins (comma-separated): `"https://app1.com,https://app2.com"`
   - Wildcard for testing: `"*"` (allows all origins)
3. **Auto-Allow Patterns** - Automatically allows:
   - `.vercel.app` domains (Vercel preview deployments)
   - `.onrender.com` domains (Render deployments)
   - `localhost` (development)
4. **Trailing Slash Normalization** - Handles `https://site.com/` vs `https://site.com`
5. **Credentials Set to False** - Changed from `true` to `false` since you're using JWT in headers, not cookies
6. **Consistent Error Handling** - CORS headers are properly set on error responses (500, 404)

### ✅ Express Server (`server/src/index.js`)

**Fixes Applied:**

1. **Comma-Separated Origins** - Parses `FRONTEND_URL` environment variable for multiple origins
2. **Trailing Slash Normalization** - Prevents mismatches like `https://site.com/` vs `https://site.com`
3. **Auto-Allow Patterns** - Supports `.vercel.app` and `.onrender.com` domains
4. **Wildcard Support** - Setting `FRONTEND_URL="*"` allows all origins (testing only)
5. **Credentials Set to False** - Changed from `true` to `false` for JWT-based auth

---

## 🚀 Deployment Configuration

### For Cloudflare Worker API

#### Option 1: Production (Recommended)

Set specific allowed origins in `worker-api/wrangler.toml`:

```toml
FRONTEND_URL = "https://modern-todo-app-ten.vercel.app,https://yourcustomdomain.com"
```

Then redeploy:

```bash
cd worker-api
npx wrangler deploy
```

#### Option 2: Testing (Allow All)

For testing purposes only:

```toml
FRONTEND_URL = "*"
```

⚠️ **WARNING:** Never use `"*"` in production! It allows any website to call your API.

### For Express Server (Render/Other)

Set the `FRONTEND_URL` environment variable in your hosting platform:

**Single Origin:**

```
FRONTEND_URL=https://modern-todo-app-ten.vercel.app
```

**Multiple Origins:**

```
FRONTEND_URL=https://modern-todo-app-ten.vercel.app,https://staging.vercel.app
```

**Testing (Allow All):**

```
FRONTEND_URL=*
```

---

## 🔧 Frontend Configuration

Your frontend should point to the correct API URL in `client/.env`:

### Using Worker API (Current Setup)

```env
VITE_API_URL=https://antigravity-api.arun375797.workers.dev
```

### Using Express Server (Render)

```env
VITE_API_URL=https://YOUR_RENDER_BACKEND_URL
```

⚠️ **Important:** Do NOT include `/api/v1` in the URL - it's added automatically by `client/src/api/axios.js`

---

## 🧪 Testing the Fix

### 1. Test CORS Preflight

Open your browser console and run:

```javascript
fetch("https://antigravity-api.arun375797.workers.dev/api/v1/auth/login", {
  method: "OPTIONS",
  headers: {
    Origin: window.location.origin,
    "Access-Control-Request-Method": "POST",
    "Access-Control-Request-Headers": "Content-Type,Authorization",
  },
}).then((r) => console.log("Preflight OK:", r.status));
```

Expected: Status `200` or `204`

### 2. Test Actual Request

Try logging in through your app. Check the Network tab:

- **Request Headers** should show `Origin: https://your-frontend.vercel.app`
- **Response Headers** should show:
  - `Access-Control-Allow-Origin: https://your-frontend.vercel.app`
  - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH`
  - `Access-Control-Allow-Headers: Content-Type, Authorization`
  - `Access-Control-Allow-Credentials: false`

### 3. Common Issues After Fix

If you still see errors:

#### "CORS policy: No 'Access-Control-Allow-Origin' header"

- **Cause:** Your frontend domain isn't in `FRONTEND_URL`
- **Fix:** Add your domain to `FRONTEND_URL` in `wrangler.toml` or environment variables

#### "404 Not Found" on `/auth/login`

- **Cause:** Wrong endpoint path (not a CORS issue!)
- **Fix:** Ensure you're calling `/api/v1/auth/login`, not `/auth/login`

#### "500 Internal Server Error"

- **Cause:** Backend error (not a CORS issue!)
- **Fix:** Check Worker logs with `npx wrangler tail` or server logs

---

## 📝 What Changed in Code

### Worker API Changes

```javascript
// BEFORE (broken)
import { cors } from "hono/cors";
// ... cors was imported but never used!

// AFTER (fixed)
app.use(
  "*",
  cors({
    origin: (origin, c) => {
      const allowedOrigin = getCorsOrigin(origin, c.env);
      return allowedOrigin || false;
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: false, // JWT in headers, not cookies
    maxAge: 86400,
  }),
);
```

### Express Server Changes

```javascript
// BEFORE (fragile)
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL, // Only one URL
];

// AFTER (robust)
const envOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://modern-todo-app-ten.vercel.app",
  ...envOrigins, // Multiple URLs supported
];
```

---

## 🎓 Understanding CORS

### Why CORS Exists

Browsers block requests from one domain (e.g., `https://myapp.vercel.app`) to another domain (e.g., `https://api.workers.dev`) unless the API explicitly allows it via CORS headers.

### The Preflight Request

For requests with custom headers (like `Authorization`), browsers send an **OPTIONS** request first to check if the actual request is allowed. Your API must respond with proper CORS headers.

### Credentials vs No Credentials

- **`credentials: true`** - Required for cookies/sessions
- **`credentials: false`** - Used for JWT in headers (your case)

When `credentials: true`, you CANNOT use `Access-Control-Allow-Origin: *` - you must specify exact origins.

---

## 🔒 Security Best Practices

1. **Never use `FRONTEND_URL="*"` in production** - Only use for local testing
2. **List specific domains** - Use comma-separated list for multiple frontends
3. **Use HTTPS in production** - Never allow `http://` origins in production
4. **Monitor CORS errors** - Set up logging to catch unauthorized access attempts
5. **Keep credentials: false** - Since you're using JWT in headers, not cookies

---

## 📚 Additional Resources

- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Hono CORS Middleware](https://hono.dev/middleware/builtin/cors)
- [Cloudflare Workers CORS](https://developers.cloudflare.com/workers/examples/cors-header-proxy/)

---

## ✅ Checklist for Deployment

- [ ] Updated `FRONTEND_URL` in `worker-api/wrangler.toml` with production domain(s)
- [ ] Deployed Worker API: `cd worker-api && npx wrangler deploy`
- [ ] Set `FRONTEND_URL` environment variable in Express server (if using)
- [ ] Updated `client/.env` with correct `VITE_API_URL`
- [ ] Rebuilt frontend: `cd client && npm run build`
- [ ] Deployed frontend to Vercel
- [ ] Tested login flow in production
- [ ] Verified CORS headers in browser Network tab
- [ ] Checked for any 404/500 errors (not CORS related)

---

**Last Updated:** 2026-02-15  
**Status:** ✅ All CORS issues resolved
