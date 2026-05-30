# Pending / In-Progress Work

## ⏳ CHỜ TEST + COMMIT (working tree 2026-05-28) — modal-execute-fcl + fix "UI đơ F5" + polish dispatchorder
Cụm thay đổi session 2026-05-28, build sạch (`ng build` 0 error), đang ở working tree web-app-update main. Chi tiết: done.md 3 section đầu. **Cần: `ng serve` → test E2E → bảo commit** (gợi ý tách 3 commit: `modal-execute-fcl + tab perform`, `fix backdrop leak xuyên route`, `polish dispatchorder + route`).
1. **modal-execute-fcl**: màn THỰC HIỆN lệnh FCL mới (component mới song song, KHÔNG đụng `modal-perform-fcl` cũ). Mở qua tab thứ 3 ở `perform-dispatch-order`. Readonly toàn bộ trừ 4 phần: POD (upload riêng, isPod=true), Ảnh hiện trường (upload riêng, isPod=false), Chi phí (listFee CRUD), Trốn vé (checkbox isPassed). Thêm 3 field lái xe nhập (Km đầu/cuối/ghi chú) khi `status≤2`. Khoảng ngày list = 7 ngày gần nhất. ngx-spinner loading 3 tab.
2. **Fix "UI đơ phải F5"** (root cause GLOBAL từ FCL refactor, ảnh hưởng toàn app): `ngOnDestroy` defensive ở 4 modal lớn (FCL v2/AddExtra/Vietmap/Compare) + cleanup WebGL map + scrub stuck `.modal-backdrop`/`body.modal-open`. Safety net global ở `app.component.ts` listen `NavigationEnd`. Cách verify: DevTools console watch backdrop count (xem done.md).
3. **modal-dispatchorder polish**: (a) bug phân trang `modal-dispatchorder-route` mất tiêu — fix CSS overflow + bỏ height cố định, pagination sát footer; (b) bug Lái xe 1 (xe thuê ngoài) thiếu `required` — sửa input thêm `[required]="isSubcontractors"`; (c) UX báo lỗi cụ thể khi click Lưu (bỏ disable im lặng, toast tiếng Việt liệt kê field thiếu); (d) đổi loại xe → reset 12 field xe/mooc/lái xe/định mức cũ.

## ✅ ĐÃ COMMIT (2026-05-27) — cụm gmap / FCL mới / hóa đơn / báo giá thầu phụ
Các cụm 2026-05-24/25 đã commit (git log: `3f3682e` gmap, `00333d6` FCL mới, `5fc580e`+hóa đơn flash-lite, `fac87e5` lock báo giá). **API key Gemini đã dời khỏi git** → `appsettings.Development.json` (đã `git rm --cached`). Còn theo dõi chi phí Cloud Billing vài ngày (xem section hóa đơn dưới).
1. **Validate gmap CustomerLocations + Ports**: link sai → 400 "Địa chỉ Google Map không đúng" (không lưu); đổi link → geocode lại; FE hiện message. Bỏ nút test ở modal customer-locations.
2. **Lệnh FCL mới**: (a) modal phát sinh bắt buộc **tải trọng** → tính dầu; (b) khóa lái xe + cung đường vận tải + header sau khi có **refNo**; (c) shipping task sửa tới trước B1; (d) tải trọng inline ở list tự lưu + toast; (e) nút "Lập lệnh (Location)" gate `DISPATCHORDER_CREATE`. *Lưu ý:* modal phát sinh chỉ THÊM mới (sửa inline ở list); nếu muốn "list readonly, sửa trong modal" thì làm chế độ edit cho `modal-add-extra-segment`.
3. **Khóa sửa báo giá thầu phụ đã duyệt** (chỉ bảng transports, KHÔNG Canon): `QuotationSubcontractorsController.Update` đọc trạng thái THẬT từ DB (`GetById`), nếu `IsApproved` → 400 "Báo giá đã duyệt, không được sửa." FE: nút Lưu ẩn khi đã duyệt (kể cả admin/accept).

