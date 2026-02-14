# Deployment Configuration Guide

## Frontend (Vercel)

### Environment Variables

Set the following in Vercel → Settings → Environment Variables:

```
VITE_API_URL=https://modern-todo-app-o2cu.onrender.com
```

**Important:**

- Do NOT include `/api/v1` in the URL - it's added automatically by the axios config
- Apply to: Production, Preview, Development

### After Setting Environment Variables

1. Go to Deployments tab
2. Click "..." on the latest deployment
3. Click "Redeploy"
4. Check "Use existing Build Cache" (optional)
5. Click "Redeploy"

---

## Backend (Render)

### Environment Variables

Set the following in Render → Environment:

```bash
# Database
MONGO_URI=mongodb+srv://arun3757979_db_user:Life2305@cluster0.bhbhtqi.mongodb.net/?appName=Cluster0

# JWT
JWT_SECRET=mysecretkey
JWT_EXPIRES_IN=7d

# Environment
NODE_ENV=production

# Frontend URL (your Vercel production URL)
FRONTEND_URL=https://todo-alpha-topaz.vercel.app
```

**Important:**

- Do NOT set `PORT` - Render sets this automatically
- Set `NODE_ENV=production` (not development)
- Update `FRONTEND_URL` to match your actual Vercel production URL

### Auto-Deploy

Render automatically deploys when you push to your repository.

---

## Testing the Deployment

### 1. Test Backend Health

Open in browser:

```
https://modern-todo-app-o2cu.onrender.com/health
```

Should return:

```json
{
  "status": "ok",
  "timestamp": "...",
  "environment": "production"
}
```

### 2. Test API Endpoint (should return 400/405, not 404)

```
https://modern-todo-app-o2cu.onrender.com/api/v1/auth/login
```

If you get 404, the routes aren't mounted correctly.
If you get 400/405, the endpoint exists (correct!).

### 3. Test Frontend

Open:

```
https://todo-alpha-topaz.vercel.app
```

Open browser console and check:

- Should see: `🔗 API Base URL: https://modern-todo-app-o2cu.onrender.com/api/v1`
- No CORS errors
- No 404 errors on login

---

## Troubleshooting

### Login returns 404

**Problem:** Frontend is calling wrong URL

**Check:**

1. Open browser console on deployed site
2. Look for `🔗 API Base URL:` log
3. Should show: `https://modern-todo-app-o2cu.onrender.com/api/v1`
4. If different, redeploy Vercel after setting env var

### CORS Error

**Problem:** Backend doesn't allow your frontend origin

**Fix:**

1. Check `FRONTEND_URL` is set correctly in Render
2. Redeploy backend
3. Vercel preview deployments (e.g., `https://todo-xyz-username.vercel.app`) are automatically allowed

### PWA Icons Missing

**Problem:** Browser can't find icon files

**Fix:**

- Icons are now SVG-based (in `client/public/icon.svg`)
- Rebuild frontend: `npm run build`
- Redeploy to Vercel

---

## Quick Deploy Checklist

### First Time Setup

- [ ] Vercel: Set `VITE_API_URL=https://modern-todo-app-o2cu.onrender.com`
- [ ] Render: Set `NODE_ENV=production`
- [ ] Render: Set `FRONTEND_URL=https://todo-alpha-topaz.vercel.app`
- [ ] Render: Remove `PORT` variable (if set)
- [ ] Redeploy both services

### After Code Changes

```bash
# Commit and push
git add .
git commit -m "Your commit message"
git push
```

- Backend (Render): Auto-deploys on push
- Frontend (Vercel): Auto-deploys on push

### After Environment Variable Changes

- Vercel: Manual redeploy required
- Render: Manual redeploy required (or push a commit)
