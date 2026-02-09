import { useMemo, useState, useEffect, useRef } from "react";
import useLocalStorageState from "./hooks/useLocalStorageState.js";
import { seedData, DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from "./lib/seed.js";
import { uuid } from "./lib/uuid.js";
import { toISODate, toISODateTime } from "./lib/date.js";
import Dashboard from "./pages/Dashboard.jsx";
import Transactions from "./pages/Transactions.jsx";
import Budgets from "./pages/Budgets.jsx";
import Settings from "./pages/Settings.jsx";

const STORAGE_KEYS = {
  transactions: "et_transactions_v1",
  categories: "et_categories_v1",
  budgets: "et_budgets_v1",
  settings: "et_settings_v1"
};

const emptySeed = seedData();

export default function App() {
  const [transactions, setTransactions, transactionsError] = useLocalStorageState(
    STORAGE_KEYS.transactions,
    emptySeed.transactions
  );
  const [categories, setCategories, categoriesError] = useLocalStorageState(
    STORAGE_KEYS.categories,
    emptySeed.categories
  );
  const [budgets, setBudgets, budgetsError] = useLocalStorageState(
    STORAGE_KEYS.budgets,
    emptySeed.budgets
  );
  const [settings, setSettings, settingsError] = useLocalStorageState(
    STORAGE_KEYS.settings,
    emptySeed.settings
  );

  const [activeTab, setActiveTab] = useState("dashboard");
  const [banner, setBanner] = useState(null);
  const migrationPrompted = useRef(false);
  const migrationApplied = useRef(false);

  useEffect(() => {
    if (!settings?.theme) return;
    document.body.dataset.theme = settings.theme;
  }, [settings]);

  useEffect(() => {
    if (!settings?.dataVersion || migrationApplied.current) return;
    if (settings.dataVersion === 1) {
      migrationApplied.current = true;
      setTransactions((prev) =>
        prev.map((txn) => ({
          ...txn,
          amount: Math.round((txn.amount || 0) / 100)
        }))
      );
      setBudgets((prev) =>
        prev.map((budget) => ({
          ...budget,
          limit: Math.round((budget.limit || 0) / 100)
        }))
      );
      setSettings((prev) => ({ ...prev, dataVersion: 2, currency: "MMK" }));
      setBanner({ tone: "info", message: "Migrated amounts to MMK (no decimals)." });
    }
  }, [settings, setTransactions, setBudgets, setSettings]);

  useEffect(() => {
    if (!settings?.dataVersion || migrationPrompted.current) return;
    if (settings.dataVersion !== DEFAULT_SETTINGS.dataVersion) {
      migrationPrompted.current = true;
      const proceed = confirm(
        "Data version mismatch detected. Reset stored data to continue?"
      );
      if (proceed) {
        resetAllData();
      }
    }
  }, [settings]);

  useEffect(() => {
    const errors = [transactionsError, categoriesError, budgetsError, settingsError].filter(Boolean);
    if (errors.length > 0) {
      setBanner({
        tone: "warning",
        message: "We ran into a localStorage issue. Changes may not persist."
      });
    }
  }, [transactionsError, categoriesError, budgetsError, settingsError]);

  const addTransaction = (payload) => {
    const now = toISODateTime();
    const txn = {
      id: uuid(),
      type: payload.type,
      amount: payload.amount,
      categoryId: payload.categoryId,
      date: payload.date,
      note: payload.note || "",
      createdAt: now,
      updatedAt: now
    };
    setTransactions((prev) => [txn, ...prev]);
  };

  const updateTransaction = (id, updates) => {
    const now = toISODateTime();
    setTransactions((prev) =>
      prev.map((txn) =>
        txn.id === id
          ? {
              ...txn,
              ...updates,
              updatedAt: now
            }
          : txn
      )
    );
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((txn) => txn.id !== id));
  };

  const addCategory = (payload) => {
    const next = {
      id: uuid(),
      name: payload.name,
      color: payload.color,
      icon: payload.icon || ""
    };
    setCategories((prev) => [...prev, next]);
  };

  const updateCategory = (id, updates) => {
    setCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat)));
  };

  const deleteCategory = (id) => {
    if (id === "cat_uncategorized") {
      setBanner({ tone: "warning", message: "Uncategorized is required and cannot be deleted." });
      return false;
    }
    const used = transactions.some((txn) => txn.categoryId === id);
    if (used) {
      setBanner({
        tone: "warning",
        message: "This category is used by existing transactions. Remove those first."
      });
      return false;
    }
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    return true;
  };

  const setBudget = ({ month, categoryId, limit }) => {
    const now = toISODateTime();
    setBudgets((prev) => {
      const next = prev.filter((b) => !(b.month === month && b.categoryId === categoryId));
      if (limit && limit > 0) {
        next.push({ month, categoryId, limit, updatedAt: now });
      }
      return next;
    });
  };

  const updateSettings = (updates) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetAllData = () => {
    setTransactions([]);
    setCategories(DEFAULT_CATEGORIES);
    setBudgets([]);
    setSettings(DEFAULT_SETTINGS);
    setBanner({ tone: "info", message: "All data has been reset." });
  };

  const handleImport = (payload) => {
    if (!payload || typeof payload !== "object") {
      setBanner({ tone: "warning", message: "Import failed: invalid file format." });
      return false;
    }
    const nextTransactions = Array.isArray(payload.transactions) ? payload.transactions : null;
    const nextCategories = Array.isArray(payload.categories) ? payload.categories : null;
    const nextBudgets = Array.isArray(payload.budgets) ? payload.budgets : null;
    const nextSettings = payload.settings && typeof payload.settings === "object" ? payload.settings : null;

    if (!nextTransactions || !nextCategories || !nextBudgets || !nextSettings) {
      setBanner({ tone: "warning", message: "Import failed: missing required data." });
      return false;
    }

    setTransactions(nextTransactions);
    setCategories(nextCategories);
    setBudgets(nextBudgets);
    setSettings({ ...DEFAULT_SETTINGS, ...nextSettings });
    setBanner({ tone: "info", message: "Import completed successfully." });
    return true;
  };

  const exportPayload = useMemo(
    () => ({
      exportedAt: toISODateTime(),
      transactions,
      categories,
      budgets,
      settings
    }),
    [transactions, categories, budgets, settings]
  );

  const today = toISODate();

  const tabClass = (tab) =>
    `rounded-full border px-4 py-2 shadow-panel ${
      activeTab === tab ? "bg-accent text-white border-transparent" : "bg-panel text-text border-border"
    }`;

  const bannerTone = banner?.tone === "warning" ? "border-warning" : "border-accent";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="m-0 text-xs uppercase tracking-[0.2em] text-muted">Expense Tracker</p>
          <h1 className="m-0 text-3xl font-semibold tracking-tight md:text-4xl">ThoneX</h1>
        </div>
        <nav className="flex flex-wrap gap-3" aria-label="Primary">
          <button className={tabClass("dashboard")} onClick={() => setActiveTab("dashboard")}>
            Dashboard
          </button>
          <button className={tabClass("transactions")} onClick={() => setActiveTab("transactions")}>
            Transactions
          </button>
          <button className={tabClass("budgets")} onClick={() => setActiveTab("budgets")}>
            Budgets
          </button>
          <button className={tabClass("settings")} onClick={() => setActiveTab("settings")}>
            Categories & Settings
          </button>
        </nav>
      </header>

      {banner ? (
        <div
          className={`flex items-center justify-between gap-4 rounded-2xl border bg-panel px-4 py-3 shadow-panel ${bannerTone}`}
          role="status"
        >
          <span>{banner.message}</span>
          <button className="text-muted" aria-label="Dismiss" onClick={() => setBanner(null)}>
            Dismiss
          </button>
        </div>
      ) : null}

      <main className="flex flex-col gap-6">
        {activeTab === "dashboard" && (
          <Dashboard
            transactions={transactions}
            categories={categories}
            settings={settings}
            budgets={budgets}
          />
        )}
        {activeTab === "transactions" && (
          <Transactions
            transactions={transactions}
            categories={categories}
            settings={settings}
            today={today}
            onAdd={addTransaction}
            onUpdate={updateTransaction}
            onDelete={deleteTransaction}
          />
        )}
        {activeTab === "budgets" && (
          <Budgets
            transactions={transactions}
            categories={categories}
            budgets={budgets}
            settings={settings}
            onSetBudget={setBudget}
          />
        )}
        {activeTab === "settings" && (
          <Settings
            categories={categories}
            settings={settings}
            exportPayload={exportPayload}
            onAddCategory={addCategory}
            onUpdateCategory={updateCategory}
            onDeleteCategory={deleteCategory}
            onUpdateSettings={updateSettings}
            onImport={handleImport}
            onReset={resetAllData}
          />
        )}
      </main>
    </div>
  );
}
