function formatCreateTime(createTime) {
    const date = new Date(createTime);

    if (Number.isNaN(date.getTime())) {
        return "Thời gian không xác định";
    }

    return date.toLocaleString("vi-VN");
}

function getCreatorName(creator) {
    if (typeof creator === "string") {
        return creator || "Không xác định";
    }

    if (creator && typeof creator === "object") {
        return (
            creator.name ||
            creator.studentId ||
            "Không xác định"
        );
    }

    return "Không xác định";
}

function getCreatorStudentId(creator) {
    if (
        creator &&
        typeof creator === "object"
    ) {
        return (
            creator.studentId ||
            "Không xác định"
        );
    }

    return "Không xác định";
}

function setText(selector, value, fallback) {
    const element = document.querySelector(selector);

    if (!element) {
        return;
    }

    element.textContent = value || fallback;
}

function updateDetailTime(createTime) {
    const timeElement =
        document.querySelector("#itemDetailTime");

    if (!timeElement) {
        return;
    }

    timeElement.dateTime = createTime || "";
    timeElement.textContent =
        formatCreateTime(createTime);
}

function updateDetailImage(post) {
    const image =
        document.querySelector("#itemDetailImage");

    const noImage =
        document.querySelector("#itemDetailNoImage");

    if (!image || !noImage) {
        return;
    }

    image.onerror = null;

    if (!post.image) {
        image.hidden = true;
        image.removeAttribute("src");
        image.alt = "";

        noImage.hidden = false;
        noImage.textContent = "Chưa có ảnh";

        return;
    }

    image.src = post.image;
    image.alt = post.title
        ? `Ảnh của bài đăng: ${post.title}`
        : "Ảnh bài đăng";

    image.hidden = false;
    noImage.hidden = true;

    image.onerror = () => {
        image.hidden = true;
        image.removeAttribute("src");
        image.alt = "";

        noImage.hidden = false;
        noImage.textContent = "Không thể tải ảnh";
    };
}

export function showItemDetail(
    post,
    categoryLabel,
) {
    const dialog =
        document.querySelector("#itemDetailDialog");

    if (
        !dialog ||
        typeof dialog.showModal !== "function"
    ) {
        console.error(
            "Không tìm thấy hộp thoại chi tiết.",
        );

        return;
    }

    setText(
        "#itemDetailTitle",
        post.title,
        "Không có tiêu đề",
    );

    setText(
        "#itemDetailCategory",
        categoryLabel || post.category,
        "Chưa phân loại",
    );

    setText(
        "#itemDetailCreator",
        getCreatorName(post.creator),
        "Không xác định",
    );

    setText(
        "#itemDetailStudentId",
        getCreatorStudentId(post.creator),
        "Không xác định",
    );

    setText(
        "#itemDetailLocation",
        post.location,
        "Chưa có thông tin",
    );

    setText(
        "#itemDetailContact",
        post.contact,
        "Chưa có thông tin",
    );

    setText(
        "#itemDetailContent",
        post.content,
        "Không có nội dung",
    );

    updateDetailTime(post.createTime);
    updateDetailImage(post);

    if (!dialog.open) {
        dialog.showModal();
    }
}
