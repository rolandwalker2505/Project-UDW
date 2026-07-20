# Project-UDW

Code base webclient tĩnh cho nhóm 4 người phát triển bằng HTML, CSS và JavaScript.

## Chạy trên localhost

Không cần cài dependency và không có backend/server ứng dụng. Dùng static server cục bộ để trình duyệt tải được ES Modules:

```bash
python3 -m http.server 5500
```

Mở:

```text
http://localhost:5500
```

## Cấu trúc thư mục

```text
.
├── index.html
├── assets/
│   ├── css/styles.css
│   ├── data/seed-data.js
│   └── js/
│       ├── main.js
│       └── modules/
│           ├── dashboard.js
│           ├── state.js
│           ├── storage.js
│           ├── tasks.js
│           ├── team.js
│           └── ui.js
├── docs/
│   ├── CONTRIBUTING.md
│   └── TASK-SPLIT.md
└── package.json
```

## Phân chia cho 4 người

- Người 1: layout, responsive UI, Bootstrap utilities, `index.html`, `assets/css/styles.css`.
- Người 2: quản lý task board, form thêm task, trạng thái task, `assets/js/modules/tasks.js`.
- Người 3: dashboard metrics, biểu đồ tiến độ, dữ liệu mẫu, `assets/js/modules/dashboard.js`, `assets/data/seed-data.js`.
- Người 4: team view, localStorage, theme, tài liệu, `assets/js/modules/team.js`, `assets/js/modules/storage.js`.

Chi tiết quy ước làm việc nằm trong `docs/CONTRIBUTING.md` và `docs/TASK-SPLIT.md`.

## Tính năng hiện có

- Dashboard thống kê tiến độ từ dữ liệu task.
- Task board có lọc, thêm task, chuyển trạng thái và lưu bằng `localStorage`.
- Team section hiển thị 4 thành viên và workload.
- Toggle dark mode lưu theo trình duyệt.
- Nút reset dữ liệu demo.

## Ghi chú kỹ thuật

- Bootstrap 5 và Font Awesome đang được dùng qua CDN để giảm setup.
- Vì dùng ES Modules, nên nên chạy qua `localhost`, không mở trực tiếp bằng `file://`.
- Dữ liệu chỉ nằm ở trình duyệt; refresh vẫn giữ nhờ `localStorage`.
