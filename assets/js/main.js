import { getState, updateState, updateFilters, initializeState, categories } from "./modules/state.js";
import { renderPosts } from "./modules/posts.js";
import { showItemDetail } from "./modules/item-detail.js";
import {
    createPostFromForm,
    createPostChangesFromForm,
} from "./modules/add-post.js";
import {
    savePostToJson,
    updatePostInJson,
} from "./modules/posts-api.js";
import { getCurrentUser, clearCurrentUser } from "./auth.js";

const postGrid = document.querySelector("#postGrid");
const themeToggle = document.querySelector("#themeToggle");

const markPost_stylesheet =
    document.createElement("link");
markPost_stylesheet.rel = "stylesheet";
markPost_stylesheet.href = "./assets/css/style.css";
document.head.append(markPost_stylesheet);

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

const postFormEyebrow =
    document.querySelector("#postFormEyebrow");
const postFormTitle =
    document.querySelector("#addPostTitle");
const submitPostButton =
    document.querySelector("#submitPostButton");
let editingPostId = null;

const markPost_tabDefinitions = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ xác nhận" },
    { key: "personal", label: "Cá nhân" },
];
const markPost_tabs = markPost_tabDefinitions.map(tab => {
    const button = document.createElement("button");
    button.className = "nav-button";
    button.type = "button";
    button.textContent = tab.label;
    button.dataset.markPostView = tab.key;
    document
        .querySelector("nav[aria-label='Điều hướng chính']")
        .append(button);
    return button;
});

function markPost_isOwner(post, currentUser) {
    return Boolean(
        currentUser?.studentId &&
        String(currentUser.studentId) ===
        String(post.ownerStudentId),
    );
}

function markPost_updateStatus(postId, nextStatus) {
    const state = getState();

    updateState({
        posts: state.posts.map(post =>
            String(post.id) === String(postId)
                ? {
                    ...post,
                    marked:
                        nextStatus !== "dang_dang",
                    status: nextStatus,
                }
                : post
        ),
    });

    render();
}

function markPost_markReturned(postId) {
    const state = getState();
    const post = state.posts.find(
        item => String(item.id) === String(postId),
    );

    if (
        !post ||
        post.status !== "dang_dang" ||
        !markPost_isOwner(post, state.currentUser)
    ) {
        return;
    }

    markPost_updateStatus(
        postId,
        "cho_xac_nhan_hoan_tra",
    );
}

function markPost_confirm(postId) {
    const state = getState();
    const post = state.posts.find(
        item => String(item.id) === String(postId),
    );

    if (
        !post ||
        post.status !== "cho_xac_nhan_hoan_tra" ||
        !markPost_isOwner(post, state.currentUser)
    ) {
        return;
    }

    markPost_updateStatus(
        postId,
        "hoan_tra_thanh_cong",
    );
}

function markPost_delete(postId) {
    const state = getState();
    const post = state.posts.find(
        item => String(item.id) === String(postId),
    );

    if (
        !post ||
        post.status !== "hoan_tra_thanh_cong" ||
        !markPost_isOwner(post, state.currentUser)
    ) {
        return;
    }

    if (!window.confirm("Bạn có chắc muốn xóa?")) {
        return;
    }

    updateState({
        posts: state.posts.filter(
            item => String(item.id) !== String(postId),
        ),
        deletedPostIds: [
            ...(state.deletedPostIds || []),
            String(postId),
        ],
    });

    render();
}

function markPost_createButton(
    action,
    postId,
    label,
    className,
) {
    const button = document.createElement("button");
    button.className = className;
    button.dataset.action = action;
    button.dataset.id = String(postId);
    button.type = "button";
    button.textContent = label;
    return button;
}

