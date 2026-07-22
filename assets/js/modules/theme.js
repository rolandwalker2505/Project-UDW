import {
  loadTheme,
  saveTheme,
} from "./storage.js";

const LIGHT_THEME = "light";
const DARK_THEME = "dark";

function normalizeTheme(theme) {
  return theme === DARK_THEME
    ? DARK_THEME
    : LIGHT_THEME;
}

function getThemeToggle() {
  const existingToggle =
    document.querySelector("#themeToggle");

  if (existingToggle) {
    return existingToggle;
  }

  const themeToggle =
    document.createElement("button");

  themeToggle.id = "themeToggle";
  themeToggle.className = "theme-toggle";
  themeToggle.type = "button";

  document.body.append(themeToggle);

  return themeToggle;
}

function updateThemeToggle(themeToggle, theme) {
  const darkModeEnabled =
    theme === DARK_THEME;

  themeToggle.textContent =
    darkModeEnabled ? "☀" : "☾";

  themeToggle.setAttribute(
    "aria-label",
    darkModeEnabled
      ? "Chuyển sang giao diện sáng"
      : "Chuyển sang giao diện tối",
  );

  themeToggle.setAttribute(
    "aria-pressed",
    String(darkModeEnabled),
  );
}

function applyTheme(theme, themeToggle) {
  const normalizedTheme =
    normalizeTheme(theme);

  document.documentElement.dataset.theme =
    normalizedTheme;

  updateThemeToggle(
    themeToggle,
    normalizedTheme,
  );

  return normalizedTheme;
}

export function initializeTheme() {
  const themeToggle = getThemeToggle();

  let currentTheme = applyTheme(
    loadTheme(),
    themeToggle,
  );

  themeToggle.addEventListener("click", () => {
    const nextTheme =
      currentTheme === DARK_THEME
        ? LIGHT_THEME
        : DARK_THEME;

    currentTheme = applyTheme(
      nextTheme,
      themeToggle,
    );

    saveTheme(currentTheme);
  });
}
