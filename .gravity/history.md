# Work History & Recent Changes

Tài liệu này lưu trữ các mốc thay đổi quan trọng và lịch sử làm việc gần đây trên project.

## 1. Các Task đã hoàn thành gần đây (Recent Milestones)
- **Modernizing Debit Note Operations**:
  - Hiện đại hóa các Module Shipment Reporting (BC02, BC04-DT12, CP03).
  - Chuyển từ Layout Legacy Table sang Standardized "Solid" Card-based Design.
  - Tích hợp `app-data-table` để thống nhất Filtering và Pagination.
- **Refactoring Payment Module UI**:
  - Chuyển đổi Module Payment từ table cũ sang `app-data-table`.
  - Đồng bộ giao diện UI/UX cho toàn bộ hệ thống Payment (bao gồm cả Personal Loan).
- **Migrating Danh Muc Modules**:
  - Hiện đại hóa danh sách "Open Debit Note" sang `app-data-table`.
  - Duy trì tính năng tương đương (parity) với hệ thống cũ.
- **Fixing Angular Date Picker**:
  - Sửa lỗi Date Picker không hiển thị trong Angular 16 (fix regressed components).
  - Tích hợp `ngx-daterangepicker-bootstrap`.
- **Supplier Attachment Feature**:
  - Thêm tính năng "Chứng từ" (Attachment) cho Module Supplier.
  - Tạo `modal-attachfile` và tích hợp vào `SupplierComponent`.

## 2. Các Thay đổi Hệ thống lớn (System Migrations)
- **Angular Upgrade**: Nỗ lực nâng cấp hệ thống từ Angular 15/16 lên Angular 20/21 (đang thực hiện song song hoặc thử nghiệm).
- **Logistics-v2**: Dự án mới `logistics-v2` (Angular 21) bắt đầu import các module từ project hiện tại.

## 3. Các điểm cần chú ý (Important Context)
- Dự án `web-app-update` (Angular 15) là phiên bản ổn định đang được hiện đại hóa UI dần dần.
- `app-data-table` là trung tâm của việc thay đổi thiết kế UI.
- Luôn kiểm soát API Payload khi chuyển đổi giữa các module cũ/mới (GET/POST endpoints).

---
*Cập nhật lần cuối: 2026-03-31*
