import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import "./index.css";
import { Toaster } from "react-hot-toast";

// Apply theme immediately from localStorage before React renders
try {
  const authStorage = localStorage.getItem("auth-storage");
  if (authStorage) {
    const parsed = JSON.parse(authStorage);
    const theme = parsed?.state?.user?.preferences?.theme;
    if (theme) {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }
} catch (error) {
  console.error("Error applying early theme:", error);
}

// Replace with your actual Google Client ID
const GOOGLE_CLIENT_ID = "836758394002-m92kpjnrkfl5e95c1b00bugqvegoql7c.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
      <Toaster position="bottom-right" />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
