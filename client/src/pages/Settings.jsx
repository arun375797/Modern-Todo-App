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

  const handleThemeChange = (themeId) => {
    updatePreferences({ theme: themeId });
  };

  const handleOverlayChange = (key, value) => {
    const newOverlay = { ...user.preferences.overlay, [key]: Number(value) };
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
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <h1 className="text-3xl font-bold text-text mb-8">Settings</h1>

      {/* Theme Section */}
      <section className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Palette size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text">Appearance</h2>
            <p className="text-muted text-sm">
              Customize how Antigravity looks for you.
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

            {user?.preferences?.background?.type === "upload" && (
              <div className="flex-1 relative rounded-xl overflow-hidden border border-border h-48 group">
                <img
                  src={user.preferences.background.value}
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

          {/* Overlay Settings */}
          <div className="bg-bg/50 p-4 rounded-xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sliders size={18} className="text-muted" />
              <h4 className="font-bold text-text">Overlay & Blur</h4>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted">Dim/Darken</span>
                <span className="text-text font-mono">
                  {user?.preferences?.overlay?.dim || 0}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.8"
                step="0.1"
                value={user?.preferences?.overlay?.dim || 0}
                onChange={(e) => handleOverlayChange("dim", e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted">Blur</span>
                <span className="text-text font-mono">
                  {user?.preferences?.overlay?.blur || 0}px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={user?.preferences?.overlay?.blur || 0}
                onChange={(e) => handleOverlayChange("blur", e.target.value)}
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
