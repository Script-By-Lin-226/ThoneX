export function toISODate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function toISODateTime(date = new Date()) {
  return date.toISOString();
}

export function monthKeyFromDate(isoDate) {
  if (!isoDate) return "";
  return isoDate.slice(0, 7);
}

export function startOfMonth(monthKey) {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(y, (m || 1) - 1, 1);
}

export function endOfMonth(monthKey) {
  const start = startOfMonth(monthKey);
  return new Date(start.getFullYear(), start.getMonth() + 1, 0);
}

export function addMonths(monthKey, delta) {
  const start = startOfMonth(monthKey);
  start.setMonth(start.getMonth() + delta);
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
}

export function lastNMonths(n = 6, fromDate = new Date()) {
  const base = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, "0")}`;
  const months = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    months.push(addMonths(base, -i));
  }
  return months;
}

export function withinDateRange(isoDate, start, end) {
  if (!isoDate) return false;
  if (start && isoDate < start) return false;
  if (end && isoDate > end) return false;
  return true;
}
