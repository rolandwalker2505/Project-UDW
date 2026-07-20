export function renderTeam(state) {
  const teamGrid = document.querySelector("#teamGrid");

  if (!teamGrid) {
    return;
  }

  teamGrid.innerHTML = state.teamMembers
    .map((member) => {
      const assignedTasks = state.tasks.filter((task) => task.owner === member.id);
      const doneTasks = assignedTasks.filter((task) => task.status === "done").length;
      const workload = assignedTasks.length;

      return `
        <div class="col-md-6 col-xl-3">
          <article class="card app-card h-100">
            <div class="card-body">
              <div class="team-avatar mb-3">${member.name.charAt(0)}</div>
              <h3 class="h5 mb-1">${member.name}</h3>
              <p class="text-secondary mb-2">${member.role}</p>
              <p class="small mb-3">${member.focus}</p>
              <div class="d-flex justify-content-between small">
                <span>Task: <strong>${workload}</strong></span>
                <span>Done: <strong>${doneTasks}</strong></span>
              </div>
            </div>
          </article>
        </div>
      `;
    })
    .join("");
}