function markPost_renderOwnerActions(state) {
    postGrid
        .querySelectorAll(".post-card")
        .forEach(card => {
            const actions =
                card.querySelector(".post-card-actions");
            const postId =
                actions?.querySelector("[data-id]")?.dataset.id;
            const post = state.posts.find(
                item => String(item.id) === String(postId),
            );

            if (!actions || !post) {
                return;
            }

            if (post.category === "student-card") {
                card
                    .querySelector(".category-badge")
                    ?.classList.add("badge-sv");
            }

            actions
                .querySelectorAll(
                    ".mark-button, [data-action='delete']",
                )
                .forEach(button => button.remove());

            if (!markPost_isOwner(post, state.currentUser)) {
                return;
            }

            const bottomActions =
                document.createElement("div");
            bottomActions.className =
                "mark-post-bottom-actions";
            card.append(bottomActions);

            if (post.status === "dang_dang") {
                bottomActions.append(
                    markPost_createButton(
                        "markReturned",
                        post.id,
                        "✓ Đánh dấu hoàn trả",
                        "btn-mark",
                    ),
                );
                return;
            }

            if (
                post.status ===
                "cho_xac_nhan_hoan_tra"
            ) {
                bottomActions.append(
                    markPost_createButton(
                        "confirmReturned",
                        post.id,
                        "✓ Xác nhận đã nhận",
                        "btn-confirm",
                    ),
                );
                return;
            }

            if (
                post.status ===
                "hoan_tra_thanh_cong"
            ) {
                bottomActions.append(
                    markPost_createButton(
                        "delete",
                        post.id,
                        "🗑️ Xóa",
                        "btn-delete",
                    ),
                );
            }
        });
}

function markPost_getRenderState(state) {
    const deletedPostIds = new Set(
        (state.deletedPostIds || []).map(String),
    );
    const visiblePosts = state.posts.filter(
        post =>
            !deletedPostIds.has(String(post.id)),
    );

    const currentUser = state.currentUser;
    const view = state.markPostView || "all";
    const filteredPosts =
        view === "pending"
            ? visiblePosts.filter(
                post =>
                    post.status ===
                    "cho_xac_nhan_hoan_tra" &&
                    markPost_isOwner(post, currentUser),
            )
            : view === "personal"
                ? visiblePosts.filter(
                    post =>
                        post.status ===
                        "hoan_tra_thanh_cong" &&
                        markPost_isOwner(post, currentUser),
                )
                : visiblePosts.filter(
                    post => post.status === "dang_dang",
                );

    return {
        ...state,
        posts: filteredPosts
            .map(post => ({
                ...post,
                type: state.mode,
            })),
        filters: {
            ...(view === "all"
                ? state.filters
                : {
                    ...state.filters,
                    keyword: "",
                    category: "all",
                }),
        },
    };
}

function markPost_syncPosts(posts, storedPosts) {
    const storedById = new Map(
        storedPosts.map(post => [
            String(post.id),
            post,
        ]),
    );

    return posts.map(post => {
        const storedPost =
            storedById.get(String(post.id));
        const storedStatus =
            storedPost?.status || post.status;
        const status = [
            "dang_dang",
            "cho_xac_nhan_hoan_tra",
            "hoan_tra_thanh_cong",
        ].includes(storedStatus)
            ? storedStatus
            : (storedPost?.marked || post.marked)
                ? "cho_xac_nhan_hoan_tra"
                : "dang_dang";

        return {
            ...post,
            ownerStudentId:
                post.ownerStudentId ||
                storedPost?.ownerStudentId ||
                post.creator?.studentId ||
                "",
            marked: status !== "dang_dang",
            status,
        };
    });
}

if (!getCurrentUser())
    window.location.replace("./pages/login.html");
else updateState(
    { currentUser: getCurrentUser() });

function openAddPostDialog() {
    editingPostId = null;
    addPostForm.reset();
    postFormEyebrow.textContent = "Bài đăng mới";
    postFormTitle.textContent =
        "Đăng thông tin đồ thất lạc";
    submitPostButton.textContent = "Đăng bài";

    addPostType.value =
        getState().mode;

    if (!addPostDialog.open) {
        addPostDialog.showModal();
    }
}

