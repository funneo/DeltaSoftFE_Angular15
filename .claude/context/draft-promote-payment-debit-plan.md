# Kế hoạch: Hiển thị nháp ở ERP + nút "Xác nhận chuyển sang ERP" cho Payment (PCCV) & Debit

**Ngày:** 2026-06-29 · **Trạng thái:** PLAN (chưa code) · **Phạm vi:** Payment (Thanh toán/PCCV) + Debit. (Workflow/Job để đợt sau, cùng pattern.)

**QUYẾT ĐỊNH (2026-06-29):** Form nháp phải **PARITY 100%** với ERP — có đủ MỌI field nhập liệu của ERP (kể cả nhóm phí F043, TK nợ/có kế toán, số/ngày hóa đơn). Promote = deserialize payload → tạo thật, KHÔNG cần người duyệt điền thêm. ⇒ Phải nâng form draft-web trước (section 2D) rồi mới promote sạch.

## 0. Nguyên tắc: CLONE Y HỆT Shipment promote (đã xong 2026-06-18)
Shipment đã làm trọn cả BE + FE. Toàn bộ kế hoạch này = nhân bản pattern đó cho 2 loại còn lại. KHÔNG phát minh UX mới.

**Pattern Shipment (mẫu):**
- FE list (`shipment-normal.component.ts`): `forkJoin{ erp, draft: draftService.getPagingForErp({draftType:'Shipment'}) }` → `mapDraftToShipmentRow()` gắn cờ `_isDraft/_draftId/_draftPayload` → **trộn chung 1 list**, CSS bôi vàng, chặn action thường.
- Click dòng nháp → `showDraft()` → mở **đúng modal tạo/sửa** ở chế độ `viewDraft(payload, draftId)` (đọc payload, read-only).
- Trong modal có nút duyệt → gọi endpoint promote → `onApproveDraft()` reload (dòng nháp biến mất, bản thật hiện lên).
- BE (`ShipmentController.PromoteFromDraft`): `_draft.GetForPromote(id)` → guard idempotent (Status='Draft', chưa promote) → deserialize Payload → tạo thật bằng repo sẵn có → `_draft.MarkPromoted(id, jobId, shipmentId, reviewer)` (best-effort, lỗi bước này KHÔNG hủy bản thật).

## 1. ĐÃ CÓ SẴN — không phải làm lại
- **SQL:** `draft.SP_DraftEntries_GetForPromote(@Id)` + `draft.SP_DraftEntries_MarkPromoted(@Id,@JobId,@ShipmentId,@ReviewedBy,@RowsAffected OUT)` — **GENERIC, dùng cho mọi DraftType**. ERP login db_owner gọi được.
- **SQL:** `dbo.SP_DraftEntries_GetForErp_GetPaging` — đã hỗ trợ filter `@DraftType` = Payment/Debit.
- **BE ERP:** `IDraft.GetForPromote / MarkPromoted / GetPagingForErp` + `DraftRepository` đã implement.
- **FE ERP:** `DraftService.getPagingForErp(filter)` + interface `DraftEntryView/DraftFilterRequest`.
- **Draft side (FE draft-web + DraftAPI):** form/list/save Payment + Debit đã xong; payload chuẩn là DTO-tạo-thật.

➡️ **KHÔNG cần SQL mới.** `MarkPromoted` tái dùng nguyên: truyền RefNo (số phiếu/debit) vào `@JobId`, Id bản thật vào `@ShipmentId`; guard idempotent đọc `PromotedRefNo`.

## 2. CẦN LÀM

### 2A. BE — 2 endpoint promote (NewAPI), clone `ShipmentController.PromoteFromDraft`
1. **`PaymentsController.PromoteFromDraft`** (`POST /api/payments/PromoteFromDraft`)
   - `[ClaimRequirement(FunctionCode.PAYMENT, ActionCode.CREATE)]` (token ERP thường — promote = ghi thật, KHÔNG phải aud=draft).
   - `GetForPromote(draftId)` → guard (null/đã promote → trả RefNo cũ, idempotent).
   - Deserialize `info.Payload` → `Payments` (JsonSerializer case-insensitive như Shipment). Ép `Id=0`; set `CreatedBy=reviewer`; giữ `BranchId/EmployeeId` (targetEmployee) từ payload.
   - Tạo thật bằng `PaymentsRepository` create sẵn có (SP `SP_Payments_Create2`) → nhận `RefNo`.
   - `MarkPromoted(draftId, refNo, newPaymentId, reviewer)` (try/catch best-effort).
2. **`DebitNoteController.PromoteFromDraft`** (`POST /api/debitnote/PromoteFromDraft`)
   - `[ClaimRequirement(FunctionCode.DEBITNOTES, ActionCode.CREATE)]`.
   - Tương tự: deserialize → `DebitNotes` → repo create (SP `SP_DebitNotes_Create`) → nhận `DebitNo` → `MarkPromoted(draftId, debitNo, newDebitId, reviewer)`.

