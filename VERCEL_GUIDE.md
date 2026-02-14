# How to Deploy Frontend on Vercel (From Scratch)

Since you are starting fresh, follow these exact steps to ensure everything works perfectly.

## Step 1: Push Your Latest Code

Make sure your latest code (including the `vercel.json` and config fixes) is pushed to GitHub.

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push
```

## Step 2: Import Project in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** -> **"Project"**
3. Find your repository and click **"Import"**

## Step 3: Configure Project (CRITICAL STEP)

**Before clicking Deploy**, you MUST configure these settings:

### 1. Framework Preset

- Select **Vite** (it should auto-detect this)

### 2. Root Directory (Very Important!)

- Click **Edit** next to "Root Directory"
- Select the `client` folder
- This tells Vercel your frontend code is inside `client/`, not at the root.

### 3. Build and Output Settings (Auto-configured if Root Directory is set)

- If you set Root Directory to `client`, these should auto-fill correctly:
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`

### 4. Environment Variables

- Expand **Environment Variables** section
- Add the following variable:
  - **Key:** `VITE_API_URL`
  - **Value:** `https://modern-todo-app-o2cu.onrender.com`
    _(Note: Do NOT add `/api/v1` at the end - the code adds it automatically)_

## Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete.
3. If successful, you will see a preview of your app!

## Step 5: Final Verification

1. Open your new Vercel URL (e.g., `https://todo-alpha-topaz.vercel.app`)
2. Open the browser console (F12)
3. Refresh the page
4. Look for the log message:
   `🔗 API Base URL: https://modern-todo-app-o2cu.onrender.com/api/v1`

If you see this, and the login page loads without errors, you are DONE! 🚀
