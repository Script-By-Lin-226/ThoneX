export function formatMoney(amountValue, currency = "MMK") {
  const amount = Number.isFinite(amountValue) ? amountValue : 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `${Math.round(amount)} ${currency}`;
  }
}

export function parseMoneyInput(value) {
  if (value === "") return null;
  const normalized = value.replace(/[^0-9-]/g, "");
  if (!normalized || normalized === "-") return null;
  const number = Number(normalized);
  if (!Number.isFinite(number)) return null;
  const amount = Math.round(number);
  if (amount <= 0) return null;
  return amount;
}

export function formatDateLabel(isoDate) {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString();
}

export function formatMonthLabel(monthKey) {
  if (!monthKey) return "";
  const [y, m] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(y, (m || 1) - 1, 1));
  return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}
