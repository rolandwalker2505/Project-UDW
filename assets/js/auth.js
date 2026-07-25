// Quản lý thông tin đăng nhập đơn giản bằng localStorage.
const USER_KEY = "findagain-user";

// Đọc người dùng hiện tại; trả về null nếu chưa đăng nhập hoặc dữ liệu bị lỗi.
export function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
        return null;
    }
}

// Lưu mã số sinh viên sau khi đăng nhập thành công.
export function saveCurrentUser(studentId) {
    const user = {
        studentId: studentId.trim()
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
}

// Xóa phiên đăng nhập cục bộ khi người dùng đăng xuất.
export function clearCurrentUser() {
    localStorage.removeItem(USER_KEY);
}
