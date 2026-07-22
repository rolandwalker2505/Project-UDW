import { getState, updateState, updateFilters, initializeState, categories } from "./modules/state.js";
import { renderPosts } from "./modules/posts.js";
import { showItemDetail } from "./modules/item-detail.js";
import { getCurrentUser, clearCurrentUser } from "./auth.js";

const postGrid = document.querySelector("#postGrid");
const themeToggle = document.querySelector("#themeToggle");
if (!getCurrentUser())
    window.location.replace("./pages/login.html");
else updateState(
    { currentUser: getCurrentUser() });

function render() {
    const state = getState();
    document.documentElement.dataset.theme = state.theme;

    const darkModeEnabled =
        state.theme === "dark";

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

themeToggle.addEventListener("click", () => {
    updateState({ theme: getState().theme === "dark" ? "light" : "dark" }); render();
});

document.querySelector("#loginButton").textContent = "Đăng xuất";

document.querySelector("#loginButton").addEventListener("click", () => {
    clearCurrentUser();
    window.location.replace("./pages/introduction.html");
});

document.querySelectorAll("[data-view]").forEach(
    button => button.addEventListener("click", () => {
        document
            .querySelectorAll(".view")
            .forEach(view => {
                view.hidden =
                    view.id !==
                    `${button.dataset.view}View`;
            });

        document
            .querySelectorAll("[data-view]")
            .forEach(item => {
                item.classList.toggle(
                    "active",
                    item === button,
                );
            });
    })
);

postGrid.addEventListener("click", event => {
    const button =
        event.target.closest("[data-action]");

    if (!button || !postGrid.contains(button)) {
        return;
    }

    const action = button.dataset.action;
    const postId = button.dataset.id;

    if (action === "detail") {
        const post = getState().posts.find(
            item => String(item.id) === postId,
        );

        if (!post) {
            return;
        }

        const categoryLabel =
            categories[post.category] ||
            post.category ||
            "Chưa phân loại";

        showItemDetail(post, categoryLabel);

        return;
    }

    if (action !== "mark") {
        return;
    }

    const posts = getState().posts.map(post =>
        String(post.id) === postId
            ? {
                ...post,
                marked: !post.marked,
            }
            : post
    );

    updateState({ posts });
    render();
});

await initializeState();
const categoryFilter = document.querySelector("#categoryFilter");
categoryFilter.innerHTML = `<option value="all">Tất cả</option>${Object.entries(categories).map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}`;
render();
