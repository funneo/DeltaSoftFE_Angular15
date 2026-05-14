# Pending / In-Progress Work

## Refactor TO ↔ FCL Architecture — DESIGN DONE / SQL WRITTEN (2026-05-14)

### Tiến độ hiện tại
- ✅ Khảo sát schema TO + FCL
- ✅ Chốt design (3 câu hỏi đã xác nhận)
- ✅ Viết `Migration_TO_FCL_Phase1A_20260514.sql` (chờ chạy SSMS tối nay)
- ✅ Viết `Migration_TO_FCL_Phase1C_20260514.sql` (chờ — sau khi BE/FE deploy)
- ⏳ Mai: refactor BE (TransportOrderRepository + DispatchOrderFCLRepository transaction)
- ⏳ Mai: refactor FE (modal-transport-order strip + modal-dispatch-order-fcl tích hợp + TO list read-only)


### Mục tiêu
- **TO** trở thành module cung đường thuần (segments + km + trạm thu phí)
- **FCL** chứa toàn bộ xe/lái xe/ghi chú/tóm tắt/duyệt — link sang TO qua `TransportOrderId` FK
- **Quan hệ 1-1 bắt buộc**: tạo FCL phải tạo TO cùng lúc (transactional). Không có flow tạo TO độc lập.
- **Không có nhân bản FCL**
- **Dùng chung table `Tbl_DispatchOrderFCL`** + thêm field `IsLegacy` phân biệt lệnh cũ vs mới
- **TO list page** giữ vai trò read-only route viewer; muốn sửa → mở FCL gốc
- **RefNo**: TO + FCL giữ RefNo độc lập song song (vd `TO-2026-001` + `FCL-2026-001`)

### Design đã chốt (2026-05-14)
- ✅ `IsLegacy` default: record cũ UPDATE thành 1, record mới = 0
- ✅ Phase 1C tách riêng, chạy sau khi deploy ổn
- ✅ Không backfill TO cho lệnh FCL cũ; FE detect `IsLegacy=1` → read-only
- ✅ **Đổi hướng link** (giảm ảnh hưởng FCL): link bên TO (`Tbl_TransportOrders.FclRefNo`) thay vì FCL trỏ sang TO

### Schema design (đã khảo sát xong)
**Giữ trên `Tbl_TransportOrders`** (TO trim):
- Id (INT IDENTITY), RefNo, BranchId, ShortWay, FullRoute, TongKm, Status (giảm còn 2 trạng thái: 0=Draft, 1=Locked)
- **`FclRefNo NVARCHAR(50) NULL` mới — link sang DispatchOrderFCL.RefNo (UNIQUE)**
- Audit: CreatedDate/By/ByName, UpdatedBy/Date, Deleted
- Quan hệ: Tbl_TransportOrder_Segments (Id, TransportOrderId, OrderIndex, Start/End Location*, DistanceKm, FuelNorm, FuelAmountCalculated, ETCCost, RoutePolyline, Note, listStations, listWaypoints)
- Tbl_TransportOrder_Segment_Stations + Tbl_TransportOrder_Segment_Waypoints — giữ nguyên

**Drop khỏi `Tbl_TransportOrders`** (~40 cột chuyển sang FCL):
- ShippingUnit*, Vehicle*, Mooc*, Driver*, SecondDriver*, FuelDriverId, Weight, Volume, IsExport, ContType
- OilPrice, OilCompensation, ReasonOilCompensation, Subcontractors*, DispatchSummarize, InquiryTime*, ContactInformation, Note
- StartVehicleOdor/StartEupOdor/FinishVehicleOdor/FinishEupOdor, Grade*, Evaluation*
- Started/Finished/NoteFinished/FinishedDate, IsDeny, Feedback, ClosingBy/Date
- IsFuelApproval, IsRePaymentEtc, IsEmployeeDebitClosing, Tongdau, Chiphidau, IsSummarized, AccountingDate

**Drop tables** (FCL đã có tương đương):
- `Tbl_TransportOrder_Fees` → dùng `DispatchOrderFCLFee`
- `Tbl_TransportOrder_Details` → dùng `DispatchOrderFclDetailed`

**ADD vào `DispatchOrderFCL`** (chạm tối thiểu):
- `IsLegacy BIT NOT NULL DEFAULT 0` — record cũ UPDATE thành 1 ngay sau ADD
- ❌ KHÔNG thêm `TransportOrderId` (đã đổi sang link bên TO)

### Flow tạo lệnh mới (transactional)
1. Generate FCL RefNo trước (logic hiện có)
2. INSERT TO với `FclRefNo = newFclRefNo` → lấy `newToId`
3. INSERT FCL với `RefNo = newFclRefNo, IsLegacy = 0`
4. COMMIT

