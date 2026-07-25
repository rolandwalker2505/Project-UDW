# Project UDW — Đồ thất lạc

Ứng dụng hỗ trợ sinh viên đăng tin, tìm kiếm và kết nối với nhau khi làm mất hoặc nhặt được đồ.

## Chạy dự án

Yêu cầu máy đã cài Node.js.

```bash
npm start
```

Sau đó mở:

```text
http://localhost:5500
```

Không mở HTML trực tiếp bằng `file://` vì ứng dụng sử dụng ES Modules, `fetch()` và API cục bộ.

## Luồng sử dụng

1. Mở trang giới thiệu.
2. Đăng nhập bằng mã số sinh viên.
3. Xem danh sách đồ bị mất hoặc đồ nhặt được.
4. Tìm kiếm, lọc danh mục và sắp xếp bài đăng.
5. Đăng bài mới hoặc chỉnh sửa bài của mình.
6. Người khác có thể gửi phản hồi:
   - `Tôi đã tìm thấy` đối với bài tìm đồ bị mất.
   - `Tôi là chủ đồ này` đối với bài đồ nhặt được.
7. Chủ bài xem thông tin phản hồi và đánh dấu bài đã hoàn thành.
8. Bài hoàn thành có thể được mở lại khi cần.

## Chức năng

- Đăng nhập bằng mã số sinh viên.
- Giao diện Light Mode và Dark Mode.
- Đăng bài đồ bị mất hoặc đồ nhặt được.
- Thêm ảnh từ máy dưới dạng Base64.
- Chỉnh sửa bài đăng.
- Tìm kiếm theo tiêu đề, nội dung và địa điểm.
- Lọc theo loại bài, trạng thái và danh mục.
- Sắp xếp theo thời gian.
- Xem chi tiết bài đăng.
- Đánh dấu bài yêu thích.
- Lọc `Bài của tôi`.
- Gửi và xem phản hồi.
- Đánh dấu bài đã hoàn thành hoặc mở lại.
- Ngăn một tài khoản gửi phản hồi nhiều lần cho cùng một bài.

## Cấu trúc thư mục

```text
.
├── index.html
├── server.js
├── package.json
├── README.md
├── pages/
│   ├── introduction.html
│   └── login.html
└── assets/
    ├── css/
    │   ├── styles.css
    │   └── components/
    │       ├── add-post.css
    │       ├── item-detail.css
    │       └── post-status.css
    ├── data/
    │   ├── category.json
    │   ├── found-data.json
    │   └── lost-data.json
    ├── icons/
    │   └── plus-large-svgrepo-com.svg
    └── js/
        ├── auth.js
        ├── login.js
        ├── main.js
        ├── theme-init.js
        └── modules/
            ├── add-post.js
            ├── item-detail.js
            ├── posts-api.js
            ├── posts.js
            ├── state.js
            ├── storage.js
            └── theme.js
```

## Lưu trữ dữ liệu

- Bài đồ bị mất được lưu trong `assets/data/lost-data.json`.
- Bài đồ nhặt được được lưu trong `assets/data/found-data.json`.
- Danh mục được lưu trong `assets/data/category.json`.
- Trạng thái đăng nhập, giao diện và một số trạng thái ứng dụng được lưu trong `localStorage`.
- Khi đăng hoặc cập nhật bài, web gửi yêu cầu đến API trong `server.js`.
- Các thay đổi trong file JSON cần được commit và push để thành viên khác pull về.

## Lưu ý về đồng bộ

Ứng dụng chưa có máy chủ dữ liệu trực tuyến.

- Hai trình duyệt cùng truy cập một server đang chạy sẽ đọc chung dữ liệu JSON sau khi reload.
- Hai máy tự chạy `localhost` riêng sẽ không tự động đồng bộ dữ liệu.
- Muốn chia sẻ dữ liệu cho nhóm, cần commit và push các file JSON lên Git.

## Công nghệ

- HTML5
- CSS3
- JavaScript ES Modules
- LocalStorage
- Node.js HTTP API
- JSON

Dự án không sử dụng AWS, S3 hoặc database bên ngoài.
