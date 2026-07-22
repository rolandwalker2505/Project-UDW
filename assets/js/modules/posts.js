import { categories } from "./state.js";
export function getVisiblePosts(state) {
  const { keyword, category, sortBy } = state.filters;
  const query = keyword.trim().toLocaleLowerCase("vi");
  return state.posts.filter(post => post.type === state.mode && (category === "all" || post.category === category) && (!query || `${post.title} ${post.content}`.toLocaleLowerCase("vi").includes(query))).sort((a, b) => sortBy === "createTime-asc" ? a.createTime.localeCompare(b.createTime) : b.createTime.localeCompare(a.createTime));
}
export function renderPosts(state, target) {
  const posts = getVisiblePosts(state);
  target.innerHTML = posts.length ? posts.map(post => `<article class="post-card"><div class="post-card-head"><span class="category-badge">${categories[post.category] || post.category}</span><button class="mark-button ${post.marked ? "marked" : ""}" data-action="mark" data-id="${post.id}" type="button" aria-label="Đánh dấu">★</button></div><h2>${escapeHtml(post.title)}</h2><p>${escapeHtml(post.content)}</p><footer><span>${escapeHtml(post.creator.name)}</span><time datetime="${post.createTime}">${new Date(post.createTime).toLocaleString("vi-VN")}</time></footer></article>`).join("") : '<div class="empty-state"><h2>Chưa có bài viết</h2><p>Thử đổi bộ lọc hoặc đăng bài mới.</p></div>';
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}
