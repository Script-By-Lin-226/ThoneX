import { monthKeyFromDate, lastNMonths, withinDateRange } from "./date.js";

export function totalsByType(transactions) {
  return transactions.reduce(
    (acc, txn) => {
      const amount = Number(txn.amount) || 0;
      if (txn.type === "income") acc.income += amount;
      if (txn.type === "expense") acc.expense += amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );
}

export function categoryTotals(transactions, categories, { start, end } = {}) {
  const byId = new Map();
  categories.forEach((cat) => {
    byId.set(cat.id, { id: cat.id, name: cat.name, color: cat.color, icon: cat.icon, total: 0 });
  });

  transactions.forEach((txn) => {
    if (txn.type !== "expense") return;
    if (!withinDateRange(txn.date, start, end)) return;
    const amount = Number(txn.amount) || 0;
    const entry = byId.get(txn.categoryId);
    if (entry) entry.total += amount;
  });

  return Array.from(byId.values()).filter((entry) => entry.total > 0);
}

export function trendSeries(transactions, { start, end } = {}) {
  const totals = new Map();
  transactions.forEach((txn) => {
    if (txn.type !== "expense") return;
    if (!withinDateRange(txn.date, start, end)) return;
    const amount = Number(txn.amount) || 0;
    const current = totals.get(txn.date) || 0;
    totals.set(txn.date, current + amount);
  });
  return Array.from(totals.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, amount]) => ({ date, amount }));
}

export function monthlySeries(transactions, months = lastNMonths(6)) {
  const map = new Map(months.map((m) => [m, { month: m, income: 0, expense: 0 }]));
  transactions.forEach((txn) => {
    const month = monthKeyFromDate(txn.date);
    if (!map.has(month)) return;
    const entry = map.get(month);
    const amount = Number(txn.amount) || 0;
    if (txn.type === "income") entry.income += amount;
    if (txn.type === "expense") entry.expense += amount;
  });
  return months.map((m) => map.get(m));
}

export function budgetsForMonth(budgets, monthKey) {
  return budgets.filter((b) => b.month === monthKey);
}

export function spendingByCategoryForMonth(transactions, monthKey) {
  const map = new Map();
  transactions.forEach((txn) => {
    if (txn.type !== "expense") return;
    if (monthKeyFromDate(txn.date) !== monthKey) return;
    const amount = Number(txn.amount) || 0;
    const current = map.get(txn.categoryId) || 0;
    map.set(txn.categoryId, current + amount);
  });
  return map;
}
