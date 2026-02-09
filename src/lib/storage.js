export function safeLocalStorage() {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage;
  } catch {
    return null;
  }
}

export function readJSON(key, fallback) {
  const storage = safeLocalStorage();
  if (!storage) {
    return { ok: false, value: fallback, error: new Error("localStorage unavailable") };
  }
  try {
    const raw = storage.getItem(key);
    if (raw === null) {
      return { ok: true, value: fallback, missing: true };
    }
    return { ok: true, value: JSON.parse(raw), missing: false };
  } catch (error) {
    return { ok: false, value: fallback, error };
  }
}

export function writeJSON(key, value) {
  const storage = safeLocalStorage();
  if (!storage) {
    return { ok: false, error: new Error("localStorage unavailable") };
  }
  try {
    storage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}
