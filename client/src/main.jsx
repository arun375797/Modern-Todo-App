import React from "react";
import ReactDOM from "react-dom/client";
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
      console.log("Early theme initialization:", theme);
      document.documentElement.setAttribute("data-theme", theme);
    }
  }
} catch (error) {
  console.error("Error applying early theme:", error);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Toaster position="bottom-right" />
  </React.StrictMode>,
);
