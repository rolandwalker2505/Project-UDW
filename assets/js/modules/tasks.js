import { taskStatuses } from "../../data/seed-data.js";
import { getOwnerName, getPriorityLabel } from "./ui.js";

let selectedOwner = "all";
let selectedStatus = "all";

function createTaskCard(task, teamMembers) {
  return `
    <article class="task-card mb-3">
      <div class="d-flex justify-content-between gap-2">
        <h4 class="h6 mb-2">${task.title}</h4>
        <span class="badge text-bg-light">
          <span class="priority-dot priority-${task.priority}"></span>
          ${getPriorityLabel(task.priority)}
        </span>
      </div>
      <p class="small text-secondary mb-3">
        <i class="fa-solid fa-user me-1"></i>
        ${getOwnerName(teamMembers, task.owner)}
      </p>
      <div class="d-flex gap-2">
        ${taskStatuses
          .map(
            (status) => `
              <button
                class="btn btn-sm ${task.status === status.id ? `btn-${status.color}` : `btn-outline-${status.color}`}"
                data-task-id="${task.id}"
                data-next-status="${status.id}"
                type="button"
              >
                ${status.label}
              </button>
            `,
          )
          .join("")}
      </div>
    </article>
  `;
}

function getFilteredTasks(tasks) {
  return tasks.filter((task) => {
    const ownerMatches = selectedOwner === "all" || task.owner === selectedOwner;
    const statusMatches = selectedStatus === "all" || task.status === selectedStatus;

    return ownerMatches && statusMatches;
  });
}

export function renderTaskControls(state) {
  const ownerSelect = document.querySelector("#taskOwner");
  const filterGroup = document.querySelector("[aria-label='Task filters']");

  if (!ownerSelect || !filterGroup) {
    return;
  }

  ownerSelect.innerHTML = state.teamMembers
    .map((member) => `<option value="${member.id}">${member.name} · ${member.role}</option>`)
    .join("");

  filterGroup.innerHTML = `
    <button class="btn btn-outline-primary active" data-filter-owner="all" type="button">Tất cả</button>
    ${state.teamMembers
      .map(
        (member) => `
          <button class="btn btn-outline-primary" data-filter-owner="${member.id}" type="button">
            ${member.name}
          </button>
        `,
      )
      .join("")}
  `;
}

export function renderTasks(state) {
  const taskBoard = document.querySelector("#taskBoard");

  if (!taskBoard) {
    return;
  }

  const visibleTasks = getFilteredTasks(state.tasks);

  taskBoard.innerHTML = taskStatuses
    .map((status) => {
      const tasksByStatus = visibleTasks.filter((task) => task.status === status.id);

      return `
        <div class="col-md-4">
          <div class="card app-card h-100">
            <div class="card-body task-column">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="h6 mb-0">${status.label}</h3>
                <span class="badge text-bg-${status.color}">${tasksByStatus.length}</span>
              </div>
              ${
                tasksByStatus.length > 0
                  ? tasksByStatus.map((task) => createTaskCard(task, state.teamMembers)).join("")
                  : '<p class="text-secondary small mb-0">Không có task phù hợp.</p>'
              }
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

export function bindTaskEvents({ getState, addTask, updateTaskStatus, renderApp, notify }) {
  const taskForm = document.querySelector("#taskForm");
  const taskBoard = document.querySelector("#taskBoard");
  const filterGroup = document.querySelector("[aria-label='Task filters']");
  const statusFilter = document.querySelector("#statusFilter");

  taskForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!taskForm.checkValidity()) {
      taskForm.classList.add("was-validated");
      return;
    }

    const formData = new FormData(taskForm);
    addTask({
      title: String(formData.get("title")).trim(),
      owner: String(formData.get("owner")),
      priority: String(formData.get("priority")),
    });
    taskForm.reset();
    taskForm.classList.remove("was-validated");
    renderTaskControls(getState());
    renderApp();
    notify("Đã thêm task mới.");
  });

  taskBoard?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-task-id][data-next-status]");

    if (!button) {
      return;
    }

    updateTaskStatus(button.dataset.taskId, button.dataset.nextStatus);
    renderApp();
    notify("Đã cập nhật trạng thái task.");
  });

  filterGroup?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter-owner]");

    if (!button) {
      return;
    }

    selectedOwner = button.dataset.filterOwner;
    filterGroup.querySelectorAll("[data-filter-owner]").forEach((filterButton) => {
      filterButton.classList.toggle("active", filterButton === button);
    });
    renderTasks(getState());
  });

  statusFilter?.addEventListener("change", (event) => {
    selectedStatus = event.target.value;
    renderTasks(getState());
  });
}
