function getFormValue(formData, fieldName) {
    return String(
        formData.get(fieldName) || "",
    ).trim();
}

function createPostId() {
    return `post-${Date.now()}`;
}

export function createPostFromForm(
    form,
    currentUser,
) {
    const formData = new FormData(form);

    const selectedType =
        getFormValue(formData, "type");

    const image =
        getFormValue(formData, "image");

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

        image: image || null,

        marked: false,
    };
}
