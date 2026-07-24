import { saveCurrentUser, getCurrentUser } from "./auth.js";
const form = document.querySelector("#loginForm");
const error = document.querySelector("#loginError");

if (getCurrentUser()) {
  window.location.replace("../index.html");
}

form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.checkValidity()) {
        error.hidden = false; return;
    } saveCurrentUser(new FormData(form).get("studentId"));
    window.location.href = "../index.html";
});
