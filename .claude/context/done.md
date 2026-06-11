# Completed Features

## Draft Site — TaskDocs: commit view draft Lô hàng/Canon + SQL design tài liệu giao nhận (Bot) — 2026-06-11
Session ngắn: chốt + commit phần view draft đã làm, rồi lên kế hoạch + viết SQL design cho feature mới "Công việc vận chuyển + tài liệu Bot".

### Commit `9b00042` (web-app-update main) — view draft Lô hàng thường + Canon
Gói lại Stage 3 đã làm trước đó: `modal-shipment` + `modal-job-canon` thêm chế độ `_isDraftView` read-only nền vàng + badge "NHÁP #id" + `viewDraft(payload, draftId)` (parse create-DTO YYYYMMDD qua `_draftDate()` tolerant) + nút Duyệt **disabled** (placeholder Phase 4) + nút Hủy. List `shipment-normal`/`job-canon` badge draft `(click)="showDraft()"`. Tất cả additive, reset `_isDraftView=false` ở `add()/edit()` → không đụng luồng thật. Build 0 error.

### SQL design feature mới (CHƯA chạy — chờ anh duyệt)
[Migration_DraftSite_TaskDocs_20260611.sql](D:/Delta/DeltaSoft/NewAPI/Migration_DraftSite_TaskDocs_20260611.sql) — viết theo convention Phase0 (idempotent, PRINT/GO, owner-check, soft-delete, TotalRows OVER()):
- **Bảng `draft.DraftTaskDocs`**: 1 dòng = 1 ảnh/tài liệu, link chuyến ERP bằng `ShippingTaskId` INT (tham chiếu mềm, **KHÔNG FK sang dbo** → giữ cô lập). Cột: `DocType` (DeliveryNote/HandoverDoc/Other), `FileName/PathFile(S3)/ContentType/Size/Note`, `Status` (Draft→Promoted), `Source` (Bot/Manual), audit + `PromotedAttachId` (map Attachfiles thật Phase sau). 2 index (Task, Created).
- **5 SP draft**: `SP_DraftTaskDocs_Insert/GetByTask/GetPaging/Delete/UpdateStatus`. `draft_app` đã có `GRANT EXECUTE ON SCHEMA::[draft]` → tự cấp quyền.
- **1 SP dbo**: `SP_DraftTaskDocs_GetForErp_GetByDateRange` (ERP login gọi, đọc theo khoảng ngày rồi FE gộp theo `ShippingTaskId` — né `STRING_SPLIT` vì SQL 2014).

**Quyết định kiến trúc**: list draft mirror chuyến ERP read-only (bot chỉ gắn tài liệu, không nhân bản chuyến); ảnh S3 + Draft API tự nhận multipart→S3→insert. Kế hoạch A→D đầy đủ ở [todo.md](.claude/context/todo.md) section đầu.

## PendingInvoice → Payment: modal picker chọn hóa đơn AI + đính kèm file vào phiếu (move, không copy) — 2026-06-10 (code+SQL xong, chờ test E2E)
Tích hợp F043 vào lập phiếu thanh toán. **2 commit**: web-app-update `main` 9c10562, NewAPI `master` bb88319. **SQL đã chạy**: chỉ `Migration_PendingInvoice_AttachOnPayment_20260610.sql` (SP `SP_PendingInvoice_UpdatePathFileLocal`); picker migration `Migration_PendingInvoice_PickerForPayment_20260610.sql` (GetForPicker/MarkUsedByPaymentBatch/ReleaseByPayment + cột `UsedByPaymentId` + TVP `Type_PendingInvoiceIds`) đã chạy từ trước. **Cần restart/build API** (API.dll bị IIS Express/VS khóa lúc build).

### Modal picker (FE)
- **Mới** `src/app/shared/components/advance-payment/modal-pending-invoice-picker/` (.ts/.html/.css/.module): list hóa đơn `Status=0 + UsedByPaymentId IS NULL` (scope user/admin trong SP), filter cột (NCC/MST/Số HĐ/Ngày) + daterange + keyword, row trùng vàng + badge "TRÙNG" tooltip RefNo, link mở file (`buildFileUrl` `~/`→`/`). `@Output SaveSuccess` trả mảng item đã check. Fix 2 bug click "lúc được lúc không": `ngDraggable [handle]="myHandle"` trên `.modal` + `#myHandle` header; checkbox display-only `pointer-events:none` để `onRowClick` trên `<tr>` là single source.
- **`payment-detail.component`**: nút mở picker (chỉ khi tạo mới/chưa chuyển duyệt), `onInvoicesPicked` fill mỗi hóa đơn thành 1 dòng `PaymentDetail` (amount/vat/total/currency/invoiceNo/date/pattern/tax/web/code) kèm **`pendingInvoiceId`** (BE dùng key này). User tự chọn mã phí + nhập mã tham chiếu.
- `payments.model.ts`: `PaymentDetail.pendingInvoiceId?`. `pending-invoice.service.ts`: `getForPicker` + interface `PendingInvoicePickerFilter/Item`.

### Đính kèm file qua BE (move, không copy — chốt với anh: không gấp đôi bộ nhớ + đúng cấu trúc đường dẫn AttachFiles)
- **`PaymentsController.Add/Update`** (inject `IPendingInvoice` + `IAttachFiles`) → helper `MoveInvoiceFilesToAttachments(paymentId, details, branchId, userId)`: lấy `pendingInvoiceId` distinct; mỗi hóa đơn nếu `PathFileLocal` **còn ở `/Invoice/`** → **MOVE** file vật lý `~/UploadFiles/Invoice/yyyy/MM/<name>` → `~/UploadFiles/<name>` (đích tồn tại thì xóa nguồn → luôn 1 bản) → `UpdatePathFileLocal` trỏ hóa đơn về vị trí mới → tạo `AttachFiles` (`FrmName/FunctionName="PAYMENT"`, `RefNo=paymentId`, `FileName="hoa-don"+sốHĐ`+đuôi). **Idempotent** (bỏ qua file đã move → lưu lại không nhân đôi attachment), **best-effort** (lỗi 1 hóa đơn không chặn lưu phiếu). File đã sẵn trên S3 (`Invoices/...`) → không upload lại.
- **Mới** SP `SP_PendingInvoice_UpdatePathFileLocal` (chỉ UPDATE `PathFileLocal`, không đụng legacy) — `IPendingInvoice.UpdatePathFileLocal` + repo. Mark/Release đã nối sẵn trong `PaymentsRepository.Create/Update/Delete` theo `ExtractPendingInvoiceIds`.
- **Quyết định để ngỏ**: S3 giữ prefix `Invoices/` (AttachFiles không lưu path S3, tải đọc từ local nên OK); xóa phiếu chỉ release cờ `UsedByPaymentId`, KHÔNG gỡ AttachFiles/đưa file về (tránh đụng luồng xóa legacy).

### Skill mới
- `.claude/skills/deltasoft-modals/SKILL.md`: convention 163 modal (ngDraggable+[handle], [config], ViewChild+SaveSuccess/CloseModal, lazy-mount *ngIf, 2 bug click). Memory pointer `reference_deltasoft_modals_skill`.

## Đọc hóa đơn AI — F043 PendingInvoice + lưu DB + check trùng snapshot + retry chọn lọc + token tracking — 2026-06-09
Module mới hoàn chỉnh (anh đã chạy SQL + tạo Functions.F043; chờ test E2E):

### SQL (đã chạy)
- **`Migration_PendingInvoice_20260609.sql`**: `Tbl_PendingInvoice` (33 cột, gồm Customer info + LineItemsJson + AI tokens), TVP `Type_InvoiceKey`, 7 SP (Create/Update/GetPaging/GetById/Delete/MarkUsedByPayment/CheckDuplicateBatch). Tên cột match `PaymentDetail` (InvoiceNo/TaxNumber/InvoicePattern/InvoiceDate NVARCHAR/Web/Code) để JOIN check trùng đơn giản. KHÔNG có UNIQUE — trùng vẫn ghi, chỉ cảnh báo. Status: 0=Chờ TT, 1=Đã dùng cho 1 Payment, -1=Xóa.
- **`Migration_PendingInvoice_AddDuplicateRef_20260609.sql`**: ALTER TABLE + 2 cột `IsDuplicate BIT` + `DuplicatesJson NVARCHAR(MAX)` (snapshot kết quả check trùng tại thời điểm AI đọc), DROP+CREATE lại `SP_Create` + `SP_Update` để nhận 2 param mới.
- **`Migration_F043_PendingInvoice_Grant_20260609.sql`**: ActionInFunctions × 5 (VIEW/CREATE/UPDATE/DELETE/EXPORT) + Permissions Admin. Anh tự INSERT row Functions.F043.

### Check trùng — 4 tiêu chí, CHỈ vs PaymentDetail
SP `SP_PendingInvoice_CheckDuplicateBatch` UNION map theo `RowKey` (FE/BE truyền index để map ngược): TaxNumber + InvoiceNo + InvoicePattern + InvoiceDate (so chuỗi vì PaymentDetail.InvoiceDate lưu chuỗi). KHÔNG check trong `Tbl_PendingInvoice` vì đó chỉ là staging — anh chốt chỉ chống TT 2 lần.

### BE — 8 file mới + 4 sửa
- **Mới**: `Models/CustomerCommunicate/GoogleServices/PendingInvoice.cs` (domain + `InvoiceKey` TVP row) — `ViewModels/.../PendingInvoiceViewModel.cs` (Filter/CreateBatchRequest/InvoiceDuplicate/ReExtractRequest) — `Interfaces/.../IPendingInvoice.cs` (7 method) — `Repositories/.../PendingInvoiceRepository.cs` (TVP `AsTableValuedParameter("Type_InvoiceKey")`, dynamic cast `Convert.ToInt32` cho SCOPE_IDENTITY) — `Controllers/.../PendingInvoiceController.cs` (5 endpoint, gate `FunctionCode.F043`) — `Services/InvoiceTempCleanupService.cs` (`BackgroundService` quét `UploadFiles/InvoiceTemp/*` mỗi 6h, xóa folder LastWriteTime >24h).
- **Sửa**: `Filters/FunctionCode.cs` (F043 + comment), `Program.cs` (`AddHostedService<InvoiceTempCleanupService>`), `IGeminiAIRepository.cs` (+ `ExtractInvoiceFromBytes` cho re-extract), `GeminiAIRepository.cs` (+ token usage parse từ `usageMetadata.promptTokenCount/candidatesTokenCount/totalTokenCount`, public `ExtractInvoiceFromBytes`), `Controllers/.../GeminiAIController.cs` (đổi `[AllowAnonymous]` → `[Authorize]`, inject `IPendingInvoice`, `AnnotateDuplicatesAsync` auto check dup sau extract/retry, gán `IsDuplicate + Duplicates[]` vào result).
- **`Models/.../DocumentAIModels.cs`**: + `TempFileName`/`PromptTokens`/`CompletionTokens`/`TotalTokens`/`IsDuplicate`/`Duplicates[]`/`InvoiceDuplicateRef` wrapper class.

### CreateBatch flow — BE tự check trùng (single source of truth)
1. Verify folder `UploadFiles/InvoiceTemp/<uploadId>/` tồn tại (410 nếu hết hạn).
2. Build TVP keys từ tất cả Items → 1 call `CheckDuplicateBatch` cho cả batch.
3. Group kết quả theo `RowKey` → mỗi item gán `IsDuplicate=true` + `DuplicatesJson = JsonConvert.SerializeObject([{paymentId, paymentRefNo, paymentRefDate, paymentStatus}])`.
4. Loop từng item: move file `InvoiceTemp/<uploadId>/<tempFile>` → `UploadFiles/Invoice/yyyy/MM/<random30>.<ext>` + upload S3 song song (bucket `files-manager-delta-erp`, key `Invoices/yyyy/MM/<permName>`). S3 fail KHÔNG chặn (vẫn lưu DB, `pathFileS3=null`, push vào `errors[]`).
5. INSERT row → xóa folder temp.

### ReExtract flow (luồng "Đọc lại" 1 dòng list)
1. GetById → verify Status=0 + PathFileLocal tồn tại (410 nếu file mất).
2. Đọc bytes → `_gemini.ExtractInvoiceFromBytes`.
3. Check trùng bằng key MỚI → overwrite `IsDuplicate/DuplicatesJson` (không cộng dồn — key đổi → tập trùng đổi).
4. SP_Update: token CỘNG DỒN (đọc lại tốn thêm thực sự); IsDuplicate/DuplicatesJson OVERWRITE.

### FE — 4 file mới + 4 sửa
- **Mới**: `shared/services/pending-invoice.service.ts` (5 endpoint + static helper `fromExtractionResult` map InvoiceExtractionResult → CreateItem), `main/advance-payment/pending-invoice/{routing,module,component.ts/.html/.css}` (list với daterange + status filter + cột Token + cột Tác vụ Đọc lại/Xóa, row vàng `row-duplicate` + badge "TRÙNG" cạnh số HĐ + tooltip `parseDuplicates` liệt kê RefNo Payment trùng).
- **Sửa**: `shared/services/gemini-ai.service.ts` (+ `isDuplicate/duplicates[]/promptTokens/completionTokens/totalTokens`), `shared/components/advance-payment/modal-doc-hoa-don/{.ts,.html,.css}`:
  - **Checkbox per row** + helper bar ("Tất cả/Bỏ chọn/Chỉ lỗi") + counter "Đã chọn N/M".
  - **Badge "TRÙNG"** đỏ + tooltip JSON dups + ili-sub liệt kê RefNo Payment dưới mỗi dòng.
  - **CSS `.is-duplicate`**: row background `#FFF3CD` + border-left vàng.
  - **2 nút footer** thay 1: "Đọc lại đã chọn (N)" + "Lưu hóa đơn chờ TT (N)" — flex theo checkedCount.
  - **Token tracking footer**: hiển thị `{in} / {out} = {total} tokens` (cộng tổng theo lần call Gemini — BE chỉ gán usage vào phần tử ĐẦU mỗi call nên không nhân đôi).
  - **Discard flow**: close/reset/upload-lần-mới → POST `extract-invoices-discard` → BE xóa folder temp.
  - `SaveSuccess` emit → parent list reload + close modal.
- `main/advance-payment/advance-payment-routing.module.ts`: route `pending-invoice` data `functionCode:'F043'`.

### Retry chọn lọc — không upload lại file nén
Endpoint `extract-invoices-retry` nhận `{uploadId, tempFileNames[]}` → BE đọc file local + Gemini song song + AnnotateDuplicates. FE checkbox + "Đọc lại đã chọn" cho phép retry ARBITRARY dòng (kể cả OK), không chỉ file lỗi. Replace results theo `tempFileName`. 410 nếu folder mất.

### Cron cleanup folder rác
`IHostedService InvoiceTempCleanupService`: chờ 1 phút sau start (đợi DI init xong) → loop mỗi 6h: quét `UploadFiles/InvoiceTemp/*`, xóa folder có `LastWriteTime < now - 24h`. Cover user đóng tab/crash → folder không có discard call → cron tự dọn.

### Lưu ý cleanup phụ
- Bỏ Vertex AI cũ (em đã làm trước):
  - `appsettings.json` `GoogleServices.Gemini` còn 1 dòng `ModelId: gemini-2.5-flash-lite` (xóa `ProjectId`/`Location`/`CredentialsPath`).
  - `API.csproj` xóa `<PackageReference Include="Google.Cloud.AIPlatform.V1" />` (orphaned sau migrate sang AI Studio REST). Code không còn `using` nào dùng.
  - **GIỮ**: `delta-erp-vn-2550393a36c2.json` credential + `GOOGLE_APPLICATION_CREDENTIALS` env var trong launchSettings — DocumentAI vẫn dùng.
- **Token usage**: model `gemini-2.5-flash-lite` ($0.10 in / $0.40 out per 1M token), bật `thinkingBudget=0` + `mediaResolution=MEDIA_RESOLUTION_LOW` → ~$0.001-0.002/hóa đơn (anh đang theo dõi Cloud Billing).
- **Key Gemini**: đã ở `appsettings.Development.json` (gitignore) — verify `git log -S` không thấy leak.

