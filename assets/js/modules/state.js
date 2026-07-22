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
export async function initializeState() {
  try {
    const categoryResponse = await fetch("./assets/data/category.json");
    if (categoryResponse.ok) categories = await categoryResponse.json();
  } catch (error) {
    console.warn("Không tải được danh mục.", error);
  }
  if (state.posts.length)
    return state;
  try {
    const [lostResponse, foundResponse] = await Promise.all([
      fetch("./assets/data/lost-data.json"),
      fetch("./assets/data/found-data.json")
    ]);
    if (!lostResponse.ok || !foundResponse.ok)
      throw new Error("Seed data unavailable");
    const [lostPosts, foundPosts] = await Promise.all([lostResponse.json(), foundResponse.json()]);
    state = { ...state, posts: [...lostPosts, ...foundPosts] };
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
