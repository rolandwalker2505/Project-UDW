// Ghép các module state, render, form, API và xác thực cho trang dashboard.
import {
    categories,
    getState,
    initializeState,
    updateFilters,
    updateState,
} from "./modules/state.js";
import { renderPosts } from "./modules/posts.js";
import { showItemDetail } from "./modules/item-detail.js";
import {
    createPostChangesFromForm,
    createPostFromForm,
} from "./modules/add-post.js";
import {
    addPostReportToJson,
    savePostToJson,
    updatePostInJson,
    updatePostStatusInJson,
} from "./modules/posts-api.js";
import { clearCurrentUser, getCurrentUser } from "./auth.js";

// Tham chiếu các phần tử giao diện được sử dụng nhiều lần.
const postGrid = document.querySelector("#postGrid");
const appLoading = document.querySelector("#appLoading");
const appLoadingMessage = document.querySelector("#appLoadingMessage");
const themeToggle = document.querySelector("#themeToggle");
const addPostButton = document.querySelector("#addPostButton");
const addPostDialog = document.querySelector("#addPostDialog");
const addPostForm = document.querySelector("#addPostForm");
const addPostType = document.querySelector("#addPostType");
const addPostCategory = document.querySelector("#addPostCategory");
const closeAddPostButton = document.querySelector(
    "#closeAddPostButton",
);
const cancelAddPostButton = document.querySelector(
    "#cancelAddPostButton",
);
const categoryFilter = document.querySelector("#categoryFilter");
const postSearch = document.querySelector("#postSearch");
const searchLoading = document.querySelector("#searchLoading");
const postFormEyebrow = document.querySelector("#postFormEyebrow");
const postFormTitle = document.querySelector("#addPostTitle");
const submitPostButton = document.querySelector("#submitPostButton");
const myPostsButton = document.querySelector("#myPostsButton");
const reportDialog = document.querySelector("#reportDialog");
const reportForm = document.querySelector("#reportForm");
const reportSubmitButton = reportForm.querySelector(
    'button[type="submit"]',
);
const reportDialogEyebrow = document.querySelector(
    "#reportDialogEyebrow",
);
const reportDialogTitle = document.querySelector("#reportDialogTitle");
const reportDialogDescription = document.querySelector(
    "#reportDialogDescription",
);
const closeReportButton = document.querySelector("#closeReportButton");
const cancelReportButton = document.querySelector("#cancelReportButton");
const reportsDialog = document.querySelector("#reportsDialog");
const reportsDialogTitle = document.querySelector(
    "#reportsDialogTitle",
);
const reportList = document.querySelector("#reportList");
const closeReportsButton = document.querySelector(
    "#closeReportsButton",
);
const doneReportsButton = document.querySelector(
    "#doneReportsButton",
);

// Thời gian tối thiểu giúp spinner không bị nhấp nháy khi API phản hồi quá nhanh.
const MIN_LOADING_TIME = 320;
const SEARCH_DEBOUNCE_TIME = 280;
let searchTimer = null;

// Bật/tắt overlay và cập nhật thông báo cho người dùng.
function setAppLoading(isLoading, message) {
    if (!appLoading) {
        return;
    }

    if (message && appLoadingMessage) {
        appLoadingMessage.textContent = message;
    }

    appLoading.hidden = !isLoading;
    document.body.setAttribute("aria-busy", String(isLoading));
}

// Bao bọc một tác vụ bất đồng bộ bằng hiệu ứng loading có thời lượng tối thiểu.
async function withAppLoading(task, message) {
    const startedAt = performance.now();

    setAppLoading(true, message);

    try {
        return await task();
    } finally {
        const elapsed = performance.now() - startedAt;
        const remaining = MIN_LOADING_TIME - elapsed;

        if (remaining > 0) {
            await new Promise((resolve) => {
                window.setTimeout(resolve, remaining);
            });
        }

        setAppLoading(false);
    }
}

// Lưu ID đang thao tác để một form có thể dùng cho nhiều bài khác nhau.
let editingPostId = null;
let reportingPostId = null;

