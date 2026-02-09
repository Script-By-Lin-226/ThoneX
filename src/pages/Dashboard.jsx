import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { formatMoney, formatDateLabel, formatMonthLabel } from "../lib/format.js";
import { totalsByType, categoryTotals, trendSeries, monthlySeries, spendingByCategoryForMonth } from "../lib/derive.js";
import { monthKeyFromDate, lastNMonths, toISODate } from "../lib/date.js";

export default function Dashboard({ transactions, categories, settings, budgets = [] }) {
  const currency = settings.currency || "USD";
  const totals = useMemo(() => totalsByType(transactions), [transactions]);
  const net = totals.income - totals.expense;

  const today = toISODate();
  const currentMonth = monthKeyFromDate(today);
  const mtdTransactions = useMemo(
    () => transactions.filter((t) => t.date.startsWith(currentMonth)),
    [transactions, currentMonth]
  );
  const mtdTotals = totalsByType(mtdTransactions);
  const mtdNet = mtdTotals.income - mtdTotals.expense;

  const [rangeStart, setRangeStart] = useState(`${currentMonth}-01`);
  const [rangeEnd, setRangeEnd] = useState(today);

  const pieData = useMemo(
    () => categoryTotals(transactions, categories, { start: rangeStart, end: rangeEnd }),
    [transactions, categories, rangeStart, rangeEnd]
  );

  const trendData = useMemo(
    () => trendSeries(transactions, { start: rangeStart, end: rangeEnd }),
    [transactions, rangeStart, rangeEnd]
  );

  const months = useMemo(() => lastNMonths(6), []);
  const monthlyData = useMemo(() => monthlySeries(transactions, months), [transactions, months]);

  const budgetSummary = useMemo(() => {
    const monthBudgets = budgets.filter((b) => b.month === currentMonth);
    const spendingMap = spendingByCategoryForMonth(transactions, currentMonth);
    return monthBudgets
      .map((budget) => {
        const spent = spendingMap.get(budget.categoryId) || 0;
        return { ...budget, spent };
      })
      .filter((b) => b.spent > b.limit)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 3)
      .map((b) => {
        const category = categories.find((c) => c.id === b.categoryId);
        return {
          ...b,
          categoryName: category ? category.name : "Unknown",
          color: category ? category.color : "#6b7280"
        };
      });
  }, [budgets, transactions, currentMonth, categories]);

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-panel p-5 shadow-panel">
          <p className="mb-2 text-muted">Total Income</p>
          <h3 className="text-2xl font-semibold">{formatMoney(totals.income, currency)}</h3>
        </div>
        <div className="rounded-2xl border border-border bg-panel p-5 shadow-panel">
          <p className="mb-2 text-muted">Total Expenses</p>
          <h3 className="text-2xl font-semibold">{formatMoney(totals.expense, currency)}</h3>
        </div>
        <div className="rounded-2xl border border-border bg-panel p-5 shadow-panel">
          <p className="mb-2 text-muted">Net Balance</p>
          <h3 className="text-2xl font-semibold">{formatMoney(net, currency)}</h3>
        </div>
        <div className="rounded-2xl border border-border bg-panel p-5 shadow-panel">
          <p className="mb-2 text-muted">Month-to-Date</p>
          <h3 className="text-2xl font-semibold">{formatMoney(mtdNet, currency)}</h3>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-panel p-5 shadow-panel">
        <div>
          <h2 className="text-lg font-semibold">Chart Range</h2>
          <p className="text-muted">Adjust the date window for the pie and trend charts.</p>
        </div>
        <label className="grid gap-1 text-sm">
          Start
          <input
            type="date"
            value={rangeStart}
            onChange={(event) => setRangeStart(event.target.value)}
          />
        </label>
        <label className="grid gap-1 text-sm">
          End
          <input
            type="date"
            value={rangeEnd}
            onChange={(event) => setRangeEnd(event.target.value)}
          />
        </label>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-panel p-5 shadow-panel">
          <header className="mb-2 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Category Breakdown</h2>
            <span className="text-sm text-muted">{formatMonthLabel(currentMonth)}</span>
          </header>
          {pieData.length === 0 ? (
            <p className="text-muted">No expenses recorded for this period yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="total" nameKey="name" innerRadius={50} outerRadius={90}>
                  {pieData.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatMoney(value, currency)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-panel p-5 shadow-panel">
          <header className="mb-2 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Spending Trend</h2>
            <span className="text-sm text-muted">Selected range</span>
          </header>
          {trendData.length === 0 ? (
            <p className="text-muted">No expenses for this range.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDateLabel} />
                <YAxis tickFormatter={(value) => formatMoney(value, currency)} />
                <Tooltip formatter={(value) => formatMoney(value, currency)} labelFormatter={formatDateLabel} />
                <Area type="monotone" dataKey="amount" stroke="#2563eb" fill="url(#colorSpend)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-panel p-5 shadow-panel lg:col-span-2">
          <header className="mb-2 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Monthly Totals</h2>
            <span className="text-sm text-muted">Last 6 months</span>
          </header>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tickFormatter={formatMonthLabel} />
              <YAxis tickFormatter={(value) => formatMoney(value, currency)} />
              <Tooltip formatter={(value) => formatMoney(value, currency)} labelFormatter={formatMonthLabel} />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-panel p-5 shadow-panel">
        <header className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Budget Alerts</h2>
          <span className="text-sm text-muted">{formatMonthLabel(currentMonth)}</span>
        </header>
        {budgetSummary.length === 0 ? (
          <p className="text-muted">No budgets exceeded this month.</p>
        ) : (
          <div className="grid gap-3">
            {budgetSummary.map((item) => (
              <div key={item.categoryId} className="flex items-center justify-between rounded-xl bg-panel-muted px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="h-9 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <strong>{item.categoryName}</strong>
                    <p className="text-sm text-muted">
                      {formatMoney(item.spent, currency)} spent of {formatMoney(item.limit, currency)}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-danger">Over budget</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
