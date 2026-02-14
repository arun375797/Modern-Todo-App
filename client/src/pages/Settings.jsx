import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { Palette, Image, Sliders, Check } from "lucide-react";
import { motion } from "framer-motion";

const THEMES = [
  { id: "calm", name: "Calm", color: "bg-purple-100 border-purple-400" },
  { id: "green", name: "Green", color: "bg-emerald-100 border-emerald-400" },
  { id: "ocean", name: "Ocean", color: "bg-sky-100 border-sky-400" },
  {
    id: "dark",
    name: "Dark",
    color: "bg-slate-800 border-slate-600 text-white",
  },
];

const Settings = () => {
  const { user, updatePreferences, uploadBackground } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [overlay, setOverlay] = useState(
    user?.preferences?.overlay || { dim: 0, blur: 0 },
  );

  const handleThemeChange = (themeId) => {
    updatePreferences({ theme: themeId });
  };

  const handleOverlayCommit = (newOverlay) => {
    updatePreferences({ overlay: newOverlay });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    await uploadBackground(file);
    setUploading(false);
  };

  const handleRemoveBackground = () => {
    updatePreferences({ background: { type: "none", value: "" } });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 use-theme-colors">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {/* Theme Section */}
      <section className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Palette size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text">Appearance</h2>
            <p className="text-muted text-sm">
              Customize how MyTodo looks for you.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`relative h-24 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 flex items-center justify-center ${theme.color} ${user?.preferences?.theme === theme.id ? "ring-2 ring-primary ring-offset-2" : "border-transparent"}`}
            >
              {user?.preferences?.theme === theme.id && (
                <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                  <Check size={12} />
                </div>
              )}
              <span className="font-bold">{theme.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Font Section */}
      <section className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <span className="text-xl font-bold">Aa</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-text">Typography</h2>
            <p className="text-muted text-sm">
              Choose a font that suits your style.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {["Inter", "Roboto", "Lora", "Space Mono", "Comic Neue"].map(
            (font) => (
              <button
                key={font}
                onClick={() => updatePreferences({ font })}
                className={`p-3 rounded-xl border text-center transition-all ${user?.preferences?.font === font ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-muted"}`}
                style={{ fontFamily: font }}
              >
                {font}
              </button>
            ),
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-border pt-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-text mb-1">
              Global Text Color
            </label>
            <p className="text-xs text-muted">
              Override the theme's text color.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={user?.preferences?.textColor || "#000000"}
              onChange={(e) => updatePreferences({ textColor: e.target.value })}
              className="h-10 w-20 rounded cursor-pointer border border-border"
            />
            <button
              onClick={() => updatePreferences({ textColor: "" })}
              className="text-xs text-muted hover:text-red-500 underline"
            >
              Reset to Theme
            </button>
          </div>
        </div>
      </section>

      {/* Alarm Sound Section */}
      <section className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <span className="text-xl font-bold">🔔</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-text">Focus Alarm</h2>
            <p className="text-muted text-sm">
              Choose the sound that plays when your timer finishes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: "beep", name: "Beep" },
            { id: "bell", name: "Bell" },
            { id: "digital", name: "Digital" },
            { id: "none", name: "None" },
          ].map((sound) => (
            <button
              key={sound.id}
              onClick={() => {
                updatePreferences({ alarmSound: sound.id });
                // Preview sound
                if (sound.id !== "none") {
                  const audioMap = {
                    beep: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
                    bell: "https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg",
                    digital:
                      "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg",
                  };
                  new Audio(audioMap[sound.id]).play().catch(() => {});
                }
              }}
              className={`p-4 rounded-xl border text-center transition-all ${
                (user?.preferences?.alarmSound || "beep") === sound.id
                  ? "border-primary bg-primary/5 text-primary font-bold ring-1 ring-primary"
                  : "border-border hover:border-muted hover:bg-muted/5"
              }`}
            >
              {sound.name}
            </button>
          ))}
        </div>
      </section>

      {/* Background Section */}
      <section className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Image size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text">Background</h2>
            <p className="text-muted text-sm">
              Set a calming background image.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <label className="flex-1 cursor-pointer">
              <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-muted hover:text-primary hover:border-primary transition-colors bg-bg/50 hover:bg-bg h-48">
                {uploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                ) : (
                  <Image size={32} className="mb-2" />
                )}
                <span className="font-medium">Upload Image</span>
                <span className="text-xs mt-1">JPG, PNG up to 2MB</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </div>
            </label>

            {user?.preferences?.background?.value && (
              <div className="flex-1 relative rounded-xl overflow-hidden border border-border h-48 group">
                <img
                  src={
                    user.preferences.background.value?.startsWith("http")
                      ? user.preferences.background.value
                      : `${import.meta.env.VITE_API_URL || ""}/${user.preferences.background.value}`
                  }
                  alt="Current background"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={handleRemoveBackground}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleRemoveBackground}
              disabled={user?.preferences?.background?.type === "none"}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                user?.preferences?.background?.type === "none"
                  ? "bg-muted/20 text-muted cursor-not-allowed"
                  : "bg-red-100 text-red-600 hover:bg-red-200"
              }`}
            >
              <Image size={16} />
              Reset Background to Default
            </button>
          </div>

          {/* Overlay Settings */}
          <div className="bg-bg/50 p-4 rounded-xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sliders size={18} className="text-muted" />
              <h4 className="font-bold text-text">Overlay & Blur</h4>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted">Dim/Darken</span>
                <span className="text-text font-mono">{overlay.dim}</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.1"
                value={overlay.dim}
                onChange={(e) =>
                  setOverlay({ ...overlay, dim: Number(e.target.value) })
                }
                onMouseUp={() => handleOverlayCommit(overlay)}
                onTouchEnd={() => handleOverlayCommit(overlay)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted">Blur</span>
                <span className="text-text font-mono">{overlay.blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={overlay.blur}
                onChange={(e) =>
                  setOverlay({ ...overlay, blur: Number(e.target.value) })
                }
                onMouseUp={() => handleOverlayCommit(overlay)}
                onTouchEnd={() => handleOverlayCommit(overlay)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
