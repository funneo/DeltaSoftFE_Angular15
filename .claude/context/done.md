# Completed Features

## FE polish — 2026-05-17

### modal-dispatchorder-route — Box-footer luôn pin đáy + 1 scroll duy nhất
- **Bug 1**: `box-footer` trước đây nằm trong `<form>` → trong `.modal-body` → khi table dài, footer cuộn ra khỏi viewport, user không thấy nút Lưu/Hủy
- **Fix layout**: di chuyển `<div class="box-footer">` ra ngoài `<form>` + `<div class="modal-body">`, thành sibling của `.modal-body` trong `.modal-content`
- **CSS** ([modal-dispatchorder-route.component.css](src/app/shared/components/transports/modal-dispatchorder-route/modal-dispatchorder-route.component.css)):
  - `.modal-content`: `display: flex; flex-direction: column; max-height: 90vh` (chia 3 vùng dọc, không vượt viewport)
  - `.modal-header` + `.box-footer`: `flex-shrink: 0` (luôn giữ kích thước)
  - `.modal-body`: `flex: 1 1 auto; min-height: 0; overflow: hidden` (chiếm chỗ trống, KHÔNG cuộn)
  - `.box-footer`: padding 10/15px, nền `#f5f5f5`, border-top — visual rõ ràng
