import { getState, updateState, updateFilters, initializeState, categories } from "./modules/state.js";
import { renderPosts } from "./modules/posts.js";
import { getCurrentUser, clearCurrentUser } from "./auth.js";

const postGrid = document.querySelector("#postGrid");
if (!getCurrentUser())
    window.location.replace("./pages/login.html");
else updateState(
    { currentUser: getCurrentUser() });
function render() {
    const state = getState();
    document.documentElement.dataset.theme = state.theme;
    renderPosts(state, postGrid);
    document.querySelector("#profileState").textContent = state.currentUser ? `Đã đăng nhập: ${state.currentUser.studentId}` : "Bạn chưa đăng nhập.";
}
document.querySelectorAll("[data-mode]").forEach(button => button.addEventListener("click", () => {
    updateState({ mode: button.dataset.mode });
    document.querySelectorAll("[data-mode]").forEach(
        item => item.classList.toggle("active", item === button));
    render();
}));
document.querySelector("#postSearch").addEventListener("input", event => {
    updateFilters({ keyword: event.target.value }); render();
});
document.querySelector("#categoryFilter").addEventListener("change", event => {
    updateFilters({ category: event.target.value }); render();
});
document.querySelector("#sortFilter").addEventListener("change", event => {
    updateFilters({ sortBy: event.target.value }); render();
});
document.querySelector("#themeToggle").addEventListener("click", () => {
    updateState({ theme: getState().theme === "dark" ? "light" : "dark" }); render();
});
document.querySelector("#loginButton").textContent = "Đăng xuất";
document.querySelector("#loginButton").addEventListener("click", () => {
    clearCurrentUser();
    window.location.replace("./pages/introduction.html");
});
document.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click", () => {
    document.querySelectorAll(".view").forEach(view => { view.hidden = view.id !== `${button.dataset.view}View`; });
}));
postGrid.addEventListener("click", event => {
    const button = event.target.closest("[data-action='mark']");
    if (!button)
        return;
    const posts = getState().posts.map(post => post.id === button.dataset.id ? { ...post, marked: !post.marked } : post);
    updateState({ posts });
    render();
});
await initializeState();
const categoryFilter = document.querySelector("#categoryFilter");
categoryFilter.innerHTML = `<option value="all">Tất cả</option>${Object.entries(categories).map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}`;
render();