### Lookup
- Mở FCL: nếu `IsLegacy=1` → FE hiện banner "Lệnh legacy", ẩn nút "Thiết kế cung đường"
- Mở FCL: nếu `IsLegacy=0` → query `Tbl_TransportOrders WHERE FclRefNo = @fclRefNo` lấy TO data

### Migration 3 phase
- **Phase 1A** `Migration_TO_FCL_Phase1A_20260514.sql` (non-breaking):
  - ALTER TABLE DispatchOrderFCL ADD IsLegacy BIT NOT NULL DEFAULT 0
  - UPDATE existing FCL records SET IsLegacy = 1
  - ALTER TABLE Tbl_TransportOrders ADD FclRefNo NVARCHAR(50) NULL
  - ADD UNIQUE constraint `UQ_TransportOrders_FclRefNo` (filtered: WHERE FclRefNo IS NOT NULL)
  - CREATE INDEX `IX_TransportOrders_FclRefNo`
- **Phase 1B** Backfill — **SKIP** (đã chốt không backfill)
- **Phase 1C** `Migration_TO_FCL_Phase1C_20260514.sql` (chạy sau khi deploy ổn 1-2 tuần):
  - DROP các cột không dùng trên Tbl_TransportOrders (~40 cột)
  - DROP TABLE Tbl_TransportOrder_Fees
  - DROP TABLE Tbl_TransportOrder_Details
  - DROP TVP / SP liên quan

### TODO sau khi user xác nhận 3 câu hỏi
- [ ] Viết `Phase1A_TO_FCL_Refactor_ColumnAdd.sql`
- [ ] Viết `Phase1C_TO_Cleanup.sql`
- [ ] **BE — TransportOrderRepository**: cắt vehicle/driver/approval khỏi Create/Update; giữ Create chỉ nhận route data
- [ ] **BE — DispatchOrderFCLRepository**: `CreateAsync` wrap trong `BEGIN TRAN` → tạo TO trước (lấy `newToId`) → tạo FCL với `TransportOrderId = newToId, IsLegacy = 0` → COMMIT/ROLLBACK
- [ ] **BE — DispatchOrderFCL Model + ViewModel**: thêm `TransportOrderId`, `IsLegacy`, payload route (nested object)
- [ ] **FE — modal-transport-order**: strip thành pure route editor (xóa hết block xe/lái/duyệt/ghi chú); 2 trạng thái Draft/Locked
- [ ] **FE — modal-dispatch-order-fcl**: thêm nested tab/section "Thiết kế cung đường" embed modal-transport-order; truyền payload TO khi save FCL
- [ ] **FE — TO list page**: chuyển sang read-only route viewer; bỏ button Sửa/Xóa hoặc redirect sang FCL khi click; hiển thị badge "Lệnh legacy" khi mở FCL cũ có `IsLegacy=1`
- [ ] **FE — listTO không nút Thêm mới**: đã có sẵn, giữ nguyên (chỉ tạo qua FCL)

### Files cần chỉnh chính
- BE: `NewAPI/API/Controllers/Transports/DispatchOrderFCLController.cs`, `NewAPI/API/Repositories/DispatchOrderFCLRepository.cs`, `NewAPI/API/Repositories/TransportOrderRepository.cs`, models `TransportOrder.cs`, `DispatchOrderFCL.cs`
- FE: `src/app/shared/components/transports/modal-dispatch-order-fcl/`, `src/app/shared/components/transports/modal-transport-order/`, `src/app/main/transports/transport-order/`

### Tham chiếu
- File schema TO đầy đủ: `D:\Delta\DeltaSoft\web-app-update\transportOrder.sql` (UTF-16 LE)
- File schema FCL đầy đủ: `D:\Delta\DeltaSoft\web-app-update\dispatchOrderFcl.sql` (UTF-16 LE, ~94k tokens — đọc bằng `Get-Content -Encoding Unicode` chia khúc)

---

## Hóa đơn chờ thanh toán (Pending Invoice) — IN PROGRESS

