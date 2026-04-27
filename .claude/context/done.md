# Completed Features

## Core Infrastructure
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
- Transport order modal: **_rebuildSegments fix** — match theo startLocationId+endLocationId thay vì index, giữ nguyên payloadWeight/fuelNorm/fuelAmountCalculated/routePolyline/listWaypoints/listEtc khi thêm/xóa/kéo thả điểm
- SP_GetAllLocations: UNION ALL CustomerLocations + Ports với locationType discriminator (1=KH, 2=Cảng)
- SP_CustomerLocations_UpdateGeocode, SP_Ports_UpdateGeocode
- ShippingTask SP getBy*: JOIN thêm PickupLatitude, PickupLongitude, DeliveryLatitude, DeliveryLongitude
- Transport order: onAttachFileChanged() → S3 upload ảnh hiện trường
- modal-route-compare: Google Maps phí BOT via Distance Matrix API
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

## Ports (Cảng bãi)
- Model FE: đổi `groupPort` (string) → `groupPortId: number` + `groupPortName: string`
- SQL migration `Ports_GroupPort_And_IsAvoided_Migration.sql` (file tại `NewAPI/`):
  - Part A: INSERT GroupPorts → OtherCategories (type='GROUPPORTS'); ADD GroupPortId FK; UPDATE mapping; DROP GroupPort column; recreate SP_Ports_GetAll/GetByCode/Create/Update với LEFT JOIN OtherCategories
  - Part B: hướng dẫn patch SP_TransportOrder_Create/Update thêm `IsAvoided` vào INSERT Tbl_TransportOrder_Segment_Etcs
  - ⚠️ Migration chưa chạy — cần chạy trong SSMS trước khi BE hoạt động đúng
- GroupPorts FCL: `getAllGroupPorts()` trong `PortsService` vẫn giữ nguyên; FCL modal components tiếp tục dùng

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
