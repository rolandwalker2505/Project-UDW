export function getOwnerName(teamMembers, ownerId) {
  return teamMembers.find((member) => member.id === ownerId)?.name || "Chưa rõ";
}

export function getPriorityLabel(priority) {
  const labels = {
    high: "Cao",
    medium: "Trung bình",
    low: "Thấp",
  };

  return labels[priority] || priority;
}

export function showToast(message) {
  const toastElement = document.querySelector("#appToast");
  const toastBody = toastElement?.querySelector(".toast-body");

  if (!toastElement || !toastBody || !window.bootstrap) {
    return;
  }

  toastBody.textContent = message;
  window.bootstrap.Toast.getOrCreateInstance(toastElement).show();
}

export function createElementFromHTML(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}
