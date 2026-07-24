function getFormValue(formData, fieldName) {
    return String(
        formData.get(fieldName) || "",
    ).trim();
}

const MAX_IMAGE_SIZE = 650 * 1024;

function createPostId() {
    return `post-${Date.now()}`;
}

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
    };
}