// Kiểm tra phiên đăng nhập và đồng bộ tài khoản hiện tại vào state.
const currentUser = getCurrentUser();
const storedStudentId = getState().currentUser?.studentId;
const accountChanged = currentUser &&
    String(storedStudentId || "") !==
    String(currentUser.studentId);

if (!currentUser) {
    window.location.replace("./pages/login.html");
} else {
    updateState({
        currentUser,
        ...(accountChanged
            ? {
                mode: "lost",
                statusFilter: "active",
                postScope: "all",
                filters: {
                    keyword: "",
                    category: "all",
                    sortBy: "createTime-desc",
                },
            }
            : {}),
    });
}

// Các helper kiểm tra trạng thái, quyền sở hữu và tìm bài theo ID.
function getPostStatus(post) {
    return post.status === "resolved"
        ? "resolved"
        : "active";
}

function isPostOwner(post, currentUser) {
    return Boolean(
        currentUser?.studentId &&
        String(post.creator?.studentId || "") ===
        String(currentUser.studentId),
    );
}

function getPostById(postId) {
    return getState().posts.find(
        (post) => String(post.id) === String(postId),
    );
}

// Nhóm hàm đóng dialog và xóa trạng thái thao tác tạm thời.
function closeAddPostDialog() {
    if (addPostDialog.open) {
        addPostDialog.close();
    }

    editingPostId = null;
}

function closeReportDialog() {
    if (reportDialog.open) {
        reportDialog.close();
    }

    reportingPostId = null;
    reportForm.reset();
}

function closeReportsDialog() {
    if (reportsDialog.open) {
        reportsDialog.close();
    }
}

// Mở form ở chế độ tạo bài mới.
function openAddPostDialog() {
    editingPostId = null;
    addPostForm.reset();
    postFormEyebrow.textContent = "Bài đăng mới";
    postFormTitle.textContent = "Đăng thông tin đồ thất lạc";
    submitPostButton.textContent = "Đăng bài";
    addPostType.value = getState().mode;

    if (!addPostDialog.open) {
        addPostDialog.showModal();
    }
}

// Điền dữ liệu bài cũ vào form để người dùng chỉnh sửa.
function openEditPostDialog(post) {
    if (!isPostOwner(post, getCurrentUser())) {
        alert("Bạn chỉ có thể sửa bài đăng của chính mình.");
        return;
    }

    editingPostId = String(post.id);
    addPostForm.reset();
    addPostType.value = post.type;
    addPostCategory.value = post.category;
    addPostForm.elements.title.value = post.title || "";
    addPostForm.elements.creatorName.value = post.creator?.name || "";
    addPostForm.elements.location.value = post.location || "";
    addPostForm.elements.contact.value = post.contact || "";
    addPostForm.elements.content.value = post.content || "";
    postFormEyebrow.textContent = "Chỉnh sửa bài đăng";
    postFormTitle.textContent = "Cập nhật thông tin";
    submitPostButton.textContent = "Lưu thay đổi";

    if (!addPostDialog.open) {
        addPostDialog.showModal();
    }
}

// Chuẩn bị nội dung dialog phản hồi tùy theo bài mất hoặc bài nhặt được.
function openReportDialog(post) {
    if (isPostOwner(post, getCurrentUser())) {
        alert("Bạn không thể gửi phản hồi cho bài đăng của chính mình.");
        return;
    }

    if (getPostStatus(post) !== "active") {
        alert("Bài đăng này đã hoàn thành.");
        return;
    }

    reportingPostId = String(post.id);
    reportForm.reset();

    const isLostPost = post.type === "lost";
    reportDialogEyebrow.textContent = isLostPost
        ? "Báo đã tìm thấy"
        : "Xác nhận là chủ đồ";
    reportDialogTitle.textContent = isLostPost
        ? "Tôi đã tìm thấy đồ này"
        : "Tôi là chủ của đồ này";
    reportDialogDescription.textContent = isLostPost
        ? `Gửi thông tin liên hệ cho “${post.title}”. Chủ bài sẽ liên hệ lại để xác minh và nhận đồ.`
        : `Gửi thông tin liên hệ cho “${post.title}”. Người nhặt được sẽ liên hệ lại để trao trả đồ.`;

    if (!reportDialog.open) {
        reportDialog.showModal();
    }
}