### BE — Phase 2+3 (chờ migration chạy xong)
- [ ] Sửa `GeminiAIRepository`: thêm `ExtractInvoiceDataFromUrl(string url, string mimeType)` dùng `Part.FileData { FileUri, MimeType }` thay InlineData
- [ ] Join `lineItems[].description` thành `Contents` bằng `; ` trong BE trước khi trả về / lưu DB
- [ ] Model: `PendingInvoice.cs`
- [ ] Interface: `IPendingInvoiceRepository`
- [ ] Repository: `PendingInvoiceRepository` — gọi 7 SPs
- [ ] Controller: `PendingInvoiceController`
  - `POST upload-and-read` — lưu local+S3 (Create2 pattern) → S3 URL → Gemini → CheckDuplicate → trả array kết quả
  - `POST create` — user confirm → insert DB
  - `POST get-pending` — list chờ TT
  - `POST get-by-id`
  - `POST mark-paid`
  - `POST delete`

### FE — Phase 4 (sau khi BE xong)
- [ ] `PendingInvoiceService`
- [ ] List component: bảng hóa đơn chờ TT, filter EmployeeId/ngày/vendor
- [ ] Upload modal: multi-file drag-drop → loading per-file → hiển thị kết quả AI + warning trùng → confirm/bỏ qua từng dòng
- [ ] Tích hợp thanh toán: "Thanh toán" button → payment modal pre-filled → sau khi save gọi mark-paid → ẩn khỏi list

## DB Migration Pending (chạy trong SSMS)
- [ ] Chạy `Ports_GroupPort_And_IsAvoided_Migration.sql` (file tại `NewAPI/`):
  - **Part A** (tự động): migrate GroupPorts → OtherCategories, thêm GroupPortId FK, update mapping, drop GroupPort column, recreate 4 Ports SPs
    - ⚠️ Kiểm tra lại logic sinh Code trong `SP_Ports_Create` (placeholder `PORT + padded Id`)
  - Part B (IsAvoided cho Segment_Etcs) — **không cần nữa**, đã thay bằng Segment_Stations
- [ ] Sau khi test Ports ổn: chạy cleanup `DROP TABLE Tbl_GroupPorts` + `DROP PROCEDURE SP_GroupPorts_GetAll` (commented ở cuối file migration)

## Transport Order Modal — Việc còn lại
- [ ] **SP GetById Result 6** (SSMS): chạy ALTER SP để thêm JOIN `Customers`, `Tbl_Shipments` (JobId), `Tbl_Ports` (PortOfLiftingName/PortOfLiftOffName) + các cột trực tiếp từ ShippingTask (`ContType`, `PickupTime`, `SealNumber`, `ReferCode`) — template SQL đã có, cần verify tên bảng/cột
- [ ] **`note` per-segment lưu DB**: `TransportOrderSegment.note` (FE model ✅, `_rebuildDispatchSummarize()` dùng ✅) cần: thêm cột `Note NVARCHAR(500)` vào `Tbl_TransportOrder_Segments`; cập nhật TVP `TypeTransportOrderSegment`; cập nhật SP_Create/Update/GetById để lưu + đọc `Note`; sau khi GetById trả Note thì `_rebuildDispatchSummarize()` phải được gọi khi load edit
- [ ] **Nhà thầu phụ**: toggle đã bỏ khỏi UI, form subcontractor đã xóa — cần thiết kế lại luồng xe thuê ngoài (giải quyết sau)
- [ ] **Verify `vihicletype=0`**: kiểm tra SP `VihicleService.getAll` có trả về tất cả xe khi `@type=0` không, nếu không cần điều chỉnh
- [ ] **Permissions `TO_CLOSING` / `TO_ACCEPT`**: thêm 2 permission code này vào DB `Tbl_Functions` nếu chưa có
- [ ] **`updateState()`**: hiện dùng `update()` chung, cân nhắc thêm endpoint `POST /api/TransportOrder/update-state` riêng (nhẹ hơn, chỉ update status + feedback)
- [ ] **Test Segment_Stations**: test tạo TO có cung đường Vietmap → kiểm tra `Tbl_TransportOrder_Segment_Stations` có lưu đúng `AllPrices` JSON không
- [ ] **Test Route Segment Defaults**: test nút "Lưu mặc định" → kiểm tra `Tbl_RouteSegmentDefaults` + `Tbl_RouteSegmentDefault_Stations` lưu đúng; test mở lại modal tạo TO mới → đoạn A→B tự điền từ bảng mặc định

## Transport Order List — Việc còn lại
- [ ] **Kiểm tra `rStatus`**: SP_TransportOrder_GetAll có trả về `rStatus` không — nếu có thì bỏ tính toán client-side; nếu không thì giữ nguyên
- [ ] **Chức năng cập nhật trạng thái**: xem xét thêm action "Gửi lệnh" / "Từ chối" trực tiếp từ list (tương tự FCL chotlenh)