## Site nháp song song ERP (Draft Site) — Phase 3 XONG 4/4 menu (cập nhật 2026-05-29)
Lộ trình chi tiết + kiến trúc đã chốt: [draft-site-roadmap.md](draft-site-roadmap.md). Tóm tắt: site nháp public cho AI/người nhập lô/cv/TT/debit nháp (JSON envelope, Draft API process riêng + login `draft_app` chỉ schema `draft` chung DB), người duyệt + promote trong ERP thật; ERP API thêm lớp chặn `aud=draft` (read-only allowlist). **Thứ tự (đảo 2026-05-24):** xây TRỌN site nháp trước (P0 DB → P1 ERP API token/đọc-only BE → P2 Draft API → P3 site nháp FE đủ 4 menu), CHƯA đụng FE ERP; view+approve ERP làm sau (P5).
- **✅ Phase 0 XONG (2026-05-24):** schema `draft` + `draft.DraftEntries` + 6 SP `SP_DraftEntries_*` + login `draft_app`.
- **✅ Phase 1 XONG + merge master (2026-05-24):** ERP API token `aud=draft` + `DraftAudienceGuardFilter` default-deny + login-draft.
- **✅ Phase 2 TEST ĐẠT e2e (2026-05-27):** project `D:\Delta\DeltaSoft\DraftAPI` (.NET 9). Xóa nháp KHÔNG cần quyền ERP nhưng chỉ chủ tạo. `createdByName` fallback GetUserName khi GetFullName rỗng.
- **✅ Phase 3 XONG 4/4 menu (2026-05-29) — commit `45f69e6` push `funneo/DeltaSoftDraftFE`:**
  - Lô hàng (2026-05-27): port 4 tab form ERP, list ag-grid với cột khớp ERP.
  - **Debit + Payment + Workflow (2026-05-29):** copy 1:1 từ ERP, modal **fullscreen**, css compact, nút Lưu/Hủy header (bỏ In), bỏ "Chuyển duyệt", reuse `modal-shipment-search` chéo 3 module. Payment có thêm nút chọn Lô hàng (khác ERP). Token JWT mang `employeeId` claim → "Người làm TT" default = chính user. Chi tiết: done.md section đầu.
- **▶ Cần test E2E sau khi restart ERP API** (load allowlist mới: jobgroup/jobgroupoption/handlinggroup, shipment/getfordebitnotes, supplier, employee, …) + restart Draft API.
- **Việc kế (chờ feedback):** (a) port sub-modal showJob/showFiles/showDispatchOrder trong debit-form (đang toast placeholder); (b) Phase 4 — Promote: ERP cần màn "Duyệt nháp" để bê record `draft.DraftEntries.Payload` → `Tbl_*` thật; (c) Phase 5 — view/approve ERP (UI duyệt + audit log).

---

## Đọc hóa đơn — AI Studio + ZIP/RAR + flash-lite + LOW + đa hóa đơn/1 PDF — CHẠY ĐƯỢC, CHƯA commit (cập nhật 2026-05-25)

Đã migrate Vertex→**AI Studio REST** + retry + tắt thinking + ZIP/RAR; session 2026-05-25 thêm: **flash-lite** (config), **mediaResolution=LOW** (−74% token ảnh), **đa hóa đơn trong 1 PDF** (AI trả mảng), nút đọc hóa đơn **chỉ admin** ở list thanh toán. Chi tiết: done.md 2 section đầu. **Bản cũ đã test chạy; bản 2026-05-25 chờ anh restart BE test.**
- **Cần anh test (Stop Shift+F5 → F5 trong VS để chạy bản mới):**
  1. Ảnh chụp điện thoại 1 hóa đơn dày chữ ở `LOW` còn đọc đúng không → nếu sai nhiều, đổi `MEDIA_RESOLUTION_LOW`→`MEDIUM` (1 dòng) hoặc điều kiện PDF=LOW/ảnh=MEDIUM.
  2. PDF gộp nhiều hóa đơn (có hóa đơn nhiều trang) → tách đúng, không gộp/cắt nhầm.
- **Còn lại (chờ user):**
  1. Theo dõi **chi phí** Cloud Billing vài ngày (số tiền trễ ~24h; request count gần realtime ở APIs & Services → Generative Language API → Metrics). Ước tính ~$0.001–0.002/hóa đơn (giờ thấp hơn nhờ flash-lite+LOW).
  2. Khi commit: **dời API key** `GoogleServices:Gemini:ApiKey` khỏi `appsettings.json` → `appsettings.Development.json`/env (đừng commit key lên git).
  3. Nếu gặp lại **malformed JSON** với hóa đơn phức tạp → cân nhắc thêm lại `responseSchema` (đã từng thêm rồi bỏ theo yêu cầu user).
  4. Tùy chọn tối ưu thêm: tăng `MaxParallel` cho ZIP lớn.
