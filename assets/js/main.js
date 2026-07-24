import { getState, updateState, updateFilters, initializeState, categories } from "./modules/state.js";
import { renderPosts } from "./modules/posts.js";
import { showItemDetail } from "./modules/item-detail.js";
import { createPostFromForm } from "./modules/add-post.js";
import { savePostToJson } from "./modules/posts-api.js";
import { getCurrentUser, clearCurrentUser } from "./auth.js";

const postGrid = document.querySelector("#postGrid");
const themeToggle = document.querySelector("#themeToggle");

const addPostButton =
    document.querySelector("#addPostButton");

const addPostDialog =
    document.querySelector("#addPostDialog");

const addPostForm =
    document.querySelector("#addPostForm");

const addPostType =
    document.querySelector("#addPostType");

const addPostCategory =
    document.querySelector("#addPostCategory");

const closeAddPostButton =
    document.querySelector("#closeAddPostButton");

const cancelAddPostButton =
    document.querySelector("#cancelAddPostButton");

const categoryFilter =
    document.querySelector("#categoryFilter");

if (!getCurrentUser())
    window.location.replace("./pages/login.html");
else updateState(
    { currentUser: getCurrentUser() });

function openAddPostDialog() {
    addPostForm.reset();

    addPostType.value =
        getState().mode;

    if (!addPostDialog.open) {
        addPostDialog.showModal();
    }
}

function closeAddPostDialog() {
    if (addPostDialog.open) {
        addPostDialog.close();
    }
}

function syncPostControls(state) {
    document
        .querySelectorAll("[data-mode]")
        .forEach((button) => {
            button.classList.toggle(
                "active",
                button.dataset.mode === state.mode,
            );
        });

    document.querySelector("#postSearch").value =
        state.filters.keyword;

    categoryFilter.value =
        state.filters.category;

    document.querySelector("#sortFilter").value =
        state.filters.sortBy;
}

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

    syncPostControls(state);
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

addPostButton.addEventListener(
    "click",
    openAddPostDialog,
);

closeAddPostButton.addEventListener(
    "click",
    closeAddPostDialog,
);

cancelAddPostButton.addEventListener(
    "click",
    closeAddPostDialog,
);

addPostForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();

        const currentUser =
            getCurrentUser();

        if (!currentUser) {
            window.location.replace(
                "./pages/login.html",
            );

            return;
        }

        const newPost =
            createPostFromForm(
                addPostForm,
                currentUser,
            );

        try {
            await savePostToJson(newPost);
        } catch (error) {
            console.error(
                "Không lưu được bài đăng.",
                error,
            );

            alert(error.message);

            return;
        }

        const state = getState();

        updateState({
            posts: [
                newPost,
                ...state.posts,
            ],

            mode: newPost.type,

            filters: {
                ...state.filters,
                keyword: "",
                category: "all",
                sortBy: "createTime-desc",
            },
        });

        closeAddPostDialog();
        addPostForm.reset();
        render();
    },
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

const categoryOptions =
    Object.entries(categories)
        .map(
            ([value, label]) =>
                `<option value="${value}">${label}</option>`,
        )
        .join("");

categoryFilter.innerHTML = `
    <option value="all">Tất cả</option>
    ${categoryOptions}
`;

addPostCategory.innerHTML = `
    <option value="">Chọn danh mục</option>
    ${categoryOptions}
`;

render();
