export async function savePostToJson(post) {
    const response = await fetch(
        "/api/posts",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify(post),
        },
    );

    let result = {};

    try {
        result = await response.json();
    } catch {
        result = {};
    }

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Không lưu được bài đăng.",
        );
    }

    return result.post;
}

export async function updatePostInJson(
    postId,
    changes,
    studentId,
) {
    const response = await fetch(
        `/api/posts/${encodeURIComponent(postId)}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "X-Student-Id": studentId,
            },
            body: JSON.stringify(changes),
        },
    );

    let result = {};

    try {
        result = await response.json();
    } catch {
        result = {};
    }

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Không sửa được bài đăng.",
        );
    }

    return result.post;
}

async function requestPostApi(path, options, fallbackMessage) {
    const response = await fetch(path, options);

    let result = {};

    try {
        result = await response.json();
    } catch {
        result = {};
    }

    if (!response.ok) {
        throw new Error(
            result.message || fallbackMessage,
        );
    }

    return result.post;
}

export function updatePostStatusInJson(
    postId,
    status,
    studentId,
) {
    return requestPostApi(
        `/api/posts/${encodeURIComponent(postId)}/status`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "X-Student-Id": studentId,
            },
            body: JSON.stringify({ status }),
        },
        "Không cập nhật được trạng thái bài đăng.",
    );
}

export function addPostReportToJson(
    postId,
    report,
    studentId,
) {
    return requestPostApi(
        `/api/posts/${encodeURIComponent(postId)}/reports`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Student-Id": studentId,
            },
            body: JSON.stringify(report),
        },
        "Không gửi được phản hồi.",
    );
}