function openEditPostDialog(post) {
    const currentStudentId =
        getCurrentUser()?.studentId;
    const ownerStudentId =
        post.creator?.studentId;

    if (
        !currentStudentId ||
        String(ownerStudentId) !==
        String(currentStudentId)
    ) {
        alert(
            "Bạn chỉ có thể sửa bài đăng của chính mình.",
        );
        return;
    }

    editingPostId = String(post.id);
    addPostForm.reset();
    addPostType.value = post.type;
    addPostCategory.value = post.category;
    addPostForm.elements.title.value =
        post.title || "";
    addPostForm.elements.creatorName.value =
        post.creator?.name || "";
    addPostForm.elements.location.value =
        post.location || "";
    addPostForm.elements.contact.value =
        post.contact || "";
    addPostForm.elements.content.value =
        post.content || "";
    postFormEyebrow.textContent = "Chỉnh sửa bài đăng";
    postFormTitle.textContent = "Cập nhật thông tin";
    submitPostButton.textContent = "Lưu thay đổi";

    if (!addPostDialog.open) {
        addPostDialog.showModal();
    }
}

function closeAddPostDialog() {
    if (addPostDialog.open) {
        addPostDialog.close();
    }

    editingPostId = null;
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

    markPost_tabs.forEach(tab =>
        tab.classList.toggle(
            "active",
            tab.dataset.markPostView ===
            (state.markPostView || "all"),
        )
    );
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
    renderPosts(
        markPost_getRenderState(state),
        postGrid,
    );
    markPost_renderOwnerActions(state);
    document.querySelector("#profileState").textContent = state.currentUser ? `Đã đăng nhập: ${state.currentUser.studentId}` : "Bạn chưa đăng nhập.";
}

document.querySelectorAll("[data-mode]").forEach(button => button.addEventListener("click", () => {
    updateState({
        mode: button.dataset.mode,
        markPostView: "all",
    });
    document.querySelectorAll("[data-mode]").forEach(
        item => item.classList.toggle("active", item === button));
    render();
}));

markPost_tabs.forEach(tab =>
    tab.addEventListener("click", () => {
        document
            .querySelectorAll(".view")
            .forEach(view => {
                view.hidden = view.id !== "postsView";
            });

        document
            .querySelectorAll("[data-view]")
            .forEach(button => {
                button.classList.toggle(
                    "active",
                    button.dataset.view === "posts",
                );
            });

        updateState({
            markPostView:
                tab.dataset.markPostView,
        });
        render();
    })
);

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
        if (button.dataset.view === "posts") {
            updateState({ markPostView: "all" });
        }

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

addPostDialog.addEventListener("close", () => {
    editingPostId = null;
});

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

        try {
            if (editingPostId) {
                const existingPost =
                    getState().posts.find(
                        (post) =>
                            String(post.id) ===
                            editingPostId,
                    );

                if (!existingPost) {
                    throw new Error(
                        "Không tìm thấy bài đăng.",
                    );
                }

                const changes =
                    await createPostChangesFromForm(
                        addPostForm,
                        existingPost,
                    );
                const updatedPost =
                    await updatePostInJson(
                        editingPostId,
                        changes,
                        currentUser.studentId,
                    );
                const state = getState();

                updateState({
                    posts: state.posts.map((post) =>
                        String(post.id) === editingPostId
                            ? {
                                ...updatedPost,
                                marked: post.marked,
                                ownerStudentId:
                                    post.ownerStudentId,
                                status: post.status,
                            }
                            : post
                    ),
                    mode: updatedPost.type,
                });

                closeAddPostDialog();
                addPostForm.reset();
                render();
                return;
            }

            const newPost =
                await createPostFromForm(
                    addPostForm,
                    currentUser,
                );

            await savePostToJson(newPost);

            const state = getState();

            updateState({
                posts: [
                    {
                        ...newPost,
                        ownerStudentId:
                            currentUser.studentId,
                        status: "dang_dang",
                    },
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
        } catch (error) {
            console.error(
                "Không lưu được bài đăng.",
                error,
            );

            alert(error.message);

            return;
        }

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

    if (action === "edit") {
        const post = getState().posts.find(
            (item) => String(item.id) === postId,
        );

        if (post) {
            openEditPostDialog(post);
        }

        return;
    }

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

    if (action === "markReturned") {
        markPost_markReturned(postId);

        return;
    }

    if (action === "confirmReturned") {
        markPost_confirm(postId);

        return;
    }

    if (action === "delete") {
        markPost_delete(postId);
    }
});

const markPost_storedPosts = getState().posts;
await initializeState();

updateState({
    posts: markPost_syncPosts(
        getState().posts,
        markPost_storedPosts,
    ),
});

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
