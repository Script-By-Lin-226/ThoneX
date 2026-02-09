import { useMemo, useState } from "react";
import { parseMoneyInput, formatMoney, formatDateLabel } from "../lib/format.js";
import { withinDateRange } from "../lib/date.js";

const sorters = {
  date_desc: (a, b) => (a.date < b.date ? 1 : -1),
  date_asc: (a, b) => (a.date > b.date ? 1 : -1),
  amount_desc: (a, b) => b.amount - a.amount,
  amount_asc: (a, b) => a.amount - b.amount,
  category_asc: (a, b) => (a.categoryId > b.categoryId ? 1 : -1)
};

export default function Transactions({
  transactions,
  categories,
  settings,
  today,
  onAdd,
  onUpdate,
  onDelete
}) {
  const currency = settings.currency || "MMK";
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    type: "expense",
    amountInput: "",
    categoryId: categories[0]?.id || "",
    date: today,
    note: ""
  });

  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    categoryId: "all",
    start: "",
    end: "",
    min: "",
    max: "",
    sort: "date_desc"
  });

  const resetForm = () => {
    setForm({
      type: "expense",
      amountInput: "",
      categoryId: categories[0]?.id || "",
      date: today,
      note: ""
    });
    setEditingId(null);
  };

  const startEdit = (txn) => {
    setEditingId(txn.id);
    setForm({
      type: txn.type,
      amountInput: String(txn.amount),
      categoryId: txn.categoryId,
      date: txn.date,
      note: txn.note
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const amount = parseMoneyInput(form.amountInput);
    if (!amount) return;
    if (!form.date || !form.categoryId || !form.type) return;

    if (editingId) {
      onUpdate(editingId, { ...form, amount });
    } else {
      onAdd({ ...form, amount });
    }
    resetForm();
  };

  const filtered = useMemo(() => {
    const min = parseMoneyInput(filters.min) || null;
    const max = parseMoneyInput(filters.max) || null;

    return transactions
      .filter((txn) => {
        if (filters.type !== "all" && txn.type !== filters.type) return false;
        if (filters.categoryId !== "all" && txn.categoryId !== filters.categoryId) return false;
        if (!withinDateRange(txn.date, filters.start || null, filters.end || null)) return false;
        if (min !== null && txn.amount < min) return false;
        if (max !== null && txn.amount > max) return false;
        if (filters.search) {
          const haystack = `${txn.note}`.toLowerCase();
          if (!haystack.includes(filters.search.toLowerCase())) return false;
        }
        return true;
      })
      .sort(sorters[filters.sort] || sorters.date_desc);
  }, [transactions, filters]);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-panel p-5 shadow-panel">
        <header className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">{editingId ? "Edit Transaction" : "Add Transaction"}</h2>
          {editingId ? (
            <button className="rounded-full border border-border px-3 py-1" onClick={resetForm} type="button">
              Cancel edit
            </button>
          ) : null}
        </header>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="grid gap-1 text-sm">
            Type
            <select
              value={form.type}
              onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
              required
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Amount (MMK)
            <input
              type="number"
              inputMode="numeric"
              step="1"
              placeholder="0"
              value={form.amountInput}
              onChange={(event) => setForm((prev) => ({ ...prev, amountInput: event.target.value }))}
              required
            />
          </label>
          <label className="grid gap-1 text-sm">
            Category
            <select
              value={form.categoryId}
              onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon ? `${cat.icon} ` : ""}{cat.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Date
            <input
              type="date"
              value={form.date}
              onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
              required
            />
          </label>
          <label className="grid gap-1 text-sm md:col-span-2 xl:col-span-2">
            Note
            <input
              type="text"
              value={form.note}
              onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
            />
          </label>
          <button className="rounded-xl bg-accent px-4 py-2 text-white" type="submit">
            {editingId ? "Save Changes" : "Add Transaction"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-panel p-5 shadow-panel">
        <header className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            className="rounded-full border border-border px-3 py-1"
            onClick={() => setFilters({
              search: "",
              type: "all",
              categoryId: "all",
              start: "",
              end: "",
              min: "",
              max: "",
              sort: "date_desc"
            })}
            type="button"
          >
            Reset filters
          </button>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-1 text-sm">
            Search notes
            <input
              type="search"
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            />
          </label>
          <label className="grid gap-1 text-sm">
            Type
            <select
              value={filters.type}
              onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
            >
              <option value="all">All</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Category
            <select
              value={filters.categoryId}
              onChange={(event) => setFilters((prev) => ({ ...prev, categoryId: event.target.value }))}
            >
              <option value="all">All</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Date start
            <input
              type="date"
              value={filters.start}
              onChange={(event) => setFilters((prev) => ({ ...prev, start: event.target.value }))}
            />
          </label>
          <label className="grid gap-1 text-sm">
            Date end
            <input
              type="date"
              value={filters.end}
              onChange={(event) => setFilters((prev) => ({ ...prev, end: event.target.value }))}
            />
          </label>
          <label className="grid gap-1 text-sm">
            Min amount (MMK)
            <input
              type="number"
              inputMode="numeric"
              step="1"
              value={filters.min}
              onChange={(event) => setFilters((prev) => ({ ...prev, min: event.target.value }))}
            />
          </label>
          <label className="grid gap-1 text-sm">
            Max amount (MMK)
            <input
              type="number"
              inputMode="numeric"
              step="1"
              value={filters.max}
              onChange={(event) => setFilters((prev) => ({ ...prev, max: event.target.value }))}
            />
          </label>
          <label className="grid gap-1 text-sm">
            Sort
            <select
              value={filters.sort}
              onChange={(event) => setFilters((prev) => ({ ...prev, sort: event.target.value }))}
            >
              <option value="date_desc">Date (newest)</option>
              <option value="date_asc">Date (oldest)</option>
              <option value="amount_desc">Amount (high to low)</option>
              <option value="amount_asc">Amount (low to high)</option>
              <option value="category_asc">Category (A-Z)</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-panel p-5 shadow-panel">
        <header className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Transactions</h2>
          <p className="text-sm text-muted">{filtered.length} record(s)</p>
        </header>
        {filtered.length === 0 ? (
          <p className="text-muted">No transactions match your filters.</p>
        ) : (
          <div className="grid gap-2">
            <div className="hidden grid-cols-[1fr_0.8fr_1.2fr_2fr_1fr_1fr] gap-3 border-b-2 border-border pb-2 text-sm font-semibold text-muted md:grid">
              <span>Date</span>
              <span>Type</span>
              <span>Category</span>
              <span>Note</span>
              <span>Amount</span>
              <span>Actions</span>
            </div>
            {filtered.map((txn) => (
              <div
                className="grid gap-3 border-b border-border py-2 text-sm md:grid-cols-[1fr_0.8fr_1.2fr_2fr_1fr_1fr] md:items-center"
                key={txn.id}
              >
                <span>{formatDateLabel(txn.date)}</span>
                <span className={txn.type === "income" ? "font-semibold text-success" : "font-semibold text-danger"}>
                  {txn.type}
                </span>
                <span>
                  {categories.find((c) => c.id === txn.categoryId)?.name || "Unknown"}
                </span>
                <span className="text-muted">{txn.note || "—"}</span>
                <span>{formatMoney(txn.amount, currency)}</span>
                <span className="flex flex-wrap gap-2">
                  <button onClick={() => startEdit(txn)} className="rounded-full border border-border px-3 py-1">
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(txn.id)}
                    className="rounded-full border border-danger bg-panel px-3 py-1 text-danger"
                  >
                    Delete
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
