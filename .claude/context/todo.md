# Pending / In-Progress Work

## ▶ Session 2026-06-07 — SQL còn chờ anh chạy (FE+BE build sạch)
- **`SP_DriverFuelClosing_Delete`**: ALTER PROC sang `@Id INT` (bỏ STRING_SPLIT vì DB compat <130). SQL đã propose trong chat.
- **`SP_DraftEntries_GetPaging`**: DROP + CREATE bản LIKE pattern (bỏ JSON_VALUE). File `Migration_DraftSite_GetPaging_ExtendByEmployee_20260602.sql` đã cập nhật nội dung — anh chạy file đó.
- **`SP_DispatchOrder_GetForSummary`**: ALTER thêm `FuelDriverName` (LEFT JOIN Employee theo FuelDriverId) cho cả 3 nhánh UNION. SQL trong chat.
- **`SP_DriverFuelApproval_CancelExpired`**: tạo mới (Hủy IGAS hết hạn). SQL từ session trước, chưa chạy.
- **F039 grant**: ActionInFunctions + Permissions cho F039 (VIEW/CREATE/UPDATE/ACCEPT/DELETE).

**Sau khi chạy SQL**: restart ERP API (token Draft 24h + SP changes) + restart DraftAPI (port 44362, code mới `(int?)` cast + LIKE pattern).

## ⏸ Phase 5a — View Draft ở ERP — **TẠM DỪNG (2026-06-02), anh báo sau**
Anh chỉ thị dừng mọi việc liên quan ERP đọc dữ liệu Draft. Code/SQL đã làm GIỮ NGUYÊN — không revert. Khi anh báo lại sẽ tiếp Stage 3/4.

**ĐỔI PLAN (2026-06-02)**: bỏ tab Draft riêng → gộp 2 nguồn (ERP thật + Draft) vào CÙNG 1 list, dòng nháp highlight màu khác. Stage 1 SQL + Stage 2 BE đã làm vẫn dùng được (endpoint `/api/draft/getPagingForErp` không đổi).

### Đã làm (giữ nguyên)
- **✅ Stage 1 SQL** (anh đã chạy): `dbo.SP_DraftEntries_GetForErp_GetPaging`. File `Migration_DraftSite_GetForErp_20260602.sql`. Đọc trực tiếp `draft.DraftEntries` cùng DB.
- **✅ Stage 2 BE ERP** (code xong, anh build + test): 4 file `DraftEntryViewModel.cs` + `IDraft.cs` + `DraftRepository.cs` + `DraftController.cs`. Endpoint `POST /api/draft/getPagingForErp`.

### Quyết định UX (chốt với anh 2026-06-02)
- **Gộp 2 nguồn vào 1 list**, KHÔNG có tab riêng → UX nhất quán, không switch.
- **Sắp xếp**: trộn lẫn ERP + Draft theo `createdDate/createdAt desc` (sort chung).
- **Highlight dòng draft**: background **#FFF8E1** (vàng nhạt).
- **Click dòng draft**: mở **modal mới read-only riêng** cho từng DraftType (KHÔNG reuse modal ERP gốc — tránh động legacy).
- **Action**: dòng draft chỉ có nút "Xem" (read-only); dòng ERP nguyên các action cũ.

### ▶ Stage 3 — FE shared (chưa code)
- **`draft.service.ts`**: gọi BE `POST /api/draft/getPagingForErp`.
- **Helper `draft-row-mapper.ts`** (function thuần, không Component): `mapDraftToRow(draftType, draft, lookups)` → trả object có shape giống ERP row + flag `_isDraft=true` + `_draftId` + `_draftPayload`. Map fields theo từng DraftType:
  - Shipment/Canon: Payload.refNo→refNo, Payload.customerId→customer fields, Payload.shipmentType→type label, ...
  - Payment: Payload.refNo→refNo, Payload.targetEmployeeId→người làm, Payload.amount→total, ...
  - Workflow: Payload.jobId→jobid, Payload.handlingGroupId→nhóm, ...
  - Debit: Payload.customerId, Payload.totalAmount, Payload.debitDate, ...
- **5 modal view detail riêng** (không đụng modal ERP):
  - `modal-draft-shipment-view`
  - `modal-draft-canon-view`
  - `modal-draft-payment-view`
  - `modal-draft-workflow-view`
  - `modal-draft-debit-view`
  - Layout: hiển thị fields parse từ Payload, badge "NHÁP" trên header, không có save button. Mở qua `@Input() payload + draftType` hoặc `@Input() draftId` (fetch từ BE).

