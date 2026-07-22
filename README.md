# Project UDW — Tìm lại

Webclient tĩnh giúp sinh viên đăng và tìm thông tin đồ thất lạc.

## Chạy trên localhost

```bash
npm start
```

Mở `http://localhost:5500/pages/introduction.html`.

Không mở trực tiếp bằng `file://` vì ứng dụng dùng ES Modules và `fetch()` để tải JSON.

## Flow

1. Introduction → chọn đăng nhập.
2. Login bằng mã số sinh viên.
3. Dashboard → xem lost/found, tìm kiếm, lọc danh mục, sắp xếp và đánh dấu bài viết.

## Cấu trúc

```text
.
├── index.html                  # Dashboard, yêu cầu đăng nhập
├── pages/
│   ├── introduction.html
│   └── login.html
├── assets/
│   ├── css/styles.css
│   ├── data/
│   │   ├── category.json
│   │   ├── found-data.json
│   │   └── lost-data.json
│   └── js/
│       ├── auth.js
│       ├── login.js
│       ├── main.js
│       └── modules/
│           ├── posts.js
│           ├── state.js
│           └── storage.js
├── package.json
└── README.md
```

User và application state được lưu trong `localStorage`. Dữ liệu mẫu và danh mục được tải từ các file JSON trong `assets/data`.

## Công nghệ

- HTML5
- CSS3
- JavaScript ES Modules
- Không có server backend hoặc dependency runtime bên ngoài
