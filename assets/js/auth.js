const USER_KEY = "findagain-user";
export function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
        return null;
    }
}

export function saveCurrentUser(studentId) {
    const user = {
        studentId: studentId.trim()
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
}

export function clearCurrentUser() {
    localStorage.removeItem(USER_KEY);
}
