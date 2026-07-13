# Các chỉnh sửa trong bản Airport-only

1. Loại bỏ luồng chạy Global, Viettel Đà Nẵng và IOC khỏi router.
2. Route `/` và mọi URL không hợp lệ đều chuyển tới `/site/gia-binh`.
3. Bỏ nút Global khỏi Header.
4. Sidebar Module Navigation mặc định ẩn, hiển thị dạng drawer và tự đóng sau khi chọn mục.
5. Overview 2D/3D được chuyển thành workspace toàn màn hình.
6. 15 KPI không còn chiếm 3 hàng cố định:
   - 5 KPI chính hiển thị dạng HUD nhỏ.
   - Toàn bộ KPI nằm trong Operational Overview drawer.
   - Biểu đồ, timeline và incident feed nằm trong Operational Insights drawer.
7. Data Layers chuyển thành panel bật/tắt.
8. Thêm chuyển ngôn ngữ ENG/VNI; mặc định VNI và lưu lựa chọn trong localStorage.
9. Nén ảnh overview từ PNG 6.4 MB thành WebP khoảng 758 KB.
10. Thêm `OPEN_GIA_BINH.cmd` để tự cài dependency, chạy server và mở đúng URL.
11. Build đã kiểm tra thành công bằng `npm run build`.