**Lưu ý map payload→model:** payload camelCase ↔ model PascalCase (case-insensitive lo được). Kiểm field bắt buộc của SP create (vd Payment: `IsDirectPayment/AdvancesRefNo` khi type=0; Debit: `ShipmentId/CustomerId/RefDate/DebitDate/AccountingDate`). Reviewer lấy từ token (giống Shipment).

### 2B. FE — 2 list + 2 modal (web-app-update), clone shipment-normal
1. **`advance-payment/payment/payment.component.ts`** (list Thanh toán):
   - `forkJoin` thêm `draftService.getPagingForErp({draftType:'Payment', ...})` (catchError → []).
   - `mapDraftToPaymentRow(d)`: `JSON.parse(d.payload)` → row giống Payment + cờ `_isDraft/_draftId/_draftPayload`. Trộn `[...draftRows, ...erpItems]` sort theo ngày.
   - HTML: bôi vàng dòng `_isDraft`, ẩn nút sửa/xóa/duyệt thường; click → `showDraft(item)`.
2. **`ModalPhieuChiComponent`** (modal Payment):
   - Thêm `viewDraft(payload, draftId)`: parse payload → đổ vào form read-only, nhớ `draftId`.
   - Footer thêm nút **"Xác nhận chuyển sang ERP"** (`*ngIf="draftId"`) → gọi `paymentsService.promoteFromDraft(draftId)` → emit `SaveSuccess`/`onApproveDraft(draftId)`.
3. **`shipments/debit-note/debit-note.component.ts`** + **`ModalDebitNotesComponent`**: y hệt, `draftType:'Debit'`.
4. **Service:** thêm `promoteFromDraft(draftId)` vào `PaymentsService` + `DebitNotesService` (POST endpoint 2A, kèm TokenKey).

### 2C. (Tùy chọn, có thể bỏ) gate quyền nút
Nút "Xác nhận chuyển sang ERP" chỉ hiện khi user có quyền CREATE tương ứng (`authService.hasPermission('PAYMENT_CREATE'/'DEBITNOTES_CREATE')`) — để CS không quyền vẫn xem được nháp nhưng không duyệt.

### 2D. NÂNG FORM DRAFT-WEB LÊN PARITY 100% VỚI ERP — ✅ ĐÃ LÀM 2026-06-29
**Đã code xong (typecheck `tsc --noEmit` pass). Allowlist KHÔNG cần đổi — `/api/feecode/getall` + `/api/fee/getall` đã có sẵn trong `Draft:ReadAllowlist`.**

Payment (`payment-form` + `models.ts` + `lookup.service.ts`):
- `models.ts`: +`FeeCodeLookup`; `FeeLookup`+`groupCode`; `PaymentDraftPayload`+`groupFeeCode`/`subFeeCode`.
- `lookup.service.ts`: +`feeCodes(parentId,level,status,isInvoiceInput)` → `/api/FeeCode/GetAll`.
- `payment-form.ts`: +signals `_listGroupFee`/`_listSubFee`, `_lastGroupFee`; forkJoin nạp nhóm cấp 1; `loadSubFee`/`onChangeGroupFee` (clone ERP: đổi cấp 1 confirm → xóa chi tiết); add()/edit() reset+khôi phục.
- `payment-form.html`: +2 dropdown "Nhóm phí cấp 1" / "Phân nhóm cấp 2" (cột phải, trước Tổng tiền).
- KHÔNG thêm debitAccount/creditAccount: ERP FE cũng không điền (server suy từ FeeId) → thêm là VƯỢT ERP.

Debit (`debit-form` + `models.ts`):
- `models.ts`: `DebitNoteDetailDraft`+`groupFee`; `DebitDraftPayload`+`currency`/`exchangeRate` (header).
- `debit-form.ts`: `empty()` default `currency:'VND'`/`exchangeRate:0`; save() truyền `groupFee` qua detail.
- KHÔNG thêm master invoiceNo/invoiceDate/invoiceNotes: `SP_DebitNotes_Create` KHÔNG nhận (chỉ điền khi xuất HĐ) → thêm là vượt ERP.

**Đối chiếu chốt theo SP create thật (đã đọc repo):** SP_DebitNotes_Create TVP detail = {Id,DebitNoteId,FeeId,Contents,ReferCode,Amount,VAT,AmountAfterVAT,InvoiceNo,Notes,GroupFee,Quantity,Unit,Price,RVat,Currency,InvoiceDate}; master có @ExchangeRate/@Currency, KHÔNG có @InvoiceNo. → các field thêm ở trên là đủ & đúng.