### ▶ Stage 4 — Tích hợp 5 list ERP (chưa code)
Mỗi list (shipment / canon / payment / workflow / debit-notes) cần:
1. Inject `DraftService` + 1 modal view tương ứng.
2. Sửa `load()`:
   ```ts
   forkJoin([
     erpService.getPaging(params),                                    // pageSize bình thường
     draftService.getPagingForErp({ draftType, shipmentType, pageSize: 999, ...sameFilters })
   ]).subscribe(([erpRes, draftRes]) => {
     const erpRows   = erpRes.data.map(r => ({ ...r, _isDraft: false }));
     const draftRows = draftRes.data.map(d => mapDraftToRow(draftType, d, this.lookups));
     this.list = [...draftRows, ...erpRows]
       .sort((a, b) => +new Date(b._sortDate ?? b.createdDate) - +new Date(a._sortDate ?? a.createdDate));
   });
   ```
3. **ag-grid styling**: `getRowStyle = params => params.data._isDraft ? { backgroundColor: '#FFF8E1' } : null`.
4. **Action column**: cell renderer check `_isDraft` → render Sửa/Xóa/Duyệt (ERP) HOẶC nút "👁 Xem" duy nhất (draft).
5. **Click row / open action**:
   - `_isDraft=true` → mở modal-draft-*-view tương ứng (đưa payload + draftId)
   - `_isDraft=false` → mở modal ERP cũ như bình thường

### Tablechart 5 list
| List | Component | DraftType | ShipmentType | Modal view |
|---|---|---|---|---|
| Lô hàng | shipments-list | Shipment | != 1176 | modal-draft-shipment-view |
| Lô hàng Canon | jobs-list (canon) | Shipment | = 1176 | modal-draft-canon-view |
| Thanh toán | payments-list | Payment | — | modal-draft-payment-view |
| Phân công CV | workflow-list | Workflow | — | modal-draft-workflow-view |
| Debit Note | debit-notes-list | Debit | — | modal-draft-debit-view |

### Phụ tùy phải xử lý khi code
- Filter input của list ERP: truyền y nguyên cho cả 2 API (cùng customer/date/keyword) → kết quả tự nhất quán.
- Pagination: list ERP vẫn server-side bình thường; Draft load full pageSize=999 ở mỗi page → mỗi page hiển thị FULL draft + ERP page → trang sau lặp lại draft. ⚠️ Cần chốt: hoặc (a) chỉ load draft khi pageIndex=1, sang trang 2+ không gọi draft API; (b) flag "Đã xem hết nháp" badge.
- Cột sort: nếu user click sort cột nào, áp dụng cho cả 2 nguồn sau khi merge (client-side sort sau forkJoin).
- Lookups cho map: cần load customers/branches/employees TRƯỚC khi merge để mapDraftToRow có dữ liệu hiển thị tên/mã KH thay vì chỉ ID.

## ▶ Chốt dầu lái xe (DriverFuelClosing) — 2026-06-04 (SQL+BE+FE XONG, chờ anh grant permission + test E2E)
SQL Part 7 redesign (chốt theo XE, 2 bảng `Tbl_DriverFuelClosing` + Detail + TVP + 7 SP) đã chạy OK. BE 6 file (FunctionCode F039 enum sẵn có line 114, Model/ViewModel/Interface/Repo/Controller) build 0 error. FE 6 file mới (model + service + `modal-vehicle-fuel-closing` + list `vehicle-fuel-closing` + route `/transports/vehiclefuelclosing` data.functionCode='F039') build 0 error. Chi tiết: done.md.

