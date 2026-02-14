# Quick Deployment Steps

## 🚀 Deploy Worker API to Cloudflare

### Step 1: Update FRONTEND_URL in wrangler.toml

Edit `worker-api/wrangler.toml`:

```toml
# For production (recommended):
FRONTEND_URL = "https://modern-todo-app-ten.vercel.app"

# For multiple domains:
# FRONTEND_URL = "https://modern-todo-app-ten.vercel.app,https://yourcustomdomain.com"

# For testing only (NOT for production!):
# FRONTEND_URL = "*"
```

### Step 2: Deploy to Cloudflare

```bash
cd worker-api
npx wrangler deploy
```

### Step 3: Verify Deployment

Check the deployment URL (should be `https://antigravity-api.arun375797.workers.dev`)

Test health endpoint:

```bash
curl https://antigravity-api.arun375797.workers.dev/health
```

---

## 🌐 Deploy Frontend to Vercel

### Step 1: Verify API URL

Check `client/.env`:

```env
VITE_API_URL=https://antigravity-api.arun375797.workers.dev
```

### Step 2: Build and Deploy

```bash
cd client
npm run build
```

Then push to GitHub - Vercel will auto-deploy.

Or deploy manually:

```bash
npx vercel --prod
```

### Step 3: Test in Production

1. Visit your Vercel URL: `https://modern-todo-app-ten.vercel.app`
2. Open browser DevTools → Network tab
3. Try logging in with Google
4. Check for CORS errors (should be none!)
5. Verify response headers include:
   - `Access-Control-Allow-Origin: https://modern-todo-app-ten.vercel.app`
   - `Access-Control-Allow-Credentials: false`

---

## 🔍 Troubleshooting

### Still seeing CORS errors?

1. **Check Worker logs:**

   ```bash
   cd worker-api
   npx wrangler tail --format=pretty
   ```

2. **Verify FRONTEND_URL:**
   - Make sure it matches your Vercel deployment URL exactly
   - No trailing slashes: ✅ `https://site.com` ❌ `https://site.com/`

3. **Check browser console:**
   - Look for the actual origin being sent
   - Compare with `FRONTEND_URL` in wrangler.toml

### Getting 404 errors?

This is NOT a CORS issue! Check:

- Are you calling the correct endpoint? (e.g., `/api/v1/auth/login`)
- Is the route defined in the Worker API?

### Getting 500 errors?

This is NOT a CORS issue! Check:

- Worker logs: `npx wrangler tail`
- Are all secrets set? (MONGO_URI, JWT_SECRET, etc.)
- Is the database accessible?

---

## ✅ Final Checklist

- [ ] Updated `FRONTEND_URL` in `worker-api/wrangler.toml`
- [ ] Deployed Worker API: `npx wrangler deploy`
- [ ] Verified `VITE_API_URL` in `client/.env`
- [ ] Built frontend: `npm run build`
- [ ] Deployed to Vercel
- [ ] Tested login flow
- [ ] No CORS errors in browser console
- [ ] All API calls working

---

**Need Help?** See `CORS_FIX_GUIDE.md` for detailed explanations.