### Anh cần test E2E
1. Relogin (claim JWT mới có `F043_*`) → `/main/advance-payment/pending-invoice`.
2. Upload ZIP 5-10 file (gồm 1-2 file trùng với Payment đã có) → modal hiện list: row trùng vàng + badge "TRÙNG" + tooltip RefNo.
3. Uncheck 1-2 dòng test → bấm "Lưu hóa đơn chờ TT (N)" → toast "Đã lưu N hóa đơn" + list reload + row trùng vẫn vàng + badge.
4. Bấm "Đọc lại đã chọn" trên modal (kể cả dòng OK) → BE đọc lại, không upload lại file. Restart ERP API rồi mới retry → phải hiện "Phiên upload hết hạn".
5. Bấm "Đọc lại" 1 dòng trong list → BE đọc lại từ `PathFileLocal` → snapshot dup mới → reload.
6. Đóng modal không lưu → folder `InvoiceTemp/<uploadId>/` xóa ngay. Folder bỏ rơi >24h → cron tự dọn.

## Phase 5a — View Draft ở ERP — Lô hàng + Canon (2026-06-08, RESUME)
Sau quyết định 2026-06-02 (gộp draft vào CÙNG list ERP, highlight vàng), em đã tiếp tục và xong **2/5 list**:

### Stage 3 — FE shared
- **`shared/services/draft.service.ts`** (mới): `DraftService` + interface `DraftFilterRequest`/`DraftEntryView`. Gọi `POST /api/draft/getPagingForErp` (token JWT ERP `aud=Issuer`, KHÔNG phải aud=draft). `tokenKey` auto inject từ `JwtService`. Phòng 401 → logout. Catch 500 → return `{code:200, data:[]}` để không vỡ ERP list.

### Stage 4 — 2/5 list đã tích hợp

**Lô hàng thường** ([shipment-normal.component.ts](src/app/main/shipments/shipment-normal/shipment-normal.component.ts)) — đã có client-side paging sẵn, chỉ cần forkJoin:
- `loadData()`: forkJoin `{erp: shipmentService.getPagingNormal, draft: draftService.getPagingForErp({shipmentType:0})}`. shipmentType=0 → SP loại trừ Canon.
- `mapDraftToShipmentRow(d)`: parse `d.payload` JSON → row shape Shipment (jobId='NHÁP #id', customerName, cdsNumber, hawB_HBL, mawB_MBL, invoiceNo, bookingNo, weight, conts, notes, createdByName, createdDate, branchId) + flag `_isDraft=true`, `_draftId`, `_draftPayload`.
- **Defensive guard 3 lớp**: (1) `code=200/201`, (2) `Array.isArray(res.draft.data)`, (3) client-side `filter(r => shipmentType !== 1176)` — phòng SP filter sai.
- Merge: `[...draftRows, ...erpItems]` sort theo `createdDate desc`.

