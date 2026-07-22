const KEY = "findagain-state";

function readStoredState() {
  try {
    const value = JSON.parse(
      localStorage.getItem(KEY) || "null",
    );

    return value && typeof value === "object"
      ? value
      : null;
  } catch {
    return null;
  }
}

function normalizeTheme(theme) {
  return theme === "dark" ? "dark" : "light";
}

export function loadState(fallback) {
  const storedState = readStoredState();
  const defaultState = structuredClone(fallback);

  if (!storedState) {
    return defaultState;
  }

  return {
    ...defaultState,
    ...storedState,

    theme: normalizeTheme(storedState.theme),

    filters: {
      ...defaultState.filters,
      ...(storedState.filters || {}),
    },

    posts: Array.isArray(storedState.posts)
      ? storedState.posts
      : defaultState.posts,
  };
}

export function saveState(state) {
  localStorage.setItem(
    KEY,
    JSON.stringify(state),
  );
}

export function loadTheme() {
  return normalizeTheme(
    readStoredState()?.theme,
  );
}

export function saveTheme(theme) {
  const storedState = readStoredState() || {};

  localStorage.setItem(
    KEY,
    JSON.stringify({
      ...storedState,
      theme: normalizeTheme(theme),
    }),
  );
}