// Định dạng và hiển thị danh sách phản hồi dành cho chủ bài.
function formatReportTime(createdAt) {
    const date = new Date(createdAt);

    return Number.isNaN(date.getTime())
        ? "Thời gian không xác định"
        : date.toLocaleString("vi-VN");
}

function openReportsDialog(post) {
    if (!isPostOwner(post, getCurrentUser())) {
        alert("Bạn chỉ có thể xem phản hồi cho bài đăng của mình.");
        return;
    }

    const reports = Array.isArray(post.reports)
        ? post.reports
        : [];

    reportsDialogTitle.textContent = `Phản hồi cho: ${post.title}`;
    reportList.replaceChildren();

    if (!reports.length) {
        const emptyState = document.createElement("p");
        emptyState.className = "post-status-dialog__intro";
        emptyState.textContent = "Chưa có phản hồi nào cho bài đăng này.";
        reportList.append(emptyState);
    } else {
        reports.forEach((report) => {
            const item = document.createElement("article");
            item.className = "report-list__item";

            const name = document.createElement("h3");
            name.textContent = report.reporter?.name || "Không xác định";

            const contact = document.createElement("p");
            contact.className = "report-list__contact";
            contact.textContent = `Liên hệ: ${report.contact || "Chưa có thông tin"}`;

            const time = document.createElement("p");
            time.className = "report-list__time";
            time.textContent = formatReportTime(report.createdAt);

            const message = document.createElement("p");
            message.className = "report-list__message";
            message.textContent = report.message || "Không có lời nhắn.";

            item.append(name, contact, time, message);
            reportList.append(item);
        });
    }

    if (!reportsDialog.open) {
        reportsDialog.showModal();
    }
}

// Thay bài đã cập nhật trong state nhưng vẫn giữ đánh dấu yêu thích cục bộ.
function replacePostInState(updatedPost) {
    const state = getState();

    updateState({
        posts: state.posts.map((post) =>
            String(post.id) === String(updatedPost.id)
                ? {
                    ...updatedPost,
                    marked: post.marked,
                }
                : post,
        ),
    });
}

// Xác nhận với người dùng rồi gọi API đóng hoặc mở lại bài đăng.
async function changePostStatus(post, nextStatus) {
    if (!isPostOwner(post, getCurrentUser())) {
        return;
    }

    const isResolving = nextStatus === "resolved";
    const message = isResolving
        ? "Đánh dấu bài đăng là đã hoàn thành? Bài vẫn có thể mở lại khi cần."
        : "Mở lại bài đăng này để tiếp tục hiển thị?";

    if (!window.confirm(message)) {
        return;
    }

    try {
        const updatedPost = await withAppLoading(
            () => updatePostStatusInJson(
                post.id,
                nextStatus,
                getCurrentUser().studentId,
            ),
            isResolving
                ? "Đang đánh dấu bài đã hoàn thành..."
                : "Đang mở lại bài đăng...",
        );

        replacePostInState(updatedPost);
        render();
    } catch (error) {
        console.error("Không cập nhật được trạng thái.", error);
        alert(error.message);
    }
}

// Đồng bộ trạng thái state lên các nút lọc, ô tìm kiếm và select.
function syncPostControls(state) {
    document.querySelectorAll("[data-mode]").forEach((button) => {
        button.classList.toggle(
            "active",
            button.dataset.mode === state.mode,
        );
    });

    document
        .querySelectorAll("[data-status-filter]")
        .forEach((button) => {
            button.classList.toggle(
                "active",
                button.dataset.statusFilter ===
                (state.statusFilter || "active"),
            );
        });

    myPostsButton.setAttribute(
        "aria-pressed",
        String(state.postScope === "mine"),
    );
    document.querySelector("#postSearch").value = state.filters.keyword;
    categoryFilter.value = state.filters.category;
    document.querySelector("#sortFilter").value = state.filters.sortBy;
}

