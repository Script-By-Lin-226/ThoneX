import { useState } from "react";

const EMOJI_OPTIONS = [
  "📦",
  "🍔",
  "🚌",
  "🛒",
  "🏠",
  "🎬",
  "🩺",
  "💼",
  "🧰",
  "☕",
  "🍜",
  "🍩",
  "🥦",
  "🚗",
  "⛽",
  "🧾",
  "🧹",
  "🧴",
  "🎮",
  "🎧",
  "📚",
  "✈️",
  "🏖️",
  "🎁",
  "💳",
  "🏥",
  "🐶",
  "🧒",
  "👪",
  "🧑‍💻",
  "🎓",
  "🏋️",
  "🧘",
  "🪙",
  "📈",
  "🧪",
  "🛠️"
];

export default function Settings({
  categories,
  settings,
  exportPayload,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onUpdateSettings,
  onImport,
  onReset
}) {
  const [newCategory, setNewCategory] = useState({ name: "", color: "#4f46e5", icon: "" });

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "expense-tracker-backup.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        onImport(parsed);
      } catch {
        onImport(null);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-panel p-5 shadow-panel">
        <h2 className="mb-4 text-lg font-semibold">Categories</h2>
        <div className="grid gap-3">
          {categories.map((cat) => (
            <div key={cat.id} className="grid items-center gap-2 md:grid-cols-[2fr_0.6fr_1fr_auto]">
              <input
                type="text"
                value={cat.name}
                onChange={(event) => onUpdateCategory(cat.id, { name: event.target.value })}
                aria-label="Category name"
              />
              <input
                type="color"
                value={cat.color}
                onChange={(event) => onUpdateCategory(cat.id, { color: event.target.value })}
                aria-label="Category color"
              />
              <select
                value={cat.icon || ""}
                onChange={(event) => onUpdateCategory(cat.id, { icon: event.target.value })}
                aria-label="Category icon"
              >
                <option value="">No icon</option>
                {EMOJI_OPTIONS.map((emoji) => (
                  <option key={emoji} value={emoji}>
                    {emoji}
                  </option>
                ))}
              </select>
              <button
                onClick={() => onDeleteCategory(cat.id)}
                className="rounded-xl border border-danger bg-panel px-3 py-2 text-danger"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 grid items-center gap-2 md:grid-cols-[2fr_0.6fr_1fr_auto]">
          <input
            type="text"
            placeholder="Category name"
            value={newCategory.name}
            onChange={(event) => setNewCategory((prev) => ({ ...prev, name: event.target.value }))}
          />
          <input
            type="color"
            value={newCategory.color}
            onChange={(event) => setNewCategory((prev) => ({ ...prev, color: event.target.value }))}
          />
          <select
            value={newCategory.icon}
            onChange={(event) => setNewCategory((prev) => ({ ...prev, icon: event.target.value }))}
          >
            <option value="">No icon</option>
            {EMOJI_OPTIONS.map((emoji) => (
              <option key={emoji} value={emoji}>
                {emoji}
              </option>
            ))}
          </select>
          <button
            className="rounded-xl bg-accent px-4 py-2 text-white"
            onClick={() => {
              if (!newCategory.name.trim()) return;
              onAddCategory({
                name: newCategory.name.trim(),
                color: newCategory.color,
                icon: newCategory.icon
              });
              setNewCategory({ name: "", color: "#4f46e5", icon: "" });
            }}
          >
            Add
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-panel p-5 shadow-panel">
        <h2 className="mb-4 text-lg font-semibold">Settings</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-1 text-sm">
            Currency
            <input
              type="text"
              value={settings.currency}
              onChange={(event) => onUpdateSettings({ currency: event.target.value.toUpperCase() })}
            />
          </label>
          <label className="grid gap-1 text-sm">
            Start of week
            <select
              value={settings.startOfWeek}
              onChange={(event) => onUpdateSettings({ startOfWeek: event.target.value })}
            >
              <option value="monday">Monday</option>
              <option value="sunday">Sunday</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Theme
            <select
              value={settings.theme}
              onChange={(event) => onUpdateSettings({ theme: event.target.value })}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Date format
            <input type="text" value={settings.dateFormat} readOnly />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-panel p-5 shadow-panel">
        <h2 className="mb-3 text-lg font-semibold">Import / Export</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={handleExport} className="rounded-xl bg-accent px-4 py-2 text-white">
            Export JSON
          </button>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border px-4 py-2">
            Import JSON
            <input type="file" accept="application/json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-danger bg-panel p-5 shadow-panel">
        <h2 className="mb-2 text-lg font-semibold">Danger Zone</h2>
        <p className="text-sm text-muted">This will clear all transactions, categories, budgets, and settings.</p>
        <button
          className="mt-3 rounded-xl border border-danger bg-panel px-4 py-2 text-danger"
          onClick={() => {
            if (confirm("Reset all data? This cannot be undone.")) {
              onReset();
            }
          }}
        >
          Reset All Data
        </button>
      </section>
    </div>
  );
}