**Lô hàng Canon** ([job-canon.component.ts](src/app/main/canon/job-canon/job-canon.component.ts)) — kiểu khác, BE `SP_Shipment_GetPaging` có `OFFSET/FETCH` bị comment → trả ALL rows. FE list cũ render hết qua `*ngFor="let item of listShipment"` → chậm khi dữ liệu lớn.
- **Fix paging**: chuyển sang client-side. `loadData` gửi `pageSize=99999`, set `listShipment` = all + `listFilter` = filtered subset. Thêm getter `visibleData` slice theo `pageIndex × pageSize`. `pageChanged` chỉ set `pageIndex` (KHÔNG reload BE).
- **Filter theo cột**: thêm dòng input dưới header cho 7 cột (Khách hàng / JobId / Xe vận chuyển / LOT / Cung đường / #Pallets / Ghi chú). Cột Ngày/Trạng thái/Tác vụ rowspan=2. CSS sticky 2-row đã có sẵn (`thead tr:nth-child(2) th { top:22px }`).
- forkJoin draft với `shipmentType:1176` (chỉ Canon) + client-side filter `=== 1176`.
- `mapDraftToShipmentRow`: map field Canon (cdsNumber=Xe, cdsDate=Ngày, hawB_HBL=LOT, mawB_MBL=Cung đường, pallets).

### CSS dòng nháp (cả 2 list)
```css
tr.row-draft > td { background-color: #FFF8E1 !important; color: #6b5d20; }
tr.row-draft:hover > td { background-color: #FFEFB0 !important; }
.badge-draft { padding:1px 8px; border-radius:10px; background:#FFC107; color:#4a3a00; font-weight:600; font-size:11px; }
```

### HTML cho dòng nháp
- `[class.row-draft]="item._isDraft"` + `(click)="!item._isDraft && clickRow(item)"` + `[title]="...nháp chưa duyệt"`.
- JobId: `*ngIf="_isDraft"` → `<span class="badge-draft">NHÁP #id</span>`; ngược lại `<a [routerLink]>` mở modal ERP cũ.
- **Cột Tác vụ**: bọc toàn bộ button trong `<ng-container *ngIf="!item._isDraft">` — dòng nháp không hiển thị nút nào.

### SP đã chạy (rewrite bỏ JSON_VALUE)
**`Migration_DraftSite_GetForErp_20260602.sql`** — anh đã chạy 2026-06-08, runtime verify dòng vàng đã hiện ở list Lô hàng + Canon. Rewrite dùng LIKE pattern (DB compat <130 không hỗ trợ JSON_VALUE):
```sql
DECLARE @PatTgt   NVARCHAR(100) = N'%"targetEmployeeId":' + @EmpStr + N'[^0-9]%';
DECLARE @PatEmp   NVARCHAR(100) = N'%[,{]"employeeId":'   + @EmpStr + N'[^0-9]%';
DECLARE @PatCanon NVARCHAR(50)  = N'%"shipmentType":1176[^0-9]%';
```
Filter Canon: `@ShipmentType=1176 → [Payload] LIKE @PatCanon`; `@ShipmentType<>1176 → [Payload] NOT LIKE @PatCanon`.

### Bug đã fix
- **`draftItems.map is not a function`** runtime: SP chưa tồn tại → BE trả `code=500, data=exception`. FE crash khi `.map()` trên object. Fix bằng 3 lớp guard ở trên.

### Còn lại — Phase 5a
- 3 list chưa làm: Thanh toán, Phân công CV, Debit Note (tablechart [todo.md](.claude/context/todo.md)).
- 5 modal-draft-*-view chưa code (Stage 3) — hiện click vào draft chỉ thấy badge, chưa mở modal xem chi tiết.

## SQL session 2026-06-07 — anh đã chạy hết 2026-06-08
5 SQL:
- ALTER `SP_DriverFuelClosing_Delete` sang `@Id INT` (bỏ STRING_SPLIT).
- DROP+CREATE `SP_DraftEntries_GetPaging` với LIKE pattern (bỏ JSON_VALUE, +@CurrentEmployeeId).
- ALTER `SP_DispatchOrder_GetForSummary` LEFT JOIN Employee theo FuelDriverId → `FuelDriverName` cho 3 nhánh UNION.
- CREATE `SP_DriverFuelApproval_CancelExpired` (Hủy IGAS hết hạn, status -2 + ghi reason vào Note).
- F039 grant: INSERT `ActionInFunctions` × {VIEW,CREATE,UPDATE,ACCEPT,DELETE} + INSERT `Permissions` cho RoleId=Admin.

Còn chờ anh test E2E (xem todo.md section đầu).

## Session 2026-06-07 — chốt dầu UX + bugfix + skill utility + draft fix + DraftAPI port + Swagger prod + token 24h
Cụm việc 1 session, build sạch hết, đã commit:

### Modal vehicle-fuel-closing — UX rebuild + bugfix
- **Source=1 detail**: thay 2 cột "Igas + Chênh" bằng 3 cột **Số lượng cấp / SL thực đổ / Chênh** (cấp = quantity + quantityIgas client-side, vì `quantity` stored là chênh). Source 2/3/4 giữ 1 cột "Lít".
- **Bỏ cột "Lệnh gốc"** (`mergeJobId`) — số phiếu cha đã thấy ở cột "Số phiếu" với Source 2/3.
- **List action**: bỏ toolbar trên (Sửa/Xem/Duyệt/Xóa). Thêm cột "Thao tác" đầu mỗi dòng:
  - `canEdit(h) = isOwner && status===0` → nút **Sửa** (info); ngược lại → **Xem** (default).
  - `canDelete(h)` same condition → nút **Xóa** (danger).
  - `isOwner`: so `h.createdBy` (Guid) với `userLoged.id` (case-insensitive).
- **Bỏ nút "Duyệt phiếu" riêng** ở footer modal — chỉ còn Đóng / Lưu nháp / Lưu & Duyệt (single-shot duyệt thẳng).
- **Bằng chữ**: hàng riêng sau bảng tổng, dùng `_utilityService.docso() + capitalizeFirstLetter() + ' đồng'`. Màu **đỏ** (`netLiters > 0` → lái xe trả tiền) / **xanh** (`< 0` → lái xe nhận tiền) + badge cùng màu hiển thị "lái xe trả tiền / lái xe nhận tiền".
- **Ghi chú**: input 1 dòng → `<textarea rows="3" min-height:70px resize:vertical>` full-width.
- **Layout reorder**: Hàng 3 = `Tải dữ liệu chưa tổng kết` (col-sm-6 trái) + Đơn giá dầu (col-sm-2 + col-sm-2, label `text-right`, input narrow dịch phải). Hàng 4 = Ghi chú full-width ngay dưới nút Tải.

### Bugfix modal vehicle-fuel-closing
- **`#f="ngForm"` scope issue**: form khai báo trong `<div *ngIf="entity">`, footer ở NGOÀI `*ngIf` → template ref `f` undefined → click Lưu = `Cannot read properties of undefined (reading 'valid')`. Fix: `@ViewChild('f') ngFormRef: NgForm` + fallback `const f = form || this.ngFormRef`. Template: `saveChange(null)` thay `saveChange(f)`.
- **Daterangepicker crash** `Cannot read 'customClasses' of undefined`: `entity = {}` truthy → form render NGAY khi mount → `ngAfterViewInit` của picker đọc `this.options.locale.customClasses` khi `dateOptions` còn null. Fix: init `ngayBatDau/ngayKetThuc/dateOptions` trong `ngOnInit` (giống list component).
- **`confirm()` JS xấu**: đổi sang `_notificationService.printConfirmationDialog(message, okCallback)` (alertify modal, locale VN "Đồng ý/Hủy").

### Backend single-Id Delete (đổi cả 4 layer)
- **SQL**: `STRING_SPLIT` không có ở DB compat <130. Thay vì XML split, đổi luôn signature SP sang `@Id INT` (user feedback "chỉ xóa 1 phiếu nên dùng id thôi"). Anh chạy ALTER PROC.
- **Interface**: `Delete(int id, Guid userId)`.
- **Repository**: param `@Id` thay `@ListId`.
- **Controller**: lấy `obj.Item?.Id`, return 400 nếu ≤ 0.
- **FE Service**: `delete(id: number)` → `p.item = { id }`.
- **FE list**: `service.delete(item.id)` (không còn `+ ''`).

### Skill `.claude/skills/deltasoft-utility/SKILL.md` — catalog UtilityService
Tránh đọc lại 1132 dòng `utility.service.ts` mỗi session. 12 section: số→chữ (docso/ReadNumber/capitalizeFirstLetter/convertToWords/convertToRoman + idiom "Bằng chữ") / tiền-mask (VND/USD/UnMaskTienTe + static mask0/maskNumber/mask3Number/maskConfig) / datepicker configs (dateTimeOptionDays/dateOptionMultis/calendarOptionMultis) / date helpers (toDate/convertDateStringToYMD/checkWorkingDaysExceeded/validateDebitNoteDate) / number-string helpers / 14 static dropdown lists / localStorage params / print template renderers (PrintPhieuThu/printDebitNote/GetVongLap) / FormatContstants + MessageContstants / BaseService pattern / anti-duplication cheatsheet. Pointer memory `reference_deltasoft_utility_skill.md` + entry MEMORY.md.

### Draft API — debug + deploy fix
- **Vấn đề employee không thấy job draft AI tạo**: SP `draft.SP_DraftEntries_GetPaging` đang chạy là bản CŨ (không có `@CurrentEmployeeId`). Dapper truyền `currentEmployeeId` bị bỏ qua → filter còn `CreatedBy = @CreatedBy` → 0 dòng. Migration `Migration_DraftSite_GetPaging_ExtendByEmployee_20260602.sql` đã sẵn từ 06-02 nhưng chưa chạy.
- **JSON_VALUE không tồn tại**: DB compat <130. Rewrite migration dùng **LIKE pattern matching** thay JSON_VALUE:
  - `"targetEmployeeId":<id>[^0-9]%` — tránh false-positive khi `12` khớp `123`.
  - `[,{]"employeeId":<id>[^0-9]%` — yêu cầu trước `employeeId` phải là `,` hoặc `{` để không match nhầm `targetEmployeeId`.
  - Newtonsoft default không có space sau `:` nên không cần handle whitespace.
- **DraftAPI compile error** `JToken.Value<T>(object)`: `obj["targetEmployeeId"]?.Value<int?>()` chỉ là extension trên `JEnumerable`. Fix `(int?)obj["..."]` — cast operator chuẩn Newtonsoft, null-safe.

### DraftAPI deployment
- **Port 44360 bị Windows reserved** (Hyper-V/WSL2 dynamic range nuốt). PID 4 (System) listen sẵn → bind fail "An attempt was made to access a socket in a way forbidden". Đổi port `44360 → 44362` (verify free + không trong excluded range). 2 file đổi: `launchSettings.json` + `draft-web/environment.ts`.
- **Mở Swagger ở production**: bỏ `if (app.Environment.IsDevelopment())` quanh `UseSwagger/UseSwaggerUI` ở `Program.cs`. Tất cả endpoint vẫn cần `[Authorize]` + JWT `aud=draft` → không bypass auth. **Lưu ý**: nếu DraftAPI prod expose Internet, nên thêm Basic Auth gate trước Swagger.
- **Token Draft 1h → 24h**: `appsettings.json` `Draft:TokenHours: 1 → 24`. Code login-draft đã đọc động qua `_configuration.GetValue<int?>("Draft:TokenHours")` — chỉ cần restart ERP API, không rebuild.

### Modal-fuel-summary — đổi cột JobId → Người nhận dầu
- Cột "JobId" (`mergeJobId`) thay bằng "Người nhận dầu" (`fuelDriverName`) — anh thấy ai nhận dầu rõ hơn.
- Model `DriverFuelApprovalDetailed` thêm field `fuelDriverName?: string`.
- Component `_fetchDetailsByVihicle` map thêm `fuelDriverName: item.fuelDriverName`.
- **SQL anh chạy**: ALTER `SP_DispatchOrder_GetForSummary` LEFT JOIN `Employee e ON e.Id = s.FuelDriverId` ở cả 3 nhánh UNION ALL (DispatchOrder, AdditionalFee, FCL), thêm cột `e.EmployeeFullName AS FuelDriverName`.

## Skill `.claude/skills/deltasoft-stack/SKILL.md` — cheatsheet stack — 2026-06-04
Tóm tắt convention/template trong project để session sau KHÔNG phải đọc lại 10 file mẫu (DriverFuelApproval Controller/Repo, FromBodyBase, ClaimRequirementFilter, FunctionCode, ActionCode, auth.guard, SP_sys_Permission_GetByUserId, DispatchOrder schema quirks).
- 13 mục: checklist add module (BE+FE+DB) / auth-permission flow (claim format `{FunctionId}_{ActionId}` 3 chỗ phải đồng bộ) / Controller template / Repository template (TVP + QueryMultipleAsync) / Service / List / Modal skeletons / compact UI density / DB conventions + schema quirks (DispatchOrder dùng `VihicleId/VihiclelLicensePlates`, FCL dùng `VehicleId/VehiclelLicensePlates/Tongdau`, fuel `FeeId 666/667`, additional fee `FeeId=666`) / PowerShell SELECT-only / hard rules / module map / file paths.
- Pointer memory `reference_deltasoft_stack_skill.md` + entry trong MEMORY.md để session sau biết invoke skill.
- Lý do: trong cùng session em đã đọc đi đọc lại các file mẫu nhiều lần → khoảng 10-15 tool calls có thể skip nếu invoke skill trước khi clone module.

## Chốt dầu lái xe (DriverFuelClosing) — SQL Part 7 redesign + BE + FE đầy đủ — 2026-06-03/04 (code xong, anh chạy ActionInFunctions/Permissions SQL + test E2E)
Module mới hoàn chỉnh: chốt dầu theo XE (không theo lái), công thức `NetLiters = (4)TopUp − (3)AdditionalFee − (2)DispatchOrder − (1)ApprovalDiff` với `NetAmount = ABS(NetLiters) × OilPrice` luôn trừ lương (không trả dầu khi âm).

### SQL — quá trình thử-sai 7 part (kết thúc Part 7 OK)
File [Migration_DriverFuelClosing_Part7_FullRedesign_20260603.sql](D:/Delta/DeltaSoft/NewAPI/Migration_DriverFuelClosing_Part7_FullRedesign_20260603.sql) — DROP+CREATE lại sạch (bảng trống nên không mất data). Đã chạy OK trên SSMS.
- Part 1-2 (rev 1) anh đã chạy nhưng `DriverId UNIQUEIDENTIFIER` (sai). Part 3-5 cố ALTER → fail vì index/default/object ngầm bám DriverId. Part 6 chuyển sang DROP COLUMN + ADD COLUMN INT — chạy được. Part 7 redesign hoàn chỉnh.
- **Bảng `Tbl_DriverFuelClosing`** (header — key `(BranchId, VihicleId, FromDate, ToDate)`):
  - `VihicleId INT NOT NULL` + `VihicleLicensePlate NVARCHAR(30)` snapshot
  - `DriverId INT NULL` + `DriverName NVARCHAR(150)` snapshot (tài đổi giữa kỳ vẫn ghi nhận xe)
  - `CloseReason INT NULL` (1=Cuối tháng, 2=Tài nghỉ giữa kỳ, 3=Đổi xe, 9=Khác)
  - 4 tổng auto-lưu: `ApprovalDiffQty` (1) / `DispatchOrderQty` (2) / `AdditionalFeeQty` (3) / `TopUpLiters` (4 — user nhập)
  - `NetLiters` + `NetAmount` (luôn dương = ABS×giá)
  - `Status` (0=Draft / 1=Approved) + audit fields
- **Bảng `Tbl_DriverFuelClosingDetail`**: `Source` (1=Approval, 2=DispatchOrder, 3=FCL, 4=AdditionalFee) + `RefNo`/`MergeJobId`/snapshot fields + `Quantity` (lít contribute) + `QuantityIgas` (Source=1 snapshot để hiển thị). CASCADE từ header.
- **TVP `TypeDriverFuelClosingDetail`** mirror Detail (minus Id/FK).
- **7 SP**:
  - `SP_DriverFuelClosing_GetCandidates(@BranchId,@VihicleId,@FromDate,@ToDate)` UNION ALL 4 nguồn, khớp TVP. Filter xe nhà (`IsSubcontractors=0`), lệnh chốt B2 (`Status=6`), chưa tổng kết (`IsSummarized=0|NULL`), QuantityIgas>0 (Source=1), loại RefNo đã có trong **bất kỳ** `Tbl_DriverFuelClosingDetail` (kể cả phiếu chưa duyệt — chống double-pick).
  - `SP_Create`: chặn nếu xe đang có phiếu chốt Status=0 + overlap kỳ; tính 3 tổng từ TVP; gen RefNo `DFC-YYYYMM-NNN`.
  - `SP_Update`: chỉ Status=0; recompute; DELETE+INSERT detail.
  - `SP_GetPaging` + `SP_GetById` (multi-result-set header + detail).
  - `SP_Approve`: SET Status=1 + UPDATE `IsFuelClosing=1` cho DriverFuelApproval / `IsSummarized=1` cho 3 bảng còn lại qua RefNo (chỉ khi duyệt — không động lúc Draft).
  - `SP_Delete`: chỉ Status=0; Detail CASCADE.

### BE — 6 file + enum
- `Filters/FunctionCode.cs`: dùng enum `F039` có sẵn (line 114) thay vì thêm `DRIVERFUELCLOSING` mới.
- `Models/Transports/DriverFuelClosing.cs` + `DriverFuelClosingDetail.cs`.
- `ViewModels/Transports/DriverFuelClosingViewModel.cs` (+ `DriverFuelClosingDetailViewModel`).
- `Interfaces/Transports/IDriverFuelClosing.cs` (7 method).
- `Repositories/Transports/DriverFuelClosingRepository.cs` — TVP `AsTableValuedParameter("TypeDriverFuelClosingDetail")` + `_conn.QueryMultipleAsync` cho GetById.
- `Controllers/Transports/DriverFuelClosingController.cs` — 7 endpoint với `[ClaimRequirement(FunctionCode.F039, ActionCode.X)]`.
- Build BE 0 error.

### FE — 6 file mới + 1 route
- `shared/models/transports/driver-fuel-closing.model.ts` (+ Detail, có `checked` cho list selection).
- `shared/services/transports/driver-fuel-closing.service.ts` (extends BaseService, 7 method POST).
- `shared/components/transports/modal-vehicle-fuel-closing/*` (TS+HTML+CSS+module). **Đặt tên `vehicle-fuel-closing`** thay vì `driver-fuel-closing` vì folder cũ tên đó đã tồn tại nhưng là FuelClosing (chốt nhà cấp gas) — không sửa cái cũ.
  - Modal flow: chọn xe + kỳ + giá dầu + lý do → "Tải dữ liệu chưa tổng kết" gọi GetCandidates → bảng 4 nhóm theo Source + checkbox + nút xóa row → nhập (4) TopUp → recalc auto.
  - Footer: Đóng / Lưu nháp / Lưu & Duyệt (single-shot) / Duyệt phiếu (khi edit).
- `main/transports/vehicle-fuel-closing/*` (list page TS+HTML+CSS+module+routing). Filter chi nhánh/xe/kỳ/trạng thái/keyword. Buttons Thêm/Sửa/Xem/Duyệt/Xóa.
- `transports-routing.module.ts`: `{ path: 'vehiclefuelclosing', ..., data: { functionCode: 'F039' } }`.
- Build FE 0 error.

### Đặc thù 3 layer F039 phải đồng bộ (ghi vào skill)
- DB: `Functions.Id='F039'` (anh đã insert) + `ActionInFunctions.FunctionId='F039'` × {VIEW, CREATE, UPDATE, ACCEPT, DELETE} (anh chạy SQL đề xuất).
- BE: enum `FunctionCode.F039` (có sẵn) + Controller dùng `FunctionCode.F039`.
- FE: route data `functionCode: 'F039'`.
- Claim JWT sinh từ `SP_sys_Permission_GetByUserId`: `UPPER(FunctionId+'_'+ActionId)` → `F039_VIEW/CREATE/...`.

### Quy trình test (anh)
1. Chạy SQL grant: `INSERT INTO ActionInFunctions/Permissions` cho F039 (em đã đề xuất).
2. Login lại → claim mới có F039_*.
3. Truy cập `/main/transports/vehiclefuelclosing` → test golden path: chọn xe + kỳ + Tải dữ liệu → nhập TopUp → quan sát Net/NetAmount → Lưu nháp → Tải lại (verify candidates đã pick biến mất) → Duyệt → check `IsFuelClosing`/`IsSummarized` ở 4 bảng nguồn.
4. Edge: tạo phiếu thứ 2 cùng xe → phải bị chặn "Xe đang có phiếu chưa duyệt".

## Phase 5a — View Draft ở ERP (SQL + BE) — 2026-06-02 (code xong, anh build BE + test trước Stage 3 FE)
Tab "Nháp" trong list ERP đọc TRỰC TIẾP `draft.DraftEntries` cùng DB (không proxy DraftAPI). Chỉ READ — promote/cleanup vẫn ở DraftAPI.

### Stage 1 SQL — `dbo.SP_DraftEntries_GetForErp_GetPaging` (anh đã chạy)
File [Migration_DraftSite_GetForErp_20260602.sql](D:/Delta/DeltaSoft/NewAPI/Migration_DraftSite_GetForErp_20260602.sql). Đặt schema `dbo` để login `delta.erp` (db_owner) sẵn quyền EXEC + SELECT cross-schema sang `draft.DraftEntries` — KHÔNG cần GRANT thêm.
- Param: `@DraftType, @ShipmentType, @Keyword, @FromDate, @ToDate, @UserId, @EmployeeId, @PageIndex, @PageSize`
- Filter `Status='Draft'` only (Promoted/Reviewed đã có ở tab chính thức).
- Quyền view: admin (`@UserId IS NULL`) tất cả; user thường = người tạo HOẶC `JSON_VALUE($.targetEmployeeId|$.employeeId) = @EmployeeId`.
- Canon vs Shipment thường qua `@ShipmentType`: `=1176` chỉ Canon, `!=1176` loại trừ Canon, NULL không lọc.
- Payload full trả ra trong list → FE click row bind trực tiếp vào modal view (KHÔNG cần SP GetById).

### Stage 2 BE ERP — 4 file mới
- [ViewModels/DraftEntryViewModel.cs](D:/Delta/DeltaSoft/NewAPI/API/ViewModels/DraftEntryViewModel.cs): DTO `DraftEntryViewModel` (list item) + `DraftFilterRequest` (POST body, có TokenKey theo pattern ERP).
- [Interfaces/IDraft.cs](D:/Delta/DeltaSoft/NewAPI/API/Interfaces/IDraft.cs): 1 method `GetPagingForErp(...)` (auto-scan qua Scrutor).
- [Repositories/DraftRepository.cs](D:/Delta/DeltaSoft/NewAPI/API/Repositories/DraftRepository.cs): Dapper gọi SP trực tiếp.
- [Controllers/DraftController.cs](D:/Delta/DeltaSoft/NewAPI/API/Controllers/DraftController.cs): `POST /api/draft/getPagingForErp`. Admin (`User.IsInRole("Admin")`) → truyền null cho userId/employeeId → SP trả tất cả; user thường → truyền từ JWT claims.

### Pending (chưa code)
- **Stage 3** — FE shared: `draft.service.ts`, `<draft-list-tab>` reusable (input `draftType` + `shipmentType?`, filter riêng date/keyword), 5 modal view detail read-only (modal-draft-shipment-view, -canon-view, -payment-view, -workflow-view, -debit-view).
- **Stage 4** — tích hợp 2 tab vào 5 list ERP (Lô hàng / Canon / Thanh toán / Phân công CV / Debit Note).

## Draft API — view mở rộng: ngoài người tạo, nhân viên được CHỌN trên payload cũng view được — 2026-06-02 (SQL + BE 4 file xong, anh chạy SQL + build DraftAPI)
Yêu cầu user: khi user A lập nháp với `targetEmployeeId = empB` → user B cũng phải thấy nháp đó (list + detail).

### SQL — `SP_DraftEntries_GetPaging` thêm `@CurrentEmployeeId` (DROP + CREATE)
File [Migration_DraftSite_GetPaging_ExtendByEmployee_20260602.sql](D:/Delta/DeltaSoft/NewAPI/Migration_DraftSite_GetPaging_ExtendByEmployee_20260602.sql). Filter mở rộng:
```
@CreatedBy IS NULL  -- admin
OR CreatedBy = @CreatedBy  -- người tạo
OR (@EmpStr IS NOT NULL AND (JSON_VALUE($.targetEmployeeId)=@EmpStr OR JSON_VALUE($.employeeId)=@EmpStr))
```
Cover cả 4 DraftType: Shipment + Debit có `targetEmployeeId`; Workflow + Payment có cả `targetEmployeeId` + `employeeId`.

### BE DraftAPI — 4 file
- [DraftIdentity.cs](D:/Delta/DeltaSoft/DraftAPI/Auth/DraftIdentity.cs): + `GetEmployeeId()` extension đọc claim `"employeeId"`.
- [DraftRepository.cs](D:/Delta/DeltaSoft/DraftAPI/Data/DraftRepository.cs): `GetPagingAsync` thêm `int? currentEmployeeId` → truyền xuống SP `@CurrentEmployeeId`.
- [DraftController.cs - GetPaging](D:/Delta/DeltaSoft/DraftAPI/Controllers/DraftController.cs): truyền `User.GetEmployeeId()` (null nếu admin).
- [DraftController.cs - GetById](D:/Delta/DeltaSoft/DraftAPI/Controllers/DraftController.cs): extend check — cho phép view nếu admin / chủ tạo / `PayloadHasEmployee(payload, employeeId)`. Helper parse JSON kiểm 2 field `targetEmployeeId`/`employeeId`.

### DraftAPI — bỏ check quyền Create/Update (2026-06-02)
Theo yêu cầu user: tất cả tài khoản ERP đăng nhập draft đều được tạo/sửa nháp Shipment/Payment/Debit (token aud=draft vẫn bắt buộc qua `[Authorize]`). Comment 2 block `User.CanDraft(...)` ở [DraftController.cs](D:/Delta/DeltaSoft/DraftAPI/Controllers/DraftController.cs) Create + Update. Vẫn giữ ràng buộc chủ sở hữu (SP filter `updatedBy/deletedBy`), admin bypass. Function `CanDraft()` + map `Draft:Permissions` GIỮ NGUYÊN — nếu cần khôi phục chỉ uncomment 2 dòng.

## Chốt dầu lái xe (DriverFuelClosing) — SQL design + 2 bảng + TVP + 6 SP — 2026-06-02 (trình anh duyệt, CHƯA chạy)
Bối cảnh: cuối tháng tổng kết dầu cho từng lái xe — gộp phiếu DriverFuelApproval + lệnh DispatchOrder chưa tổng kết → so igas đổ thực tế → ra dầu DƯƠNG (đổ không hết, tự tính) hoặc ÂM (làm đầy bình, kế toán nhập tay). Kế toán dựa `NetLiters × OilPrice` thu/xuất tiền lái xe.

### Decisions (chốt với anh 2026-06-02)
- **Scope**: 1 phiếu = 1 lái xe / 1 khoảng FromDate-ToDate / 1 chi nhánh (KHÔNG dùng Month/Year cứng — hỗ trợ lái xe nghỉ giữa tháng / mới vào cuối tháng).
- **CloseReason**: 1=cuối tháng, 2=nghỉ việc, 9=khác (case "đổi xe" tạm bỏ scope, làm khi phát sinh).
- **Schema**: bảng mới hoàn toàn (`DriverFuelClosing` + `DriverFuelClosingDetail`), không động `DriverFuelApproval`. Linking: chỉ REFERENCE nullable, không khóa nguồn.
- **DriverId = INT** (khớp `DispatchOrder.DriverId` + `DriverFuelApproval.DriverId`, không phải Guid).

### File: [Migration_DriverFuelClosing_All_20260602.sql](D:/Delta/DeltaSoft/NewAPI/Migration_DriverFuelClosing_All_20260602.sql)
- `DriverFuelClosing` header: FromDate/ToDate + CloseReason + Total/Positive/Negative/Net Liters + NetAmount + Status (0=nháp/1=chốt) + Approval audit
- `DriverFuelClosingDetail`: Source (1=DriverFuelApproval, 2=DispatchOrder, 3=FCL, 4=AdditionFee) + snapshot fields + nullable FK
- `TypeDriverFuelClosingDetail` TVP (Dapper truyền `DataTable.AsTableValuedParameter()` đúng pattern `SP_DriverFuelApproval_Create2` hiện có)
- 6 SP: GetPaging, GetById, Create (overlap validate + gen RefNo `DFC-YYYYMM-NNN`), Update (chỉ Status=0), Approve, Delete
- **Overlap check**: `FromDate <= @ToDate AND ToDate >= @FromDate` cho cùng (BranchId, DriverId, Status>=0) — chống tạo 2 phiếu chồng khoảng cùng lái

### Anh tự viết (em không động)
- `SP_DriverFuelClosing_GetCandidates(@BranchId, @DriverId, @FromDate, @ToDate)` — lấy phiếu DriverFuelApproval + lệnh DispatchOrder/FCL/AdditionFee chưa tổng kết (filter `IsSummarized=0` — cột flag trong DispatchOrder). Khi anh xong báo signature, em hook vào BE.

## Modal-fuel-summary — nút Reload + Xóa từng dòng (chỉ khi tạo mới) — 2026-06-02 (code xong, anh test)
[modal-fuel-summary.component.html/ts](d:/Delta/DeltaSoft/web-app-update/src/app/shared/components/transports/modal-fuel-summary/). Khi user tạo phiếu tổng kết dầu:
- Cột "X" đầu mỗi dòng chi tiết → nút Xóa (`removeDetail(i)` splice + tính lại `entity.quantity`).
- Nút "Tải lại danh sách" cạnh dropdown Biển kiểm soát → confirm dialog rồi fetch lại toàn bộ lệnh chưa tổng kết.
- Tách helper `_fetchDetailsByVihicle(vihicleId)` từ `vihicleChanged` để reuse.
- Cả 2 button chỉ hiện khi `flagNew && !flagXem && entity.vihicleId`.

## Modal-dispatchorder — fix vihicleTypeChanged không reset lái xe khi xe thuê ngoài — 2026-06-02 (code xong, anh test)
Bug: sửa phiếu xe thuê ngoài, đổi loại xe → ấn Lưu im lặng (không notify, không ghi).
- Root: `vihicleTypeChanged` ([modal-dispatchorder.component.ts:533](d:/Delta/DeltaSoft/web-app-update/src/app/shared/components/transports/modal-dispatchorder/modal-dispatchorder.component.ts#L533)) reset `driverName = ''` (input text `[required]` khi `isSubcontractors`) → form invalid → `saveChange()` line 851 `if (form.valid)` không có else → im lặng thoát.
- Fix: tách logic — xe nội bộ giữ logic reset cũ (xe gắn loại trong DB); xe thuê ngoài chỉ `loadQuotationDetailed()`, KHÔNG reset biển số/lái xe/SĐT (đều là input text tự nhập, không link loại xe).
- Lưu ý: `saveChange` không có nhánh else khi form invalid → defensive notify chưa thêm; nếu sau gặp case tương tự sẽ vẫn im lặng.

## Vietmap routing — fixed cứng theo hợp đồng, BỎ tham số custom — 2026-06-02
Confirm với Vietmap: endpoint public `maps.vietmap.vn/api/route` chỉ accept `vehicle=car` + `points_encoded` + `apikey`. `avoid=motorway` / `weighting=shortest` / `vehicle=truck` đều bị bỏ qua, cần liên hệ Vietmap theo hợp đồng. Revert [VietmapApiController.cs:61](D:/Delta/DeltaSoft/NewAPI/API/Controllers/Commons/VietmapApiController.cs#L61) về URL cơ bản. Memory: `reference_vietmap_api_params_locked.md`.

## Google routing — tránh cao tốc + ưu tiên đường ngắn nhất (đồng bộ "ưu tiên QL") — 2026-06-02
ERP `modal-route-compare` gọi **trực tiếp Google Maps JS SDK client-side** (`google.maps.DirectionsService`), KHÔNG qua BE → fix tại đúng nơi:
- **FE** [modal-route-compare.component.ts:304](d:/Delta/DeltaSoft/web-app-update/src/app/shared/components/danhmuc/modal-route-compare/modal-route-compare.component.ts#L304): thêm `avoidHighways: true` + đổi `provideRouteAlternatives: false → true` + sort `result.routes` theo tổng `legs.distance.value` asc trước khi `_applyGoogleRenderer` (routeIndex=0 = ngắn nhất). Confirm với anh: Google đã ưu tiên QL.
- **BE** [GoogleMapController.cs](D:/Delta/DeltaSoft/NewAPI/API/Controllers/CustomerCommunicate/GoogleServices/GoogleMapController.cs) `/api/GoogleMap/get-routes` (endpoint `getRoutesWB` chưa có FE caller nào sử dụng): thêm `routeModifiers.avoidHighways=true` + sort `googleData["routes"]` theo `distanceMeters` asc trước khi build object. Giữ cho luồng tương lai.

## ERP API DraftAudienceGuardFilter — tạm gỡ khỏi pipeline để debug app pool stop — 2026-06-02 (code xong, anh deploy + theo dõi)
App pool ERP IIS bị stop kèm pattern "20 phút không dùng → STOP, phải vào IIS Manager Start". Phân tích stdout log 7244 dòng `stdout_20260602035749_13852.log`:
- KHÔNG có exception/shutdown — file cắt giữa dòng → process bị kill ngoài managed code.
- KHÔNG có request `/api/draft/*` hay token aud=draft → KHÔNG liên quan code Draft.
- Hot path nghi vấn: `POST /api/ExportInvoice/GetExport` response **22.5 MB JSON** (line 3826) + `/api/ExportInvoice/getpaging` lặp 4 lần liên tục.
- Diagnosis: Idle Time-out 20' shutdown w3wp + DataProtection in-memory keys mất (LoadUserProfile=False) → cookie decryption fail khi cold start → crash → Rapid-Fail Protection stop pool.

### Cách 1 (đang áp dụng) — gỡ filter draft khỏi pipeline
Comment `options.Filters.Add<DraftAudienceGuardFilter>()` ở [Program.cs:83](D:/Delta/DeltaSoft/NewAPI/API/Program.cs#L83). Giữ ValidAudiences + endpoint `/login-draft` → draft-web vẫn hoạt động. Mất lớp default-deny aud=draft (rủi ro thấp vì token chỉ 1h + `FilterDraftPermissions` đã hẹp scope).

### Đề xuất config IIS (anh tự áp khi rảnh)
- App Pool Advanced Settings: `Idle Time-out = 0`, `Load User Profile = True`, `Start Mode = AlwaysRunning`, `Rapid-Fail Maximum Failures = 100` (rộng)
- Site Advanced Settings: `Preload Enabled = True`

### Cách 3 (tách bạch ERP/Draft hoàn toàn) — HOÃN
SQL design + BE/FE refactor lớn. SQL grants em đã soạn ở [Grant_DraftApp_ErpAccess_20260602.sql](D:/Delta/DeltaSoft/DraftAPI/Grant_DraftApp_ErpAccess_20260602.sql) — chưa chạy. Khi anh muốn pick up sẽ làm.

## Draft Site Phase 3 — Canon Job nháp (menu Hàng Canon) + cleanup ngày tạo/Kích hoạt/Chuyển duyệt — 2026-06-01 (code xong, CHƯA commit, cần restart ERP API + test)
Port modal-job-canon ERP qua draft-web (Canon Job nháp) + tách menu submenu "Hàng Canon" + dọn UI noise.

### Canon Job nháp — port 1:1 modal-job-canon
- **Reuse `DraftType='Shipment'` + Payload có `shipmentType=1176` (CANON_TRUCKING)** → KHÔNG đụng BE/SQL/SP. List 2 menu (Lô hàng thường vs Canon Job) filter trên FE theo flag này.
- **Folder mới** `D:\Delta\DeltaSoft\draft-web\src\app\canon\`:
  - `canon-job-form.ts/html/scss` — port nguyên xi layout modal-job-canon ERP (2 cột 8/4), modal **85vw** (custom SCSS class `.canon-job-dialog { max-width: 85vw }`). Default `shipmentType=1176` cố định. Field bind đặc biệt theo ERP convention: `entity.mawB_MBL=Cung đường code`, `entity.cdsNumber=Xe vận chuyển`, `entity.hawB_HBL=LOT`, `entity.cdsDate=Ngày VC`. Header "Nhân viên" như 4 form đã có.
  - `canon-job-list.ts/html` — ag-grid filter `Payload.shipmentType===1176`. Cột rút gọn: Mã KH/Khách hàng/Cung đường/Xe VC/LOT/Ngày VC/Pallets/Lượng kg/Ghi chú/Người lập/Trạng thái. Map cung đường code→name bằng cách load `canonRoads(customerId)` cho từng KH có record trong list.
- **Models** [core/models.ts](D:/Delta/DeltaSoft/draft-web/src/app/core/models.ts) thêm `CanonRoadLookup { id, code, name, customerId }`.
- **Lookup** [core/lookup.service.ts](D:/Delta/DeltaSoft/draft-web/src/app/core/lookup.service.ts) thêm `canonRoads(customerId) → POST /api/canonroad/getall { tokenKey, customerId, item: {} }`.
- **ERP allowlist** [appsettings.json](d:/Delta/DeltaSoft/NewAPI/API/appsettings.json) thêm `/api/canonroad/getall` (action có `[ClaimRequirement]` không thấy, phải allowlist tay). **Cần restart ERP API**.
- **Shipment-list filter** EXCLUDE Canon: `p.shipmentType !== 1176` trong load() → list "Lô hàng" thường không lẫn record Canon.
- **Routing** [app.routes.ts](D:/Delta/DeltaSoft/draft-web/src/app/app.routes.ts) thêm `/canon-job → CanonJobList`.
- **Layout** [layout.html/scss](D:/Delta/DeltaSoft/draft-web/src/app/layout/) thêm submenu "Hàng Canon" (title + sub-item Job; sub-item Debit để slot trống chờ làm sau). CSS `.menu-group + .menu-group-title + .menu-sub` indent 30px, font-size 11px uppercase letter-spacing.

### Bỏ UI "Ngày tạo/Ngày lập" — dùng SQL `CreatedAt` envelope
Anh chốt: ngày tạo nháp lấy server-side từ `draft.DraftEntries.CreatedAt`, user không nhập/sửa. Debit giữ "Ngày doanh thu" + "Ngày vận hành" (vì là ngày kế toán riêng).
- **Shipment**: bỏ `<input ngayjob>` ở right col-md-4 (Tab 1).
- **Payment**: bỏ `<input refdate>` ở right col-md-4.
- **Debit**: bỏ "Ngày lập" (refDate). Giữ NGUYÊN "Ngày doanh thu" (debitDate) + "Ngày vận hành" (accountingDate).
- **Canon Job**: bỏ "Ngày tạo" ở right col-md-4.
- **Workflow**: skip (không có field "Ngày tạo", chỉ có thời gian dự kiến/hoàn thành/đóng-trả hàng — không phải ngày tạo).
- TS `add()` vẫn set `jobDate/refDate = today` (Payload có giá trị, không null) → Phase 4 Promote sau này sẽ override = `createdAt` envelope khi insert `Tbl_*.JobDate/RefDate`.

### Bỏ "Kích hoạt" + "Chuyển duyệt"
- **Shipment + Canon Job**: bỏ checkbox "Kích hoạt" (`entity.status` checkbox HTML). `empty()` default `status=true` giữ nguyên — không ảnh hưởng vì nháp KHÔNG có khái niệm "active/inactive".
- **Payment + Debit**: clean field `_isChuyeduyet` (TS) + reference `[readonly]="flagXem || _isChuyeduyet"` → `[readonly]="flagXem"`. `save()` hardcode `entity.status = false` (nháp luôn false, không có workflow accept). Vì checkbox "Chuyển duyệt" đã bỏ từ session trước, biến `_isChuyeduyet` luôn = false → dead code, clean luôn.

### Build sạch
- `ng build --configuration=development` → 6.6s lần đầu, 7.2s sau cleanup. 0 error.
- **Service nào cần restart**: chỉ **ERP API** (load allowlist canonroad). Draft API + SQL KHÔNG đụng.

## Draft Site Phase 3 — header "Nhân viên" bắt buộc cho 4 form (lập hộ NV X) — 2026-05-31 (code xong, CHƯA commit, cần test)
Bối cảnh: 1 tài khoản admin được phân quyền duy nhất dùng để lập hộ TẤT CẢ nháp → mỗi phiếu phải ghi nhận `targetEmployeeId` để Phase 4 Promote gán đúng người vào ERP. Bỏ giả định "user = chủ phiếu".
- **Models** (`core/models.ts`): thêm `targetEmployeeId?: number | null` + `targetEmployeeName?: string` vào **4 Payload**: `ShipmentDraftPayload`, `WorkflowDraftPayload`, `DebitDraftPayload`, `PaymentDraftPayload`. Field nằm trong JSON envelope, KHÔNG đụng DB (`Payload NVARCHAR(MAX)` opaque).
- **4 form đều có cùng banner header** (alert-light border):
  ```
  👤 Nhân viên *  [Chọn NV (phiếu lập hộ)... ▼]
  ```
  Đặt trước nội dung form: shipment trước nav-tabs, workflow sau row Lưu/Hủy buttons, debit ngay đầu form, payment sau form-tag.
- **Lookup** dùng lại `lookup.employees()` đã có (allowlist `/api/employee/getbybranchid` đã add từ session trước — không cần đụng BE).
- **Validation**: `save()` block ngay đầu nếu `!entity.targetEmployeeId` → toast `"Vui lòng chọn Nhân viên (phiếu này lập hộ cho ai)."` Áp dụng cho cả 4 form.
- **Payment đặc thù** (đã chốt với anh: "tách 2 field, auto-fill khi tạo, vẫn cho đổi"):
  - `changedTargetEmployee()` nếu `!editId` → tự set `entity.employeeId = targetEmployeeId` ("Người làm TT" auto theo Nhân viên header)
  - "Người làm TT" trước đây `[readonly]="true"` → giờ `[readonly]="flagXem"` → cho admin đổi tay (lập hộ NV X nhưng TT cho NV Y)
  - **Modal chọn tạm ứng**: `modal-list-advance` thêm `@Input() employeeId`, payment-form truyền `[employeeId]="entity.targetEmployeeId"` → lọc tạm ứng của NV target chứ KHÔNG phải user đăng nhập admin.
- **lookup.advances()**: thêm param `employeeId?: number | null`, fallback `auth.employeeId` nếu null. Logic SP_Advances_GetPaging `@Step=3` filter `WHERE ad.EmployeeId = @EmployeeId` cho tạm ứng cá nhân — giờ truyền đúng NV target.
- **Range NV** (chốt với anh: "theo chi nhánh được phân quyền CS"): tạm dùng `lookup.employees()` không param → BE tự lấy theo branchId trong token. Nếu sau cần multi-branch thì mở rộng.
- **Edit lock** (chốt: "cho đổi NV"): KHÔNG khóa khi edit — nháp Draft cho đổi hết. Phase 4 Promote sẽ chốt.
- **Build**: 10.7s, 0 error. **BE/SQL KHÔNG đụng** (Payload opaque). Khi Phase 4 Promote → controller promote phải parse `targetEmployeeId` từ Payload và gán vào `Tbl_*.EmployeeId` thật.

## Draft Site Phase 3 — Production environment + fix advances employeeId — 2026-05-30 (đã commit + push `038cf3a`/`54d20b0`)
2 commit nhỏ, push lên `funneo/DeltaSoftDraftFE`.
- **`54d20b0`** — fix advances `employeeId: null` (NCC + cá nhân đều rỗng) → `this.auth.employeeId` từ JWT claim. SP `SP_Advances_GetPaging` nhánh `@Step=3` filter `WHERE ad.EmployeeId = @EmployeeId` cho cả tạm ứng cá nhân và NCC, NULL → 0 row.
- **`038cf3a`** — `environment.prod.ts` (production: true, URL HTTPS prod) + angular.json `fileReplacements` swap khi build prod. `defaultConfiguration: production` nên `ng build` không kèm flag = build prod luôn.

## modal-dispatchorder — bỏ field "Lái xe ghi nhận dầu" + auto-sync theo Lái xe 1 — 2026-05-31 (code xong, CHƯA commit, cần test)
Ẩn field "Lái xe ghi nhận dầu" khỏi UI, luôn = Lái xe 1 (tránh user phải nhập 2 lần cùng giá trị).
- **HTML** [modal-dispatchorder.component.html:149-157](../../src/app/shared/components/transports/modal-dispatchorder/modal-dispatchorder.component.html#L149): xóa label + ng-select "Lái xe ghi nhận dầu" (vốn `*ngIf="!isSubcontractors"` + required). Giữ "Loại Cont" lên đầu form-group (col-sm-2 label + col-sm-4 ng-select).
- **TS `driver1Change()`** ([modal-dispatchorder.component.ts:277](../../src/app/shared/components/transports/modal-dispatchorder/modal-dispatchorder.component.ts#L277)): **bỏ điều kiện** `if (branchId != '5')` → **luôn** set `fuelDriverId = event?.id` + `fuelDriverNae = event?.employeeFullName`. Trước đây branch 5 mới skip để admin chọn riêng — giờ thống nhất tất cả branch.
- **TS `changeVihicle()`** ([modal-dispatchorder.component.ts:556](../../src/app/shared/components/transports/modal-dispatchorder/modal-dispatchorder.component.ts#L556)): khi chọn Xe → auto-set Lái xe 1 theo employeeId của xe → sync luôn `fuelDriverId` + `fuelDriverNae` cho nhất quán (không thì user chọn Xe trước, Lái xe 1 auto nhưng fuelDriverId rỗng → fee dầu không tính được).
- **Dead code KHÔNG đụng** (theo quy ước minimum diff): `driver3Change` handler + `_fieldLabels.fueldriverId` entry trong `_collectMissingFields()`. Không gây hại vì field không còn require nữa.
- **Xe thuê ngoài** (`isSubcontractors=true`): Lái xe 1 là `<input text>` nhập tay → không có employeeId → fuelDriverId vẫn null. Section "Lái xe ghi nhận dầu" trước đây cũng đã `*ngIf="!isSubcontractors"` → consistent với behavior cũ.

## Draft Site Phase 3 — Debit + Payment + Workflow nháp (4/4 menu xong) — 2026-05-29 (đã commit + push `45f69e6`)
Nhân bản pattern từ "Lô hàng" sang 3 menu còn lại (port 1:1 từ ERP, css compact, modal **fullscreen**). Push lên `funneo/DeltaSoftDraftFE`. Tất cả qua Draft API (`POST /api/draft/create|update|delete|getPaging|getById` với `draftType` tương ứng).
- **Push lần đầu app `draft-web` vào git**: repo private `funneo/DeltaSoftDraftFE.git`.
- **Allowlist mới (ERP `appsettings.json`)**: shipment/getfordebitnotes, shipment/getbyid, supplier/getall, employee/getbybranchid, jobgroup/getall, jobgroupoption/getbyjobgroup, handlinggroup/getall. Endpoint có `[ClaimRequirement(VIEW)]` thì pass-through tự nhiên qua `DraftAudienceGuardFilter`; endpoint không có CR phải thêm allowlist tay.
- **Auth bổ sung claim `employeeId`** (KHÁC userId): `DraftClaims` + `auth.employeeId` getter. Dùng cho field "Người làm thanh toán" default = chính user đăng nhập (readonly).
- **Debit nháp** (`debit/`):
  - `modal-shipment-search.ts` — port `modal-shipment-view-search` ERP (chọn JobId / Lô hàng). **Reuse cho cả Payment + Workflow.**
  - `debit-form.ts/html/scss` — copy 1:1 `modal-debit-notes` ERP, modal **fullscreen** (BS5 `modal-fullscreen`), nút Lưu/Hủy ở header (bỏ nút In). Giữ NGUYÊN các nút sub-modal (showJob/showFiles/showDispatchOrder…) — tạm toast placeholder, port sau. **Bỏ checkbox "Chuyển duyệt"** (nháp không có workflow accept).
  - `debit-list.ts/html` — ag-grid wrapper.
  - Quyết định: debit nháp KHÔNG khóa shipment (vì chỉ là nháp).
- **Payment nháp** (`payment/`):
  - `modal-list-advance.ts/html/scss` — port `modal-list-advance` ERP, date range mặc định 60 ngày, 4 filter rows.
  - `payment-form.ts/html/scss` — port `modal-payment-detail` + page `payment-detail` ERP, fullscreen. Có **Hình thức** (Cá nhân/NCC), **Loại thanh toán** (Có tạm ứng/Trực tiếp), số tạm ứng + nút mắt mở modal-list-advance (lọc `isTransfer` + `supplierId` đúng theo loại). **Người làm TT default = `auth.employeeId`, readonly** (trước đó để rỗng — anh feedback "phải mặc định chính là tài khoản đăng nhập"). **Bổ sung nút chọn Lô hàng** (input-group reuse `modal-shipment-search` từ debit) vì TT nháp cần biết Lô hàng (khác ERP). **Bỏ "Chuyển duyệt".**
  - `payment-list.ts/html`.
- **Workflow nháp** (`workflow/`) — port 1:1 `modal-workflow` ERP, fullscreen, single col layout:
  - KH (Mã + dropdown) → load shipments cùng KH cho ô JobId search.
  - **JobId** span đỏ + nút search → reuse `modal-shipment-search`.
  - **Nhóm thực hiện** multi-select (tạo mới) / single (sửa) + **Mức độ phức tạp** (toughness `OtherCategories.TOUGH`).
  - Thời gian dự kiến / Hoàn thành trước (datetime).
  - **Nhóm công việc** → on-change load checkbox list "Tên công việc" (click row toggle).
  - Nội dung / Mã tham chiếu (required) / Thời gian + Địa điểm đóng/trả hàng.
  - Card **Chi tiết Lô hàng** hiện khi đã chọn shipment.
  - `workflow-list` ag-grid 10 cột.
- **Models / Lookup mới**: ShipmentLookup, PaymentDetailLookup, DebitDraftPayload, DebitNoteDetailDraft, SupplierLookup, EmployeeLookup, AdvanceLookup, PaymentDraftPayload, PaymentDetailDraft, JobGroupLookup, JobGroupOptionLookup, HandlingGroupLookup, WorkflowJobOptionDraft, WorkflowDraftPayload. Methods: shipmentsForDebitNotes, shipmentDetail, paymentByJob, suppliers, employees, advances, jobGroups, jobGroupOptions, handlingGroups.
- **Layout/Routing**: 4 menu enable theo thứ tự ERP (Lô hàng → Công việc → Thanh toán → Debit), routes `/workflow`, `/payment`, `/debit`.
- **Lưu ý đã giải quyết**: endpoint draft không có `[ClaimRequirement(VIEW)]` → phải thêm Draft:ReadAllowlist tay; restart ERP API mỗi lần thêm allowlist. DraftAudienceGuardFilter pattern default-deny.

## Fix "UI đơ phải F5" — modal-backdrop leak xuyên route + WebGL Vietmap leak — 2026-05-28 (code xong, CHƯA commit, cần test thực tế)
Audit toàn FE phát hiện root cause hiện tượng "đơ phải F5" XẢY RA TRÊN CẢ APP (xuất hiện từ lúc làm FCL refactor 3 tháng trước).
- **Root cause #1 (chính):** [modal-dispatch-order-fcl-v2.component.html:1151-1156](../../src/app/shared/components/transports/modal-dispatch-order-fcl-v2/modal-dispatch-order-fcl-v2.component.html#L1151-L1156) + [modal-add-extra-segment.component.html:187-188](../../src/app/shared/components/transports/modal-add-extra-segment/modal-add-extra-segment.component.html#L187-L188) embed cứng 4 sub-modal (Vietmap/MapRoutes/Compare/AddExtra) KHÔNG `*ngIf`. Host list FCL mới destroy modal cha bằng `*ngIf="viewModalV2"`. Khi user mở v2 → AddExtra → Vietmap (3 backdrop) rồi bấm X/Lưu trên cha mà chưa đóng con → host destroy cả cây → ngx-bootstrap không kịp gỡ `.modal-backdrop` + `body.modal-open` → backdrop kẹt ở `<body>` Angular root sống xuyên route → trang khác bị overlay vô hình chặn click. Khớp đúng "từ lúc làm FCL".
- **Root cause #2:** [modal-vietmap-routes.component.ts](../../src/app/shared/components/danhmuc/modal-vietmap-routes/modal-vietmap-routes.component.ts) + [modal-route-compare.component.ts](../../src/app/shared/components/danhmuc/modal-route-compare/modal-route-compare.component.ts) không có `ngOnDestroy` → WebGL Map instance giữ GPU context + RAF loop + listeners. Sau 5-10 lần mở-đóng đột ngột, browser ngắt WebGL → CPU 100% + lag toàn app.
- **Fix (combo defensive cleanup):**
  - `ngOnDestroy` ở 4 modal lớn: [modal-dispatch-order-fcl-v2](../../src/app/shared/components/transports/modal-dispatch-order-fcl-v2/modal-dispatch-order-fcl-v2.component.ts), [modal-add-extra-segment](../../src/app/shared/components/transports/modal-add-extra-segment/modal-add-extra-segment.component.ts), [modal-vietmap-routes](../../src/app/shared/components/danhmuc/modal-vietmap-routes/modal-vietmap-routes.component.ts) (destroy map WebGL + clear markers/timer), [modal-route-compare](../../src/app/shared/components/danhmuc/modal-route-compare/modal-route-compare.component.ts) (destroy 2 maps + googleRenderer.setMap(null)). Mỗi ngOnDestroy: `modal?.hide?.()` chủ động + `setTimeout(250ms)` scrub stuck DOM (CHỈ scrub khi không còn `.modal.in/.show` thật → tránh phá modal khác).
  - Thêm `@Output() CloseModal` cho `modal-add-extra-segment` (đang thiếu, host không biết user đóng).
  - **Safety net global** [app.component.ts](../../src/app/app.component.ts): listen `NavigationEnd` → sau 50ms, nếu DOM còn `.modal-backdrop` / `body.modal-open` mà KHÔNG có modal shown → scrub. Lớp này catch mọi case modal nào đó leak quên trong tương lai.
- **Cách verify (DevTools console):**
  ```js
  setInterval(() => {
    const bd = document.querySelectorAll('.modal-backdrop').length;
    const open = document.body.classList.contains('modal-open');
    const visible = document.querySelectorAll('.modal.in, .modal.show').length;
    console.log(`[modal-watch] backdrop=${bd} modal-open=${open} visible=${visible}`);
  }, 1000);
  ```
  Sequence: FCL → AddExtra → Vietmap → bấm X modal v2 → navigate sang `/home`. Trước: `backdrop≥1 modal-open=true visible=0`. Sau fix: `backdrop=0 modal-open=false`.
- **Pattern khác đã loại trừ** (audit ban đầu nghi nhưng KHÔNG phải nguyên nhân chính): ngx-spinner không hide khi error, AuthInterceptor không catch 401, SignalR token cũ. Đây là nguyên nhân PHỤ (tạo "đơ trong tab FCL"), không gây "đơ toàn app". Để dành cho session sau.

## modal-dispatchorder (lệnh vận chuyển thường) — polish UX validation + đổi loại xe reset + modal-dispatchorder-route phân trang — 2026-05-28 (code xong, CHƯA commit, cần test)
3 fix cải thiện UX cho modal lập lệnh vận chuyển thường (TO/Dispatchorder legacy).
- **Bug "phân trang mất tiêu" ở `modal-dispatchorder-route`**: commit `19c6d54` (2026-05-18) đổi `.modal-body { overflow: hidden }` + `tbody { height: calc(90vh - 280px); max-height: 580px }` → tbody chiếm gần hết → pagination dưới tbody bị **cắt khỏi viewport** dù DOM vẫn render. Fix [modal-dispatchorder-route.component.css](../../src/app/shared/components/transports/modal-dispatchorder-route/modal-dispatchorder-route.component.css): (a) `overflow: hidden` → `overflow: auto` (cuộn dự phòng); (b) bỏ `height` cố định cả `.modal-content` (`height: 800px`) + `tbody` (`height: calc(...)`); (c) `tbody { max-height: calc(90vh - 360px) }` (giảm 580→500-ish, chừa chỗ pagination). Kết quả: modal co theo content, pagination sát footer "Lưu/Hủy", không khoảng trống xám.
- **Bug Lái xe 1 (xe thuê ngoài) thiếu `required`**: [modal-dispatchorder.component.html:122](../../src/app/shared/components/transports/modal-dispatchorder/modal-dispatchorder.component.html#L122) — label "Lái xe 1 *" hiện dấu * đỏ nhưng nhánh `*ngIf="isSubcontractors"` chỉ có `<input name="driverName">` KHÔNG required. Sửa thêm `[required]="entity.isSubcontractors"`.
- **UX "bắt lỗi sai sau khi ấn lưu và nhập tiếp"**: nguyên nhân nút Lưu `[disabled]="!flagOk || !form.valid"` → user không biết field nào còn thiếu, cứ "mò". Fix:
  - 2 nút Lưu bỏ `!flagOk || !addEditForm.form.valid` khỏi disabled → user CLICK được kể cả form invalid.
  - 3 helper mới ở [modal-dispatchorder.component.ts:671-718](../../src/app/shared/components/transports/modal-dispatchorder/modal-dispatchorder.component.ts#L671-L718): `_fieldLabels` (map name → tên Việt: Nhà cung cấp/Loại xe/Xe/Lái xe 1/Lái xe ghi nhận dầu/Cung đường toàn tuyến), `_collectMissingFields()` duyệt form.controls invalid → tách field master vs dòng bảng (gộp `hasRowInvalid`), `_validateBeforeSave()` trả error message tiếng Việt hoặc null.
  - `saveChange()` và `saveAndNew()` đều gọi `_validateBeforeSave()` đầu → toast `"Vui lòng kiểm tra các trường: Loại xe, Cung đường toàn tuyến"` hoặc `"Chưa có: Chi tiết công việc, Cung đường"` thay vì silent disable.
- **Bug đổi loại xe không reset xe cũ**: [modal-dispatchorder.component.ts vihicleTypeChanged()](../../src/app/shared/components/transports/modal-dispatchorder/modal-dispatchorder.component.ts) cũ chỉ `loadVihicle(...)` mà KHÔNG xóa `vihicleId/moocId/license plates/oilQuota/driverId/driverName/driverTel/secondDriver*/fuelDriverId` → xe cũ còn nguyên dù không thuộc loại mới. Fix: reset 12 field (xe, mooc, license plates, định mức, lái xe 1+2+ghi dầu) + gọi `changedKmQuota()` recompute fee dầu, rồi mới `loadVihicle()`.

## Draft Site Phase 3 — modal-execute-fcl: màn THỰC HIỆN lệnh FCL mới + loading list + 7 ngày mặc định — 2026-05-28 (code xong, CHƯA commit, cần test)
Component MỚI hoàn toàn ở `shared/components/transports/modal-execute-fcl/` (4 file ~640 dòng tổng). Tách song song khỏi `modal-perform-fcl` cũ — KHÔNG đụng cũ.
- **Component cấu trúc:** [modal-execute-fcl.component.ts](../../src/app/shared/components/transports/modal-execute-fcl/modal-execute-fcl.component.ts) (~280 dòng) mở qua `getDetailWithTo(refNo)` (load FCL mới + segments + extras + listEtc + listFee + listDetailed). [.html](../../src/app/shared/components/transports/modal-execute-fcl/modal-execute-fcl.component.html) (~290 dòng). [.scss](../../src/app/shared/components/transports/modal-execute-fcl/modal-execute-fcl.component.scss). [.module.ts](../../src/app/shared/components/transports/modal-execute-fcl/modal-execute-fcl.module.ts).
- **Mọi field readonly NGOẠI TRỪ 4 phần (theo spec anh):**
  1. **POD** — section riêng (fieldset 50/50 với "Ảnh hiện trường"): nút "Tải POD" + bảng list file + nút xóa. Dùng `DispatchordersService.getAttachFile/addAttachFile/deleteAttachFile` với cờ `isPod=true`.
  2. **Ảnh hiện trường** — tương tự, `isPod=false`.
  3. **Bảng "Chi phí" (listFee)** — editable: dropdown loại phí (CP01/02/03), nội dung, số tiền, VAT, tổng tiền auto, nút Thêm dòng / Xóa.
  4. **Cột "Trốn vé" trong bảng "Xe tránh trạm" (listEtc)** — list TẤT CẢ trạm phí FLAT, chỉ checkbox `isPassed` là editable (cột khác readonly). Section ẩn nếu `listEtc` rỗng. Quyết định cuối: KHÔNG group theo chặng (yêu cầu thêm SegmentId vào schema, quá đụng) — flat đơn giản.
- **3 field LÁI XE NHẬP** (sau nhận lệnh, trước duyệt B1 — `status≤2`): Km đầu (`startVehicleOdor`), Km cuối (`finishVehicleOdor`), Tài xế ghi chú (`noteFinished`). `status≥3` → readonly. Validation Km đầu < Km cuối khi save (port từ modal-perform-fcl cũ).
- **Footer buttons workflow** giống perform-fcl cũ: `status=1` Nhận lệnh/Từ chối, `status=2` Lưu thông tin/Kết thúc (gọi `driverUpdate`), `status=4` Chốt dữ liệu/Từ chối chốt.
- **Tab thứ 3 ở [perform-dispatch-order](../../src/app/main/transports/dispatchorders/perform-dispatch-order/)** "Thực hiện lệnh FCL mới": clone layout list từ tab FCL cũ; click RefNo → mở `<modal-execute-fcl>`. Filter `isLegacy === false` ở FE (không cần đụng SP `GetPerformance`).
- **Loading 3 tab**: thêm `ngx-spinner` (name: `toSpinner` / `fclSpinner` / `fclNewSpinner`) — show khi gọi BE, hide trong cả nhánh next + error. NgxSpinnerModule thêm vào module.
- **Khoảng ngày mặc định**: đổi từ `startOf('month')` → 7 ngày gần nhất (`subtract(6, 'days')` đến hôm nay). Áp dụng cả 3 tab.

## Draft Site — Phase 3: FE site nháp (Angular 21 app mới) — vertical slice "Lô hàng" — 2026-05-27 (code xong, chờ test e2e)
App Angular **21** hoàn toàn mới `D:\Delta\DeltaSoft\draft-web` (KHÔNG đụng ERP `web-app-update`). Stack: standalone components + signals + control flow `@if/@for`, **Bootstrap 5.3**, Font Awesome 6 (+v4-shims cho `fa fa-*`), `@ng-select/ng-select` 21, `ngx-mask` 21, **`ngx-daterangepicker-material`** (thay datepicker cũ), `dayjs`, **ag-grid** 35 (Community). Build sạch, `ng serve` cổng **4300**.
- **Auth** (`core/auth.service.ts` + interceptor + guard functional): login → ERP `POST /api/account/login-draft` (token `aud=draft`, hạn 1h), lưu `DRAFT_TOKEN` localStorage, decode JWT (atob) lấy claims/branchId/permissions, `isLoggedIn` check `exp`. Interceptor gắn Bearer + 401→logout. Remember-me (base64 pwd in `DRAFT_LOGIN_REMEMBER`).
- **Login** (`login/`): rewrite sạch Bootstrap 5 (form-floating) — panel brand gradient + carousel quote xoay 6s, username/password (toggle hiện/ẩn), `<select>` chi nhánh nạp từ `/assets/data/branch.json`, remember-me, lỗi inline. (CSS ERP copy nguyên 514 dòng bị vỡ trên BS5 → viết lại mới.)
- **Layout** (`layout/`): sidebar 4 menu (Lô hàng active; Công việc/Thanh toán/Debit disabled), topbar tên user + logout.
- **Lô hàng — form MODAL** (`shipment/shipment-form.*`): port **nguyên xi** form lô hàng ERP (4 tab: Thông tin chung / Chi tiết / Thông tin khác / Số hóa báo giá), modal-xl BS5, `@Input open/editId` `@Output closed/saved`. Giữ toàn bộ logic: đổi KH→load hợp đồng/báo giá (`_typePrice`), shipmentType→shippingType (FCL/LCL khi 1174/1175), số hóa báo giá (quotationDetail + checkbox clickRow), auto-thêm dòng cont/package, ngày lưu `YYYYMMDD`/`YYYYMMDD HH:mm:ss` (parity DTO ERP để promote).
- **Lô hàng — LIST** (`shipment/shipment-list.*`): bọc **ag-grid** qua wrapper `<app-data-table>` port từ SBIERP (`shared/components/data-table/`). **Cột KHỚP list Lô hàng ERP** (`shipment-normal`): STT/Thao tác pin trái, Mã KH, Khách hàng, JobId (link→mở sửa, nháp hiện `#id`), Loại hình, Tờ khai, Invoice, H/Bill, M/Bill, Booking No, Lượng hàng (number), Cont No, Ghi chú, Người lập/Ngày lập, CN làm hàng, Trạng thái (badge). List parse **Payload JSON** mỗi dòng + map qua lookup nạp 1 lần (customers→Mã KH, OtherCategories `SHIPMENT_T02`→Loại hình, branches→CN). Action Sửa/Xóa chỉ hiện `status==='Draft'`. Cần: SP `getPaging` trả thêm `Payload` (`Migration_DraftSite_GetPaging_AddPayload_20260527.sql`) + restart Draft API.
- **Lookup read-only ERP** (`core/lookup.service.ts`): customers/fees/branches/otherCategories/contracts/quotations/quotationDetail gọi ERP qua token nháp (đọc-only, allowlist Phase 1). ERP `Draft:ReadAllowlist` đã bổ sung customer/fee/branch/contractcustomer/quotationcustomer/othercategories/feecode.
- **Draft API calls** (`core/draft.service.ts`): create/update/delete/getPaging/getById → Draft API `:44360`.
- **⚠️ Bài học**: `ng serve` KHÔNG reload thay đổi `angular.json` (styles/assets) → phải **restart** `ng serve` sau khi sửa angular.json (đã dính lỗi ng-select/fontawesome mất style do quên restart).
- **Chưa làm**: draft-web chưa đưa vào git; 3 menu còn lại (Công việc/Thanh toán/Debit).

## Đọc hóa đơn: tối ưu chi phí flash-lite + mediaResolution=LOW + đa hóa đơn/1 PDF + nút admin-only — 2026-05-25 (code xong, CHƯA commit, chờ test)
Tiếp nối section dưới (migrate AI Studio). Cụm thay đổi giảm chi phí + xử lý KH gộp nhiều hóa đơn 1 file. Working tree NewAPI master + web-app-update main, build sạch.
- **Đổi model → `gemini-2.5-flash-lite`** (chỉ config `GoogleServices:Gemini:ModelId` trong appsettings.json — rẻ/nhanh hơn flash, vẫn honor thinkingBudget=0). Đổi model sau này = sửa 1 dòng config.
- **`mediaResolution = MEDIA_RESOLUTION_LOW`** (`generationConfig` trong [GeminiAIRepository.cs](../../d:/Delta/DeltaSoft/NewAPI/API/Repositories/CustomerCommunicate/GoogleServices/GeminiAIRepository.cs)): đòn bẩy chi phí THẬT — token ảnh 258→~66 (−74%, đã verify curl trên flash-lite). Token tính cố định theo trang/tile nên đây là cách giảm tiền hiệu quả nhất (tiền xử lý ảnh OpenCV KHÔNG giảm token, chỉ là đòn bẩy độ chính xác). Nếu ảnh chụp điện thoại sai nhiều → đổi 1 dòng sang `MEDIA_RESOLUTION_MEDIUM`.
- **Đa hóa đơn trong 1 PDF (Hướng A — AI tự tách trả mảng):** lõi mới `ExtractInvoicesCore(byte[], mime, fileName)` → `Task<List<InvoiceExtractionResult>>`. Prompt yêu cầu model phát hiện nhiều hóa đơn (mỗi hóa đơn có thể nhiều trang), trả JSON **ARRAY**, không gộp/bịa. `ParseInvoiceArray` parse mảng (fallback object lẻ → 1 phần tử). `maxOutputTokens=65536` để mảng dài không bị cắt; nếu rỗng + `finishReason==MAX_TOKENS` → báo "Tệp có quá nhiều hóa đơn, kết quả bị cắt". Nhãn `FileName` = `"{file} [i/N]"` khi N>1. `ExtractCore` (endpoint lẻ cũ) thành wrapper mỏng `.FirstOrDefault()`. Archive ZIP/RAR: mỗi entry → `SelectMany` gộp. **FE không đổi** — `modal-doc-hoa-don` vốn đã gọi endpoint mảng + master-detail khi >1.
- **Nút "Đọc hóa đơn" chỉ admin thấy ở list thanh toán:** [payment.component.html](../../src/app/main/advance-payment/payment/payment.component.html) thêm `*ngIf="_isAdmin"` (cờ `_isAdmin` đã có sẵn trong .ts từ `user.isAdmin`).

## Đọc hóa đơn: Vertex AI → Google AI Studio + retry + tắt thinking — 2026-05-24 (CHẠY ĐƯỢC, đang theo dõi chi phí, CHƯA commit)
Đổi [GeminiAIRepository.cs](../../d:/Delta/DeltaSoft/NewAPI/API/Repositories/CustomerCommunicate/GoogleServices/GeminiAIRepository.cs) từ Vertex AI (PredictionServiceClient, service-account) → **Google AI Studio REST** (`generativelanguage.googleapis.com/v1beta/.../generateContent?key=`) — rẻ hơn, có free tier, chỉ cần API key. Lý do gốc: chi phí Vertex cao.
- **Constructor** giờ là `(IConfiguration, IHttpClientFactory)`; bỏ `PredictionServiceClient`/`Google.Cloud.AIPlatform.V1`. Đọc `_modelId` (`gemini-2.5-flash`) + `_apiKey` từ `GoogleServices:Gemini:ApiKey` (appsettings — ⚠️ key đang để thẳng trong appsettings.json, nên chuyển sang appsettings.Development.json / env trước khi commit).
- **`CallGeminiWithRetryAsync`**: 3 lần thử, backoff 1.5s→3s; retry cho lỗi tạm thời 429/500/502/503/504 + 400 `API_KEY_INVALID`/`API key expired` (key mới tạo đang propagate) + lỗi mạng/timeout. Lỗi không tạm thời → ném ngay. `HttpClient.Timeout = 60s`.
- **TẮT thinking** (`generationConfig.thinkingConfig.thinkingBudget = 0`): `gemini-2.5-flash` mặc định BẬT "thinking" → mỗi hóa đơn chờ 15–60s, nhân với nhiều file song song → màn upload "quay mãi". OCR không cần suy luận → tắt đi nhanh hơn nhiều lần + rẻ hơn. **Đây là nguyên nhân chính của lỗi "đơ".**
- **`responseSchema` (controlled generation) ĐÃ THÊM RỒI BỎ**: ban đầu thêm để ép JSON đúng kiểu (fix lỗi `Invalid property identifier ... lineItems[0].amount`), nhưng user thấy nghi nên yêu cầu trả lại. Giữ `responseMimeType="application/json"` + `temperature=0` + robust substring `{...}` để parse. Nếu sau gặp lại malformed JSON với hóa đơn phức tạp thì cân nhắc thêm lại responseSchema.
- **Chẩn đoán "quay mãi"**: test curl trực tiếp tới Gemini = 1–2,3s OK (kể cả kèm ảnh + responseSchema + thinking off) → treo nằm ở **BE chạy DLL cũ** (bản Vertex chờ auth) vì IIS Express khóa `bin\API.dll` nên build CLI không ghi đè được. Quy trình đúng để chạy code mới: **Stop (Shift+F5) trong VS rồi F5 lại** (VS tự rebuild+chạy). Build CLI chỉ để verify code.
- Chi phí ước tính: ~$0.001–0.002/hóa đơn (`gemini-2.5-flash` paid). User đang theo dõi Cloud Billing vài ngày (số tiền trễ tối đa ~24h; request count gần realtime).

## Lệnh FCL mới — tải trọng phát sinh + khóa sau lập lệnh + quyền tạo lệnh — 2026-05-24 (code xong, CHƯA commit, cần test)
Tất cả ở working tree (NewAPI master + web-app-update main), build sạch (BE "lỗi" copy DLL chỉ do IIS Express đang chạy).
- **Tải trọng cung đường phát sinh (bắt buộc):** [modal-add-extra-segment](../../web-app-update/src/app/shared/components/transports/modal-add-extra-segment/) thêm dropdown **Tải trọng** (từ `listOilQuota` xe trên lệnh, parent truyền kèm `shortWay`); `onPayloadChange` tính `fuelNorm` + `fuelAmount=norm×km/100` (km đổi cũng tính lại); `canSave()` bắt buộc `payloadWeight`; gửi `payloadWeight/fuelNorm/fuelAmountCalculated` xuống. SP + repository BE đã sẵn 3 cột → không đổi DB.
- **Khóa sau "lập lệnh xong" (có refNo):** FE [modal-dispatch-order-fcl-v2.html] đổi **18 field** (xe/mooc/lái xe/lái xe ghi dầu/loại cont/NCC/loại xe/biển số/định mức chạy hàng/toàn tuyến/mã cung đường phí/giá dầu/checkbox xe thuê ngoài) từ `flagXem`/`status>2`/`status>0` → **`routeConfirmed`** (=có refNo). Giữ MỞ (chỉ `flagXem`): bù dầu, lý do bù dầu, tóm tắt lệnh, ghi chú; chi phí + phát sinh có gate riêng.
- **Shipping task (chi tiết công việc):** thêm/xóa được tới **TRƯỚC duyệt B1** (`status<3`, đổi từ `<4`).
- **BE siết** [DispatchOrderFCLRepository.cs] `UpdateWithTOAsync`: lệnh mới (không legacy) lấy bản ghi cũ từ DB làm gốc, CHỈ nhận từ client: `OilCompensation, ReasonOilCompensation, DispatchSummarize, Note, ListFee` (+`ListDetailed` khi `status<3`). Lái xe + segments + ETC phục hồi từ DB → client không ghi đè được (kể cả gọi API trực tiếp).
- **Tải trọng inline ở list phát sinh:** đã tự lưu SQL sẵn (`onExtraPayloadChange`→debounce 400ms→`updateExtraSegment`→SP recompute); thêm toast "Đã cập nhật cung đường phát sinh" cho rõ.
- **Quyền nút "Lập lệnh (Location)"** (tạo lệnh FCL mới ở `shipping-task-opman`): bỏ `*ngIf="userLoged.isAdmin"` → gate giống "Lập lệnh vận chuyển" (`appPermission DISPATCHORDER_CREATE`).

## Validate địa chỉ Google Map cho CustomerLocations + Ports — 2026-05-24 (code xong, CHƯA commit, cần test)
BE: Create/Update của [CustomerLocationsController] + [PortsController] đã tự lấy lat/lng từ `GoogleLocations` qua `GoogleMapService.ExtractCoordsFromUrl` (parse LINK gmap, không geocode địa chỉ chữ). Bổ sung: link sai/không lấy được tọa độ → trả **400 "Địa chỉ Google Map không đúng"** + KHÔNG insert/update (trước đây vẫn lưu lat/lng=0). Update: so link cũ/mới (`GetByIdAsync`/`GetByCode`), **đổi link thì geocode lại**. FE: 4 nhánh lỗi của [modal-customer-locations] + [modal-ports] ưu tiên hiển thị `res.message`. Bỏ nút test (Quy đổi/Google/Vietmap) khỏi form customer-locations modal.

## Draft Site — Phase 2: Draft API (process .NET riêng) — 2026-05-24
Project mới `D:\Delta\DeltaSoft\DraftAPI` (.NET 9, build 0 error), CHƯA test e2e (chờ user điền password `draft_app`). Tất cả endpoint **POST** (giống ERP): `/api/draft/create|update|delete|getPaging|getById` → gọi bộ `draft.SP_DraftEntries_*` qua Dapper (login `draft_app`, chỉ chạm schema `draft`). JWT **chỉ nhận `aud=draft`** (cùng `Tokens:Key`/`Issuer` ERP, `RoleClaimType="roles"`). **Quyền nháp suy ra từ quyền ERP** (QĐ user): tạo nháp cần `X_CREATE`, sửa `X_UPDATE`, xóa `X_DELETE`; map trong `appsettings Draft:Permissions` (Shipment→SHIPMENT_*, Job→`WORKFLOW_VIEW`, Payment→PAYMENT_*, Debit→DEBITNOTES_*); admin bypass. Files: Program.cs, Controllers/DraftController.cs, Data/DraftRepository.cs, Auth/DraftIdentity.cs, Models/DraftDtos.cs. Kèm sửa NewAPI `FilterDraftPermissions` (branch `feature/draft-site-phase2`) giữ `{VIEW,EXPORT,CREATE,UPDATE,DELETE}` để token nháp mang đủ quyền. Login luôn qua ERP `/api/account/login-draft` (Draft API không có kho user riêng).

## Draft Site — Phase 1: ERP API token aud=draft + lớp đọc-only — 2026-05-24 (đã test, merge master)
ERP API cấp token site nháp + chặn ghi, toàn bộ cộng thêm. `Program.cs`: `ValidAudiences={Issuer,draft}` + đăng ký global `DraftAudienceGuardFilter`. `Filters/DraftAudienceGuardFilter.cs` (mới, `IOrderedFilter` Order=int.MinValue): aud≠draft→no-op; aud=draft→default-deny (action có `[ClaimRequirement]` chỉ cho VIEW/EXPORT + audit-log EXPORT; action không có thì theo `Draft:ReadAllowlist`); độc lập admin. `ClaimRequirementAttribute`: +property `Function`/`Action`. `AccountController`: +`POST /api/account/login-draft` (method mới, token `aud=draft` hạn 1h không refresh) + `FilterDraftPermissions`. `appsettings`: section `Draft`. **Đã test:** login cũ 0 hồi quy; login-draft ghi→403 (kể cả admin). Merge master (commit `c9caf5d`).

## Draft Site — Phase 0: nền tảng DB nháp — 2026-05-24
Schema `draft` cô lập khỏi `dbo`; bảng `draft.DraftEntries` (JSON envelope: `Payload` = DTO tạo-thật, `Status` Draft→Promoted, cột phẳng `CustomerName/TotalAmount/RefHint`, xóa mềm `IsDeleted`, 2 index). 6 SP generic `draft.SP_DraftEntries_*`: `Insert` (validate DraftType, không side-effect dbo), `Update`/`Delete`(mềm) chỉ khi còn Draft + đúng chủ, `GetPaging` (filter+paging OFFSET/FETCH, không trả Payload), `GetById`, `UpdateStatus` (promote idempotent). Login least-privilege `draft_app`: GRANT schema `draft` / DENY schema `dbo`. Scripts: `NewAPI/Migration_DraftSite_Phase0_20260524.sql` (db_owner) + `..._Login_20260524.sql` (sa). Môi trường: SQL Server 2014 (không ISJSON → validate JSON ở Draft API C#); `delta.erp` là db_owner không sysadmin. Roadmap: [draft-site-roadmap.md](draft-site-roadmap.md).

## Đọc hóa đơn từ ZIP/RAR (nhiều file) + xuất Excel; sửa đường dẫn credential lên production — 2026-05-23

### Sửa đường dẫn cứng để deploy production
- [launchSettings.json](../../d:/Delta/DeltaSoft/NewAPI/API/Properties/launchSettings.json): đổi `GOOGLE_APPLICATION_CREDENTIALS` từ tuyệt đối `d:\Delta\...` → tương đối `Templates\delta-erp-vn-...json` (cả 2 profile). Code production vốn đã an toàn: [GeminiAIRepository.cs](../../d:/Delta/DeltaSoft/NewAPI/API/Repositories/CustomerCommunicate/GoogleServices/GeminiAIRepository.cs) dùng `Path.Combine(AppContext.BaseDirectory, CredentialsPath tương đối)` + [API.csproj](../../d:/Delta/DeltaSoft/NewAPI/API/API.csproj) copy file json lên output. `launchSettings.json` chỉ dùng khi dev, `dotnet publish` không đóng gói nó.

### Đọc hóa đơn nén ZIP/RAR (nhiều hóa đơn 1 lần)
Mở rộng modal "Đọc hóa đơn tự động (AI)" để nhận thêm file nén; giải nén ở BE, gửi từng file cho Gemini, trả mảng kết quả. **Endpoint cũ `extract-invoice` giữ nguyên, không đụng DB.**
- **BE**:
  - [API.csproj](../../d:/Delta/DeltaSoft/NewAPI/API/API.csproj): thêm `SharpCompress 1.0.0` (đọc cả ZIP + RAR; chọn 1.0.0 vì 0.37.2 dính advisory GHSA-6c8g-7p36-r338).
  - [DocumentAIModels.cs](../../d:/Delta/DeltaSoft/NewAPI/API/Models/CustomerCommunicate/GoogleServices/DocumentAIModels.cs): `InvoiceExtractionResult` thêm `FileName` + `Error`.
  - [GeminiAIRepository.cs](../../d:/Delta/DeltaSoft/NewAPI/API/Repositories/CustomerCommunicate/GoogleServices/GeminiAIRepository.cs): tách lõi `ExtractCore(byte[], mime, fileName)` (dùng chung); `ExtractInvoicesFromUpload(IFormFile)` nhận diện archive qua **magic bytes** (`PK`=ZIP, `Rar!`=RAR) — không phải nén thì xử như 1 file. Giải nén lọc đuôi whitelist `.pdf/.jpg/.jpeg/.png/.webp`; gọi Gemini **song song tối đa 5 luồng** (`SemaphoreSlim`), mỗi file try/catch riêng (lỗi 1 file → set `Error`, không vỡ cả lô). Chặn zip-bomb: **30 file/archive**, tổng giải nén **≤ 100 MB**; archive có mật khẩu/hỏng → trả 1 phần tử `Error` (dò message `password/crypt/encrypt`).
  - Interface [IGeminiAIRepository.cs](../../d:/Delta/DeltaSoft/NewAPI/API/Interfaces/CustomerCommunicate/GoogleServices/IGeminiAIRepository.cs) + [GeminiAIController.cs](../../d:/Delta/DeltaSoft/NewAPI/API/Controllers/CustomerCommunicate/GoogleServices/GeminiAIController.cs): thêm `POST /api/geminiAI/extract-invoices` trả `List<InvoiceExtractionResult>`.
- **FE**:
  - [export-excel.service.ts](../../src/app/shared/services/export-excel.service.ts): thêm `exportMultiSheet(sheets[{name,data}], fileName)` (nhiều sheet 1 file).
  - [gemini-ai.service.ts](../../src/app/shared/services/gemini-ai.service.ts): interface thêm `fileName?/error?`; thêm `extractInvoices(file)` POST tới `extract-invoices`.
  - [modal-doc-hoa-don](../../src/app/shared/components/advance-payment/modal-doc-hoa-don/) (.ts/.html/.css): `accept` thêm `.zip,.rar`; luôn gọi `extractInvoices`, trả mảng `results`. **1 file → giao diện cũ** (kèm preview nếu ảnh); **nhiều file → master-detail**: cột trái danh sách file (badge OK/lỗi, click chọn), cột phải chi tiết hóa đơn `selected`. Nút **Xuất Excel** (chỉ hiện khi nhiều file) → 2 sheet: `HoaDon` (1 dòng/HĐ), `ChiTietHang` (1 dòng/mặt hàng, có STT HĐ liên kết).
- Build sạch cả BE (0 error) lẫn FE (ng build OK).

---

## List lệnh FCL mới (giao diện hiện đại) thay trang TO — 2026-05-22

Tạo **component MỚI HOÀN TOÀN** `dispatch-order-fcl-new` (KHÔNG sửa FCL list cũ, KHÔNG sửa trang TO — xem [[feedback_no_touch_fcl_legacy]]). Kế thừa toàn bộ logic FCL list, lọc **`isLegacy=0`** (lệnh mới), giao diện table hiện đại hơn.
- **5 file mới** `src/app/main/transports/dispatch-order-fcl-new/`: `.component.ts` (copy logic FCL: load/filter cột/search/branch/driver; chỉ `@ViewChild` modal v2 + closing + phiếu chi; `edit()` luôn mở modal v2; localStorage key riêng `DISPATCHORDER_NEW`; `getStatusClass()` cho badge), `.component.html` (toolbar card + filter + bảng sticky header + badge pill + zebra/hover + chip cont + hàng filter theo cột + footer phân trang; cuối chỉ 3 modal: `modal-dispatch-order-fcl-v2`, `modal-closing-fcl-process`, `modal-phieu-chi-lenh` — KHÔNG có modal FCL legacy), `.component.scss` (style hiện đại: card/shadow/bo góc/badge màu), `.module.ts` (chỉ import 3 modal module cần), `-routing.module.ts`.
- **BE/service dùng chung (additive)**: `SP_DispatchOrderFCL_GetAll` thêm param `@IsLegacy` (user tự chạy SQL: NULL/0→lấy 0, 1→lấy 1); [IDispatchOrderFCL.cs](../../d:/Delta/DeltaSoft/NewAPI/API/Interfaces/FCL/IDispatchOrderFCL.cs) + [DispatchOrderFCLRepository.cs](../../d:/Delta/DeltaSoft/NewAPI/API/Repositories/FCL/DispatchOrderFCLRepository.cs) `GetAll` thêm `bool? isLegacy`; [DispatchOrderFCLController.cs](../../d:/Delta/DeltaSoft/NewAPI/API/Controllers/FCL/DispatchOrderFCLController.cs) GetPaging truyền `obj.Item?.IsLegacy`; FE `dispatch-order-fcl.service.ts` getAll đọc param `isLegacy`. FCL list cũ KHÔNG truyền isLegacy → user tự xử lý phần đó.
- **Route**: `transports/transport-order` repoint loadChildren → `DispatchOrderFclNewModule` (menu cũ tự hiển thị list mới, không đổi menu/DB). `TransportOrderModule`/component còn nguyên nhưng không route nào dùng.
- **Trước mắt ẩn**: Export, Chốt lệnh (SLL + nút CHỐT từng dòng → bỏ cột Tác vụ), Thanh toán — chỉ giữ Sửa + Xóa (method vẫn còn trong TS để bật lại sau).
- **Fix check dòng**: checkbox dòng `pointer-events:none` (chỉ hiển thị); click ô bất kỳ → `clickRow(item)` check đúng dòng; RefNo `stopPropagation` để chỉ mở xem.

---

## Vay cá nhân — filter row client-side (tổng tiền + export theo lọc) — 2026-05-21

Màn `personal-loan` (Vay cá nhân) trước đây phân trang **server 20 dòng/trang** → không có filter theo cột. Chuyển sang **load toàn bộ kỳ 1 lần → lọc + phân trang client-side** để filter/tổng tiền/export nhất quán trên TẤT CẢ bản ghi.
- **TS** [personal-loan.component.ts](../../src/app/main/advance-payment/personal-loan/personal-loan.component.ts):
  - `loadData()`: gọi API `pageSize=99999` nạp hết bản ghi trong kỳ vào `listPersonalLoan`.
  - 7 field lọc theo cột (`fEmployee/fRefNo/fDate/fAmount/fReason/fRepayment/fStatus`) + `applyFilter()` lọc dạng contains → `listFilter`; tính lại `totalMoney` + `totalRows` = số dòng sau lọc, reset trang 1.
  - `get pagedList`: cắt `listFilter` theo trang (phân trang client-side); `pageChanged()` chỉ đổi trang KHÔNG gọi API.
  - `statusText(step)`: map `step`→nhãn trạng thái để lọc theo chữ hiển thị; inject `DatePipe` (lọc ngày `dd/MM/yyyy`) + `providers:[DatePipe]`.
  - `export()`: xuất đúng `listFilter` (toàn bộ sau lọc, không chỉ trang hiện tại); strip field FE `checked`/`step`; báo nếu rỗng.
  - `checkAll`/`isAllChecked`: theo trang đang hiển thị (`pagedList`).
- **HTML** [personal-loan.component.html](../../src/app/main/advance-payment/personal-loan/personal-loan.component.html): thêm `<tr class="filter-row">` 7 ô lọc; bảng `*ngFor` qua `pagedList`; pagination dùng `totalRows` (=số dòng sau lọc); footer + empty-state theo `listFilter`.
- **CSS**: `.filter-row` gọn (input 26px).
- Kết quả: gõ filter → lọc toàn bộ kỳ, "Tổng số bản ghi" + "Tổng tiền" + phân trang + Export đều đổi theo bộ lọc.

---

## Bảo mật đăng nhập + lọc tạm ứng theo loại thanh toán — 2026-05-21

### Tạm ứng ở thanh toán lọc theo cá nhân / nhà cung cấp
Bug: modal chọn tạm ứng khi lập thanh toán ([modal-list-advance](../../src/app/shared/components/advance-payment/modal-list-advance/modal-list-advance.component.ts)) trước đây list TẤT CẢ tạm ứng (lẫn cá nhân + NCC) vì `loadData()` không truyền `isTransfer`. Phân loại cá nhân/NCC dựa trên field **`isTransfer`** (false=cá nhân, true=NCC), KHÔNG phải `type`.
- **SQL (anh tự ALTER)**: `SP_Advances_GetPaging` thêm param `@SupplierId INT = NULL` (và **`@SupplierId = 0` ≡ NULL** = không lọc); nhánh `@Step=3` thêm `AND (@SupplierId IS NULL OR ad.SupplierId=@SupplierId)` + nới lọc `EmployeeId` cho luồng NCC. `@IsTransfer BIT=0` đã có sẵn từ trước.
- **BE** (3 file): [IAdvances.cs](../../d:/Delta/DeltaSoft/NewAPI/API/Interfaces/AdvanceAndPayments/IAdvances.cs) + [AdvancesRepository.cs](../../d:/Delta/DeltaSoft/NewAPI/API/Repositories/AdvanceAndPayments/AdvancesRepository.cs) `GetPaging` thêm param `int? supplierId` → `@SupplierId`; [AdvanceController.cs](../../d:/Delta/DeltaSoft/NewAPI/API/Controllers/AdvanceAndPayments/AdvanceController.cs) đọc `obj.Item?.SupplierId` truyền vào.
- **FE** (4 file): `advance.service.ts` getPaging đọc `supplierId` param → `p.item.supplierId`; `modal-list-advance.component.ts` thêm `@Input() isTransfer` + `@Input() supplierId`, gửi qua `loadData()` (NCC gửi supplierId, cá nhân gửi 0); `payment-detail.component.ts` `showAdvances()` cảnh báo *"Vui lòng chọn Nhà cung cấp trước khi chọn tạm ứng!"* khi `_type==1 && !entity.supplierId`; `payment-detail.component.html` truyền `[isTransfer]="_type==1" [supplierId]="entity.supplierId"`.
- Kết quả: TT cá nhân (`_type=0`) chỉ thấy tạm ứng cá nhân của chính user; TT NCC (`_type=1`) bắt buộc chọn NCC trước rồi chỉ thấy tạm ứng của đúng NCC đó.

### Rate limit login (.NET 9) — chống brute-force
- [Program.cs](../../d:/Delta/DeltaSoft/NewAPI/API/Program.cs): `AddRateLimiter` + policy `"login"` (FixedWindow, phân vùng theo **IP client thật**), `app.UseRateLimiter()` sau `UseRouting`. Vượt ngưỡng → HTTP **429** + JSON `{code:"429", message:...}` + header `Retry-After`.
- IP client lấy theo thứ tự `CF-Connecting-IP` → `X-Forwarded-For` → `RemoteIpAddress` → đúng cả khi gọi trực tiếp lẫn khi sau này đặt sau **Cloudflare** (không bị gộp chung 1 rổ). Áp dụng cho cả web lẫn app di động (chung endpoint).
- [appsettings.json](../../d:/Delta/DeltaSoft/NewAPI/API/appsettings.json): section `RateLimit:Login` (`PermitLimit:10`, `WindowSeconds:60`) — chỉnh không cần build lại.
- [AccountController.cs](../../d:/Delta/DeltaSoft/NewAPI/API/Controllers/AccountController.cs): `[EnableRateLimiting("login")]` trên `Login` + `ExternalLogin`.

### Hợp nhất cảnh báo login — chống dò tài khoản (account enumeration)
- Trước: sai mật khẩu trả `400 PASSWORD_INCORRECT`, user không tồn tại trả `404 USER_NOTFOUND` → khác status + nội dung → dò được username có thật.
- Giờ: cả 2 nhánh (sai mật khẩu + user không tồn tại + không phải tài khoản external) đều trả **giống hệt** `400 BadRequest` + `{code:"LOGIN_FAILED", message:"Tên đăng nhập hoặc mật khẩu không đúng!"}`. Áp dụng cho cả `Login` và `ExternalLogin`.
- [MessageViewModel.cs](../../d:/Delta/DeltaSoft/NewAPI/API/ViewModels/MessageViewModel.cs): thêm message chung `LOGIN_FAILED`.
- **Giữ nguyên có chủ đích** (chỉ xảy ra SAU khi mật khẩu đã đúng → không giúp dò tài khoản): `USER_LOCK` (khóa), `USER_NOACTIVE` (chưa kích hoạt), `USER_NOBRANCH` (không có quyền chi nhánh). Log nội bộ vẫn ghi chi tiết để điều tra.

---

## Trạm thu phí (ETC) gộp vào cung đường + tách modal cung đường phát sinh — 2026-05-20

### Gộp tab ETC vào "Thông tin cung đường" (modal FCL v2)
Bỏ tab "ETC" riêng; quản lý trạm thu phí ngay trong section "Thông tin cung đường" dưới dạng **bảng editable** bind `entity.listEtc`. Đổi từ `tollStationId` → **`tollStationName`** (tên trạm thay vì id).
- **SQL (anh tự chạy SSMS)**: `DispatchOrderFCLEtc` ADD `TollStationName NVARCHAR(255)`; type mới `TypeDispatchOrderFCLEtcV2` (thứ tự cột: Id, RefNo, TollStationId, TollStationName, FeeId, FeeCode, FeeName, Cost, Vat, TotalCost, Note, IsPassed); ALTER `SP_DispatchOrderFCL_CreateWithTO` + `UpdateWithTO` dùng type V2 + insert TollStationName; ALTER `SP_DispatchOrderFCL_GetByRefNoWithTO` đọc TollStationName đã lưu (bỏ INNER JOIN drop row).
- **BE** [DispatchOrderFCLRepository.cs](../../d:/Delta/DeltaSoft/NewAPI/API/Repositories/FCL/DispatchOrderFCLRepository.cs): `listEtcDt` anonymous Select reorder khớp ĐÚNG thứ tự cột type V2 (TVP map theo ORDINAL). `item.ListEtc` là `IEnumerable<DispatchOrderFCLEtc>` (đã có `TollStationName`).
- **FE model** [dispatch-order-etc.model.ts](../../src/app/shared/models/transports/dispatchorders/dispatch-order-etc.model.ts): thêm helper FE-only KHÔNG gửi BE — `_auto`, `_segIndex`, `_allPrices` (JSON giá theo loại xe), `_vietmapId`.
- **FE bảng editable** (`modal-dispatch-order-fcl-v2.component.html` quanh dòng 803): cột Tên trạm (input), Số tiền (mask), VAT (mask), Tổng tiền (display), Trốn vé (checkbox), Ghi chú (input), nút Xóa; header `dsg-etc-header` có nút "Thêm trạm"; tfoot tổng. SCSS: `.dsg-etc-header/.dsg-etc-title/.dsg-etc-add/.dsg-etc-table` (input-sm 26px), row auto nền `#fffaf0`.
- **Auto-populate từ Vietmap per-chặng** (`_syncEtcFromSegment(segIndex)`): xóa các dòng `_auto && _segIndex===segIndex` rồi push lại từ `seg.listStations` (bỏ `isAvoided`), gắn `_auto/_segIndex/_allPrices/_vietmapId`. Gọi sau `onRouteSelected` (main), `_fetchTollForSegment`, `_fetchSegmentHistory`. Giữ nguyên dòng nhập tay.
- **Recompute giá theo loại xe** (`_recomputeAutoEtcPrices()`): với dòng `_auto && _allPrices` tính lại `cost` từ JSON theo `_botTypeMap`; gọi cuối `_applyTollPrices()`.
- **`totalEtc` → getter**: `reduce` trên `listEtc.totalCost` (bỏ field + bỏ `this.totalEtc += ...` chỗ Excel import cũ).
- **`newEtc()`** push dòng trống `{feeId: environment.tollFeeId, tollStationName:'', cost:0, vat:0, totalCost:0, isPassed:false, _auto:false}`.
- **Validation lập lệnh** (trong `saveChange()`, chỉ khi `!isSubcontractors`): nếu trạm có tên mà `cost < 1` → `printErrorMessage` + chặn lưu.
- **Khóa sau khi tạo lệnh** (`routeConfirmed = !!entity.refNo || flagXem`): ẩn nút "Thêm trạm", ẩn cột action header + ô Xóa, input `[readonly]`, checkbox `[disabled]`, tfoot colspan co lại, empty-hint đổi "Không có trạm thu phí.".
- **Caveat**: sửa lệnh CŨ rồi tính lại Vietmap 1 chặng có thể nhân đôi dòng trạm (dòng load từ DB thiếu `_auto`); luồng tạo mới sạch.

### Tách "Thêm cung đường phát sinh" thành modal riêng — `modal-add-extra-segment/`
Trước đây popup viết inline trong FCL v2 (overlay), bị lỗi z-index khi mở Vietmap/So sánh. Tách thành component standalone gọi qua `@ViewChild` + `.open()`, Vietmap/Compare modal nằm BÊN TRONG modal mới (modal stack chuẩn).
- **4 file mới** `src/app/shared/components/transports/modal-add-extra-segment/`: `.component.ts` (`ModalAddExtraSegmentComponent`, exports `ExtraSegmentSavedResult {newItem, totals}` + `ExtraSegmentOpenContext {transportOrderId, locations, vehicleBotTypeId}`; có riêng `@ViewChild` ModalVietmapRoutes + ModalRouteCompare; methods open/close/filteredLocations/togglePicker/selectLocation/openVietmap/openCompare/onVietmapRouteSelected/onCompareRouteSelected/save); `.html` (point boxes điểm đi/đến đẹp như route FCL v2, dropdown picker `*ngIf="pickerOpen"`, nút Vietmap/So sánh disabled khi `!hasBothPoints`); `.scss` self-contained; `.module.ts` (`ModalAddExtraSegmentModule` import `ModalMapRoutesModule`).
- **FCL v2 dọn sạch**: bỏ toàn bộ state `extraDraft`/picker/draft + branch `'extra-draft'`; `_routeContext` còn `'segment' | 'extra-view' | 'extra-existing'`; thêm `@ViewChild(ModalAddExtraSegmentComponent) modalAddExtra`, `openExtraSegmentPopup()` truyền context, `onExtraSegmentSaved(e)` merge `{newItem, totals}`. HTML: thay popup inline bằng `<modal-add-extra-segment (SaveSuccess)="onExtraSegmentSaved($event)">`. Giữ 3 route modal cho main-segment + extra-existing.
- Build FE + BE: 0 error (BE chỉ file-lock IIS Express).

### shipping-task-opman — fix list chi nhánh trống + admin-only
- `loadBranch()` chưa từng gọi trong `ngOnInit` → `listBranch` rỗng. Thêm `this.loadBranch();` vào `ngOnInit`.
- Dropdown chi nhánh: `[readonly]` → `[disabled]="!userLoged.isAdmin"` (chỉ admin enable). Mặc định luôn chọn ngày hiện tại.

---

## Cung đường phát sinh (Extra Segments) — 2026-05-19

Tính năng mới: cho phép thêm cung đường phát sinh **SAU** khi đã khởi tạo lệnh FCL. Mỗi extra là 1 chặng độc lập (2 điểm), có ghi chú bắt buộc. Lưu song song với cung đường vận tải, công thức tổng km/dầu cộng dồn cả 2 nguồn.

### SQL — `Migration_TO_ExtraSegments_20260519.sql` đã chạy production
- **Bảng mới** `Tbl_TransportOrder_ExtraSegments`: lưu inline JSON `StationsJson` + `WaypointsJson` (đỡ 2 bảng phụ + 2 TVP); FK tới `Tbl_TransportOrders.Id`; `Note NVARCHAR(1000) NOT NULL` bắt buộc
- **5 SP mới** (tuân thủ convention `SP_<TableName>_<Action>`):
  - `SP_TransportOrder_RecomputeTotals(@TransportOrderId)` — helper internal, gọi sau mỗi action; recompute `FCL.TongKm/Tongdau/Chiphidau` + `TO.TongKm` trong cùng transaction
  - `SP_TransportOrder_ExtraSegments_Add` — auto-gen `SeqNo = MAX+1`, validate Note required, trả 2 RS: `{TongKm, Tongdau, Chiphidau}` + `{NewExtraSegmentId, NewSeqNo}`
  - `SP_TransportOrder_ExtraSegments_Update` — UPDATE full row + recompute, trả totals
  - `SP_TransportOrder_ExtraSegments_Delete` — DELETE + tái đánh SeqNo liên tiếp (1,2,3…) + recompute
  - `SP_TransportOrder_ExtraSegments_GetByFclRefNo(@FclRefNo)` — BE gọi tách (KHÔNG sửa `SP_DispatchOrderFcl_GetByRefNoWithTO` 142 dòng để tránh risky)
- **Công thức tổng**:
  - `TongKm    = SUM(Segments.DistanceKm) + SUM(ExtraSegments.DistanceKm)`
  - `Tongdau   = SUM(Segments.FuelAmountCalculated) + SUM(ExtraSegments.FuelAmountCalculated) + FCL.OilCompensation`
  - `Chiphidau = ROUND(Tongdau * FCL.OilPrice, 0)`

### BE
- **Model mới** [TransportOrderExtraSegment.cs](../../d:/Delta/DeltaSoft/NewAPI/API/Models/Transports/TransportOrderExtraSegment.cs) — mirror table fields + `TransportOrderTotalsResult` + `TransportOrderExtraSegmentAddResult`
- `DispatchOrderFCL.cs`: thêm `ExtraSegments` + `ToId` (Id của TO link — cần khi FE gọi AddExtraSegment)
- `ITransportOrder` + `TransportOrderRepository`: 3 method `AddExtraSegmentAsync` / `UpdateExtraSegmentAsync` / `DeleteExtraSegmentAsync`
- `TransportOrderController`: 3 endpoint `/api/TransportOrder/AddExtraSegment` / `UpdateExtraSegment` / `DeleteExtraSegment`
- `DispatchOrderFCLRepository.GetByRefNoWithTOAsync` mở rộng:
  - Load extras qua SP riêng (`SP_TransportOrder_ExtraSegments_GetByFclRefNo`) cho lệnh non-legacy
  - Extract `ToId` + `ToRefNo` qua `IDictionary<string,object>` cast của DapperRow (an toàn hơn dynamic dispatch — `try (int)th.Id` từng fail silent)

### FE Models + Service
- [transport-order.model.ts](../../src/app/shared/models/transports/dispatchorders/transport-order.model.ts): thêm `TransportOrderExtraSegment`, `TransportOrderTotalsResult`, `TransportOrderExtraSegmentAddResult` (UI helper `listStations` + `listWaypoints` deserialized từ JSON khi load; serialize lại khi save)
- `dispatch-order-fcl.ts`: thêm `extraSegments` + `toId`
- `transport-order.service.ts`: 3 method `addExtraSegment` / `updateExtraSegment` / `deleteExtraSegment`

### FE — Modal V2 integration (`modal-dispatch-order-fcl-v2/`)
- **Rename labels theo yêu cầu**: "Tải trọng & Tóm tắt lệnh" → **"Cung đường vận tải"**; "Tóm tắt lệnh" → **"Thông tin cung đường"**
- **Section "Cung đường phát sinh"** đặt dưới bảng trạm phí trong "Thông tin cung đường" (cột phải), `*ngIf="showExtraSegmentsSection"` (luôn hiện cho lệnh V2, không phải legacy)
- **Bảng list extras**: cột Chặng (đầu/N/cuối auto-label theo SeqNo), Điểm đi→đến, Tải trọng (ng-select inline editable), Km, Dầu ĐM, Ghi chú, Actions (Xem map / Tính lại Vietmap / So sánh / Xóa)
- **Visibility ma trận**:
  - `routeConfirmed = !!entity.refNo || flagXem` — cung đường vận tải KHÓA NGAY khi có RefNo (đã khởi tạo lệnh xong); Vietmap/So sánh/Lưu mặc định/payload main ẩn
  - `canAddExtraSegment = !!refNo && !!toId && status < 3 && !flagXem` — extras editable cho đến trước khi chốt B1 (status < 3); từ status ≥ 3 chỉ còn "Xem map"
- **Nút Lưu main** require `lastSegmentFinal=true` khi tạo mới (chưa có refNo): `*ngIf="!flagXem && status<3 && (refNo || lastSegmentFinal)"`
- **Auto-set `lastSegmentFinal=true`** trong `_rebuildSegments()` khi `segments.length === 1` (chặng duy nhất hiển nhiên là "Chặng cuối")
- **Popup "Thêm cung đường phát sinh"** (inline overlay z-index 1060):
  - Picker table 2-mode (Điểm đi / Điểm đến) clone pattern "Thêm điểm khác" của main route — có sortable header + filter row (dropdown loại + input địa chỉ) — KHÔNG dùng ng-select đơn giản nữa
  - Click row → assign vào active mode → auto-switch sang "Điểm đến"
  - Row đã chọn highlight: xanh lá `#e8f5e9` + badge "Điểm đi" hoặc đỏ `#ffebee` + badge "Điểm đến"
  - Nút "Tính Vietmap" + "So sánh" CHỈ HIỆN khi `extraDraftHasBothPoints` — chưa đủ 2 điểm thì hiện hint thay vì button
  - Note required (textarea), disable Lưu khi rỗng hoặc chưa có distanceKm
- **Auto-save per action** (3 endpoint riêng):
  - Add: popup submit → `addExtraSegment()` → BE INSERT + recompute → trả `{Id, SeqNo, Totals}` → FE thêm row + cập nhật display totals
  - Update payload inline: ng-select change → `_debouncedUpdateExtra` (400ms) → BE UPDATE + recompute → totals mới
  - Delete: confirm → BE DELETE + tái đánh SeqNo + recompute → FE remove row
- **`_routeContext` dispatch** (`'segment' | 'extra-draft' | 'extra-existing' | 'extra-view'`) để vietmap/compare modals chia sẻ với cả main route + extras:
  - `extra-draft`: popup chưa save, result fill vào `extraDraft`
  - `extra-existing`: recalc extra đã có, result fill row + auto-update BE
  - `extra-view`: showSaved mode chỉ vẽ map từ polyline có sẵn
- **Hint empty state** dùng getter `extraEmptyHint` (mutually exclusive, ưu tiên theo thứ tự): chưa save / chế độ xem / chốt B1 / thiếu ToId / sẵn sàng thêm

### Files đụng tới
- SQL: [Migration_TO_ExtraSegments_20260519.sql](../../d:/Delta/DeltaSoft/NewAPI/Migration_TO_ExtraSegments_20260519.sql)
- BE: [TransportOrderExtraSegment.cs](../../d:/Delta/DeltaSoft/NewAPI/API/Models/Transports/TransportOrderExtraSegment.cs), `DispatchOrderFCL.cs` (+ToId), `ITransportOrder.cs`, `TransportOrderRepository.cs`, `TransportOrderController.cs`, `DispatchOrderFCLRepository.cs` (GetByRefNoWithTOAsync mở rộng load extras)
- FE: `transport-order.model.ts`, `dispatch-order-fcl.ts`, `transport-order.service.ts`, [modal-dispatch-order-fcl-v2](../../src/app/shared/components/transports/modal-dispatch-order-fcl-v2/) (`.ts` +~300 dòng methods, `.html` +section + popup, `.scss` +~160 dòng)
- Build status: BE 0 error C# (chỉ file-lock warning IIS Express); FE `ng build` PASS

### Quy ước anh chốt
- SP naming **bắt buộc** `SP_<TableName>_<Action>` — KHÔNG dùng `SP_TransportOrder_AddExtraSegment` (lẫn lộn bảng), đúng là `SP_TransportOrder_ExtraSegments_Add` (memory: [feedback_sp_naming_convention](../../C:/Users/Dell/.claude/projects/d--Delta-DeltaSoft-web-app-update/memory/feedback_sp_naming_convention.md))
- Threshold trạng thái B1: `status >= 3` mới là chốt B1; "tạo lệnh xong" = có `refNo` (khác B1)

---

## TO↔FCL Phase 2 cutover + Modal V2 E2E verified — 2026-05-19

### SQL Phase 2 đã chạy production
- `Migration_TO_FCL_Phase2_SPs_20260515.sql` chạy thành công trên SSMS
- 3 SP WithTO mới đã hoạt động: `SP_DispatchOrderFCL_CreateWithTO`, `SP_DispatchOrderFCL_UpdateWithTO`, `SP_DispatchOrderFcl_GetByRefNoWithTO`
- 4 SP TO refactor: `SP_TransportOrder_GetById` (4 RS), `SP_TransportOrder_GetAll` (JOIN FCL via FclRefNo có IsLegacy), `SP_TransportOrder_UpdateStatus` simplified, DROP `SP_TransportOrder_Create/Update`
- `ALTER SP_DispatchOrderFCL_GetAll` thêm cột `IsLegacy` vào SELECT (anh tự làm)
- Cột `DispatchOrderFCL.TongKm DECIMAL(18,2) NULL` đã có ở DB

### Modal V2 FCL — E2E test PASS
End-to-end test cả 3 luồng đều pass sạch, không có regression:
- **Create**: tạo lệnh mới qua `shipping-task-opman` "Lập lệnh (Location)" → `POST /CreateWithTO` → trả `{NewToId, NewToRefNo, NewFclRefNo}` đầy đủ → DB insert đúng `Tbl_TransportOrders` (có FclRefNo link) + `DispatchOrderFCL` (IsLegacy=0 explicit, TongKm/Tongdau/Chiphidau đúng công thức mới)
- **Update**: edit lệnh `IsLegacy=0` → `POST /UpdateWithTO` → BEGIN TRAN OK, không RAISERROR, segments delete+insert lại qua 3 TVPs đúng
- **Load**: click row `IsLegacy=0` → `getDetailWithTo(refNo)` → 9 result sets (5 FCL + 4 TO) → repository attach stations/waypoints theo SegmentId → `_segmentsToLocations` rebuild `locations[]` chuẩn pickup/delivery
- Bảng tải trọng load đúng `payloadWeight` per chặng
- Giá trạm phí cập nhật khi đổi xe (qua `loadVehicle()` → `_vehicleBotTypeId` → `_applyTollPrices()`)
- Công thức `Tongdau = SUM(FuelAmountCalculated) + OilCompensation` + `TongKm = SUM(DistanceKm)` + `Chiphidau = Tongdau * OilPrice` khớp 100% FE compute vs BE persist
- Lệnh `IsLegacy=1` (cũ) vẫn mở modal legacy thường — zero regression

### shipment-normal — Conts hiển thị end-to-end
- SP `SP_Shipment_GetPagingNormal` đã ALTER thêm SELECT cột `Conts` (STRING_AGG ContainerNumber từ ShippingTasks)
- Cột "Cont No" trên list lô hàng thường hiển thị data thực, filter `contnoSearch` + export Excel theo `listFilter` hoạt động đầy đủ

---

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
