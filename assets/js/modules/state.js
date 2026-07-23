import { saveState, loadState } from "./storage.js";

export let categories = {};

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
export function updateState(patch) {
  state = { ...state, ...patch };
  saveState(state);
  return state;
}
export function updateFilters(filters) {
  return updateState({
    filters: {
      ...state.filters, ...filters
    }
  });
}
export function resetState() {
  state = structuredClone(fallback);
  saveState(state);
  return state;
}