#### (Tham khảo) 2D gốc — yêu cầu ban đầu
Mục tiêu: payload nháp chứa đủ field → promote deserialize thuần. Sửa ở `draft-web`: `core/models.ts` (interface) + form TS/HTML từng loại. KHÔNG đụng DraftAPI/SP draft (generic, không cần đổi).

**PAYMENT — thêm vào `PaymentDraftPayload` + `payment-form`:**
- Master: `groupFeeCode`, `subFeeCode` (F043 — dropdown nhóm phí cấp 1 + cấp 2 cascade; clone logic ERP `payment-detail.component` ln 262-300, HTML ln 168-189).
- Detail (`PaymentDetailDraft`): `debitAccount`, `creditAccount` (TK kế toán; autofill từ Fee khi chọn phí, cho sửa tay).
- Map lúc promote: `status` bool(draft `false`) → int `0` (ERP).
- KHÔNG thêm (server/internal): `RefNo`, `PendingInvoiceId`, các field workflow (AcceptedBy/IsCompleted/IsPaymented/Feedback…).

**DEBIT — thêm vào `DebitDraftPayload` + `debit-form`:**
- Master: `currency`, `exchangeRate` (mặc định VND/0), `invoiceNo`, `invoiceDate`, `invoiceNotes` (cho nhập, để trống được).
- Detail (`DebitNoteDetailDraft`): `groupFee` (F043 nhóm phí cấp 1 theo dòng).
- Map lúc promote: `status` bool → int.
- KHÔNG thêm: `DebitNo`(auto), `isDebt/isCanon/isLocled`, `contractId/quotationId`, `partnerId`(type=1 chưa làm), detail `workflowId/item`.
- Field ref-only UI giữ nguyên (jobId/cdsNumber/hawB_HBL/mawB_MBL/bookingNo/shipmentTypeName) — không gửi BE.

**Phụ thuộc LOOKUP (quan trọng):** dropdown nhóm phí F043 + TK kế toán cần nguồn data. `draft-web` gọi qua `LookupService` (token aud=draft, read-only allowlist). ⇒ endpoint nguồn (nhóm phí cấp1/2, account theo Fee) PHẢI nằm trong `Draft:ReadAllowlist` (appsettings ERP). Kiểm + bổ sung allowlist nếu thiếu — đây là việc BE nhỏ phía ERP, không phải write.

**targetEmployeeId/Name:** field draft-only (không có ở SP create) — promote dùng để set `EmployeeId`/người lập, không đẩy thẳng.

## 3. THỨ TỰ THỰC HIỆN
1. ✅ **Draft-web parity (2D)** — XONG cho cả Payment + Debit (typecheck pass). Allowlist không cần đổi.
   - CÒN (test): chạy `ng serve` draft-web, tạo 1 nháp Payment (chọn nhóm phí cấp 1/2) + 1 nháp Debit để làm dữ liệu test promote; xác nhận dropdown F043 có data (token aud=draft đọc `/api/feecode/getall`).
2. ⬜ BE: `PaymentsController.PromoteFromDraft` + deserialize/guard/map status → test promote nháp Payment → ra phiếu chi thật khớp 100%.
3. ⬜ FE ERP: payment list trộn nháp + modal `viewDraft` + nút "Xác nhận chuyển sang ERP" → `ng build` test end-to-end.
4. ⬜ Lặp lại 2→3 cho **Debit**.
5. ⬜ Regression: dòng nháp không lọt export/tổng tiền/đếm; promote 2 lần không tạo trùng (idempotent); field F043/currency sang bản thật đúng.

## 4. RỦI RO / GHI CHÚ
- **Parity là cam kết bảo trì:** ERP thêm field nhập liệu mới → form nháp phải bám theo. Ghi vào checklist khi sửa form Payment/Debit ERP.
- **Lookup allowlist:** nếu nguồn nhóm phí/TK kế toán chưa nằm trong `Draft:ReadAllowlist`, dropdown nháp sẽ trống → phải thêm allowlist (ERP appsettings) trước khi test 2D.
- **Mapping "thanh toán" = `Payment`** (model `Payments`, advance-payment), KHÔNG phải `OnBehalfPayment` (F042) — loại đó chưa có draftType/form nháp; muốn parity cả nó là việc lớn riêng (dựng form nháp mới + draftType mới), tính sau nếu cần.
- **MarkPromoted semantic:** `PromotedShipmentId` (INT) chứa Id bản thật payment/debit — tên theo Shipment nhưng generic, dùng được; đổi tên cột để sạch nghĩa là tùy chọn về sau.
- **Đọc SP trước khi code BE:** xác nhận tham số bắt buộc `SP_Payments_Create2` (TVP detail) / `SP_DebitNotes_Create` (TVP `@DebitNoteDetails`) so với payload — tránh lỗi runtime.
- **Không** đụng SP/BE/FE Shipment promote đang chạy.
