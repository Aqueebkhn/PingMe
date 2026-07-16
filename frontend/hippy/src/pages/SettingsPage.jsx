import React from "react";
import { useThemeStore } from "../store/useThemeStore.js";
import { Send } from "lucide-react";

const THEMES = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "forest",
  "aqua",
  "luxury",
  "dracula",
  "coffee",
  "nord",
  "sunset",
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  const PREVIEW_MESSAGES = [
    { id: 1, text: "Hey! How is it going?", isSender: false },
    { id: 2, text: "Doing great! Just configuring some cool features.", isSender: true },
  ];

  return (
    <div className="min-h-screen container mx-auto px-4 pt-24 pb-12 max-w-5xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Theme</h2>
          <p className="text-sm text-base-content/60">Choose a color theme for your chat interface</p>
        </div>

        {/* Theme select grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {THEMES.map((t) => (
            <button
              key={t}
              className={`
                group flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all
                ${theme === t ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-base-300 hover:bg-base-200/50"}
              `}
              onClick={() => setTheme(t)}
            >
              <div className="relative h-8 w-full rounded-md overflow-hidden" data-theme={t}>
                <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                  <div className="rounded bg-primary"></div>
                  <div className="rounded bg-secondary"></div>
                  <div className="rounded bg-accent"></div>
                  <div className="rounded bg-neutral"></div>
                </div>
              </div>
              <span className="text-[11px] font-medium truncate w-full text-center">
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </span>
            </button>
          ))}
        </div>

        {/* Theme Preview Section */}
        <h3 className="text-lg font-semibold mt-4">Preview</h3>
        <div className="rounded-xl border border-base-300 overflow-hidden bg-base-100 shadow-lg">
          <div className="p-4 bg-base-200 border-b border-base-300 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content font-bold">
                J
              </div>
              <div>
                <p className="text-sm font-medium">Jane Doe</p>
                <p className="text-xs text-base-content/60">Online</p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4 min-h-[200px] bg-base-100">
            {PREVIEW_MESSAGES.map((msg) => (
              <div key={msg.id} className={`chat ${msg.isSender ? "chat-end" : "chat-start"}`}>
                <div className="chat-bubble p-3 rounded-2xl max-w-[80%]">
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-base-200 border-t border-base-300">
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                placeholder="This is a preview input..."
                className="input input-bordered input-sm flex-1"
              />
              <button className="btn btn-primary btn-sm btn-circle">
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
