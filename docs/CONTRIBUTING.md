# Quy ước phát triển

## Nguyên tắc

- Giữ dự án client-only: không thêm backend, database hoặc API server nếu chưa thống nhất lại scope.
- Ưu tiên HTML semantic, CSS dễ đọc, JavaScript module nhỏ và rõ trách nhiệm.
- Không đưa logic nghiệp vụ trực tiếp vào `index.html`; đặt trong `assets/js/modules`.
- Không hard-code dữ liệu lặp lại ở nhiều nơi; dữ liệu mẫu nằm trong `assets/data/seed-data.js`.
- Kiểm tra trên `http://localhost:5500`, không chỉ mở bằng `file://`.

## Quy trình làm việc

1. Pull code mới nhất trước khi sửa.
2. Tạo nhánh theo format `feature/ten-ngan-gon`.
3. Sửa đúng module mình phụ trách.
4. Chạy `python3 -m http.server 5500`.
5. Kiểm tra Chrome/Edge ở desktop và mobile viewport.
6. Tạo pull request kèm ảnh hoặc mô tả UI thay đổi.

## Quy ước code

- HTML: dùng class Bootstrap trước, custom class sau.
- CSS: dùng biến trong `:root`, tránh màu hard-code tràn lan.
- JS: dùng `const` mặc định, `let` khi cần gán lại, không dùng biến một chữ cái.
- Function nên làm một việc cụ thể và đặt tên theo hành động.
- Commit nhỏ, mô tả rõ kết quả thay vì chỉ ghi `update`.

## Definition of Done

- Tính năng chạy trên localhost.
- Không có lỗi console khi load trang.
- UI responsive ở mobile và desktop.
- Tương tác JS có phản hồi rõ cho người dùng.
- README hoặc docs được cập nhật nếu thay đổi cách chạy hoặc cấu trúc.
