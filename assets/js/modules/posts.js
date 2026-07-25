import { categories } from "./state.js";

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

function hasReported(post, currentUser) {
  const studentId = currentUser?.studentId;

  if (!studentId || !Array.isArray(post.reports)) {
    return false;
  }

  return post.reports.some(
    (report) =>
      String(report.reporter?.studentId || "") ===
      String(studentId),
  );
}

export function getVisiblePosts(state) {
  const {
    keyword,
    category,
    sortBy,
  } = state.filters;

  const query = keyword.trim().toLocaleLowerCase("vi");
  const statusFilter = state.statusFilter || "active";
  const postScope = state.postScope || "all";

  return state.posts
    .filter((post) => {
      const matchesMode = post.type === state.mode;
      const matchesCategory =
        category === "all" ||
        post.category === category;
      const matchesStatus =
        getPostStatus(post) === statusFilter;
      const matchesScope =
        postScope !== "mine" ||
        isPostOwner(post, state.currentUser);
      const searchableContent =
        `${post.title} ${post.content} ${post.location || ""}`
          .toLocaleLowerCase("vi");
      const matchesKeyword =
        !query ||
        searchableContent.includes(query);

      return (
        matchesMode &&
        matchesCategory &&
        matchesStatus &&
        matchesScope &&
        matchesKeyword
      );
    })
    .sort((firstPost, secondPost) => {
      if (sortBy === "createTime-asc") {
        return firstPost.createTime.localeCompare(
          secondPost.createTime,
        );
      }

      return secondPost.createTime.localeCompare(
        firstPost.createTime,
      );
    });
}

function formatCreateTime(createTime) {
  const date = new Date(createTime);

  if (Number.isNaN(date.getTime())) {
    return "Thời gian không xác định";
  }

  return date.toLocaleString("vi-VN");
}

function createPostMedia(post) {
  if (!post.image) {
    return `
      <div class="post-card-media post-card-image-placeholder">
        Chưa có ảnh
      </div>
    `;
  }

  const imageUrl = escapeHtml(post.image);
  const imageAlt = escapeHtml(
    `Ảnh của bài đăng: ${post.title}`,
  );

  return `
    <div class="post-card-media">
      <img
        class="post-card-image"
        src="${imageUrl}"
        alt="${imageAlt}"
        loading="lazy"
      >
    </div>
  `;
}

function createStatusBadge(post) {
  if (getPostStatus(post) === "resolved") {
    return `
      <span class="post-card-status post-card-status--resolved">
        Đã hoàn thành
      </span>
    `;
  }

  return `
    <span class="post-card-status">
      Đang hiển thị
    </span>
  `;
}

function createOwnerActions(post, currentUser) {
  if (!isPostOwner(post, currentUser)) {
    if (getPostStatus(post) !== "active") {
      return "";
    }

    const reportLabel = post.type === "lost"
      ? "Tôi đã tìm thấy"
      : "Tôi là chủ đồ này";

    if (hasReported(post, currentUser)) {
      return `
        <div class="post-card__owner-actions">
          <button
            class="post-status-action post-status-action--reported"
            type="button"
            disabled
            aria-label="Bạn đã gửi phản hồi cho bài đăng này"
          >
            Đã gửi phản hồi
          </button>
        </div>
      `;
    }

    return `
      <div class="post-card__owner-actions">
        <button
          class="post-status-action post-status-action--report"
          data-action="report"
          data-id="${escapeHtml(post.id)}"
          type="button"
        >
          ${reportLabel}
        </button>
      </div>
    `;
  }

  const reports = Array.isArray(post.reports)
    ? post.reports
    : [];
  const statusAction = getPostStatus(post) === "active"
    ? `
      <button
        class="post-status-action post-status-action--resolve"
        data-action="resolve"
        data-id="${escapeHtml(post.id)}"
        type="button"
      >
        Đã hoàn thành
      </button>
    `
    : `
      <button
        class="post-status-action post-status-action--reopen"
        data-action="reopen"
        data-id="${escapeHtml(post.id)}"
        type="button"
      >
        Mở lại bài đăng
      </button>
    `;

  return `
    <div class="post-card__owner-actions">
      ${reports.length
        ? `
          <button
            class="reports-button reports-button--has-reports"
            data-action="reports"
            data-id="${escapeHtml(post.id)}"
            type="button"
          >
            ${reports.length} phản hồi
          </button>
        `
        : ""}
      ${statusAction}
    </div>
  `;
}

function createEmptyState(state) {
  const isMine = state.postScope === "mine";
  const isResolved = state.statusFilter === "resolved";

  const description = isMine
    ? "Bạn chưa có bài đăng nào phù hợp với bộ lọc này."
    : isResolved
      ? "Chưa có bài đăng hoàn thành trong danh mục này."
      : "Thử đổi bộ lọc hoặc đăng bài mới.";

  return `
    <div class="empty-state">
      <h2>Chưa có bài viết</h2>
      <p>${description}</p>
    </div>
  `;
}

export function renderPosts(state, target) {
  const posts = getVisiblePosts(state);

  target.innerHTML = posts.length
    ? posts
      .map(
        (post) => `
          <article class="post-card">
            ${createPostMedia(post)}

            <div class="post-card-head">
              <span class="category-badge">
                ${escapeHtml(
                  categories[post.category] ||
                  post.category ||
                  "Chưa phân loại",
                )}
              </span>

              <div class="post-card-actions">
                ${isPostOwner(post, state.currentUser)
                  ? `
                    <button
                      class="edit-button"
                      data-action="edit"
                      data-id="${escapeHtml(post.id)}"
                      type="button"
                    >
                      Sửa
                    </button>
                  `
                  : ""}

                <button
                  class="detail-button"
                  data-action="detail"
                  data-id="${escapeHtml(post.id)}"
                  type="button"
                >
                  Chi tiết
                </button>

                <button
                  class="mark-button ${post.marked ? "marked" : ""}"
                  data-action="mark"
                  data-id="${escapeHtml(post.id)}"
                  type="button"
                  aria-label="Đánh dấu yêu thích"
                  aria-pressed="${String(Boolean(post.marked))}"
                >
                  ★
                </button>
              </div>
            </div>

            <h2>${escapeHtml(post.title || "Không có tiêu đề")}</h2>
            ${createStatusBadge(post)}

            <footer>
              <span>📍 ${escapeHtml(post.location || "Chưa có địa điểm")}</span>
              <time datetime="${escapeHtml(post.createTime || "")}">
                ${formatCreateTime(post.createTime)}
              </time>
            </footer>

            ${createOwnerActions(post, state.currentUser)}
          </article>
        `,
      )
      .join("")
    : createEmptyState(state);

  target
    .querySelectorAll(".post-card-image")
    .forEach((image) => {
      image.addEventListener("error", () => {
        const media = image.closest(".post-card-media");

        if (!media) {
          return;
        }

        media.replaceChildren();
        media.classList.add("post-card-image-placeholder");
        media.textContent = "Không thể tải ảnh";
      });
    });
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[character]),
  );
}