**▶ Anh chạy SQL grant** (đã đề xuất trong chat):
```sql
INSERT INTO dbo.ActionInFunctions (FunctionId, ActionId)
SELECT 'F039', x.a FROM (VALUES ('VIEW'),('CREATE'),('UPDATE'),('ACCEPT'),('DELETE')) x(a)
WHERE NOT EXISTS (SELECT 1 FROM dbo.ActionInFunctions y WHERE y.FunctionId='F039' AND y.ActionId=x.a);

DECLARE @AdminRoleId NVARCHAR(450) = (SELECT TOP 1 Id FROM dbo.Roles WHERE Name='Admin');
INSERT INTO dbo.Permissions (RoleId, FunctionId, ActionId)
SELECT @AdminRoleId, 'F039', x.a FROM (VALUES ('VIEW'),('CREATE'),('UPDATE'),('ACCEPT'),('DELETE')) x(a)
WHERE @AdminRoleId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Permissions p WHERE p.RoleId=@AdminRoleId AND p.FunctionId='F039' AND p.ActionId=x.a);
```
**▶ Test E2E**: relogin (claim mới có F039_*) → `/main/transports/vehiclefuelclosing` → chọn xe + kỳ + Tải dữ liệu → nhập (4) TopUp → quan sát Net/NetAmount → Lưu nháp → Tải lại (candidates đã pick phải biến mất) → Duyệt → check 4 bảng nguồn (`DriverFuelApproval.IsFuelClosing`, `DispatchOrder/FCL/AdditionalFee.IsSummarized`).
**▶ Edge**: tạo phiếu thứ 2 cùng xe → phải chặn "Xe đang có phiếu chưa duyệt"; Net âm phải vẫn ra NetAmount dương (ABS×giá).

## ▶ Draft API view mở rộng (2026-06-02, code xong, anh deploy)
- **▶ SQL** chưa chạy: `Migration_DraftSite_GetPaging_ExtendByEmployee_20260602.sql` (DROP + CREATE `SP_DraftEntries_GetPaging` thêm `@CurrentEmployeeId`).
- **▶ BE DraftAPI** code xong: GetEmployeeId() + Repository signature + Controller GetPaging/GetById (PayloadHasEmployee helper). Anh build + restart DraftAPI.
- **▶ Bỏ check quyền Create/Update DraftAPI**: comment 2 block `User.CanDraft(...)` — cần build + restart cùng cụm trên.

