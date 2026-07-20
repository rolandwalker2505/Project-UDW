# Phân chia nhiệm vụ cho nhóm 4 người

## Người 1: UI Shell

- File chính: `index.html`, `assets/css/styles.css`.
- Phạm vi: navbar, hero, spacing, responsive layout, trạng thái dark mode về mặt giao diện.
- Không nên sửa trực tiếp logic trong `assets/js/modules` trừ khi cần class hook mới.

## Người 2: Task Interaction

- File chính: `assets/js/modules/tasks.js`.
- Phạm vi: form thêm task, lọc task, chuyển trạng thái, render task board.
- Cần phối hợp với Người 4 nếu thay đổi schema dữ liệu task.

## Người 3: Dashboard & Data

- File chính: `assets/js/modules/dashboard.js`, `assets/data/seed-data.js`.
- Phạm vi: metric cards, progress bar, dữ liệu mẫu cho task và team.
- Cần giữ `taskStatuses` đồng bộ với UI task board.

## Người 4: State, Storage & Docs

- File chính: `assets/js/modules/state.js`, `assets/js/modules/storage.js`, `docs/*`, `README.md`.
- Phạm vi: localStorage, reset state, theme persistence, tài liệu chạy dự án.
- Cần review mọi thay đổi ảnh hưởng đến cấu trúc dữ liệu lưu ở trình duyệt.

## Điểm giao nhau cần cẩn thận

- `task.status` phải thuộc một trong các giá trị của `taskStatuses`.
- `task.owner` phải khớp với `teamMembers.id`.
- Nếu đổi tên field trong seed data, phải cập nhật cả dashboard, task board và team view.
- Bootstrap và Font Awesome đang dùng CDN; nếu cần chạy offline hoàn toàn thì phải tải asset về local.
