import { saveCurrentUser, getCurrentUser } from "./auth.js";

// Lấy các phần tử của form đăng nhập và khai báo quy tắc mã sinh viên.
const form = document.querySelector("#loginForm");
const error = document.querySelector("#loginError");
const studentIdInput = document.querySelector("#studentId");
const submitButton = form.querySelector('button[type="submit"]');
const appLoading = document.querySelector("#appLoading");
const appLoadingMessage = document.querySelector("#appLoadingMessage");
const STUDENT_ID_PATTERN = /^[0-9]{10}$/;

// Người dùng đã đăng nhập thì không cần quay lại trang login.
if (getCurrentUser()) {
    window.location.replace("../index.html");
}

// Hiển thị trạng thái lỗi cho cả người dùng thường và trình đọc màn hình.
function showValidationError() {
    error.hidden = false;
    studentIdInput.setAttribute("aria-invalid", "true");
}

// Xóa lỗi ngay khi người dùng nhập lại mã sinh viên.
function clearValidationError() {
    error.hidden = true;
    studentIdInput.removeAttribute("aria-invalid");
    studentIdInput.setCustomValidity("");
}

// Hiển thị hiệu ứng ngắn trong lúc chuyển từ login sang dashboard.
function showLoginLoading(message) {
    if (!appLoading) {
        return;
    }

    appLoadingMessage.textContent = message;
    appLoading.hidden = false;
    document.body.setAttribute("aria-busy", "true");
}

// Đồng bộ thông báo lỗi với cơ chế validation có sẵn của trình duyệt.
studentIdInput.addEventListener("input", clearValidationError);
studentIdInput.addEventListener("invalid", showValidationError);

// Chỉ lưu đăng nhập khi mã sinh viên gồm đúng 10 chữ số.
form.addEventListener("submit", (event) => {
    event.preventDefault();

    const studentId = studentIdInput.value.trim();

    if (!STUDENT_ID_PATTERN.test(studentId)) {
        studentIdInput.setCustomValidity(
            "Mã số sinh viên phải gồm đúng 10 chữ số.",
        );
        showValidationError();
        studentIdInput.reportValidity();
        return;
    }

    saveCurrentUser(studentId);
    submitButton.disabled = true;
    showLoginLoading("Đang đăng nhập...");

    window.setTimeout(() => {
        window.location.href = "../index.html";
    }, 350);
});
