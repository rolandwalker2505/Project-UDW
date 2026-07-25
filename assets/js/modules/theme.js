import {
  loadTheme,
  saveTheme,
} from "./storage.js";

// Các giá trị theme duy nhất được ứng dụng hỗ trợ.
const LIGHT_THEME = "light";
const DARK_THEME = "dark";

function normalizeTheme(theme) {
  return theme === DARK_THEME
    ? DARK_THEME
    : LIGHT_THEME;
}

// Dùng nút có sẵn hoặc tạo nút nổi cho những trang chưa khai báo nút theme.
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

// Cập nhật biểu tượng và thuộc tính hỗ trợ accessibility của nút theme.
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

// Áp dụng theme lên thẻ html để CSS chọn đúng bộ màu.
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

// Khởi tạo theme đã lưu và xử lý thao tác chuyển sáng/tối.
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
