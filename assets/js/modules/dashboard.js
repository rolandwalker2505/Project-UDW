import { taskStatuses } from "../../data/seed-data.js";

function calculateMetrics(tasks) {
  const total = tasks.length;
  const done = tasks.filter((task) => task.status === "done").length;
  const doing = tasks.filter((task) => task.status === "doing").length;
  const highPriority = tasks.filter((task) => task.priority === "high").length;
  const completionRate = total === 0 ? 0 : Math.round((done / total) * 100);

  return [
    {
      label: "Tổng task",
      value: total,
      icon: "fa-list-check",
    },
    {
      label: "Đang làm",
      value: doing,
      icon: "fa-spinner",
    },
    {
      label: "Ưu tiên cao",
      value: highPriority,
      icon: "fa-fire",
    },
    {
      label: "Hoàn thành",
      value: `${completionRate}%`,
      icon: "fa-circle-check",
    },
  ];
}

export function renderDashboard(state) {
  const metricCards = document.querySelector("#metricCards");
  const statusProgress = document.querySelector("#statusProgress");
  const lastUpdated = document.querySelector("#lastUpdated");

  if (!metricCards || !statusProgress || !lastUpdated) {
    return;
  }

  metricCards.innerHTML = calculateMetrics(state.tasks)
    .map(
      (metric) => `
        <div class="col-sm-6 col-lg-3">
          <article class="metric-card">
            <div class="metric-icon mb-3">
              <i class="fa-solid ${metric.icon}"></i>
            </div>
            <p class="text-secondary mb-1">${metric.label}</p>
            <strong class="fs-3">${metric.value}</strong>
          </article>
        </div>
      `,
    )
    .join("");

  const totalTasks = state.tasks.length || 1;
  statusProgress.innerHTML = taskStatuses
    .map((status) => {
      const count = state.tasks.filter((task) => task.status === status.id).length;
      const width = Math.round((count / totalTasks) * 100);

      return `
        <div
          class="progress-bar bg-${status.color}"
          role="progressbar"
          style="width: ${width}%"
          aria-valuenow="${width}"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          ${width > 10 ? `${status.label} ${width}%` : ""}
        </div>
      `;
    })
    .join("");

  lastUpdated.textContent = `Cập nhật: ${new Date().toLocaleTimeString("vi-VN")}`;
}