- **Nghiên cứu 2026-05-25 (DeepSeek & AI free khác):** DeepSeek API hosted **text-only** (không vision) → loại; DeepSeek-OCR/OCR-2 phải tự host GPU → đắt+phức tạp hơn. Gemini flash-lite ($0.10/M) đang rẻ nhất có vision sẵn. Ứng viên free duy nhất đáng thử sau: **Qwen3-VL/Qwen-OCR** (Alibaba, free tier, ~94.8% acc). Chưa đụng code.
- **⚠️ Lưu ý chạy đúng bản mới:** IIS Express khóa `bin\API.dll` → build CLI không ghi đè được, dễ test trúng DLL cũ (Vertex → treo). Luôn **Stop (Shift+F5) trong VS rồi F5 lại** để VS tự rebuild+chạy bản mới.

### Mặc định có thể chỉnh nếu cần (đang hardcode trong [GeminiAIRepository.cs](../../d:/Delta/DeltaSoft/NewAPI/API/Repositories/CustomerCommunicate/GoogleServices/GeminiAIRepository.cs))
- `MaxFilesPerArchive=30`, `MaxTotalUncompressedBytes=100MB`, `MaxParallel=5`. Nếu muốn cấu hình qua appsettings thì cân nhắc đưa ra config sau.

---

## Bảo mật / chống bot — 2026-05-21

### Đã làm (cần restart IIS Express + test)
- ✅ **Rate limit login** (.NET 9): 10 lần/60s/IP, trả 429. Lọc tạm ứng theo cá nhân/NCC ở thanh toán. Hợp nhất cảnh báo login chống dò tài khoản. (chi tiết: done.md section đầu)
- ✅ **Vay cá nhân — filter row client-side** (chỉ FE, cần `ng serve` + test): load toàn kỳ → lọc/phân trang/tổng tiền/export đều theo bộ lọc. (chi tiết: done.md section đầu)
- ⚠️ Test NAT văn phòng: nếu nhiều NV chung 1 IP công cộng bị chặn nhầm vào giờ cao điểm → tăng `RateLimit:Login:PermitLimit` trong appsettings.
- ⚠️ Vay cá nhân nay nạp toàn bộ bản ghi trong kỳ (pageSize=99999); nếu dữ liệu 1 kỳ quá lớn cân nhắc lại — hiện volume nhỏ nên OK.

### Lộ trình chống bot còn lại (theo thứ tự ưu tiên đã tư vấn — anh quyết khi nào làm)
- [ ] **Cloudflare trước IIS** (gói Free): bật "Block AI Scrapers", Bot Fight Mode + Managed Challenge cho **host web**; **KHÔNG** áp browser-challenge lên host API (sẽ phá app di động) — API chỉ rate-limit + WAF. Khi bật CF nhớ đảm bảo lấy đúng IP qua `CF-Connecting-IP` (code rate-limit đã hỗ trợ sẵn).
- [ ] **MFA/OTP** (TOTP) — vũ khí mạnh nhất chống cả brute-force lẫn AI agent dùng cred trộm. ERP nên có.
- [ ] **Turnstile** ở form login web (CAPTCHA vô hình). App di động dùng **Play Integrity / App Attest** thay vì Turnstile.
- [ ] **Account lockout** sau N lần sai (Identity đã có lockout cơ chế — cân nhắc bật/cấu hình rõ).
- [ ] **Rút ngắn JWT** (hiện 24h, quá dài) + refresh token + step-up auth cho thao tác nhạy cảm.
- [ ] **Anomaly/velocity detection** + giới hạn export để chống scrape qua UI.
- [ ] IIS: Dynamic IP Restrictions, ẩn header lộ công nghệ, HSTS.

### Quy ước tuyệt đối (memory)
- KHÔNG tự sửa SP / chạy DELETE/UPDATE/ALTER vào CSDL — chỉ đề xuất SQL để anh tự chạy (memory: `feedback_no_auto_db_writes`).

---

## Trạm thu phí gộp + tách modal cung đường phát sinh — hoàn tất 2026-05-20

Đã code xong + build pass (xem done.md section đầu). **Anh cần test E2E + restart IIS Express** (BE DLL bị khóa khi build):

1. **Trạm thu phí trong "Thông tin cung đường"**: chọn cung đường Vietmap có trạm → tự thêm dòng auto (nền vàng) với tên + tiền theo loại xe; nút "Thêm trạm" để thêm dòng nhập tay; đổi loại xe → giá auto cập nhật
2. **Validation lập lệnh**: trạm có tên mà tiền < 1 → cảnh báo + chặn lưu
3. **Khóa sau khi tạo lệnh** (có refNo): ẩn nút Thêm, không sửa/xóa được
4. **Modal cung đường phát sinh tách riêng**: bấm "+ Thêm" → modal `modal-add-extra-segment` mở; bấm Vietmap/So sánh → sub-modal hiện ĐÈ LÊN (modal phát sinh vẫn thấy ở dưới); lưu → totals cập nhật

