# BMS 3D Model Assets

Đặt các file .glb / .gltf vào thư mục này. Tên file phải khớp chính xác với bảng bên dưới.

## Mapping file → thiết bị

| Tên file (đặt vào thư mục này) | Thiết bị | Model URL trong app |
|---|---|---|
| `ahu.glb` | Air Handling Unit (AHU) | `/models/bms/ahu.glb` |
| `fcu.glb` | Fan Coil Unit (FCU) | `/models/bms/fcu.glb` |
| `chiller.glb` | Chiller / Máy làm lạnh | `/models/bms/chiller.glb` |
| `plate-heat-exchanger.glb` | Plate Heat Exchanger | `/models/bms/plate-heat-exchanger.glb` |

## Nguồn asset

Google Drive folder:
https://drive.google.com/drive/folders/1u2MCQJDbe_JhCOpnsAGkEhQu4Hw2K0vW

Tải từng file về, đổi tên theo bảng trên, rồi copy vào thư mục này (`public/models/bms/`).

## Lưu ý kỹ thuật

- Vite tự động serve toàn bộ nội dung trong `public/` tại root URL.
- File đặt tại `public/models/bms/ahu.glb` → load qua URL `/models/bms/ahu.glb`.
- Hỗ trợ cả `.glb` (binary GLTF) và `.gltf` (JSON + assets tách rời).
- Nếu dùng `.gltf` có texture/bin riêng, đặt tất cả file phụ trong cùng thư mục.
- Khi file chưa có, viewer tự hiện placeholder geometry + thông báo rõ ràng.
