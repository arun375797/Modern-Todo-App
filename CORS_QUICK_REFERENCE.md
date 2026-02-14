# CORS Quick Reference

## 🚨 Common CORS Errors & Solutions

### Error 1: "No 'Access-Control-Allow-Origin' header is present"

**Symptom:**

```
Access to fetch at 'https://api.example.com/endpoint' from origin
'https://frontend.com' has been blocked by CORS policy: No
'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Cause:** CORS middleware not configured or origin not allowed

**Solution:**

1. Check `FRONTEND_URL` in `wrangler.toml` or `.env`
2. Verify it matches your frontend domain exactly
3. Redeploy: `npx wrangler deploy`

---

### Error 2: "The 'Access-Control-Allow-Origin' header contains multiple values"

**Symptom:**

```
The 'Access-Control-Allow-Origin' header contains multiple values
'https://frontend.com, https://frontend.com', but only one is allowed.
```

**Cause:** CORS headers set multiple times (middleware + manual headers)

**Solution:**

- ✅ Use CORS middleware only (already fixed)
- ❌ Don't manually set CORS headers in route handlers

---

### Error 3: "Credentials flag is 'true', but 'Access-Control-Allow-Credentials' header is 'false'"

**Symptom:**

```
Access to fetch at 'https://api.example.com/endpoint' from origin
'https://frontend.com' has been blocked by CORS policy: The value of
the 'Access-Control-Allow-Credentials' header in the response is ''
which must be 'true' when the request's credentials mode is 'include'.
```

**Cause:** Frontend sending `credentials: true` but backend has `credentials: false`

**Solution:**

- ✅ Remove `withCredentials: true` from axios config (already correct)
- ✅ Keep backend `credentials: false` (already set)
- We use JWT in headers, not cookies!

---

### Error 4: "Method not allowed by Access-Control-Allow-Methods"

**Symptom:**

```
Access to fetch at 'https://api.example.com/endpoint' from origin
'https://frontend.com' has been blocked by CORS policy: Method PATCH
is not allowed by Access-Control-Allow-Methods in preflight response.
```

**Cause:** HTTP method not in allowed methods list

**Solution:**

- ✅ Already includes: GET, POST, PUT, DELETE, OPTIONS, PATCH
- If using other methods, add them to `allowMethods` array

---

### Error 5: "Request header field authorization is not allowed"

**Symptom:**

```
Access to fetch at 'https://api.example.com/endpoint' from origin
'https://frontend.com' has been blocked by CORS policy: Request header
field authorization is not allowed by Access-Control-Allow-Headers
in preflight response.
```

**Cause:** Header not in allowed headers list

**Solution:**

- ✅ Already includes: Content-Type, Authorization
- If using other headers, add them to `allowHeaders` array

---

## ✅ Quick Fixes

### Fix 1: Update FRONTEND_URL

**Worker API:**

```bash
# Edit worker-api/wrangler.toml
FRONTEND_URL = "https://your-frontend.vercel.app"

# Redeploy
cd worker-api
npx wrangler deploy
```

**Express Server:**

```bash
# Edit server/.env
FRONTEND_URL=https://your-frontend.vercel.app

