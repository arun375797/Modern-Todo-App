# Cloudflare Workers Deployment Guide — Antigravity API

## 📁 Project Structure

```
worker-api/
├── src/
│   ├── index.js              # Hono app entry point
│   ├── config/
│   │   └── db.js             # MongoDB connection (cached)
│   ├── middleware/
│   │   └── auth.js           # JWT auth middleware
│   └── routes/
│       ├── auth.js           # Register / Login / GetMe
│       ├── todos.js          # CRUD todos
│       ├── rules.js          # CRUD rules
│       └── users.js          # Preferences + Background upload
├── .dev.vars                 # Local secrets (gitignored)
├── .gitignore
├── package.json
└── wrangler.toml             # Cloudflare config
```

## 🔧 Prerequisites

1. **Node.js 18+** installed
2. **Cloudflare account** — sign up free at [dash.cloudflare.com](https://dash.cloudflare.com)
3. **Wrangler CLI** authenticated

---

## 🚀 Step-by-Step Deployment

### Step 1: Authenticate with Cloudflare

```bash
cd worker-api
npx wrangler login
```

This will open a browser window. Log in and authorize Wrangler.

### Step 2: Set Production Secrets

These are sensitive values that should NEVER be in code. Run each command:

```bash
npx wrangler secret put MONGO_URI
# Paste: mongodb+srv://arun3757979_db_user:Life2305@cluster0.bhbhtqi.mongodb.net/?appName=Cluster0

npx wrangler secret put JWT_SECRET
# Paste: mysecretkey  (use a strong secret for production!)

npx wrangler secret put CLOUDINARY_CLOUD_NAME
# Paste: dhr5p3hq6

npx wrangler secret put CLOUDINARY_API_KEY
# Paste: 155738283232645

npx wrangler secret put CLOUDINARY_API_SECRET
# Paste: xqOFAA4ip6qbkYrAF-7rHA-Zrd0
```

### Step 3: Update Frontend URL

Edit `wrangler.toml` and set your actual Vercel frontend URL:

```toml
[vars]
FRONTEND_URL = "https://your-actual-domain.vercel.app"
```

### Step 4: Deploy

```bash
npx wrangler deploy
```

You'll get a URL like:

```
https://antigravity-api.<your-account>.workers.dev
```

### Step 5: Update Frontend Environment

In your **Vercel dashboard** (or `client/.env.production`), update:

```
VITE_API_URL=https://antigravity-api.<your-account>.workers.dev
```

---

## 🧪 Local Development

```bash
cd worker-api
npm run dev
```

This starts the Worker locally at `http://localhost:8787`.
Local secrets are read from `.dev.vars` file.

---

## 📡 API Endpoints

All endpoints mirror the original Express backend:

| Method | Path                              | Auth | Description              |
| ------ | --------------------------------- | ---- | ------------------------ |
| POST   | `/api/v1/auth/register`           | ❌   | Register new user        |
| POST   | `/api/v1/auth/login`              | ❌   | Login                    |
| GET    | `/api/v1/auth/me`                 | ✅   | Get current user         |
| GET    | `/api/v1/todos`                   | ✅   | Get todos (with filters) |
| POST   | `/api/v1/todos`                   | ✅   | Create todo              |
| PUT    | `/api/v1/todos/:id`               | ✅   | Update todo              |
| DELETE | `/api/v1/todos/:id`               | ✅   | Delete todo              |
| GET    | `/api/v1/rules`                   | ✅   | Get rules                |
| POST   | `/api/v1/rules`                   | ✅   | Create rule              |
| PUT    | `/api/v1/rules/:id`               | ✅   | Update rule              |
| DELETE | `/api/v1/rules/:id`               | ✅   | Delete rule              |
| PUT    | `/api/v1/users/preferences`       | ✅   | Update preferences       |
| POST   | `/api/v1/users/upload/background` | ✅   | Upload background image  |
| GET    | `/health`                         | ❌   | Health check             |

---

## 🔑 MongoDB Atlas: Allow Cloudflare Workers IP

Since Cloudflare Workers use many IPs globally, you need to allow access from anywhere:

1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com)
2. Navigate to **Network Access** → **IP Access List**
3. Click **Add IP Address**
4. Select **"Allow Access from Anywhere"** (`0.0.0.0/0`)
5. Click **Confirm**

> ⚠️ This is required because Workers don't have a fixed IP. Your database is still protected by username/password authentication.

---

## 🔄 Differences from Express Backend

| Feature     | Express (old)       | Workers (new)                                  |
| ----------- | ------------------- | ---------------------------------------------- |
| Framework   | Express.js          | Hono.js                                        |
| Runtime     | Node.js             | Cloudflare Workers                             |
| DB Driver   | Mongoose (ODM)      | MongoDB Native Driver                          |
| File Upload | Multer → Cloudinary | FormData → Cloudinary REST API                 |
| Env Vars    | `.env` + dotenv     | `.dev.vars` (local) + `wrangler secret` (prod) |
| Hosting     | Render / VPS        | Cloudflare (global edge)                       |

---

## ✅ Verification

After deploying, verify:

```bash
# Health check
curl https://antigravity-api.<your-account>.workers.dev/health

# Register a test user
curl -X POST https://antigravity-api.<your-account>.workers.dev/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"123456"}'
```

---

## 📝 Useful Commands

```bash
# View real-time logs
npx wrangler tail

# Deploy to a specific environment
npx wrangler deploy --env staging

# Delete the worker
npx wrangler delete
```