- **Bug 2**: cả `.modal-body` và `table tbody` đều có scroll → 2 thanh cuộn lồng nhau, khó dùng
- **Fix scroll**: `.modal-body { overflow: hidden }` (loại bỏ scroll #1); `table tbody { height: calc(90vh - 280px); max-height: 580px; overflow-y: auto }` — duy trì 1 scroll trong table, height động theo viewport
  - Viewport cao (≥960px): tbody = 580px (cap)
  - Viewport thấp (~720px): tbody ~368px → filter row + pagination + footer luôn nhìn thấy

### Login — Lưu thông tin đăng nhập kèm mật khẩu
- Đổi label `Ghi nhớ tài khoản & chi nhánh` → **`Lưu thông tin đăng nhập`** ([login.component.html:112](src/app/login/login.component.html#L112))
- Trước đây cố ý KHÔNG lưu password (lý do bảo mật). User yêu cầu lưu cả password.
- `_persistRemembered`: thêm `passWord: btoa(this.user.passWord)` (encode base64 để chống đọc lướt khi xem localStorage)
- `_loadRemembered`: `atob(data.passWord)` decode khi restore + bind vào `this.user.passWord` trong `ngOnInit`
- Field model FE đúng tên là `passWord` (camelCase W hoa), không phải `password`
- ⚠️ Base64 KHÔNG phải mã hoá — chỉ chống đọc casual. Acceptable cho nội bộ doanh nghiệp; cần thay refresh token + httpOnly cookie nếu mở rộng ra ngoài

### FCL list — Click checkbox = click row
- Trước: `<input type="checkbox" (click)="$event.stopPropagation()">` → click checkbox không bubble lên row → `item.checked` Angular không sync với DOM
- Sau: bỏ stopPropagation trên input; thêm `(click)="$event.preventDefault()"` trên `<label>` để chặn browser double-toggle (label + input)
- Bubble đúng cách lên `<tr (click)="clickRow(item)">` → toggle `item.checked` → Angular re-render `[checked]` đồng bộ ([html:121-127](src/app/main/transports/dispatch-order-fcl/dispatch-order-fcl.component.html#L121))

### Modal V2 — routeConfirmed theo workflow FCL (khác TO)
- TO có bước "Chốt cung đường" tách biệt, sau khi chốt mới hiện xe/lái xe → `routeConfirmed` là stored bool, set true khi click "Chốt cung đường"
- V2 (FCL) không có bước này — tất cả info (cung đường, xe, lái xe, tải trọng) cùng 1 form, sửa thoải mái đến khi DUYỆT B1
- Convert `routeConfirmed` từ property → **getter** dựa trên status:
  ```typescript
  get routeConfirmed(): boolean {
    return (this.entity?.status ?? 0) > 2 || this.flagXem;
  }
  ```
- Status 0 (Mới) / 1 (Gửi lệnh) / 2 (Nhận lệnh): vẫn cho sửa cung đường + tải trọng + pool col hiện
- Status 3 (Duyệt B1) / 4 (Duyệt B2) / 5 (CHỐT): route locked, pool col ẩn, buttons Vietmap/So sánh/Lưu mặc định ẩn
- Khớp pattern modal FCL legacy (`status > 2` lock)
- Bỏ dòng `this.routeConfirmed = false` trong `add()` reset (getter tự suy)

### shipment-normal — Cột Cont No + filter + export
- Thêm cột "Cont No" trước "Ghi chú" trong list lô hàng thường (dùng field `conts` có sẵn ở `Shipment.model.ts` + `ShipmentViewModel`)
- Filter row input: `[(ngModel)]="contnoSearch"` → method `filter()` thêm 1 case lọc `data.conts.toLowerCase().includes(...)`
- Nút Export Excel đã có sẵn (header `<button (click)="exportExcel()">`) — đã dùng `listFilter` (data đã lọc theo tất cả filter)
- ⚠️ Cần verify SP `SP_Shipment_GetPagingNormal` SELECT `Conts` (nếu chưa thì cột rỗng, cần ALTER SP gom container number từ shipping tasks)

---

## Refactor TO ↔ FCL — Phase 3 FE Modal V2 (2026-05-16)

### FE service + model
- **`dispatch-order-fcl.service.ts`** — thêm 3 method song song:
  - `createWithTo(entity)` → POST `/api/DispatchOrderFCL/CreateWithTO` (trả `{ NewToId, NewToRefNo, NewFclRefNo }`)
  - `updateWithTo(entity)` → POST `/api/DispatchOrderFCL/UpdateWithTO`
  - `getDetailWithTo(refNo)` → POST `/api/DispatchOrderFCL/GetByRefNoWithTO` (trả model kèm `Segments[]`, `IsLegacy`, `ToRefNo`)
- **Model `dispatch-order-fcl.ts`**: thêm `isLegacy?: boolean`, `toRefNo?: string`, `segments?: TransportOrderSegment[]`

### FE Modal V2 — `modal-dispatch-order-fcl-v2/` (clone từ modal cũ, song song)
- Folder mới: `src/app/shared/components/transports/modal-dispatch-order-fcl-v2/`
- Class `ModalDispatchOrderFclV2Component`, selector `modal-dispatch-order-fcl-v2`
- Service calls đổi sang WithTO: `create` → `createWithTo`, `update` → `updateWithTo` (4 chỗ), `getDetail` → `getDetailWithTo`
- `add(listItem)` khởi tạo `segments=[]`, `isLegacy=false` explicit
- `edit(refNo)` rebuild `locations = _segmentsToLocations(entity.segments)` để route builder load đúng
- **Tab "Cung đường"** inline copy từ `modal-transport-order` (~333 dòng template + ~1500 dòng SCSS), nhưng **bỏ hoàn toàn vehicle panel** (cột phải TO modal) — modal v2 đã có tab "Thông tin chung" riêng cho xe/lái xe/dầu
- **3 ViewChild modal helpers** embed cuối template: `<modal-vietmap-routes>`, `<modal-map-routes>`, `<modal-route-compare>`
- **~25 route methods** copy vào component: `isLocInRoute`, `addToRoute`, `onDropLocation`, `removeLocation`, `getSegment`, `calculateTotal`, `showFullRouteMap`, `editSegmentRoute`, `openCompareModal`, `_applyCompareRoute`, `onRouteSelected`, `saveSegmentDefault`, `_rebuildSegments`, `_fetchSegmentHistory`, `_parseTollStations`, `_applyTollPrices`, `_fetchTollForSegment`, `_loadAllLocations`, `_segmentsToLocations`, `calulateOilSegments`, `_rebuildDispatchSummarize`, `toggleAddCustomPoint`, `confirmAddCustomPoint`, `sortLoc`, `hasGeoCoord`, `selectLocation`, `locationTypeName`, `removeStation`, `isSegmentCalculating`, `getIndexClass`
- **Module v2**: thêm `DragDropModule` + `ModalMapRoutesModule`
- **Wiring entry point**:
  - `dispatch-order-fcl.component.ts` (list FCL): row click check `selectedItem.isLegacy === false` → mở modal v2; có 2 nút "Tạo lệnh mới (v2)" + "Tạo lệnh cũ" riêng
  - `shipping-task-opman.component.ts`: nút "Lập lệnh (Location)" → mở modal v2 (entry point chính cho luồng tạo mới)

### Redesign UI Modal V2 (2026-05-16, iter 2)
- **Width**: `.fcl-v2-dialog` 95vw (sau 2 lần điều chỉnh: 70% → 90% → 95%), max-height 97vh, border-radius 10px, shadow lớn
- **Header**: gradient navy → blue, viền vàng 2px dưới; icon truck + tiêu đề; RefNo badge vàng; pill người tạo + ngày tạo; nút X tròn xoay khi hover
- **Body**: nền `#f6f8fa`, box-body trắng bo 8px shadow nhẹ; bỏ duplicate row RefNo/Ngày trong tab "Thông tin chung" (header đã hiển thị), chỉ giữ nút "Đính kèm hồ sơ"
- **Tab nav**: padding 6/14px, font 12.5px, active border-bottom 2px navy
- **Form inputs compact**: `.form-control` + `ng-select` đồng bộ height 28px, padding 2/8px, font 12.5px, focus glow xanh nhạt; gutter cột thu 8px; `form-group margin-bottom: 6px`; `control-label padding-top: 5px`
- **Fieldset/legend**: bo 6px, padding 8/12/4, legend pill navy uppercase
- **Table**: header `#eaf3fb` navy đậm, td padding 4/6px, row hover sáng
- **Form wrap fix**: ban đầu tách footer ra ngoài form gây bug `Cannot read properties of undefined (reading 'form')` ở `addEditForm.form.valid`. Fix: `<form class="fcl-v2-form">` wrap CẢ body + footer; SCSS `.fcl-v2-form { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; }` giữ flex chain modal-content → form → body(scroll) → footer(shrink:0). Nút Lưu giữ `type="submit"`

### Tab "Cung đường" — 3 cột giống TO (2026-05-16, iter 3)
Restructure tab "Cung đường" từ 2 cột → **3 cột dọc** chính:
- **Cột trái `.to-col-pool`** (300px, collapse → 38px): "Điểm hàng từ công việc" — có nút `pool-toggle-btn` (mũi tên `‹‹/››`) ẩn/hiện. Ẩn khi `routeConfirmed`
- **Cột giữa `.to-col-route`** (flex 1): lộ trình drag-drop + per-segment buttons (Lộ trình đã lưu / Tính lại Vietmap / So sánh / Lưu mặc định) + "Thêm điểm khác" + route-summary tổng kết
- **Cột phải `.to-col-info`** (flex 6): MỚI — header "Tải trọng & Tóm tắt lệnh" + bảng `seg-km-table` (Chặng/Mô tả/Tải trọng/Km/Dầu định mức/Trạm phí) + `dispatch-summary-grid` (tổng km/dầu + bảng `allTollStations` theo loại xe + hướng dẫn cung đường)
- **Bảng tải trọng + giá trạm thu phí**: chọn payloadWeight per chặng (ng-select listOilQuota) → `onSegmentQuotaChange()` set fuelNorm + fuelAmountCalculated. Khi chọn xe ở tab Thông tin chung → `loadVehicle()` set `_vehicleBotTypeId` + gọi `_applyTollPrices()` → bảng `allTollStations` cập nhật giá theo loại xe BOT (1132-1136 → vietmap key 1-5)
- **Methods MỚI thêm cho V2**: `onSegmentQuotaChange(segIndex, event)`, `onLastSegmentFinalChange()`; `loadVehicle()` rewrite để set `_vehicleBotTypeId` từ response + call `_applyTollPrices()` sau load
- **SCSS `.to-body`**: `display:flex; height:70vh; background #f6f8fa; border 1px bo 6px`; 3 cột `height:100%` cuộn độc lập
- **Build status**: 0 errors

---

## Refactor TO ↔ FCL — Phase 2 SQL + BE (2026-05-15)

### SQL — `D:/Delta/DeltaSoft/NewAPI/Migration_TO_FCL_Phase2_SPs_20260515.sql`
- **Section 0** (idempotent): `ALTER TABLE DispatchOrderFCL ADD TongKm DECIMAL(18,2) NULL` (chỉ chạy nếu chưa có)
- **Section A — TO SPs theo schema 14 cột**:
  - DROP `SP_TransportOrder_Create`, `SP_TransportOrder_Update` (TO không còn standalone — merge vào FCL CreateWithTO)
  - `SP_TransportOrder_GetById` (4 RS: master+FCL preview / segments / stations / waypoints)
  - `SP_TransportOrder_GetAll` rewrite — bỏ JOIN `Tbl_TransportOrder_Details` (đã DROP Phase 1C), JOIN FCL qua FclRefNo show xe/lái xe/IsLegacy (anh đã tự chỉnh thêm)
  - `SP_TransportOrder_UpdateStatus` — bỏ `IsDeny/Feedback` (cột đã DROP), signature đơn giản (id/status/userId)
- **Section B — 3 SP MỚI cho FCL (song song, KHÔNG đụng SP cũ)**:
  - `SP_DispatchOrderFCL_CreateWithTO` — clone Create cũ + bỏ ~57 param legacy (Chang*, Luonghang*, Cang*, Nhamay*, Trungchuyen*, InquiryTime*, ShippingTaskId, LuotdiQuabai/LuotveQuabai) + thêm @ListSegments/@ListSegmentStations/@ListSegmentWaypoints (TVPs từ TO). Tongdau = SUM(FuelAmountCalculated) + @OilCompensation. TongKm = SUM(DistanceKm) (persist vào cả FCL.TongKm + TO.TongKm). IsLegacy = 0 explicit. Trả về `(NewToId, NewToRefNo, NewFclRefNo)`.
  - `SP_DispatchOrderFCL_UpdateWithTO` — tương tự, kèm BEGIN TRAN, lookup TO via FclRefNo, RAISERROR nếu lệnh legacy.
  - `SP_DispatchOrderFcl_GetByRefNoWithTO` — clone GetByRefNo cũ (5 RS) + thêm 4 RS TO (header/segments/stations/waypoints). SELECT TongKm dùng `COALESCE(m.TongKm, [công thức cũ])` để cover cả lệnh mới (đọc FCL.TongKm) và legacy (fallback sum Km*).

### BE FCL — giữ nguyên method cũ, chỉ THÊM
- **Model `DispatchOrderFCL`**: thêm `IsLegacy bool?`, `TongKm decimal?`, `ToRefNo string`, `Segments IEnumerable<TransportOrderSegment>`
- **ViewModel**: bỏ field `int TongKm` cũ (do model giờ là decimal?)
- **`IDispatchOrderFCL`**: thêm 3 method `CreateWithTOAsync` / `UpdateWithTOAsync` / `GetByRefNoWithTOAsync` + class `DispatchOrderFCLCreateWithTOResult { NewToId, NewToRefNo, NewFclRefNo }`
- **Repository** (cuối file): helpers `BuildSegmentsTvp` / `BuildSegmentStationsTvp` / `BuildSegmentWaypointsTvp` / `AddFclWithTOCommonParams` (chỉ tham số FCL non-legacy) + 3 impl
- **Controller**: 3 endpoint mới `/CreateWithTO`, `/UpdateWithTO`, `/GetByRefNoWithTO` (file [DispatchOrderFCLController.cs](../../d:/Delta/DeltaSoft/NewAPI/API/Controllers/FCL/DispatchOrderFCLController.cs))

### BE TO — trim về route-only
- **`TransportOrder` model**: chỉ còn 14 fields (Id, RefNo, BranchId, ShortWay, FullRoute, Status, CreatedDate, CreatedBy, CreatedByName, UpdatedBy, UpdatedDate, Deleted, TongKm, FclRefNo) + `Segments`
- **`TransportOrderViewModel`**: gắn `IsLegacy` + FCL preview info (VehiclelLicensePlates, DriverName, OilPrice, Tongdau, Chiphidau...)
- **`ITransportOrder`**: drop `CreateAsync/UpdateAsync`; `UpdateStatus` signature đơn giản (id/status/userId)
- **`TransportOrderRepository`** rewrite — chỉ còn read (GetAll/GetById), Delete (soft), UpdateStatus, GetSegmentHistory, SaveSegmentDefaultAsync, GetAllLocations
- **Controller**: drop endpoint `/Create` và `/Update` (kèm comment dẫn sang FCL WithTO); `UpdateStatus` đổi signature
- **Build status**: 0 errors (chỉ warning CA2200 cũ trong codebase)

---

## Core Infrastructure
- **Login page redesign** (2026-05-14): layout 2 cột (brand panel trái + form phải)
  - Brand panel: logo Delta + headline "Vận tải thông minh — Đồng hành cùng doanh nghiệp" + 6 quotes xoay vòng auto-rotate 6s, dots indicator click chọn quote thủ công, `setInterval` cleanup trong `ngOnDestroy`
  - Form: 3 field (username + password + branch ng-select) với floating label, icon prefix (`fa-user`/`fa-lock`/`fa-building`), error inline khi `f.submitted && !valid`
  - Toggle hiện/ẩn mật khẩu: `showPassword` flag + suffix button (`fa-eye` ↔ `fa-eye-slash`)
  - "Ghi nhớ tài khoản & chi nhánh": checkbox `rememberMe` lưu `{userName, branchId}` vào `localStorage['DELTA_LOGIN_REMEMBER']` (KHÔNG lưu password); `_loadRemembered()` restore khi `ngOnInit`, validate `branchId` còn tồn tại trong `listBranch` trước khi gán
  - Loading state: nút submit hiển thị spinner + "Đang đăng nhập..." khi `loading=true`; `[disabled]="loading"` chặn click double-submit
  - Mobile: `mobile-only` logo wrap hiện khi brand panel ẩn
  - File diff: `login.component.html` +164 / `login.component.css` +531 / `login.component.ts` +79
- JWT authentication with multi-branch login (user selects branch on login)
- Role-based + function-code permission system embedded in JWT claims
- Multi-level approval workflows (authorisationLevel, advanceConfirmLevel, paymentConfirmLevel, transportConfirmLevel)
- SignalR real-time cache invalidation for master data
- Firebase FCM push notifications (web)
- CacheService with 60-minute TTL and entity-based invalidation
- AWS S3 file storage
- File upload/download (local UploadFiles folder + S3)
- PDF generation via DinkToPdf
- Excel export via EPPlus / xlsx
- External user (IsExternal) login flow with Innvie password sync via RSA encryption
- Login history logging
- Token-key anti-replay validation on all mutating endpoints

## Master Data (danhmuc)
- Customer management (with locations, routes, toll routes, normal routes)
- Supplier management (with drivers, vehicles)
- Employee management
- Vehicle management
- Route management
- Fee / fee group / payment fee group / revenue fee group
- Toll: locations, stations, routes
- Bank, branch, province, district, location (GPS points)
- Handling groups, job groups, job group options
- Option procedures
- Rate exchange
- Gas sites, vehicle oil quotas
- Transit ports, ports
- Transport categories
- Other categories
- Account list

## Shipments
- Shipment create/update/delete/copy/finish
- Shipment normal (non-container)
- Open shipment management
- Debit note CRUD + open/accept/lock workflow
- DBS EDI shipment import
- Canon shipment flow (separate pricing model)
- Reports: BC01, BC02, BC04-DT12, CP03, revenue, debit note detail, statement

## Transports
- Dispatch order full lifecycle (create, update, changed driver, set finish, set done procedure, cancel)
- FCL dispatch orders
- Dispatch order additional fees
- Dispatch order parking tickets
- Transport order (lệnh vận chuyển) — new module using Vietmap + Google Maps API
- Transport order modal: tab "Chi tiết công việc" với 4 action buttons (xoá, đính kèm, tải file lái xe, nhân bản), tab "Chi phí" (listFee), tab "Hình ảnh hiện trường" (khi status > 1)
- Transport order modal: scrollable tab tables với sticky header (flex chain fix)
- Transport order modal: thông tin vận chuyển đầy đủ như FCL (isSubcontractor split form, route split 5-5, general info fields)
- Transport order modal: chọn loại xe → _loadVehiclesByType; chọn xe → bind driver 1 + SĐT + fuelDriverId; cả 2 dropdown lái xe dùng listEmployees
- Transport order modal: loadVehicle(id) → listOilQuota; mỗi segment chọn lượng hàng; onSegmentQuotaChange → fuelNorm, fuelAmountCalculated; calulateOil() tính tongdau
- Transport order modal: **layout mới** — chủ đạo là giao diện location/route; xe+lái xe ẩn mặc định (toggle button); tabs ẩn mặc định (toggle button)
- Transport order modal: **drag-drop route builder** — pool điểm từ ShippingTask (pickup/delivery), kéo thả sắp xếp thứ tự, per-segment km + ETC
- Transport order modal: **per-segment map button** — mỗi đoạn A→B có nút riêng mở Vietmap
- Transport order modal: **"Thêm điểm khác"** — dropdown ng-select tìm kiếm từ `getLocations()` (UnifiedLocation: CustomerLocation + Port), badge KH/Cảng
- Transport order modal: **Unified Location endpoint** — `SP_GetAllLocations` UNION ALL CustomerLocations + Ports với `locationType TINYINT` (1=KH, 2=Cảng) tránh ID collision; filter theo `@ListCust` tùy chọn
- Transport order modal: **lưu lộ trình đã duyệt per-segment** — `listWaypoints` (turn-by-turn: lat,lng,name,distanceM) lưu vào `Tbl_TransportOrder_Segment_Waypoints`; `routePolyline` (full GeoJSON coordinates JSON) lưu vào cột `RoutePolyline` trên segment
- Transport order modal: **mở lại bản đồ** — nếu segment có `listWaypoints` → `showSaved()` vẽ lại từ `routePolyline` (mượt theo đường nhựa), KHÔNG gọi Vietmap API lại
- Transport order modal: `StartLocationType`/`EndLocationType` trên segment phân biệt điểm KH vs Cảng
- Transport order modal: **location picker table** — thay ng-select bằng bảng có filter (loại + tên/địa chỉ), sortable columns, row highlight khi chọn, badge Nhà máy/Cảng/Bãi; location không có tọa độ GPS mờ đi (opacity 0.45) và không cho chọn
- Transport order modal: **"Lộ trình toàn tuyến"** — nút header mở bản đồ read-only ghép tất cả segment theo thứ tự, không cho chỉnh sửa
- Transport order modal: **"Tính lại (Vietmap)"** per-segment — mở Vietmap edit mode, ghi đè lộ trình cũ; km tổng + fuelAmountCalculated tự cập nhật sau khi chọn
- Transport order modal: **"So sánh"** per-segment — mở `modal-route-compare` chia đôi màn hình
- modal-vietmap-routes: `showSaved(steps, polyline)` mode — vẽ polyline màu cam nét đứt, populate turn-by-turn list, không fetch API
- modal-vietmap-routes: `RouteSelected` emit đầy đủ `{summary, km, waypoints, steps, polyline}`
- modal-vietmap-routes: extract `currentSteps` (lat/lng/name/distanceM từ instruction+coordinates), `currentPolyline` (JSON full geometry)
- modal-map-routes (Google Maps): `RouteSelected` nâng cấp emit đầy đủ `{summary, km, steps, polyline}` — decode `overview_path` → `[lng,lat][]`, extract steps từ `leg.steps`
- **modal-route-compare** (mới) — so sánh Vietmap vs Google Maps chia đôi màn hình 50/50:
  - Trái: Vietmap GL JS — drag mốc + click thêm điểm trung gian, hiển thị km/thời gian/phí BOT
  - Phải: Google Maps JS — DirectionsRenderer draggable, hiển thị km/thời gian
  - Nút "Dùng tuyến này" ở mỗi bên → lưu polyline + waypoints vào segment
  - Cả 2 SDK tải độc lập song song, không xung đột
- ShippingTask BE model: thêm PickupLatitude, PickupLongitude, DeliveryLatitude, DeliveryLongitude
- Transport order SQL migration: ALTER TABLE Segments (StartLocationType, EndLocationType, RoutePolyline), CREATE TABLE Tbl_TransportOrder_Segment_Waypoints, DROP/CREATE TVP TypeTransportOrderSegment + TypeTransportOrderSegmentWaypoint, SP_TransportOrder_Create/Update/GetById cập nhật waypoints
- Transport order modal: **bảng tải trọng + km per-segment** — tách khỏi giữa các điểm, đặt thành table riêng (Chặng / Tải trọng / Km / Dầu ĐM) ngay trên Tổng dầu ĐM; ng-select appendTo="body" tránh bị clip; km change gọi cả calulateOil() để ra số lít ngay
- Transport order modal: **_rebuildSegments fix** — match theo startLocationId+endLocationId thay vì index, giữ nguyên payloadWeight/fuelNorm/fuelAmountCalculated/routePolyline/listWaypoints/listStations khi thêm/xóa/kéo thả điểm
- Transport order: **bỏ 3 field DB** `LuotdiQuabai`, `LuotveQuabai`, `IsExport` — xóa khỏi SQL migration (STEP 0 idempotent), BE model, BE repository (CreateAsync + UpdateAsync), FE model
- Transport order: **fix SQL migration TVP drop order** — `SP_RouteSegmentDefault_Save` phải DROP trước `TypeRouteSegmentDefaultStation`
- Transport order: **fix CreateAsync trả 400** — đổi từ `ExecuteAsync` → `ExecuteScalarAsync<int>` để đọc `SELECT @NewId AS NewId`; controller sau create gọi `GetById(newId)` trả entity đầy đủ (có `id` + `refNo`) cho FE
- Transport order: **fix UpdateAsync trả 400** — `ExecuteAsync` + `SET NOCOUNT ON` trả 0; thêm `return 1` sau ExecuteAsync
- Transport order: **fix ToDataTable TVP** — thay `Enumerable.Empty<dynamic>()` bằng typed empty collections tránh lỗi "not enough fields in Structured type"
- Transport order: **fix Dapper parse error** — `CreatedBy`/`UpdatedBy` giữ `Guid?` trong BE model; user tự sửa kiểu cột trong DB thành `uniqueidentifier`
- Transport order list: **trang list mới** tại `/main/transports/transport-order` — toolbar (date range + chi nhánh + lái xe + keyword + Sửa/Xóa), bảng 15 cột + filter row, badge trạng thái semantic, pagination 50/trang, localStorage filter state, click RefNo mở modal edit; không có nút Thêm mới
- Transport order modal: **khi edit khóa cung đường** — `lastSegmentFinal=true`, dropdown chặng cuối `disabled`, ẩn cột trái pool điểm (`*ngIf="!routeConfirmed"`)
- Transport order modal: **RefNo header badge** — tách RefNo thành `<span class="to-header-refno">` với nền vàng `#f0b429`, `font-weight: 800`, shadow
- Transport order modal: **chi tiết công việc flat fields** — BE `TransportOrderDetail` thêm `JobId`, `ContType`, `SealNumber`, `ReferCode`, `PickupTime`, `PortOfLiftingName`, `PortOfLiftOffName`; FE model + HTML tab dùng `item.shippingTaskItem?.xxx || item.xxx` fallback; SP Result 6 cần UPDATE tay trong SSMS (template SQL đã cung cấp)
- Transport order: **Segment_Etcs → Segment_Stations** (2026-04-28):
  - Xóa nút "Thêm trạm thủ công" khỏi TO modal; tab "Chi phí" ẩn đến khi chốt cung đường; xe/lái xe luôn hiển thị
  - Model mới `SegmentStation` (FE) / `TransportOrderSegmentStation` (BE): `vietmapId INT`, `stationName`, `price` (theo loại xe), `allPrices` (JSON 5 loại), `isAvoided`; thay `listEtc` → `listStations` trên segment
  - `modal-vietmap-routes`: `_lastTollRaw` cache raw API response; `selectRoute()` build `allPrices` JSON từ 5 vehicle entries; emit `SegmentStation[]` với real Vietmap station ID
  - SQL migration: `Migration_TransportOrder_Stations_20260428.sql` — Drop Segment_Etcs table + TVP, Create Segment_Stations + TVP, Recreate SP_Create/Update/GetById, thêm `SP_TransportOrder_GetSegmentHistory` (trả 2 result sets)
  - BE: mới `TransportOrderSegmentStation.cs`; cập nhật `TransportOrderSegment.cs` (ListEtc→ListStations); `TransportOrderRepository` — CreateAsync/UpdateAsync/GetById/GetSegmentHistory đều dùng SP, xóa toàn bộ inline SQL
  - `TransportOrder.cs` BE thêm 8 field còn thiếu: `StartedDate`, `Finished`, `NoteFinished`, `FinishedDate`, `StartVehicleOdor`, `StartEupOdor`, `FinishVehicleOdor`, `FinishEupOdor`
  - SP_Create + SP_Update bổ sung đủ 11 tham số vận hành: `IsFuelApproval`, `IsRePaymentEtc`, `IsEmployeeDebitClosing`, `StartedDate`, `Finished`, `NoteFinished`, `FinishedDate`, 4 Odor fields
  - ✅ Migration SQL đã chạy thành công trong SSMS (2026-04-29)
- Transport order modal: **2-bước redesign** (2026-04-28):
  - Bước 1 "Khởi tạo cung đường": bỏ toggle nhà thầu phụ; panel phải luôn hiện chứa bảng chặng (chọn chặng cuối); xe/lái xe/bù dầu ẩn cho đến khi chốt; footer 1 nút "Hủy cung đường" → xuất hiện "Chốt cung đường" khi chọn chặng cuối
  - Bước 2 "Lệnh Vận Chuyển — REFNO": `confirmRoute()` gọi `add()` → nhận `{id, refNo}`, set `routeConfirmed=true`; xe/lái xe/bù dầu hiện ra; footer "Hủy" + "Lưu" + duyệt B1/B2/Chốt/Từ chối theo status
  - Biển số xe: ng-select toàn bộ xe (`listVehicles` load khi mở modal, `vihicletype=0`), chọn xe auto-set `entity.vehicleType = vehicle.vihicleTypeId` (ẩn)
  - Bỏ "Loại xe" và "Loại Cont" khỏi form
  - Thêm `ngOnInit()`, permissions `TO_CLOSING` / `TO_ACCEPT`
  - Approval methods: `updateState()`, `duyetB1()`, `duyetB2()`, `chotLenh()`, `tuchoiB1()`, `tuchoiChotLenh()`
  - SCSS: thêm `.to-action-footer` + `.to-footer-spacer`
  - Toggle bar: "Thông tin cung đường" + "Chi tiết công việc & Chi phí lệnh"
- SP_GetAllLocations: UNION ALL CustomerLocations + Ports với locationType discriminator (1=KH, 2=Cảng)
- SP_CustomerLocations_UpdateGeocode, SP_Ports_UpdateGeocode
- ShippingTask SP getBy*: JOIN thêm PickupLatitude, PickupLongitude, DeliveryLatitude, DeliveryLongitude
- Transport order: onAttachFileChanged() → S3 upload ảnh hiện trường
- modal-route-compare: Google Maps phí BOT via Distance Matrix API
- Transport order: **lọc mooc khỏi listVehicles** — hardcode `[17, 18, 1309]` là typeId mooc, lọc cả `listVehicles` lẫn `listVehiclesFiltered` trong `_loadVehiclesByType()`
- Transport order: **fix toll price mapping** — `_botTypeMap: Record<number,number>` ánh xạ `vihicleTypeBotId` DB (1132-1136) → Vietmap API key (1-5); `_applyTollPrices()` dùng map trước khi tra `allPrices` JSON
- Transport order list: **fix DeleteAsync 400** — `await ExecuteAsync(...)` rồi `return 1` (SET NOCOUNT ON trả 0, tương tự UpdateAsync fix); reload list sau xóa dùng `loadData()` thay filter local
- Transport order modal: **payloadWeight readonly khi đã chốt** — `[disabled]="routeConfirmed"` trên ng-select tải trọng; km field luôn `[readonly]="true"`
- Transport order list: **nút Xóa chỉ admin thấy** — `*ngIf="adminPermission"` trên delete button
- **modal-route-compare redesign** (2026-05-10):
  - Ẩn nút "Dùng tuyến Google" (Google chỉ để tham khảo)
  - Đổi tên nút Vietmap → "Xác nhận cung đường"; `[disabled]="showWarning"` khi cảnh báo đang mở
  - Cảnh báo km: nếu Vietmap > Google ≥ 1km → hiện warning box + textarea lý do; phải nhập lý do mới confirm
  - Warning text: "dài hơn" (thay "lớn hơn")
  - `CompareRouteResult` interface thêm `note?: string`; `_emitVietmap(note)` helper; `confirmVietmapSelection()` emit kèm note
  - `show()` reset `showWarning` + `warningReason` mỗi lần mở modal
- Transport order modal: **tổng km chỉ tính chặng đã chốt** — `calculateTotal()` + `_fetchSegmentHistory()` chỉ cộng/điền km khi `s.routePolyline` tồn tại
- Transport order modal: **mooc "Đầu kéo không"** — prepend `{id:0, licensePlates:'Đầu kéo không'}` vào `listMoocs`
- Transport order modal: **Container bắt buộc chọn mooc** — `confirmRoute()` kiểm tra `vehicleType===16 && entity.moocId == null` → toast lỗi; dùng `== null` thay `!moocId` vì `id=0` là falsy, tránh false-positive khi chọn "Đầu kéo không"
- Transport order modal: **fix isLocInRoute** — signature `(locationId, taskId?, type?)`, check composite `locationId + taskId + type`; `addToRoute()` truyền `task.id + type`; HTML cập nhật 4 chỗ gọi; tránh gray nhầm card khi cùng địa điểm
- Transport order modal: **Hướng dẫn cung đường** — `_rebuildDispatchSummarize()` gom `seg.note` thành "Chặng N: lý do"; gọi từ `_applyCompareRoute()` sau khi nhận note từ compare modal; HTML section `*ngIf="entity.dispatchSummarize"` với `<pre>` display; CSS `.dsg-route-note` / `.dsg-route-note-title` / `.dsg-route-note-content`
- Transport order modal: **fix note accumulate** — `_applyCompareRoute()` dùng append thay ghi đè: `seg.note = seg.note ? old+'\n'+new : new`; nếu `event.note` rỗng (không cần lý do) giữ nguyên note cũ
- Transport order modal: **fix chốt cung đường thiếu định mức dầu** — `confirmRoute()` thêm guard `missingFuelNorm = segments.some(s => !s.fuelNorm || s.fuelNorm <= 0)` → toast "Định mức dầu phải > 0 — vui lòng chọn xe có định mức dầu trước khi chốt cung đường" (chặn trường hợp chọn tải trọng nhưng xe chưa có oilQuota khớp)

## TO ↔ FCL Refactor — SQL Migration đã viết (2026-05-14)
- **`Migration_TO_FCL_Phase1A_20260514.sql`** (file tại `NewAPI/`, non-breaking, idempotent):
  - ADD `IsLegacy BIT NOT NULL DEFAULT 0` vào `DispatchOrderFCL`
  - UPDATE record cũ SET `IsLegacy = 1` (1-time qua extended property `MS_TO_FCL_Phase1A_LegacyMarked`)
  - ADD `FclRefNo NVARCHAR(50) NULL` vào `Tbl_TransportOrders`
  - CREATE UNIQUE filtered index `UX_TransportOrders_FclRefNo` (1-1 enforce ở DB level)
  - Wrap `TRY/CATCH + TRAN`, dùng `IF NOT EXISTS` mỗi STEP
- **`Migration_TO_FCL_Phase1C_20260514.sql`** (breaking, idempotent — chờ deploy ổn mới chạy):
  - Drop default constraints trước (dynamic SQL)
  - DROP 59 cột trên `Tbl_TransportOrders`: ShippingUnit*, Vehicle*, Mooc*, Driver*/SecondDriver*, FuelDriverId, Weight, Volume, IsExport, ContType, OilPrice, OilCompensation, ReasonOilCompensation, Subcontractors*, DispatchSummarize, InquiryTime*, ContactInformation, Note, Odor*, Grade*, Evaluation*, Started/Finished*, IsDeny, Feedback, Closing*, IsFuelApproval, IsRePaymentEtc, IsEmployeeDebitClosing, Tongdau, Chiphidau, IsSummarized, AccountingDate, ReferCode, LuotdiQuabai, LuotveQuabai
  - DROP `Tbl_TransportOrder_Fees`, `Tbl_TransportOrder_Details`
  - Comment hậu migration: DROP TVP/SP + verification query (còn lại ~13 cột)
- Quotation subcontractors
- Shipping tasks: CS, LG, OpMan views
- Fuel/gas management: driver fuel approval, debit, limit
- External oil purchased tracking
- Fuel closing (driver-level and site-level)
- Gas import management
- ETC repayment (toll fee reimbursement)
- Dispatch order reports: BC01, BC02, BC03
- Vietmap route + toll calculation integration

## CBT (customer-specific module)
- CBT dispatch orders
- Driver fuel approval CBT
- External oil purchased CBT
- Advance CBT
- Payment CBT
- Reports: BC01, costs, profit, revenue

## Advance & Payments
- Advance CRUD + approval workflow
- Payment CRUD + approval workflow
- Additional invoice information
- Cont bets (container bets)
- Debt inventory
- Deposits
- Employee debit closing
- Employee limits
- Personal loans
- Rebets
- Repayments
- Payment detail reports

## Accounting
- Fund management (phiếu chi, phiếu thu)
- Fund reserve
- Debt management (customer debt, supplier debt)
- Employee debit/credit
- Export invoices
- On-behalf payments
- Summary supplier costs
- Debit/credit reports
- **DriverFuelApproval.IsPaymented** bool — thêm vào BE model (`DriverFuelApproval.cs`) + FE interface (`driver-fuel-approval.model.ts`)
- **SP_DriverFuelApproval_GetBySupplier_ForAccount** — interface + repo + controller endpoint `POST /api/DriverFuelApproval/get-by-supplier-for-account`; FE: `getBySupplierForAccount(supplierId)` trong `DriverFuelApprovalService`
- **modal-summary-supplier-cost type=1 "Phiếu mua dầu"**: `supplierChanged()` case 1 load phiếu dầu theo NCC; mapping `driverName + licensePlate → contents`, `totalCost → amount`, `note → notes`
- **phiếu chi / phiếu thu list**: server-side paging — pageSize mặc định 20, dropdown chọn 10/20/50/100, totalRows từ `res.data.totalRows`, pagination controls ngx-bootstrap
- **modal-phieu-chi-lenh** redesign toàn diện:
  - Checkbox chọn từng dòng phí; chọn 1 dòng → auto check/uncheck toàn bộ dòng cùng refNo
  - check-all / uncheck-all tác động filteredFees; tổng tiền + số lượng chọn theo filteredFees
  - Column filters: Số lệnh, Mã/Tên phí, Nội dung — `(ngModelChange)` trigger recalculateAmount ngay
  - Modern UI (pc- prefix): gradient header, 2-col form grid, dark table header sticky, amount box nổi bật, scrollable table
  - Export Excel chi tiết lệnh via ExportService
  - Cột checkbox ẩn khi `flagXem = true`
  - Save chỉ gửi `filteredFees.filter(checked)` lên API

## Workflows
- Job workflow creation and management
- Assigning jobs to employees
- Assigned job tracking
- Workflow BC01 report

## Sales & Marketing
- Potential customer tracking
- Quotation management (DK04, customer quotations)
- Contract management (new + extensions)
- Sales customer tracking
- Sublist category management
- Customer DK05

## HRM
- Leave management (onleave + onleave management)
- Overtime management
- Go late / back early tracking
- Timekeeping
- Approver permission setup (general + customer-specific)
- Training documents
- Training templates

## Canon
- Canon job management
- Canon shipping
- Canon workflow
- Canon pricing
- Canon road management
- Canon quotation subcontractors
- Canon debit notes
- Canon DB detail view

## Garage / Vehicle Inspection
- Vehicle inspection (integrated with Innvie external system)
- Vehicle inspection job definition
- Vehicle inspection permissions
- Request new employee

## Systems
- User management (create, update, disable)
- Role management
- Function/menu management
- All permission management screens

## AI / External
- Google Gemini 2.5 Flash: invoice data extraction (`POST /api/geminiAI/extract-invoice`)
- Google Document AI: document processing
- Claude AI controller (endpoint exists)
- Vietmap API: route planning + toll calculation
- Vietcombank exchange rate fetch
- Igas integration
- DBS EDI integration
- `GoogleMapService`: follows Google Maps URL redirects, extracts lat/lng với `CultureInfo.InvariantCulture` + GPS range validation
- Auto-geocode on Create/Update: CustomerLocations + Ports
- Admin-only `POST geocode-all` endpoints on CustomerLocations + Ports — batch backfill
- `DapperAdapter.Parameters.AddGeoCoord()` — truyền tọa độ GPS với `DbType.Decimal, precision:18, scale:6`
- **AI Invoice Extraction — frontend hoàn chỉnh**: `GeminiAiService` gọi `POST /api/geminiAI/extract-invoice`; `modal-doc-hoa-don` hiển thị kết quả (vendor, customer, hóa đơn, bảng hàng hóa, link + URL đầy đủ, ảnh preview); nút "Đọc hóa đơn" ở header list Thanh toán; modal rộng 90vw
- **Pending Invoice — SQL Migration**: `Tbl_PendingInvoice` + 7 SPs: Create, GetPending (filter EmployeeId/ngày/vendor), GetById, MarkPaid, Delete, CheckDuplicate; lưu FileName + PathFile (local + S3); CreatedDate convention

## Module Tính Lương Lái Xe — Thiết kế (2026-05-03)
- **Thiết kế đầy đủ, chưa implement**: Tài liệu `KeHoach_TOANBO_LuongLaiXe.docx` (33.8 KB) tại `D:\Delta\DeltaSoft\NewAPI\` — công thức tổng quát, schema DB (ALTER 4 bảng hiện có + 5 bảng mới + 2 type OtherCategories), bảng cấu hình DayWage (~30 rows) + Km (5 rows) + Milkrun 42 tuyến, kế hoạch 4 phase. Lưu vào memory `project_driver_salary_module.md`.
- **Công thức**: `LuongPhaiTra = MAX(5.310.000, LuongKinhDoanh)` trong đó `LuongKinhDoanh = SUM(per lệnh: DayWage + MAX(LuongKms, TripMin) + PhuCapLenh) + PhuCapThangCoDinh + ThuongPhatDau`
- **Schema**: ALTER `Tbl_VehicleTypes` (+SalaryVehicleClassId), `Tbl_Employees` (+DriverSalaryTypeId TINYINT), `Tbl_TransportOrders` (+RouteGroupId), `Tbl_Routes` (+TripSalaryMin); tái dụng `OtherCategories` với 2 type mới (SALARY_ROUTE_GROUP: GR01-GR10, SALARY_VEHICLE_CLASS: VC01-VC05)
- **Bảng mới**: `Tbl_DriverSalaryDayWageConfig`, `Tbl_DriverSalaryKmsConfig`, `Tbl_DriverSalaryMilkrunConfig` (42 tuyến MC/MF/MK/MZ/MG/MN), `Tbl_DriverSalary`, `Tbl_DriverSalaryDetail`

## Ports (Cảng bãi)
- Model FE: đổi `groupPort` (string) → `groupPortId: number` + `groupPortName: string`
- SQL migration `Ports_GroupPort_And_IsAvoided_Migration.sql` (file tại `NewAPI/`):
  - Part A: INSERT GroupPorts → OtherCategories (type='GROUPPORTS'); ADD GroupPortId FK; UPDATE mapping; DROP GroupPort column; recreate SP_Ports_GetAll/GetByCode/Create/Update với LEFT JOIN OtherCategories
  - Part B: hướng dẫn patch SP_TransportOrder_Create/Update thêm `IsAvoided` vào INSERT Tbl_TransportOrder_Segment_Etcs
  - ⚠️ Migration chưa chạy — cần chạy trong SSMS trước khi BE hoạt động đúng
- GroupPorts FCL: `getAllGroupPorts()` trong `PortsService` vẫn giữ nguyên; FCL modal components tiếp tục dùng

## Transport Order (TO) — Fixes & Data Layer (2026-04-29)
- **Xóa 3 field không dùng**: `LuotdiQuabai`, `LuotveQuabai`, `IsExport` bị loại khỏi `Tbl_TransportOrders` (STEP 0 migration: `ALTER TABLE DROP COLUMN` idempotent), khỏi SP_Create/Update (param + INSERT + SET), BE model `TransportOrder.cs`, FE model `transport-order.model.ts`
- **Fix TVP drop order**: STEP 12 migration — drop `SP_RouteSegmentDefault_Save` trước khi drop `TypeRouteSegmentDefaultStation` (SQL Server không cho drop TVP đang được tham chiếu)
- **Fix `ToDataTable<dynamic>` bug**: `?? Enumerable.Empty<dynamic>()` khiến compiler suy ra `T=dynamic=object` → DataTable 0 cột → SQL Server error "not enough fields in Structured type". Fix: thay bằng `(coll ?? Enumerable.Empty<ConcreteType>()).Select(...)` trong cả CreateAsync lẫn UpdateAsync cho cả 4 TVP (segments, stations, waypoints, details, fees)
- **Fix CreateAsync luôn trả 0**: `ExecuteAsync` với `SET NOCOUNT ON` luôn = 0 → controller branch `"400"/"Error"`. Fix: đổi sang `_conn.QueryFirstOrDefaultAsync<int>()` để đọc `SELECT @NewId AS NewId` từ SP → controller nhận `newId > 0` → `"200"/"Success"`
- **Fix notification method names**: `this._notif.success/error` → `printSuccessMessage/printErrorMessage` trong `saveSegmentDefault()`
- **"Lưu mặc định" button**: thêm nút `btn-segment-save-default` vào `segment-map-btn-row` (HTML + SCSS); hiện khi `distanceKm` có giá trị, disabled khi chưa có `routePolyline`; gọi `saveSegmentDefault(i)`

## Transport Order List — trang danh sách `/main/transports/transport-order` (2026-04-29)
- Lazy-loaded module `TransportOrderModule` → route `/main/transports/transport-order`
- Filter bar: date range + branch (admin) + driver (client-side) + keyword (server-side)
- Table: 15 cột — status badge, RefNo link, referCode, ngày, người lập, đơn vị VC, lái xe + SĐT, biển số (plate badge), mooc, lộ trình, tongKm, tongdau, ghi chú, flags (isFuelApproval, isSummarized)
- Filter row per-column + status dropdown (9 trạng thái) — client-side
- Paging 50/trang với ngx-bootstrap pagination
- Click row chọn; click RefNo mở modal edit; Sửa/Xóa buttons (xóa chỉ cho phép status=0)
- Save params vào localStorage khi mở modal → restore khi quay về
- Không có nút "Thêm mới" — thêm mới phải từ giao diện thực hiện việc
- Design hiện đại: card + shadow, gradient header, status pill badge màu semantic, plate badge, spinner

## Transport Order (TO) — Fixes (2026-05-09)
- **Warning compare modal — tiêu đề rõ**: đổi text cảnh báo khi Vietmap > Google ≥1km thành *"Hãy điều chỉnh lại cung đường theo Google Maps, nếu vẫn muốn sử dụng VietMap, hãy trình bày lý do tại sao lại sử dụng cung đường lớn hơn."* + hiển thị km 2 bên nhỏ phía dưới
- **Tóm tắt lệnh ẩn trạm 0đ**: getter `allTollStations` filter `price > 0` → bảng tự ẩn khi toàn bộ trạm chưa có giá (chưa chọn xe)

## Transport Order (TO) — Fixes (2026-05-08)
- **Fix DeleteAsync trả 400**: `ExecuteAsync` với `SET NOCOUNT ON` trả 0 → controller `result > 0` false → báo lỗi dù đã xóa. Fix: `await ExecuteAsync(...)` rồi `return 1` (cùng pattern với UpdateAsync). BE: `TransportOrderRepository.DeleteAsync`
- **Fix list TO reload sau xóa**: bỏ `list.filter + filterData()` thừa trong `deleteConfirm()`, chỉ giữ `loadData()` (nó gọi `filterData()` bên trong)
- **Nút xóa chỉ admin thấy**: `*ngIf="adminPermission"` trên delete button trong `transport-order.component.html`
- **Lọc mooc khỏi listVehicles**: hardcode `![17, 18, 1309].includes(v.vihicleTypeId)` cho cả `listVehicles` (load khi mở modal) lẫn `listVehiclesFiltered` (load khi chọn loại xe)
- **Fix mapping giá trạm thu phí**: `vihicleTypeBotId` trong DB dùng giá trị `1132–1136`, không phải `1–5`. Thêm `_botTypeMap: {1132:1, 1133:2, 1134:3, 1135:4, 1136:5}` → `_applyTollPrices()` dùng map này tra key Vietmap trước khi đọc `allPrices`
- **Toll price = 0 khi chưa chọn xe**: `_parseTollStations()` luôn gán `price: 0`; `_applyTollPrices()` chỉ fill giá khi `_vehicleBotTypeId` có giá trị và tồn tại trong `_botTypeMap`
- **Google Maps compare chỉ tham khảo**: ẩn nút "Dùng tuyến Google" trong `modal-route-compare`; đổi tên Vietmap button → **"Xác nhận cung đường"**
- **Warning khi Vietmap > Google ≥ 1km**: nếu `vietmapKm - googleKm >= 1` → hiện box cảnh báo + textarea bắt buộc nhập lý do trước khi confirm; `CompareRouteResult` thêm `note?: string`; `TransportOrderSegment` thêm `note?: string`; `_applyCompareRoute()` lưu `seg.note = event.note`; nếu km nhỏ hơn thì `seg.note = ''`
- **Tải trọng (payloadWeight) readonly khi đã tạo lệnh**: `[disabled]="routeConfirmed"` trên ng-select tải trọng
- **Km per-segment luôn readonly**: `[readonly]="true"` trên input distanceKm — chỉ cập nhật qua Vietmap/compare, không cho nhập tay ở bất kỳ bước nào
- **Tổng km chỉ tính từ segment có cung đường**: `calculateTotal()` chỉ cộng `distanceKm` của segment có `routePolyline`; `_fetchSegmentHistory()` chỉ fill `distanceKm/fuelNorm/etcCost` khi response cũng có `routePolyline` → chọn điểm xong tổng km vẫn = 0 cho đến khi chọn cung đường Vietmap

## Transport Order (TO) — UI & Logic Enhancements
- **Layout 3:7** — cột lộ trình : thông tin lệnh (SCSS flex 3 / 6→7)
- **Trạm thu phí từ Vietmap modal**: `modal-vietmap-routes` emit `tollStations[]` trong `RouteSelected`; `TollStation.priceRaw` lưu giá số; `onRouteSelected` nhận và gán thẳng vào `seg.listEtc` — không gọi API lần 2
- **`_fetchTollForSegment()`**: fallback gọi `GetRouteAndToll` sau khi chọn tuyến từ Google/Compare modal
- **Segment table mới**: cột "Chặng" (Chặng đầu / Chặng N / dropdown "Chặng cuối" ở dòng cuối); cột "Mô tả" (A→B); đổi tên "Dầu định mức"; cột "Trạm phí" (tên trạm per-segment)
- **`lastSegmentFinal` flag**: chọn "Chặng cuối" → block thêm điểm từ pool + "Thêm điểm khác"; reset khi xóa điểm
- **Bù dầu + Lý do bù dầu** chuyển lên ngay sau bảng chặng; ẩn Giá dầu
- **Tóm tắt lệnh** (grid read-only): Tổng km + Tổng dầu + bảng trạm phí với giá + checkbox "Tránh trạm" (`isAvoided`)
- **Hướng dẫn cung đường** (đổi tên từ "Tóm tắt lệnh" textarea) — nằm dưới grid Tóm tắt lệnh
- **`isAvoided` trên `TransportOrderSegmentEtc`**: FE model + BE model (`TransportOrderSegmentEtc.cs`) + BE repository (Create + Update); migration SQL tích hợp vào `Ports_GroupPort_And_IsAvoided_Migration.sql` Part B
- **Pool panel toggle**: nút ẩn/hiện cột "Điểm hàng từ công việc" (`showPoolPanel` flag); CSS `transition width 0.2s`; collapsed → 38px; fix padding `.pool-col-header` tránh button tràn qua vòng tròn số thứ tự
- **Lộ trình toàn tuyến — trạm thu phí**: `showSaved()` nhận thêm `tollStations?[]` → tạo `TollInfo` → hiển thị bảng trạm phí + tổng phí giống segment thường; `showFullRouteMap()` gom ETC từ tất cả segment truyền vào