// Render lại toàn bộ dashboard từ state hiện tại.
function render() {
    const state = getState();
    document.documentElement.dataset.theme = state.theme;

    const darkModeEnabled = state.theme === "dark";
    themeToggle.textContent = darkModeEnabled ? "☀" : "☾";
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
    document.querySelector("#profileState").textContent = state.currentUser
        ? `Đã đăng nhập: ${state.currentUser.studentId}`
        : "Bạn chưa đăng nhập.";
}

// Xử lý các bộ lọc danh sách: loại bài, trạng thái, bài của tôi và tìm kiếm.
document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
        updateState({ mode: button.dataset.mode });
        render();
    });
});

document.querySelectorAll("[data-status-filter]").forEach((button) => {
    button.addEventListener("click", () => {
        updateState({ statusFilter: button.dataset.statusFilter });
        render();
    });
});

myPostsButton.addEventListener("click", () => {
    updateState({
        postScope: getState().postScope === "mine"
            ? "all"
            : "mine",
    });
    render();
});

// Debounce thao tác tìm kiếm và hiển thị animation trong lúc lọc danh sách.
postSearch.addEventListener("input", (event) => {
    if (searchTimer) {
        window.clearTimeout(searchTimer);
    }

    searchLoading.hidden = false;
    searchTimer = window.setTimeout(() => {
        updateFilters({ keyword: event.target.value });
        render();
        searchLoading.hidden = true;
        searchTimer = null;
    }, SEARCH_DEBOUNCE_TIME);
});

categoryFilter.addEventListener("change", (event) => {
    updateFilters({ category: event.target.value });
    render();
});

document.querySelector("#sortFilter").addEventListener("change", (event) => {
    updateFilters({ sortBy: event.target.value });
    render();
});

// Chuyển theme và lưu lựa chọn vào state.
themeToggle.addEventListener("click", () => {
    updateState({
        theme: getState().theme === "dark"
            ? "light"
            : "dark",
    });
    render();
});

// Nút đăng xuất xóa cả user hiện tại và các bộ lọc riêng của tài khoản.
document.querySelector("#loginButton").textContent = "Đăng xuất";
document.querySelector("#loginButton").addEventListener("click", () => {
    updateState({
        currentUser: null,
        postScope: "all",
        statusFilter: "active",
        filters: {
            keyword: "",
            category: "all",
            sortBy: "createTime-desc",
        },
    });
    clearCurrentUser();
    window.location.replace("./pages/introduction.html");
});

// Chuyển giữa khu vực bài viết và khu vực tài khoản.
document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".view").forEach((view) => {
            view.hidden = view.id !== `${button.dataset.view}View`;
        });

        document.querySelectorAll("[data-view]").forEach((item) => {
            item.classList.toggle("active", item === button);
        });
    });
});

// Gắn sự kiện mở/đóng cho ba dialog của ứng dụng.
addPostButton.addEventListener("click", openAddPostDialog);
closeAddPostButton.addEventListener("click", closeAddPostDialog);
cancelAddPostButton.addEventListener("click", closeAddPostDialog);
addPostDialog.addEventListener("close", () => {
    editingPostId = null;
});

closeReportButton.addEventListener("click", closeReportDialog);
cancelReportButton.addEventListener("click", closeReportDialog);
reportDialog.addEventListener("close", () => {
    reportingPostId = null;
});
closeReportsButton.addEventListener("click", closeReportsDialog);
doneReportsButton.addEventListener("click", closeReportsDialog);

