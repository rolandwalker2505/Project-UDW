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
