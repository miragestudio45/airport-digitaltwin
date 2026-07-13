# GIA BINH SMART AIRPORT – Feedback V5

Đã xử lý các feedback mới:

1. **Left utility buttons**
   - Thu gọn nhóm `Show data layers / Operational overview / Operational insights` về chiều rộng ~180px.
   - Giảm nhẹ typography để panel gọn và cân đối hơn.

2. **3D floor / orbit zoom**
   - Bỏ các mặt phẳng nền trắng/opaque dưới model.
   - Chuyển sang grid floor dạng line-based với các ô nhỏ hơn để nhìn sạch hơn.
   - Tối ưu lại clipping camera khi zoom gần để hạn chế hiện tượng mất hình ở mép dưới.

3. **Walk mode**
   - Chỉnh lại vị trí vào Walk mode bám theo mốc gốc `(x=0, z=0)` với eye height mặt sàn.
   - Tăng tính ổn định của camera clip plane trong 3D.
   - Thêm **compass / la bàn** chỉ xuất hiện trong phần 3D để định hướng model.

4. **FM & Assets – Asset Registry**
   - Thu nhỏ typography của bảng dữ liệu.
   - Giảm chiều cao cell/header để bảng nhìn gọn và chuyên nghiệp hơn.

## File chính đã chỉnh
- `src/app/airport/overview/AirportOverview2D.tsx`
- `src/app/airport/overview/AirportOverview3D.tsx`
- `src/app/airport/overview/useAirport3DInteraction.ts`
- `src/app/airport/shared/AirportUI.tsx`

## Kiểm tra build
- `npm install`
- `npm run build` ✅
