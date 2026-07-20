function bindGlobalEvents() {
  const loginButton = document.querySelector("#loginButton");

  loginButton?.addEventListener("click", () => {
    document.dispatchEvent(new CustomEvent("findagain:login-requested"));
  });
}

bindGlobalEvents();
