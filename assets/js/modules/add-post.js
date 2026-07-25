// Chuẩn hóa dữ liệu lấy từ FormData về chuỗi đã loại bỏ khoảng trắng thừa.
function getFormValue(formData, fieldName) {
    return String(
        formData.get(fieldName) || "",
    ).trim();
}

const MAX_IMAGE_SIZE = 650 * 1024;

// Tạo ID tạm dựa trên thời điểm người dùng đăng bài.
function createPostId() {
    return `post-${Date.now()}`;
}

// Chuyển file ảnh sang Data URL để có thể lưu trong JSON.
function readImageAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.addEventListener("load", () => {
            resolve(reader.result);
        });

        reader.addEventListener("error", () => {
            reject(
                new Error(
                    "Không đọc được ảnh đã chọn.",
                ),
            );
        });

        reader.readAsDataURL(file);
    });
}

// Kiểm tra định dạng, dung lượng và đọc ảnh được chọn trong form.
async function getImageDataUrl(formData) {
    const image = formData.get("image");

    if (!(image instanceof File) || !image.size) {
        return null;
    }

    if (!image.type.startsWith("image/")) {
        throw new Error(
            "File được chọn không phải là ảnh.",
        );
    }

    if (image.size > MAX_IMAGE_SIZE) {
        throw new Error(
            "Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 650KB.",
        );
    }

    return readImageAsDataUrl(image);
}

// Tạo đầy đủ một bài đăng mới từ form và người dùng hiện tại.
export async function createPostFromForm(
    form,
    currentUser,
) {
    const formData = new FormData(form);

    const selectedType =
        getFormValue(formData, "type");

    const image =
        await getImageDataUrl(formData);

    return {
        id: createPostId(),

        type:
            selectedType === "found"
                ? "found"
                : "lost",

        title:
            getFormValue(formData, "title"),

        category:
            getFormValue(formData, "category"),

        creator: {
            studentId:
                currentUser?.studentId ||
                "Không xác định",

            name:
                getFormValue(
                    formData,
                    "creatorName",
                ),
        },

        content:
            getFormValue(formData, "content"),

        location:
            getFormValue(formData, "location"),

        contact:
            getFormValue(formData, "contact"),

        createTime:
            new Date().toISOString(),

        image,

        marked: false,

        status: "active",

        reports: [],
    };
}

// Chỉ tạo các trường được phép thay đổi khi chỉnh sửa bài.
export async function createPostChangesFromForm(
    form,
    existingPost,
) {
    const formData = new FormData(form);
    const replacementImage =
        await getImageDataUrl(formData);

    return {
        type:
            getFormValue(formData, "type") === "found"
                ? "found"
                : "lost",
        title: getFormValue(formData, "title"),
        category:
            getFormValue(formData, "category"),
        creator: {
            name:
                getFormValue(formData, "creatorName"),
        },
        content: getFormValue(formData, "content"),
        location:
            getFormValue(formData, "location"),
        contact: getFormValue(formData, "contact"),
        image:
            replacementImage === null
                ? existingPost.image || null
                : replacementImage,
    };
}
