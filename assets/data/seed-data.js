export const teamMembers = [
  {
    id: "an",
    name: "An",
    role: "UI Developer",
    focus: "Layout, responsive, Bootstrap",
  },
  {
    id: "binh",
    name: "Bình",
    role: "Interaction Developer",
    focus: "Task board, form, events",
  },
  {
    id: "chi",
    name: "Chi",
    role: "Dashboard Developer",
    focus: "Metrics, progress, seed data",
  },
  {
    id: "dung",
    name: "Dũng",
    role: "State & Docs Owner",
    focus: "localStorage, theme, docs",
  },
];

export const taskStatuses = [
  { id: "todo", label: "Todo", color: "secondary" },
  { id: "doing", label: "Doing", color: "primary" },
  { id: "done", label: "Done", color: "success" },
];

export const seedTasks = [
  {
    id: "task-hero",
    title: "Dựng hero section responsive",
    owner: "an",
    priority: "high",
    status: "done",
    createdAt: "2026-07-20T08:00:00.000Z",
  },
  {
    id: "task-board",
    title: "Hoàn thiện task board tương tác",
    owner: "binh",
    priority: "high",
    status: "doing",
    createdAt: "2026-07-20T08:20:00.000Z",
  },
  {
    id: "task-dashboard",
    title: "Tính metrics từ dữ liệu task",
    owner: "chi",
    priority: "medium",
    status: "doing",
    createdAt: "2026-07-20T08:40:00.000Z",
  },
  {
    id: "task-storage",
    title: "Lưu dữ liệu demo bằng localStorage",
    owner: "dung",
    priority: "medium",
    status: "todo",
    createdAt: "2026-07-20T09:00:00.000Z",
  },
];
