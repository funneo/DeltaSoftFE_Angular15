# Pending / In-Progress Work

## DB Verify — SP_Shipment_GetPagingNormal phải SELECT cột Conts
- File hiện tại: SP gọi từ `ShipmentRepository.GetPagingNormal` (line 619-640) — tên SP `SP_Shipment_GetPagingNormal`
- FE shipment-normal list vừa thêm cột "Cont No" (2026-05-17), bind `{{item.conts}}` + filter `contnoSearch`
- **Cần verify SP**: có SELECT cột `Conts` không. Nếu chưa → ALTER SP thêm subquery gom `ContainerNumber` từ `Tbl_ShippingTasks` JOIN `Tbl_Shipments` → STRING_AGG / FOR XML PATH theo ShipmentId
- Khi confirm xong: cột Cont No sẽ hiện data, filter + export Excel hoạt động end-to-end

---

## Refactor TO ↔ FCL — FE wiring + chạy migration (cập nhật 2026-05-17)

### Trạng thái hiện tại
- ✅ Phase 1A đã chạy (IsLegacy + FclRefNo + UNIQUE filtered index)
- ✅ Phase 1C đã chạy (DROP ~59 cột TO + 2 bảng phụ `Tbl_TransportOrder_Details` / `Tbl_TransportOrder_Fees`)
- ✅ Phase 2 SQL đã viết xong (`Migration_TO_FCL_Phase2_SPs_20260515.sql`) — anh đã chỉnh thêm GetAll theo ý anh. **CHỜ CHẠY trên DB**.
- ✅ BE refactor xong, build 0 errors (FCL WithTO methods + endpoints / TO trim / model+ViewModel)
- ✅ FE service `createWithTo/updateWithTo/getDetailWithTo` đã thêm
- ✅ Model FCL đã thêm `isLegacy/toRefNo/segments`
- ✅ Modal V2 đã tạo (`modal-dispatch-order-fcl-v2/`) — tab "Cung đường" route builder inline + 3 ViewChild modal helpers + ~25 route methods
- ✅ Redesign UI v2 iter 1: width 90%, header gradient navy/vàng, inputs 28px gọn, tab modern
- ✅ Fix form wrap (footer truy cập `addEditForm.form.valid`) — `<form>` wrap cả body+footer, SCSS `display:flex column`
- ✅ Bảng tải trọng per-segment + dispatch-summary với giá trạm phí theo loại xe (`loadVehicle` set `_vehicleBotTypeId`)
- ✅ Tab "Cung đường" 3 cột dọc giống TO (pool collapse / route builder / tải trọng+tóm tắt)
- ✅ Width modal: 95vw (final)
- ✅ `routeConfirmed` đổi thành getter `status > 2` (khác TO — sửa cung đường được đến hết status=2, lock từ Duyệt B1)
- ✅ Wiring entry: list FCL route theo `isLegacy`, shipping-task-opman nút "Lập lệnh (Location)" → modal v2
- ✅ List FCL: click checkbox = click row (fix stopPropagation)
- ✅ Login: lưu mật khẩu (base64 obfuscation) + đổi label "Lưu thông tin đăng nhập"
- ✅ shipment-normal: thêm cột "Cont No" + filter (chờ verify SP trả Conts)
- ✅ Build FE pass 0 errors

### Việc còn lại

#### 1. SQL — anh chạy Phase 2 trên SSMS
- File: `D:/Delta/DeltaSoft/NewAPI/Migration_TO_FCL_Phase2_SPs_20260515.sql`
- Verification queries ở cuối file (check 4 SP mới + xác nhận SP cũ vẫn còn)
- **ALTER `SP_DispatchOrderFCL_GetAll`**: thêm `m.IsLegacy` vào SELECT output (anh nói sẽ tự làm)

#### 2. ⚠️ FE — Kiểm tra luồng lưu DB + đọc lại dữ liệu Modal V2 (PRIORITY)
- **Save (Create)**: tạo lệnh mới từ modal v2 → POST `/CreateWithTO` → BE gọi `SP_DispatchOrderFCL_CreateWithTO`. Verify:
  - Trả về `{ NewToId, NewToRefNo, NewFclRefNo }` đầy đủ
  - `Tbl_TransportOrders` insert row mới với `FclRefNo` link + segments/stations/waypoints qua 3 TVPs
  - `DispatchOrderFCL` insert row với `IsLegacy=0`, `Tongdau = SUM(FuelAmountCalculated) + OilCompensation`, `TongKm = SUM(DistanceKm)`, `Chiphidau = Tongdau * OilPrice`
  - `DispatchOrderFCL.TongKm` ghi đúng (cột mới Phase 2)