# Restart server
npm run dev
```

---

### Fix 2: Allow Multiple Origins

**Worker API:**

```toml
# worker-api/wrangler.toml
FRONTEND_URL = "https://app1.vercel.app,https://app2.com,https://staging.com"
```

**Express Server:**

```env
# server/.env
FRONTEND_URL=https://app1.vercel.app,https://app2.com,https://staging.com
```

---

### Fix 3: Allow All Origins (Testing Only!)

**Worker API:**

```toml
# worker-api/wrangler.toml
FRONTEND_URL = "*"
```

**Express Server:**

```env
# server/.env
FRONTEND_URL=*
```

⚠️ **WARNING:** Never use in production!

---

## 🔍 Debugging Checklist

### Step 1: Verify Origin

Open browser DevTools → Network tab → Select failed request → Headers

**Check Request Headers:**

```
Origin: https://your-frontend.vercel.app
```

**Does it match FRONTEND_URL?**

- ✅ Yes → Continue to Step 2
- ❌ No → Update FRONTEND_URL to match

---

### Step 2: Check Response Headers

**Look for these headers:**

```
Access-Control-Allow-Origin: https://your-frontend.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: false
```

**Are they present?**

- ✅ Yes → CORS is working! Check for other errors (404, 500)
- ❌ No → CORS middleware not active, check deployment

---

### Step 3: Check Preflight Request

**Look for OPTIONS request before the actual request**

**Is there an OPTIONS request?**

- ✅ Yes → Check if it returns 200/204 with CORS headers
- ❌ No → Browser didn't send preflight (simple request)

**Does OPTIONS return CORS headers?**

- ✅ Yes → CORS is working!
- ❌ No → CORS middleware not configured

---

### Step 4: Check Worker Logs

```bash
cd worker-api
npx wrangler tail --format=pretty
```

**Look for:**

- Incoming requests
- Origin being checked
- Errors in CORS middleware

---

### Step 5: Test with cURL

```bash
# Test preflight
curl -X OPTIONS \
  https://antigravity-api.arun375797.workers.dev/api/v1/auth/login \
  -H "Origin: https://modern-todo-app-ten.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v
```

**Expected response headers:**

```
< HTTP/2 204
< access-control-allow-origin: https://modern-todo-app-ten.vercel.app
< access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
< access-control-allow-headers: Content-Type, Authorization
< access-control-allow-credentials: false
< access-control-max-age: 86400
```

---

## 🎯 Common Mistakes

### ❌ Mistake 1: Trailing Slashes

```toml
# Wrong
FRONTEND_URL = "https://myapp.vercel.app/"

# Correct
FRONTEND_URL = "https://myapp.vercel.app"
```

**Fix:** ✅ Already handled by normalization

---

### ❌ Mistake 2: Including /api/v1 in FRONTEND_URL

```toml
# Wrong
FRONTEND_URL = "https://myapp.vercel.app/api/v1"

# Correct
FRONTEND_URL = "https://myapp.vercel.app"
```

---

### ❌ Mistake 3: Using http:// in Production

```toml
# Wrong (insecure)
FRONTEND_URL = "http://myapp.vercel.app"

# Correct (secure)
FRONTEND_URL = "https://myapp.vercel.app"
```

---

### ❌ Mistake 4: Forgetting to Redeploy

```bash
# After changing wrangler.toml, you MUST redeploy!
cd worker-api
npx wrangler deploy
```

---

### ❌ Mistake 5: Setting credentials: true with JWT

```javascript
// Wrong (for JWT in headers)
credentials: true;

// Correct (for JWT in headers)
credentials: false;
```

**Fix:** ✅ Already set to `false`

---

## 📋 Pre-Deployment Checklist

- [ ] `FRONTEND_URL` set in `wrangler.toml`
- [ ] `FRONTEND_URL` matches frontend domain exactly
- [ ] No trailing slashes in URLs
- [ ] Using `https://` (not `http://`) for production
- [ ] Worker deployed: `npx wrangler deploy`
- [ ] Frontend built: `npm run build`
- [ ] Frontend deployed to Vercel
- [ ] Tested login flow
- [ ] No CORS errors in browser console
- [ ] Response headers include `Access-Control-Allow-Origin`

---

## 🆘 Still Having Issues?

### 1. Check Documentation

- `CORS_FIX_GUIDE.md` - Comprehensive guide
- `CORS_FLOW_DIAGRAM.md` - Visual explanation
- `DEPLOYMENT.md` - Deployment steps

### 2. Check Worker Logs

```bash
cd worker-api
npx wrangler tail --format=pretty
```

### 3. Verify Configuration

**Worker API:**

```bash
cat worker-api/wrangler.toml | grep FRONTEND_URL
```

**Express Server:**

```bash
cat server/.env | grep FRONTEND_URL
```

### 4. Test Locally

```bash
# Worker API
cd worker-api
npx wrangler dev

# Frontend
cd client
npm run dev
```

---

## 🔗 Useful Resources

- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Hono CORS Middleware](https://hono.dev/middleware/builtin/cors)
- [Cloudflare Workers CORS](https://developers.cloudflare.com/workers/examples/cors-header-proxy/)

---

**Last Updated:** 2026-02-15  
**Status:** ✅ All CORS issues resolved
