import { categories } from "./state.js";

export function getVisiblePosts(state) {
  const { keyword, category, sortBy } = state.filters;
  const query = keyword.trim().toLocaleLowerCase("vi");
  return state.posts.filter(
    post => post.type === state.mode
      && (category === "all" || post.category === category)
      && (!query ||
        `${post.title} ${post.content} ${post.location || ""}`
          .toLocaleLowerCase("vi")
          .includes(query)))
    .sort((a, b) => sortBy === "createTime-asc" ? a.createTime.localeCompare(b.createTime) : b.createTime.localeCompare(a.createTime));
}

function formatCreateTime(createTime) {
  const date = new Date(createTime);

  if (Number.isNaN(date.getTime())) {
    return "Thời gian không xác định";
  }

  return date.toLocaleString("vi-VN");
}

// function getCreatorName(creator) {
//   if (typeof creator === "string") {
//     return creator || "Không xác định";
//   }

//   if (creator && typeof creator === "object") {
//     return (
//       creator.name ||
//       creator.studentId ||
//       "Không xác định"
//     );
//   }

//   return "Không xác định";
// }

function createPostMedia(post) {
  if (!post.image) {
    return `
      <div
        class="post-card-media post-card-image-placeholder"
      >
        Chưa có ảnh
      </div>
    `;
  }

  const imageUrl =
    escapeHtml(post.image);

  const imageAlt =
    escapeHtml(
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
          "Chưa phân loại"
        )}
              </span>

              <div class="post-card-actions">
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
                  aria-label="Đánh dấu"
                >
                  ★
                </button>
              </div>
            </div>

            <h2>
              ${escapeHtml(post.title)}
            </h2>

            <footer>
              <span>
                📍 ${escapeHtml(
                      post.location ||
                      "Chưa có địa điểm",
                    )}
              </span>

              <time
                datetime="${escapeHtml(
                      post.createTime || "",
                    )}"
              >
                ${formatCreateTime(post.createTime)}
              </time>
            </footer>
          </article>
        `,
      )
      .join("")
    : `
      <div class="empty-state">
        <h2>Chưa có bài viết</h2>

        <p>
          Thử đổi bộ lọc hoặc đăng bài mới.
        </p>
      </div>
    `;

  target
    .querySelectorAll(".post-card-image")
    .forEach((image) => {
      image.addEventListener("error", () => {
        const media =
          image.closest(".post-card-media");

        if (!media) {
          return;
        }

        media.replaceChildren();

        media.classList.add(
          "post-card-image-placeholder",
        );

        media.textContent =
          "Không thể tải ảnh";
      });
    });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}
