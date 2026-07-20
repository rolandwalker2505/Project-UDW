import { renderDashboard } from "./modules/dashboard.js";
import { getState, resetState, updateTasks } from "./modules/state.js";
import { clearState, loadTheme, saveTheme } from "./modules/storage.js";
import { bindTaskEvents, renderTaskControls, renderTasks } from "./modules/tasks.js";
import { renderTeam } from "./modules/team.js";
import { showToast } from "./modules/ui.js";

function renderApp() {
  const state = getState();
  renderDashboard(state);
  renderTasks(state);
  renderTeam(state);
}

function addTask(taskInput) {
  updateTasks((tasks) => [
    ...tasks,
    {
      id: crypto.randomUUID(),
      title: taskInput.title,
      owner: taskInput.owner,
      priority: taskInput.priority,
      status: "todo",
      createdAt: new Date().toISOString(),
    },
  ]);
}

function updateTaskStatus(taskId, nextStatus) {
  updateTasks((tasks) =>
    tasks.map((task) => (task.id === taskId ? { ...task, status: nextStatus } : task)),
  );
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

function bindGlobalEvents() {
  const themeToggle = document.querySelector("#themeToggle");
  const resetDataButton = document.querySelector("#resetDataButton");

  themeToggle?.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    saveTheme(nextTheme);
    showToast(`Đã chuyển sang ${nextTheme === "dark" ? "dark" : "light"} mode.`);
  });

  resetDataButton?.addEventListener("click", () => {
    clearState();
    resetState();
    renderTaskControls(getState());
    renderApp();
    showToast("Đã reset dữ liệu demo.");
  });
}

function boot() {
  applyTheme(loadTheme());
  renderTaskControls(getState());
  renderApp();
  bindGlobalEvents();
  bindTaskEvents({
    getState,
    addTask,
    updateTaskStatus,
    renderApp,
    notify: showToast,
  });
}

boot();
