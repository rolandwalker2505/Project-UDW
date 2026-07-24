# Project UDW — Tìm lại

Ứng dụng web giúp sinh viên đăng và tìm thông tin đồ thất lạc.

## Chạy trên localhost

```bash
npm start
```

Mở `http://localhost:5500/pages/introduction.html`.

Không mở trực tiếp bằng `file://` vì ứng dụng dùng ES Modules, `fetch()` và API cục bộ để lưu JSON.

## Flow

1. Introduction → chọn đăng nhập.
2. Login bằng mã số sinh viên.
3. Dashboard → xem, đăng bài mới, tìm kiếm, lọc danh mục, sắp xếp, xem chi tiết và đánh dấu bài viết.

## Cấu trúc

```text
.
├── index.html                  # Dashboard, yêu cầu đăng nhập
├── server.js                   # Static server và API lưu bài đăng
├── pages/
│   ├── introduction.html
│   └── login.html
├── assets/
│   ├── css/
│   │   ├── styles.css
│   │   └── components/
│   │       ├── add-post.css
│   │       └── item-detail.css
│   ├── data/
│   │   ├── category.json
│   │   ├── found-data.json
│   │   └── lost-data.json
│   └── js/
│       ├── auth.js
│       ├── login.js
│       ├── main.js
│       ├── theme-init.js
│       └── modules/
│           ├── add-post.js
│           ├── item-detail.js
│           ├── posts.js
│           ├── posts-api.js
│           ├── state.js
│           ├── storage.js
│           └── theme.js
├── package.json
└── README.md
```

User và application state được lưu trong `localStorage`. Khi đăng bài, webclient gửi `POST /api/posts` để Node.js ghi bài vào `lost-data.json` hoặc `found-data.json`. Danh mục và bài đăng được tải từ các file JSON trong `assets/data`.

## Lưu bài đăng

- Bài `lost` được ghi vào `assets/data/lost-data.json`.
- Bài `found` được ghi vào `assets/data/found-data.json`.
- Hai file JSON thay đổi sau khi đăng bài nên cần được commit và push để các thành viên khác pull về.
- Dự án không sử dụng AWS hoặc S3.

## Công nghệ

- HTML5
- CSS3
- JavaScript ES Modules
- Node.js API cục bộ, không dùng dependency bên ngoài