## Module Tính Lương Lái Xe — PLANNED (chưa bắt đầu)
Thiết kế đầy đủ tại `D:\Delta\DeltaSoft\NewAPI\KeHoach_TOANBO_LuongLaiXe.docx`. Memory: `project_driver_salary_module.md`. User sẽ thông báo khi bắt đầu.

**Câu hỏi cần xác nhận trước Phase 1:**
1. RouteGroupId trên lệnh: đặt thủ công hay tự động theo cung đường?
2. SalaryVehicleClassId: ai gán? UI ở đâu?
3. Milkrun nhận biết qua RouteGroupId=GR09 + RouteCode hay flag riêng?
4. TransportOrder có cột SoLuuCa (lưu ca xe) chưa?
5. Employee.NumberOfChildren có trong DB chưa?
6. Phase 1 scope: container nội địa trước hay toàn bộ?

### Phase 1 — SQL Migration + Cấu hình
- [ ] ALTER `Tbl_VehicleTypes`: thêm `SalaryVehicleClassId INT NULL FK OtherCategories`
- [ ] ALTER `Tbl_Employees`: thêm `DriverSalaryTypeId TINYINT NULL`
- [ ] ALTER `Tbl_TransportOrders`: thêm `RouteGroupId INT NULL FK OtherCategories`
- [ ] ALTER `Tbl_Routes`: thêm `TripSalaryMin INT NULL DEFAULT 0`
- [ ] INSERT OtherCategories: 10 nhóm tuyến (SALARY_ROUTE_GROUP: GR01-GR10) + 5 class xe (SALARY_VEHICLE_CLASS: VC01-VC05)
- [ ] CREATE + INSERT `Tbl_DriverSalaryDayWageConfig` (~30 rows: 9 nhóm × 3 class)
- [ ] CREATE + INSERT `Tbl_DriverSalaryKmsConfig` (5 rows: VC01-VC05 với KmsRate + CbtShortRate)
- [ ] CREATE + INSERT `Tbl_DriverSalaryMilkrunConfig` (42 rows: MC01-MC22, MF23-MF35, MK36, MZ37-MN41, MC42)
- [ ] CREATE `Tbl_DriverSalary` (Id, DriverId, Month, Year, BranchId, Status, TotalAmount, ConfirmedBy)
- [ ] CREATE `Tbl_DriverSalaryDetail` (Id, SalaryId, TransportOrderId, DayWage, KmsSalary, TripMin, PhuCapLenh, Total)
- [ ] BE: DriverSalaryConfig Repository + Controller (CRUD cho 3 bảng config)
- [ ] FE: dropdown `SalaryVehicleClass` trong modal quản lý loại xe
- [ ] FE: dropdown `DriverSalaryType` trong hồ sơ nhân viên
- [ ] FE: dropdown `RouteGroupId` trong modal Transport Order khi tạo/sửa lệnh

### Phase 2 — Engine tính lương
- [ ] SP `SP_DriverSalary_Calculate(@Month, @Year, @BranchId)` — tính lương tất cả lái xe trong tháng, INSERT/UPDATE Tbl_DriverSalary + Tbl_DriverSalaryDetail
- [ ] BE: `DriverSalaryRepository` (Calculate, GetByMonth, GetDetail, Confirm, Lock)
- [ ] BE: `DriverSalaryController` (POST calculate, get-by-month, get-detail, confirm, lock)

### Phase 3 — Giao diện tính lương
- [ ] Màn hình chọn tháng/năm + chi nhánh → bấm "Tính lương" → preview bảng lương tổng hợp
- [ ] Expand row per lái xe → chi tiết từng lệnh (DayWage, KmsSalary, TripMin, PhuCap, Total)
- [ ] Workflow: draft → confirmed → locked (locked không sửa được)
- [ ] Filter/search theo tên lái xe, xe, nhóm tuyến

### Phase 4 — Xuất phiếu + Kế toán
- [ ] Export Excel bảng lương tháng (tổng hợp + chi tiết)
- [ ] PDF phiếu lương cá nhân gửi lái xe
- [ ] Tạo Phiếu Chi tự động từ bảng lương đã lock (1 phiếu = 1 lái xe, số tiền = TotalAmount)

## Other Known Pending
- Claude AI controller — endpoint exists, không có frontend
- `appsettings.json` ClaudeApiKey còn trống

## Notes
- `angular.json` budget `anyComponentStyle` đã tăng lên 50 kB (error) / 30 kB (warning) — tránh build fail khi CSS component lớn như modal-vietmap-routes
- `Migration_TransportOrder_Stations_20260428.sql` đã chạy thành công (2026-04-29) — bao gồm cả Step 0 drop 3 cột + Steps 1-13 Segment_Stations + Route Defaults