## ▶ ERP App Pool stop — debug (2026-06-02, code xong, anh theo dõi)
- **▶ Filter draft comment tạm** ở [Program.cs:83](D:/Delta/DeltaSoft/NewAPI/API/Program.cs#L83). Anh build + deploy + theo dõi vài ngày.
- **▶ IIS App Pool config** (anh tự áp khi rảnh): Idle Time-out=0, Load User Profile=True, Start Mode=AlwaysRunning, Rapid-Fail Maximum Failures=100, Preload Enabled=True (Site).
- **Pattern**: stop sau ~20 phút idle + phải vào IIS Manager Start. Diagnosis: Idle shutdown w3wp + ephemeral DataProtection keys → cookie decrypt fail cold start → Rapid-Fail stop pool. Hot path nghi vấn ExportInvoice/GetExport 22.5MB JSON.
- **Cách 3 (tách bạch hoàn toàn)** HOÃN — SQL grants `Grant_DraftApp_ErpAccess_20260602.sql` chưa chạy.

## ⏳ CHỜ TEST + COMMIT (2026-06-02) — modal-dispatchorder + modal-fuel-summary
- **modal-dispatchorder** ([modal-dispatchorder.component.ts:533](d:/Delta/DeltaSoft/web-app-update/src/app/shared/components/transports/modal-dispatchorder/modal-dispatchorder.component.ts#L533)): fix `vihicleTypeChanged` không reset `driverName/driverTel/biển số` khi `isSubcontractors` (trước reset → empty + required → form invalid → Lưu im lặng). Tách logic xe nội bộ vs xe thuê ngoài. Chi tiết: done.md.
- **modal-fuel-summary** thêm nút Xóa từng dòng (X đầu row) + nút "Tải lại danh sách" cạnh dropdown Biển kiểm soát (chỉ khi `flagNew && !flagXem`). Chi tiết: done.md.
- **Google routing** [modal-route-compare.component.ts:304](d:/Delta/DeltaSoft/web-app-update/src/app/shared/components/danhmuc/modal-route-compare/modal-route-compare.component.ts#L304): `avoidHighways: true` + `provideRouteAlternatives: true` + sort routes theo distance. BE GoogleMap controller cũng update (chưa có FE caller). Anh confirm Google đã ưu tiên QL.

## ⏳ CHỜ TEST + COMMIT (working tree 2026-06-01) — Canon Job + header NV + dispatchorder polish

### draft-web (working tree main, repo `funneo/DeltaSoftDraftFE`)
- **Canon Job nháp + menu Hàng Canon (2026-06-01)**: port modal-job-canon ERP, modal 85vw, reuse `DraftType='Shipment'` + flag `shipmentType=1176`. ERP allowlist `/api/canonroad/getall` mới — **cần restart ERP API**. Chi tiết: done.md section đầu.
- **Bỏ "Ngày tạo/Ngày lập" UI (2026-06-01)**: 4 form bỏ input, ngày tạo lấy từ `draft.DraftEntries.CreatedAt` SQL. Debit giữ Ngày doanh thu + Ngày vận hành.
- **Bỏ "Kích hoạt" + clean `_isChuyeduyet` (2026-06-01)**: checkbox HTML xóa khỏi Shipment/Canon Job. Payment/Debit clean field dead, `entity.status=false` hardcode.
- **Header "Nhân viên" cho 4 form (2026-05-31)**: banner alert-light TOP form, bắt buộc chọn TRƯỚC khi save. Payment: chọn target → "Người làm TT" auto fill (đổi tay được), modal-list-advance lọc tạm ứng theo NV target.

**Anh test sau khi restart ERP API:**
1. Sidebar có submenu **Hàng Canon → Job**. Click → "Tạo nháp" modal 85vw.
2. Chọn NV header → KH → load Cung đường → fill Xe + LOT + Ngày + Pallets → Lưu.
3. Menu "Lô hàng" thường: KHÔNG thấy record Canon.
4. 4 form không còn input "Ngày tạo/Ngày lập" + không còn "Kích hoạt"/"Chuyển duyệt".
5. Payment NV X → Người làm TT auto = X → modal list-advance thấy tạm ứng của X.

### web-app-update (working tree main)
- **modal-dispatchorder (2026-05-31)**: field "Lái xe ghi nhận dầu" hiển thị lại nhưng KHÔNG required, auto-sync với Lái xe 1 ở `driver1Change()`/`changeVihicle()`. User vẫn override được. Chi tiết: done.md.
- **Cụm cũ 2026-05-28** (chưa commit): modal-execute-fcl + fix "UI đơ F5" + polish dispatchorder. Test xong báo em commit.

**Gợi ý tách commit khi anh OK:**
- draft-web: `feat: Canon Job nhap (menu Hang Canon) + bo ngay tao/kich hoat/chuyen duyet`
- draft-web: `feat: them header Nhan vien (lap ho NV X) o 4 form draft + fix advances employeeId` (gộp 2 cụm)
- web-app-update: `fix: dispatchorder hien Lai xe ghi nhan dau (khong required, auto-sync)`
- web-app-update: 3 commit cũ 2026-05-28 (modal-execute-fcl / fix-backdrop / polish-dispatchorder)

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
  - **Debit + Payment + Workflow (2026-05-29):** copy 1:1 từ ERP, modal **fullscreen**, css compact, nút Lưu/Hủy header (bỏ In), bỏ "Chuyển duyệt", reuse `modal-shipment-search` chéo 3 module. Payment có thêm nút chọn Lô hàng (khác ERP). Token JWT mang `employeeId` claim → "Người làm TT" default = chính user. Chi tiết: done.md.
- **✅ Phase 3 ENHANCE (2026-05-30):** fix advances `employeeId` + production env config (commit `54d20b0` + `038cf3a`).
- **▶ Phase 3 ENHANCE WORKING TREE (2026-05-31 → 2026-06-01):** header "Nhân viên" + Canon Job + cleanup (ngày tạo/Kích hoạt/Chuyển duyệt). Chi tiết: done.md 2 section đầu. Anh test rồi báo commit.
- **▶ Public production**: anh đang setup HTTPS site IIS riêng cho draft-web + Draft API. Sau xong → đổi URL trong `environment.prod.ts` từ HTTP sang HTTPS.
- **Việc kế (chờ feedback):**
  - (a) **Canon Debit nháp** + menu Debit Canon (port modal-debit-note-canon ERP, slot trong submenu Hàng Canon đã sẵn).
  - (b) port sub-modal `showJob/showFiles/showDispatchOrder/showQuotationDetail` trong debit-form (đang toast placeholder).
  - (c) **Phase 4 — Promote**: ERP cần màn "Duyệt nháp" để bê record `draft.DraftEntries.Payload` → `Tbl_*` thật. Controller promote phải parse `targetEmployeeId` từ Payload và gán vào `Tbl_*.EmployeeId`, **`jobDate/refDate` lấy từ `createdAt` envelope** (override Payload).
  - (d) **Phase 5** — view/approve ERP (UI duyệt + audit log).

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
