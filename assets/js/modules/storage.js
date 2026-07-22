const KEY = "findagain-state";
export function loadState(fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "null");
    if (value && Array.isArray(value.posts) && (value.theme === "light" || value.theme === "dark"))
      return value;
  } catch {}
  return structuredClone(fallback);
}
export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state)); }
