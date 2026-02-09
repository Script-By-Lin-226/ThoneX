import { useMemo, useState } from "react";
import { formatMoney } from "../lib/format.js";
import { monthKeyFromDate, toISODate } from "../lib/date.js";
import { spendingByCategoryForMonth } from "../lib/derive.js";
import { parseMoneyInput } from "../lib/format.js";

export default function Budgets({ transactions, categories, budgets, settings, onSetBudget }) {
  const currency = settings.currency || "MMK";
  const [month, setMonth] = useState(monthKeyFromDate(toISODate()));

  const budgetMap = useMemo(() => {
    const map = new Map();
    budgets.forEach((b) => {
      if (b.month === month) map.set(b.categoryId, b);
    });
    return map;
  }, [budgets, month]);

  const spendingMap = useMemo(
    () => spendingByCategoryForMonth(transactions, month),
    [transactions, month]
  );

  const handleLimitChange = (categoryId, input) => {
    const limit = parseMoneyInput(input);
    if (!limit) {
      onSetBudget({ month, categoryId, limit: null });
      return;
    }
    onSetBudget({ month, categoryId, limit });
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-panel p-5 shadow-panel">
        <div>
          <h2 className="text-lg font-semibold">Monthly Budgets</h2>
          <p className="text-muted">Set monthly limits per category and track progress.</p>
        </div>
        <label className="grid gap-1 text-sm">
          Month
          <input
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          />
        </label>
      </section>

      <section className="rounded-2xl border border-border bg-panel p-5 shadow-panel">
        <h3 className="mb-3 text-lg font-semibold">Budget Editor</h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((cat) => {
            const budget = budgetMap.get(cat.id);
            return (
              <label key={cat.id} className="flex items-center justify-between gap-2 rounded-xl bg-panel-muted px-3 py-2">
                <span>
                  {cat.icon ? `${cat.icon} ` : ""}{cat.name}
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  step="1"
                  key={`${month}-${cat.id}`}
                  defaultValue={budget ? String(budget.limit) : ""}
                  onBlur={(event) => handleLimitChange(cat.id, event.target.value)}
                  placeholder="0"
                  className="max-w-[120px]"
                />
              </label>
            );
          })}
        </div>
        <p className="mt-2 text-sm text-muted">Leave empty to remove a budget.</p>
      </section>

      <section className="rounded-2xl border border-border bg-panel p-5 shadow-panel">
        <h3 className="mb-3 text-lg font-semibold">Progress</h3>
        <div className="grid gap-3">
          {categories.map((cat) => {
            const budget = budgetMap.get(cat.id);
            if (!budget) return null;
            const spent = spendingMap.get(cat.id) || 0;
            const percent = budget.limit > 0 ? Math.min(100, Math.round((spent / budget.limit) * 100)) : 0;
            const over = spent > budget.limit;
            return (
              <div key={cat.id} className="grid gap-2 rounded-xl bg-panel-muted px-4 py-3">
                <div>
                  <strong>{cat.name}</strong>
                  <p className="text-sm text-muted">
                    {formatMoney(spent, currency)} of {formatMoney(budget.limit, currency)}
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-panel">
                  <span
                    className={over ? "block h-full bg-danger" : "block h-full bg-accent"}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                {over ? <span className="text-sm font-semibold text-danger">Over budget</span> : null}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
