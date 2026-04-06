# Project Architecture Docs

Dự án này là hệ thống **DeltaSoftFE_Angular15**, một ứng dụng quản lý Logistics/Phát hàng (Shipments, Accounting, HR, etc.).

## 1. Công nghệ chính (Tech Stack)
- **Framework**: Angular 15.2.x.
- **Styling**: Bootstrap 3.3.x, AdminLTE 2.x (Dashboard Template).
- **Thư viện đồ họa**: Chart.js, Highcharts.
- **Thư viện UI bổ trợ**: ngx-bootstrap, ng-select, ngx-spinner, ngx-daterangepicker-bootstrap.
- **Real-time**: SignalR (@aspnet/signalr).
- **Backend/Storage**: AngularFire (Firebase) cho một số tính năng thông báo/dữ liệu.

## 2. Cấu trúc Project (Project Structure)
Dự án được chia theo các Module nghiệp vụ chính trong `src/app/main`:
- **accounting**: Quản lý kế toán, thu/chi, Debit Note.
- **shipments**: Quản lý các lô hàng, vận đơn.
- **danhmuc**: Danh mục hệ thống (Supplier, Customer, Employee, Branch, etc.).
- **hrm**: Quản lý nhân sự, ngày phép, đào tạo.
- **transports**: Quản lý vận chuyển, xe, dầu, lộ trình.
- **workflows**: Quy trình làm việc, phân công công việc.
- **shared**: Chứa các component dùng chung, service, directive, pipe, model và guard.

## 3. Hệ thống Shared (Shared Core)
- **Components**: Các modal-based components thường nằm trong `src/app/shared/components`.
- **Services**: `UtilityService`, `NotificationService` là các service cốt lõi.
- **Interceptors**: `AuthInterceptor` xử lý authentication qua JWT.

## 4. Đặc điểm nổi bật
- Hệ thống sử dụng rất nhiều **Modals** cho các thao tác Thêm/Sửa/Xem chi tiết.
- Các component thường giao tiếp qua các **Input/Output** sự kiện như `SaveSuccess`, `CloseModal`.
- Phân quyền (Permission) được áp dụng trực tiếp trên UI qua directive `appPermission`.
