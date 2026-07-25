// Module đọc và ghi trạng thái chung của ứng dụng vào localStorage.
const KEY = "findagain-state";

// Đọc dữ liệu đã lưu và tự phục hồi khi JSON không hợp lệ.
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

// Chỉ chấp nhận hai giao diện hợp lệ, mặc định là light.
function normalizeTheme(theme) {
  return theme === "dark" ? "dark" : "light";
}

// Ghép trạng thái đã lưu với cấu hình mặc định để tương thích dữ liệu cũ.
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

// Lưu toàn bộ trạng thái ứng dụng sau mỗi lần cập nhật.
export function saveState(state) {
  localStorage.setItem(
    KEY,
    JSON.stringify(state),
  );
}

// Hai hàm riêng cho theme giúp các trang không cần tải toàn bộ state.
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
