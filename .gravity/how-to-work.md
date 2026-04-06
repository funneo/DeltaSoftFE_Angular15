# How to Work Efficiently with this Project

Dành cho AI và Lập trình viên mới tiếp cận project này:

## 1. Trước khi bắt đầu một Task (Before starting)
- **Đọc `architecture.md`**: Để hiểu tech stack và cấu trúc thư mục.
- **Xem `history.md`**: Để biết các công việc gần đây và các module đã được hiện đại hóa.
- **Tham khảo `patterns.md`**: Để không viết lại Code theo kiểu Legacy (bác bỏ Table HTML thuần, ưu tiên `app-data-table`).

## 2. Quy trình làm việc (General Workflow)
- **Khám phá (Explore)**: Luôn bắt đầu bằng việc tìm kiếm component tương ứng trong `src/app/main` hoặc `src/app/shared/components`.
- **Sao chép Pattern (Copy Patterns)**: Nếu một module cũ chưa được nâng cấp, hãy mượn thiết kế từ một module đã nâng cấp (ví dụ: `shipments` hoặc `payment`).
- **Data Binding**: Kiểm tra kỹ các Model trong `src/app/shared/models` để đảm bảo dữ liệu hiển thị chính xác.
- **Xử lý sự kiện (Events)**: Tuân thủ các chuẩn sự kiện Input/Output của hệ thống.

## 3. Các thao tác phổ biến (Common Tasks)
- **Thêm Cột vào Table**:
  - Tìm định nghĩa `columns` (thường trong TypeScript component).
  - Cập nhật header và body tương ứng.
- **Thêm Modal mới**:
  - Tạo component mới trong `shared/components`.
  - Khai báo trong module phù hợp.
  - Sử dụng `<modal-...>` trong HTML cha và điều khiển bằng biến cờ (boolean flag).
- **Fix lỗi API**:
  - Kiểm tra service call trong `src/app/shared/services`.
  - Đối chiếu với Response của API qua DevTools.

## 4. Chú ý đặc biệt (Special Warnings)
- **Boilerplate**: Hệ thống có nhiều code boilerplate cho CRUD, hãy cẩn thận khi copy để tránh lỗi reference.
- **Z-Index**: Cần kiểm tra kỹ các modal lồng nhau (nested modals) để tránh lỗi hiển thị.
- **Dates**: Luôn sử dụng `moment.js` (đã cài đặt) để xử lý ngày tháng thống nhất.

---
*Antigravity AI - Hỗ trợ lập trình viên DeltaSoft*
