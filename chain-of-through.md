# Kiến trúc Project UDW

## 1. Hiện trạng

Project UDW là frontend tĩnh dành cho cộng đồng sinh viên tìm kiếm và đăng thông tin về đồ thất lạc.

Screen hiện tại:

- `introduction.html`: trang giới thiệu và nút `Đăng nhập`.
- Screen đăng nhập và dashboard: chưa triển khai.

Công nghệ hiện tại:

- HTML5
- CSS3 thuần
- JavaScript module thuần
- Không dùng Bootstrap.
- Không dùng Font Awesome.
- Chưa có backend.

## 2. Cấu trúc source hiện tại

```text
Project-UDW/
├── pages/
│   └── introduction.html       # Screen 1: giới thiệu
├── assets/
│   ├── css/
│   │   └── styles.css          # Toàn bộ CSS hiện tại
│   ├── data/
│   │   └── seed-data.js
│   └── js/
│       ├── main.js             # Entry point của Screen 1
│       └── modules/             # Module cũ, dành cho quá trình chuyển đổi
│           ├── dashboard.js
│           ├── state.js
│           ├── storage.js
│           ├── tasks.js
│           ├── team.js
│           └── ui.js
├── docs/
│   ├── CONTRIBUTING.md
│   └── TASK-SPLIT.md
├── package.json
├── README.md
└── chain-of-through.md
```

## 3. Screen 1: Introduction

### File sử dụng

| File | Vai trò |
|---|---|
| `pages/introduction.html` | Markup trang giới thiệu, nội dung hero và nút đăng nhập. |
| `assets/css/styles.css` | Layout, màu sắc, typography, responsive và trạng thái focus/hover. |
| `assets/js/main.js` | Bắt sự kiện nút `Đăng nhập`, phát event `findagain:login-requested`. |

### Liên kết file

```text
pages/introduction.html
├── ../assets/css/styles.css
└── ../assets/js/main.js
```

Trang không dùng thư viện UI hoặc icon bên ngoài.

## 4. Cách chạy

Tại thư mục gốc dự án:

```bash
npm start
```

Mở:

```text
http://localhost:5500/pages/introduction.html
```

Hoặc dùng:

```bash
python3 -m http.server 5500
```

Không mở trực tiếp bằng `file://` vì JavaScript module có thể bị trình duyệt chặn.

## 5. Quy tắc thêm chức năng

- Nội dung Screen 1 đặt trong `pages/introduction.html`.
- Style Screen 1 đặt trong `assets/css/styles.css`.
- Logic tương tác đặt trong `assets/js/main.js` hoặc module riêng khi logic đủ lớn.
- Không thêm Bootstrap, Font Awesome hoặc thư viện mới nếu chưa thống nhất.
- Không trộn logic Screen 2/3 vào Screen 1.
- Khi tạo Screen 2 hoặc Screen 3, tạo file HTML riêng trong `pages/`.
- Cập nhật tài liệu này khi thay đổi tree hoặc cách chạy.

## 6. Kế hoạch chuyển đổi

1. Hoàn thiện Screen 1: introduction.
2. Tạo Screen 2: đăng nhập bằng mã sinh viên.
3. Chuẩn hóa dữ liệu đồ thất lạc.
4. Tạo Screen 3: dashboard tìm kiếm và đăng bài.
5. Xóa các module task/team cũ sau khi dashboard mới thay thế hoàn toàn.
