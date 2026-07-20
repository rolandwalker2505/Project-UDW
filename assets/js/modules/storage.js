const STORAGE_KEY = "project-udw-state";
const THEME_KEY = "project-udw-theme";

export function loadState(fallbackState) {
  const rawState = localStorage.getItem(STORAGE_KEY);

  if (!rawState) {
    return structuredClone(fallbackState);
  }

  try {
    return JSON.parse(rawState);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return structuredClone(fallbackState);
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

export function loadTheme() {
  return localStorage.getItem(THEME_KEY) || "light";
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}
