# Gia Binh Smart Airport Digital Twin Platform

Bản source độc lập dành riêng cho **Smart Airport Digital Twin Platform**. Bản Viettel Đà Nẵng và các route Global/IOC cũ đã được loại khỏi luồng chạy.

## Mở nhanh trên Windows

Nhấp đúp:

```text
OPEN_GIA_BINH.cmd
```

File sẽ tự:

1. Kiểm tra Node.js/npm.
2. Cài thư viện nếu chưa có `node_modules`.
3. Chạy Vite tại cổng 5173.
4. Mở trực tiếp `http://localhost:5173/site/gia-binh`.

## Chạy thủ công

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

Mở:

```text
http://localhost:5173/site/gia-binh
```

## Build

Nhấp đúp `BUILD_GIA_BINH.cmd` hoặc chạy:

```bash
npm run build
```

## Các thay đổi chính

- `/` tự chuyển thẳng sang `/site/gia-binh`.
- Không còn nút Global và không còn route Viettel Đà Nẵng trong bản bàn giao này.
- Sidebar Module Navigation mặc định ẩn, mở bằng nút nổi bên trái và tự đóng sau khi chọn mục.
- Overview 2D/3D chiếm toàn bộ workspace.
- KPI được chuyển thành HUD gọn; dashboard chi tiết và biểu đồ nằm trong drawer bật/tắt.
- Có lựa chọn ngôn ngữ `ENG / VNI`; mặc định là tiếng Việt.
- Chế độ 3D vẫn dùng shell Three.js và sẵn sàng nhận GLB sau này.

## Gắn model GLB sân bay

Sửa file:

```text
src/app/airport/overview/airport3DConfig.ts
```

Điền `modelUrl`, sau đó cập nhật target trong:

```text
src/app/airport/overview/airport3DTargets.ts
```

Xem thêm `AIRPORT_3D_INTEGRATION.md`.
