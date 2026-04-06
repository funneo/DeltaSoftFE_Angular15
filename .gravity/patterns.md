# Coding Patterns & Design Standard

Phần này tài liệu hóa các tiêu chuẩn lập trình và thiết kế của dự án, nhằm duy trì tính nhất quán.

## 1. Hệ thống Thiết kế "Solid" (Solid Design System)
- **Mục tiêu**: Hiện đại hóa các giao diện cũ (Legacy Table) sang thiết kế dạng Card-based hiện đại.
- **Thanh tiêu đề (Header)**: Phải chứa các Summary (Tóm tắt tài chính, Trạng thái) trong các "Box" hoặc "Card".
- **Bố cục (Layout)**: Sử dụng các lớp CSS tiêu chuẩn từ AdminLTE và Bootstrap:
  - `.box .box-primary` cho khung container.
  - `.box-header` cho phần tiêu đề và các nút chức năng.
  - `.box-body` cho danh sách bản ghi.
  - `.box-footer` cho phân trang (Pagination).

## 2. Quy tắc lập trình (Coding Standards)
- **Tên Component**: Các modal bắt đầu bằng `modal-` (ví dụ: `modal-supplier.component.ts`).
- **Data Table**: Ưu tiên sử dụng component `app-data-table` (được hiện đại hóa từ các table thuần cũ) để đảm bảo:
  - Tích hợp sẵn Phân trang (Pagination).
  - Tích hợp sẵn Tìm kiếm/Lọc (Filtering).
  - Tích hợp sẵn Loading State qua `ngx-spinner`.
- **API Handling**:
  - Luôn sử dụng các service trong `src/app/shared/services`.
  - Xử lý lỗi tập trung qua `NotificationService`.
  - Map dữ liệu từ API sang Model trước khi hiển thị (Mapping patterns).

## 3. Tác phong làm việc (Working Style)
- **Sửa đổi (Refactoring)**: Khi làm việc với các Module cũ, hãy cân nhắc nâng cấp từ Table HTML sang `app-data-table` và thiết kế Card-based.
- **Tính năng mới (Feature)**: Luôn đi kèm với:
  - Xử lý Loading: Phải có Spinner khi tải dữ liệu.
  - Thông báo (Alert): Thành công/Thất bại.
  - Phân quyền (Permission): Áp dụng đúng `appFunction`, `appAction`.
- **Debug**: Kiểm tra cẩn thận các API endpoint (GET vs POST) và kiểu dữ liệu ngày tháng (Date picker bootstrap).

## 4. Modal Interactions
- Các modal thường được điều khiển qua `*ngIf="viewModal"`.
- Hai sự kiện chuẩn: `(SaveSuccess)="saveSuccess()"` và `(CloseModal)="closeModal()"`.