### Caveat đã flag với anh (xử lý nếu test thấy)
- Sửa lệnh CŨ rồi tính lại Vietmap 1 chặng có thể nhân đôi dòng trạm (dòng load từ DB thiếu `_auto`) — nếu cần, thêm nhận diện dòng auto khi load
- Thiết kế báo cáo riêng cho extras (anh nói "để sau này" — chưa implement)

---

## Cung đường phát sinh — hoàn tất 2026-05-19

Feature đã code xong toàn bộ (SQL chạy production + BE 0 error + FE build pass). Đã chuyển popup inline → modal riêng `modal-add-extra-segment` (2026-05-20, xem section trên). Anh test E2E:

1. **Tạo mới lệnh**: chưa chốt "Chặng cuối" → nút Lưu KHÔNG hiện. Chốt → Lưu hiện. Trường hợp chỉ 1 chặng → auto-default "Chặng cuối"
2. **Sau khi save → reopen**: Vietmap/So sánh/Lưu mặc định ở cung đường vận tải biến mất; section "Cung đường phát sinh" hiện kèm nút "+ Thêm"
3. **Đổi tải trọng inline** trên row extra → debounce 400ms gọi `UpdateExtraSegment` → totals tự cập nhật
4. **Sau B1 (status≥3)**: extras locked, chỉ còn icon "Xem map"

### Việc còn lại (nếu test phát sinh issue)
- Có thể cần thêm endpoint `Get-By-Id` cho extra (hiện chỉ Get-By-FclRefNo qua bundle GetByRefNoWithTOAsync)

---

## Refactor TO ↔ FCL — Phase 2 còn việc nhỏ

### Trạng thái hiện tại
- ✅ Phase 1A, 1C, 2 SQL đã chạy production
- ✅ BE refactor xong (0 errors), FE Modal V2 đầy đủ + E2E pass
- ✅ Cung đường phát sinh đã thêm (xem section trên)

### Việc còn lại

#### FE — Trang list lệnh mới (ĐÃ XONG cơ bản 2026-05-22)
- ✅ Tạo component MỚI `dispatch-order-fcl-new` (list FCL isLegacy=0, UI hiện đại), repoint route `transport-order` → module mới. KHÔNG đụng FCL list cũ & TO (user tự lo phần FCL cũ). Chi tiết: done.md section đầu.
- ⚠️ Cần: (a) user thêm param `@IsLegacy` vào `SP_DispatchOrderFCL_GetAll`; (b) user xử lý FCL list cũ truyền `isLegacy=1`; (c) `ng serve` + test giao diện.
- Việc trước mắt đã ẩn (bật lại sau khi cần): Export, Chốt lệnh (SLL + từng dòng), Thanh toán.
- `TransportOrderModule`/component cũ còn nguyên nhưng không route nào dùng → cân nhắc xóa sau.

#### FE — Cleanup
- Search & remove dead code các form field cũ (Chang/Luonghang/Cang/Nhamay/etc.) trong template modal v2 nếu còn

### Quy ước quan trọng (đã chốt với anh)
- KHÔNG đụng BE/SP/FE hiện có của FCL legacy → tất cả tạo song song (`WithTO`)
- SP naming: `SP_<TableName>_<Action>` — KHÔNG gộp action với tên bảng khác
- "Tạo lệnh xong" = có `refNo` (khóa cung đường vận tải main); "Chốt B1" = `status >= 3` (khóa extras)
- Tongdau/TongKm/Chiphidau công thức gộp main segments + extra segments + OilCompensation
- `IsLegacy=0` set explicit khi INSERT FCL mới

### Tham chiếu
- Schema dump TO: `D:/Delta/DeltaSoft/web-app-update/sp_transportOrder.sql` (UTF-16 LE, đã reflect Phase 1C)
- Schema dump FCL: `D:/Delta/DeltaSoft/web-app-update/dispatchOrderFcl.sql` (UTF-16 LE)
- Migration files: `Migration_TO_FCL_Phase1A`, `Phase1C`, `Phase2_SPs_20260515`, `Migration_TO_ExtraSegments_20260519`
- Memory: `feedback_keep_legacy_create_new`, `feedback_sp_naming_convention`, `feedback_compact_ui_density`

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