// Form này xử lý cả tạo mới lẫn cập nhật bài đăng.
addPostForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const currentUser = getCurrentUser();

    if (!currentUser) {
        window.location.replace("./pages/login.html");
        return;
    }

    const isEditing = Boolean(editingPostId);
    const loadingMessage = isEditing
        ? "Đang cập nhật bài đăng..."
        : "Đang đăng bài mới...";

    submitPostButton.disabled = true;

    try {
        await withAppLoading(async () => {
            if (isEditing) {
                const existingPost = getPostById(editingPostId);

                if (!existingPost) {
                    throw new Error("Không tìm thấy bài đăng.");
                }

                const changes = await createPostChangesFromForm(
                    addPostForm,
                    existingPost,
                );
                const updatedPost = await updatePostInJson(
                    editingPostId,
                    changes,
                    currentUser.studentId,
                );

                replacePostInState(updatedPost);
                updateState({ mode: updatedPost.type });
            } else {
                const newPost = await createPostFromForm(
                    addPostForm,
                    currentUser,
                );
                const savedPost = await savePostToJson(newPost);
                const state = getState();

                updateState({
                    posts: [savedPost, ...state.posts],
                    mode: savedPost.type,
                    statusFilter: "active",
                    filters: {
                        ...state.filters,
                        keyword: "",
                        category: "all",
                        sortBy: "createTime-desc",
                    },
                });
            }
        }, loadingMessage);
    } catch (error) {
        console.error("Không lưu được bài đăng.", error);
        alert(error.message);
        return;
    } finally {
        submitPostButton.disabled = false;
    }

    closeAddPostDialog();
    addPostForm.reset();
    render();
});

// Gửi thông tin liên hệ của người phản hồi đến API.
reportForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const currentUser = getCurrentUser();
    const post = getPostById(reportingPostId);

    if (!currentUser || !post) {
        closeReportDialog();
        return;
    }

    reportSubmitButton.disabled = true;

    try {
        const formData = new FormData(reportForm);
        const updatedPost = await withAppLoading(
            () => addPostReportToJson(
                post.id,
                {
                    reporterName: String(formData.get("reporterName") || "").trim(),
                    contact: String(formData.get("contact") || "").trim(),
                    message: String(formData.get("message") || "").trim(),
                },
                currentUser.studentId,
            ),
            "Đang gửi phản hồi...",
        );

        replacePostInState(updatedPost);
        closeReportDialog();
        render();
        alert("Đã gửi phản hồi. Chủ bài sẽ liên hệ với bạn.");
    } catch (error) {
        console.error("Không gửi được phản hồi.", error);
        alert(error.message);
    } finally {
        reportSubmitButton.disabled = false;
    }
});

// Event delegation xử lý toàn bộ nút hành động được render động trong postGrid.
postGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");

    if (!button || !postGrid.contains(button)) {
        return;
    }

    const post = getPostById(button.dataset.id);

    if (!post) {
        return;
    }

    if (button.dataset.action === "edit") {
        openEditPostDialog(post);
        return;
    }

    if (button.dataset.action === "detail") {
        const categoryLabel = categories[post.category] || post.category || "Chưa phân loại";
        showItemDetail(post, categoryLabel);
        return;
    }

    if (button.dataset.action === "report") {
        openReportDialog(post);
        return;
    }

    if (button.dataset.action === "reports") {
        openReportsDialog(post);
        return;
    }

    if (button.dataset.action === "resolve") {
        changePostStatus(post, "resolved");
        return;
    }

    if (button.dataset.action === "reopen") {
        changePostStatus(post, "active");
        return;
    }

    if (button.dataset.action === "mark") {
        const state = getState();

        updateState({
            posts: state.posts.map((item) =>
                String(item.id) === String(post.id)
                    ? { ...item, marked: !item.marked }
                    : item,
            ),
        });
        render();
    }
});

// Tải dữ liệu ban đầu, chuẩn hóa bài cũ và tạo các option danh mục.
await withAppLoading(
    () => initializeState(),
    "Đang tải danh sách bài viết...",
);

updateState({
    statusFilter: getState().statusFilter === "resolved"
        ? "resolved"
        : "active",
    postScope: getState().postScope === "mine"
        ? "mine"
        : "all",
    posts: getState().posts.map((post) => ({
        ...post,
        status: getPostStatus(post),
        reports: Array.isArray(post.reports)
            ? post.reports
            : [],
    })),
});

const categoryOptions = Object.entries(categories)
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

// Lần render đầu tiên sau khi dữ liệu đã sẵn sàng.
render();
