# CORS Request Flow

## Before Fix ❌

```
┌─────────────────────────────────────────────────────────────────┐
│ Frontend (https://modern-todo-app-ten.vercel.app)              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1. OPTIONS /api/v1/auth/login
                              │    Origin: https://modern-todo-app-ten.vercel.app
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Worker API (https://antigravity-api.arun375797.workers.dev)    │
│                                                                 │
│ ❌ CORS middleware imported but NOT used                       │
│ ❌ No Access-Control-Allow-Origin header                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 2. Response (200 OK)
                              │    ❌ Missing CORS headers
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Browser                                                         │
│ 🚫 BLOCKED: "No 'Access-Control-Allow-Origin' header present"  │
└─────────────────────────────────────────────────────────────────┘
```

---

## After Fix ✅

```
┌─────────────────────────────────────────────────────────────────┐
│ Frontend (https://modern-todo-app-ten.vercel.app)              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1. OPTIONS /api/v1/auth/login (Preflight)
                              │    Origin: https://modern-todo-app-ten.vercel.app
                              │    Access-Control-Request-Method: POST
                              │    Access-Control-Request-Headers: Content-Type, Authorization
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Worker API (https://antigravity-api.arun375797.workers.dev)    │
│                                                                 │
│ ✅ CORS middleware active: app.use("*", cors({...}))           │
│ ✅ Checks origin against:                                      │
│    - FRONTEND_URL from environment                             │
│    - .vercel.app domains (auto-allowed)                        │
│    - .onrender.com domains (auto-allowed)                      │
│    - localhost (auto-allowed)                                  │
│                                                                 │
│ ✅ Origin matches → Allow request                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 2. Response (204 No Content)
                              │    ✅ Access-Control-Allow-Origin: https://modern-todo-app-ten.vercel.app
                              │    ✅ Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
                              │    ✅ Access-Control-Allow-Headers: Content-Type, Authorization
                              │    ✅ Access-Control-Allow-Credentials: false
                              │    ✅ Access-Control-Max-Age: 86400
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Browser                                                         │
│ ✅ Preflight successful! Proceeding with actual request...     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 3. POST /api/v1/auth/login (Actual Request)
                              │    Origin: https://modern-todo-app-ten.vercel.app
                              │    Authorization: Bearer eyJhbGc...
                              │    Content-Type: application/json
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Worker API                                                      │
│ ✅ CORS middleware allows request                              │
│ ✅ Processes login                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 4. Response (200 OK)
                              │    ✅ Access-Control-Allow-Origin: https://modern-todo-app-ten.vercel.app
                              │    ✅ Access-Control-Allow-Credentials: false
                              │    { "token": "...", "user": {...} }
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Browser                                                         │
│ ✅ SUCCESS! Response received and processed                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Components

### 1. Preflight Request (OPTIONS)

The browser automatically sends this **before** the actual request when:

- Using custom headers (like `Authorization`)
- Using methods other than GET/POST
- Using `Content-Type` other than simple types

### 2. CORS Middleware

```javascript
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
    maxAge: 86400, // Cache preflight for 24 hours
  }),
);
```

### 3. Origin Validation

```javascript
function getCorsOrigin(origin, env) {
  // 1. Check FRONTEND_URL environment variable
  // 2. Auto-allow .vercel.app domains
  // 3. Auto-allow .onrender.com domains
  // 4. Auto-allow localhost
  // 5. Normalize trailing slashes
  // 6. Support comma-separated origins
  // 7. Support wildcard "*" for testing
}
```

---

## Environment Configuration

### Worker API (`wrangler.toml`)

```toml
[vars]
# Single origin
FRONTEND_URL = "https://modern-todo-app-ten.vercel.app"

# Multiple origins (comma-separated)
# FRONTEND_URL = "https://app1.vercel.app,https://app2.com,https://custom-domain.com"

# Allow all (testing only!)
# FRONTEND_URL = "*"
```

### Express Server (`.env`)

```env
# Single origin
FRONTEND_URL=https://modern-todo-app-ten.vercel.app

# Multiple origins (comma-separated)
# FRONTEND_URL=https://app1.vercel.app,https://app2.com,https://custom-domain.com

# Allow all (testing only!)
# FRONTEND_URL=*
```

---

## Auto-Allowed Patterns

These domains are **automatically allowed** without needing to be in `FRONTEND_URL`:

1. **`.vercel.app`** - All Vercel deployments
   - `https://modern-todo-app-ten.vercel.app`
   - `https://modern-todo-app-git-main-username.vercel.app`
   - `https://modern-todo-app-pr-123-username.vercel.app`

2. **`.onrender.com`** - All Render deployments
   - `https://myapp.onrender.com`
   - `https://myapp-staging.onrender.com`

3. **`localhost`** - All localhost ports
   - `http://localhost:3000`
   - `http://localhost:5173`
   - `https://localhost:8080`

---

## Security Considerations

### ✅ Safe for Production

```toml
FRONTEND_URL = "https://modern-todo-app-ten.vercel.app"
```

- Only allows specific domain
- Still allows Vercel preview deployments (useful for testing PRs)
- Credentials set to `false` (correct for JWT)

### ⚠️ Use with Caution

```toml
FRONTEND_URL = "*"
```

- Allows **ANY** website to call your API
- Only use for local testing
- **NEVER** use in production!

### 🔒 Most Secure

```toml
FRONTEND_URL = "https://myapp.com,https://staging.myapp.com"
```

- Only allows specific domains
- No wildcard patterns
- Explicit allowlist

---

## Testing CORS

### 1. Browser DevTools

Open Network tab and look for:

**Preflight Request (OPTIONS):**

```
Request Headers:
  Origin: https://modern-todo-app-ten.vercel.app
  Access-Control-Request-Method: POST
  Access-Control-Request-Headers: content-type,authorization

Response Headers:
  Access-Control-Allow-Origin: https://modern-todo-app-ten.vercel.app
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
  Access-Control-Allow-Headers: Content-Type, Authorization
  Access-Control-Allow-Credentials: false
```

**Actual Request (POST):**

```
Request Headers:
  Origin: https://modern-todo-app-ten.vercel.app
  Authorization: Bearer eyJhbGc...

Response Headers:
  Access-Control-Allow-Origin: https://modern-todo-app-ten.vercel.app
  Access-Control-Allow-Credentials: false
```

### 2. cURL Test

```bash
# Test preflight
curl -X OPTIONS \
  https://antigravity-api.arun375797.workers.dev/api/v1/auth/login \
  -H "Origin: https://modern-todo-app-ten.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v

# Should return:
# < Access-Control-Allow-Origin: https://modern-todo-app-ten.vercel.app
# < Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
# < Access-Control-Allow-Headers: Content-Type, Authorization
```

### 3. Browser Console

```javascript
// Test from browser console on your frontend
fetch("https://antigravity-api.arun375797.workers.dev/api/v1/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer test-token",
  },
  body: JSON.stringify({ email: "test@example.com", password: "test" }),
})
  .then((r) => console.log("✅ CORS working!", r.status))
  .catch((e) => console.error("❌ CORS error:", e));
```

---

**Last Updated:** 2026-02-15  
**Status:** ✅ All CORS issues resolved
