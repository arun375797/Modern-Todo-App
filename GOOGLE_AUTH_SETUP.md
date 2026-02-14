# 🔐 Google Authentication Setup

I have updated your application to use **Google Sign-In only**. The traditional email/password login has been removed as requested.

## 1. Get a Google Client ID

To make the login button work, you need a Google Client ID:

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project (or select an existing one).
3.  Navigate to **APIs & Services** > **Credentials**.
4.  Click **Create Credentials** > **OAuth client ID**.
5.  Select **Web application**.
6.  Add the following **Authorized JavaScript origins**:
    - `http://localhost:5173` (or `http://localhost:3000` if you use port 3000)
    - `https://your-vercel-app.vercel.app` (Your production Vercel URL)
    - **IMPORTANT**: Add the exact URL where your app is running (check browser address bar)
    - For Vercel deployments, add both the preview URL and production URL
7.  Copy the **Client ID**.

### ⚠️ Troubleshooting: "The given origin is not allowed for the given client ID"

If you see this error in the browser console:
1. Check the exact URL in your browser's address bar (e.g., `https://your-app.vercel.app`)
2. Go to Google Cloud Console > APIs & Services > Credentials
3. Click on your OAuth 2.0 Client ID
4. Under "Authorized JavaScript origins", add the exact origin (without trailing slash):
   - For localhost: `http://localhost:5173` (or your port)
   - For Vercel: `https://your-app.vercel.app` (and any preview URLs)
   - **Note**: Origins must match exactly (including http vs https, port numbers, etc.)
5. Click "Save"
6. Wait 1-2 minutes for changes to propagate
7. Refresh your app and try again

## 2. Update Client Code

Open `client/src/main.jsx` and replace the placeholder with your Client ID:

```javascript
// client/src/main.jsx
const GOOGLE_CLIENT_ID = "YOUR_PASTED_CLIENT_ID_HERE";
```

## 3. Connect Frontend to new Backend

Your backend is already deployed to Cloudflare Workers! 🚀

Update your local `client/.env` file:

```bash
VITE_API_URL=https://antigravity-api.arun375797.workers.dev
```

And ensuring your Vercel project has the same Environment Variable.

## 4. Run Locally

```bash
cd client
npm install
npm run dev
```

## 5. Deploy Frontend

Push your code to GitHub/GitLab and connect it to Vercel.
Ensure you add the `VITE_API_URL` environment variable in Vercel settings.