- **Save (Update)**: edit lệnh `IsLegacy=0` từ modal v2 → POST `/UpdateWithTO`. Verify:
  - BEGIN TRAN OK, không RAISERROR (chỉ raise cho legacy)
  - Segments update (delete + insert lại qua TVP)
  - FCL fields cập nhật đúng (Tongdau/Chiphidau/TongKm/OilCompensation/ListEtc/ListFee...)
- **Load (Edit)**: click row `IsLegacy=0` → modal v2 → `getDetailWithTo(refNo)` → 9 result sets:
  - 5 RS legacy FCL (header / listEtc / listFee / listDetailed / Quabai)
  - 4 RS TO (header dynamic / segments / stations / waypoints)
  - Verify FE Repository attach `stations[]/waypoints[]` vào segments by `SegmentId`
  - Verify `_segmentsToLocations(entity.segments)` rebuild `locations[]` đúng thứ tự + đủ pickup/delivery
  - Verify bảng tải trọng load đúng `payloadWeight` per chặng từ DB
  - Verify giá trạm phí hiển thị (cần `entity.vehicleId` → `loadVehicle()` → `_applyTollPrices()`)
- **Edge cases cần thử**:
  - Chặng cuối được flag `lastSegmentFinal` khi mở lại
  - Lệnh có `dispatchSummarize` (note per-segment) → "Hướng dẫn cung đường" hiển thị
  - Khi tab Thông tin chung đổi xe → bảng tóm tắt giá trạm cập nhật theo loại xe mới
  - `Tongdau / Chiphidau` công thức mới có đúng khớp giữa FE compute + BE persist không

#### 3. FE — TO list page (`src/app/main/transports/transport-order/`)
- Chuyển sang **read-only route viewer**:
  - Bỏ nút Thêm/Sửa (giữ Xem + Xóa nếu cần)
  - Hiển thị badge "Legacy" nếu `IsLegacy=1` (đọc từ response GetAll mới)
  - Click row → mở modal viewer hiển thị segments + map; có nút "Mở FCL" → navigate sang modal FCL nếu cần sửa
- Cập nhật service `transport-order.service.ts`:
  - Bỏ `createAsync` / `updateAsync` (endpoint đã DROP)
  - `updateStatus(id, status)` — signature mới (không còn feedback/isRejection)

#### 4. FE — Cleanup
- Search & remove dead code các form field cũ (Chang/Luonghang/Cang/Nhamay/etc.) trong template modal v2 nếu còn (đã chuyển qua segments rồi không dùng)

### Files cần chỉnh chính (FE)
- ~~`src/app/shared/services/dispatch-order-fcl.service.ts`~~ ✅
- `src/app/shared/services/transport-order.service.ts` (bỏ create/update)
- ~~`src/app/shared/components/transports/modal-dispatch-order-fcl-v2/`~~ ✅
- `src/app/main/transports/transport-order/` (list + viewer)

### Quy ước quan trọng (đã chốt với anh)
- KHÔNG đụng BE/SP/FE hiện có của FCL legacy → tất cả tạo song song (`WithTO`)
- Tongdau mới = `SUM(FuelAmountCalculated) trên @ListSegments + @OilCompensation`
- TongKm mới  = `SUM(DistanceKm) trên @ListSegments`, persist vào **cả FCL.TongKm + TO.TongKm**
- Chiphidau mới = `Tongdau * OilPrice`
- TO không có `ShortWay`, không có `CreatedByName` (xóa khỏi insert), `FullRoute` của TO = hướng dẫn cung đường (dùng chung `@FullRoute` với FCL)
- `IsLegacy=0` set explicit khi INSERT FCL mới

### Tham chiếu
- Schema dump TO: `D:/Delta/DeltaSoft/web-app-update/sp_transportOrder.sql` (UTF-16 LE, đã reflect Phase 1C)
- Schema dump FCL: `D:/Delta/DeltaSoft/web-app-update/dispatchOrderFcl.sql` (UTF-16 LE)
- Phase 2 file: `D:/Delta/DeltaSoft/NewAPI/Migration_TO_FCL_Phase2_SPs_20260515.sql`
- Memory: `feedback_keep_legacy_create_new` — luôn tạo SP/endpoint song song khi thay đổi behavior lớn

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
