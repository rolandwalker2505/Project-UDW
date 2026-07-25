import { saveState, loadState } from "./storage.js";

// Danh mục được tải từ file JSON khi ứng dụng khởi tạo.
export let categories = {};

// Trạng thái mặc định dùng cho lần truy cập đầu tiên.
const fallback = {
  currentUser: null,
  theme: "light",
  mode: "lost",
  filters: {
    keyword: "",
    category: "all",
    sortBy: "createTime-desc"
  },
  posts: []
};
let state = loadState(fallback);
export const getState = () => state;

// Đồng bộ dữ liệu mới từ JSON nhưng vẫn giữ trạng thái yêu thích ở trình duyệt.
function syncPostsFromJson(jsonPosts, storedPosts) {
  const storedPostsById = new Map(
    storedPosts.map(post => [
      String(post.id),
      post
    ])
  );

  return jsonPosts.map(post => {
    const storedPost =
      storedPostsById.get(String(post.id));

    return {
      ...post,
      marked: storedPost
        ? Boolean(storedPost.marked)
        : Boolean(post.marked)
    };
  });
}

// Tải song song danh mục và hai danh sách bài đăng từ server.
export async function initializeState() {
  try {
    const categoryResponse = await fetch("./assets/data/category.json");
    if (categoryResponse.ok) categories = await categoryResponse.json();
  } catch (error) {
    console.warn("Không tải được danh mục.", error);
  }
  try {
    const [lostResponse, foundResponse] = await Promise.all([
      fetch("./assets/data/lost-data.json"),
      fetch("./assets/data/found-data.json")
    ]);
    if (!lostResponse.ok || !foundResponse.ok)
      throw new Error("Seed data unavailable");
    const [lostPosts, foundPosts] = await Promise.all([lostResponse.json(), foundResponse.json()]);
    const jsonPosts = [...lostPosts, ...foundPosts];
    state = {
      ...state,
      posts: syncPostsFromJson(
        jsonPosts,
        state.posts
      )
    };
    saveState(state);
  } catch (error) {
    console.warn("Không tải được dữ liệu mẫu.", error);
  }
  return state;
}

// Cập nhật một phần state và lưu lại để giữ trạng thái sau khi reload.
export function updateState(patch) {
  state = { ...state, ...patch };
  saveState(state);
  return state;
}

// Cập nhật riêng bộ lọc mà không làm mất các giá trị lọc còn lại.
export function updateFilters(filters) {
  return updateState({
    filters: {
      ...state.filters, ...filters
    }
  });
}

// Đưa ứng dụng về trạng thái mặc định.
export function resetState() {
  state = structuredClone(fallback);
  saveState(state);
  return state;
}
