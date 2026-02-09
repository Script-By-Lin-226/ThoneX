export const DEFAULT_CATEGORIES = [
  { id: "cat_uncategorized", name: "Uncategorized", color: "#6b7280", icon: "📦" },
  { id: "cat_food", name: "Food & Dining", color: "#ef4444", icon: "🍔" },
  { id: "cat_transport", name: "Transport", color: "#f59e0b", icon: "🚌" },
  { id: "cat_groceries", name: "Groceries", color: "#10b981", icon: "🛒" },
  { id: "cat_rent", name: "Rent & Utilities", color: "#3b82f6", icon: "🏠" },
  { id: "cat_entertainment", name: "Entertainment", color: "#8b5cf6", icon: "🎬" },
  { id: "cat_health", name: "Health", color: "#ec4899", icon: "🩺" },
  { id: "cat_salary", name: "Salary", color: "#22c55e", icon: "💼" },
  { id: "cat_freelance", name: "Freelance", color: "#14b8a6", icon: "🧰" }
];

export const DEFAULT_SETTINGS = {
  currency: "MMK",
  startOfWeek: "monday",
  dateFormat: "yyyy-mm-dd",
  theme: "light",
  dataVersion: 2
};

export function seedData() {
  return {
    transactions: [],
    categories: DEFAULT_CATEGORIES,
    budgets: [],
    settings: DEFAULT_SETTINGS
  };
}
