# Kế hoạch tái thiết kế Tạm ứng / Thanh toán (theo "Quy trình Tạm ứng Thanh toán_June 25 2026")

> Nguồn: `NewAPI/Quy trình Tạm ứng  Thanh toán_June 25 2026.docx` (1 comment của anh Nghĩa: không quản hạn mức CK ⇒ trách nhiệm người duyệt rất lớn).
> Tài liệu này = phân tích gap + kế hoạch + giải pháp kỹ thuật. **CHƯA CODE.** Mọi SQL chỉ soạn để anh duyệt + tự chạy (quy tắc [[feedback-no-auto-db-writes]]).
> Bản đồ module nền: [[reference-advance-payment-module]]. Flow F043: [[project-pending-invoice-groupfee]].
> Lập 2026-06-25.

## 0. Phương án triển khai (đã chốt mặc định — "tiến hóa có kiểm soát")

Module Tạm ứng/Thanh toán đang chạy LIVE, dữ liệu thật nhiều. Không dựng V2 song song toàn bộ (tốn gấp đôi + phải migrate khối lượng lớn). Cũng KHÔNG sửa phá hủy SP cũ ([[feedback-keep-legacy-create-new]]). Cách làm cho TỪNG đụng chạm:

| Loại thay đổi | Cách làm | Mức nhạy cảm |
|---|---|---|
| Thêm cột vào bảng | `ALTER ADD ... NULL` idempotent (`COL_LENGTH`) | Thấp — additive |
| Bảng/khái niệm mới (gia hạn, link TT↔TƯ, route duyệt, lock) | Bảng mới + SP mới `SP_<Table>_<Action>` | Thấp |
| Đổi HÀNH VI Create/Update hiện hữu | Tạo **SP mới** (`SP_Advances_CreateV3` / `_UpdateV3`…) chạy song song, FE/BE mới gọi bản mới; bản cũ giữ nguyên cho tới khi bỏ | **Cao** — trình SQL + chốt trước |
| Thêm param vào SP cũ (bắt buộc) | Chỉ khi an toàn: `@Param ... = NULL` + `ISNULL` preserve (như đợt dầu) — vẫn trình trước | Trung bình |

Quy tắc bất biến: đọc SP cũ qua `OBJECT_DEFINITION`/sqlcmd để biết chính xác thân trước khi soạn migration; SP mới phải trình anh duyệt; SP naming chuẩn `SP_<TableName>_<Action>` ([[feedback-sp-naming-convention]]).

## 1. Bảng GAP (spec đích vs hiện trạng) — đã verify từ source 2026-06-25

| # | Hạng mục | Hiện trạng | Khoảng cách |
|---|---|---|---|
| G1 | Nhóm phí trên **Tạm ứng** | ❌ Advance chỉ có `AdvanceGroupId` (≠ nhóm phí). GroupFeeCode chỉ có ở Payment | Thêm GroupFeeCode Lv1 (01–06) + rule kê khai theo nhóm |
| G2 | Phương thức tiền mặt/CK + hạn mức tách | ✅ `Advances.IsTransfer` + `EmployeeLimit.DebitLimit`/`DebitTransferLimit` | Chỉ cần SIẾT enforce |
| G3 | Check hạn mức khi tạo | ⚠️ Không thấy ở C# (`AdvancesRepository.CreatedAsync`). Chưa xác nhận trong SP | Verify SP → enforce "dư + mới ≤ hạn mức", chặn vượt |
| G4 | Thời hạn tạm ứng + khóa quá hạn + gia hạn | ❌ Không có field/cơ chế | **Mới hoàn toàn** |
| G5 | Thanh toán đối ứng N tạm ứng cùng nhóm | ⚠️ Chỉ 1 `Payments.AdvancesRefNo` (string); chưa thấy ràng buộc cùng nhóm | Nâng 1→N + ràng buộc nhóm + gom toàn bộ TƯ tiền mặt cùng nhóm |
| G6 | Auto Phiếu chi/Phiếu thu chênh lệch | ❌ Phiếu tạo thủ công (modal-phieu-chi/thu) | Tự sinh khi duyệt xong |
| G7 | Duyệt 2 bước theo nhóm phí | ⚠️ Có Step S0→S1→S2/S3 nhưng không route theo nhóm | B1 Kế toán; B2 theo nhóm phí |
| G8 | Nợ hóa đơn (F001) | ⚠️ Có UI + `PaymentDetail.HasInvoice=2` + bảng `DebtInventory`; thiếu rule | Auto tăng TƯ + deadline 3 ngày LV + khóa + flow trả HĐ duyệt KT |
| G9 | Phiếu chi Thủ quỹ + chặn quỹ thiếu | ⚠️ Có modal + bảng `Fund`; không check số dư | Sinh từ phiếu đã duyệt + quỹ thiếu chặn lưu + khóa field mặc định |
| G10 | Ghi chép đối ứng (bút toán kép) | ⚠️ Có model `AccountingDetail` (debit/credit); không tự sinh | Auto post — *spec chưa hoàn chỉnh* |
| G11 | Báo cáo | ✅ Chi tiết TT + số dư TƯ cá nhân | Thêm: số dư theo chi nhánh/công ty + nợ HĐ dở dang |

**Hạ tầng tái dùng được:** `FeeCodes` Lv1 (nhóm phí 01–06), `Tbl_Fund` + `FundController`, `AccountingDetail` (debit/credit), bảng **Holiday** (từ F044 — dùng tính ngày làm việc cho deadline), `modal-phieu-chi`/`modal-phieu-thu`, pattern `SP_Advances_Create2/Update2`.

## 2. Khái niệm dùng chung (cross-cutting) — làm 1 lần, dùng nhiều phase

### 2.1 Khóa tài khoản động (KHÔNG lưu trạng thái khóa)
Spec có 2 nguồn khóa: (a) quá hạn tạm ứng (P1); (b) quá hạn trả hóa đơn nợ (P3). Thay vì cột `IsLocked` dễ lệch, **suy động** lúc tạo TƯ/TT mới:
- SP mới `SP_Advances_CheckEmployeeLockState (@EmployeeId)` → trả `{ HasOverdueAdvance, HasOverdueDebtInvoice, Reasons }`.
- BE chặn Create nếu có overdue → `Code="423"` (Locked) + message rõ lý do.
- Job nền (cron) chỉ để **thông báo FCM/email** sắp/đã quá hạn, không tự ghi DB trạng thái.

### 2.2 Ngày làm việc (working days)
`SP_Util_AddWorkingDays (@From, @Days)` dùng `Tbl_Holiday` (F044) + loại T7/CN (hoặc theo cấu hình lịch). Dùng cho deadline nợ HĐ 3 ngày LV + "cuối tháng → ngày LV đầu tháng sau".

### 2.3 Nhóm phí chuẩn (FeeCode Lv1) — đã có
01 QL chung · 02 Hàng bán · 03 Trả hộ · 04 Đầu tư · 05 Công cụ dụng cụ · 06 Khác. Dùng `FeeCodeService.getAll(null, 1, ...)`.

## 3. Kế hoạch theo phase + giải pháp kỹ thuật

### ▶ P0 — Nhóm phí trên Tạm ứng (NỀN TẢNG, rủi ro thấp)
Mở khóa P2 (đối ứng cùng nhóm) + P3. Làm trước.

**SQL (soạn, trình duyệt):**
- `ALTER Tbl_Advances ADD GroupFeeCode NVARCHAR(50) NULL, GroupFeeName NVARCHAR(255) NULL, NeedExtraApproval BIT NULL` (snapshot name như Payment; `NeedExtraApproval`=hàng bán thiếu KH/JobID).
- Đổi hành vi Create/Update ⇒ **bản mới**: `SP_Advances_Create3` / `SP_Advances_Update3` (clone thân Create2/Update2 + 3 cột mới). Giữ Create2/Update2 nguyên.

**BE:** `Advances.cs` +3 field; `AdvancesRepository` thêm `CreatedV3Async/UpdatedV3Async` gọi SP mới; Controller thêm endpoint `/createV3 /updateV3` (gate ADVANCE) — hoặc nhánh cờ trong endpoint cũ. Không đụng Create2 đang chạy.

**FE (`modal-advance`):** dropdown Nhóm phí Lv1 (bắt buộc). Rule kê khai theo nhóm:
- 01 QL chung → bắt buộc ô **Lý do/Mô tả**.
- 02 Hàng bán → cần `CustomerId`+`JobId`; thiếu → vẫn lưu nhưng set `NeedExtraApproval=1` (sẽ +1 cấp duyệt ở P… approval).
- 03 Trả hộ → **bắt buộc** `CustomerId`+`JobId` (chặn lưu).
- 04/05/06 → chuẩn.

**Dữ liệu cũ:** Advance cũ `GroupFeeCode=NULL`, chỉ enforce cho bản mới (không migrate, theo tiền lệ fee 05/06).

---

### ▶ P1 — Kiểm soát tạm ứng: hạn mức + thời hạn + khóa + gia hạn
Đúng mối lo của anh Nghĩa (comment). Phụ thuộc P0 (deadline trả hộ tính theo nhóm).

**(a) Enforce hạn mức** (tách tiền mặt/CK — G2/G3)
- Verify `SP_Advances_Create2` + `SP_EmployeeLimit_*` xem đã chặn chưa (đọc OBJECT_DEFINITION).
- SP mới `SP_Advances_GetOutstandingBalance (@EmployeeId, @IsTransfer)` = tổng TƯ chưa quyết toán theo phương thức.
- BE check trước Create: `(outstanding + new) > limit` → `Code="limit_exceeded"` + thông báo "Vượt hạn mức {cash/CK}: còn khả dụng X".
- FE `modal-advance`: hiện "Hạn mức khả dụng" realtime theo phương thức đang chọn.

**(b) Thời hạn tạm ứng** (G4)
- `ALTER Tbl_Advances ADD DueDate DATE NULL, TermDays INT NULL` (trả hộ=4; khác=theo thỏa thuận nhập tay/cấu hình). DueDate set khi **phiếu chi xác nhận** (= bắt đầu hiệu lực), = ngày chi + TermDays (working days hoặc lịch — chốt với anh).
- SP mới `SP_Advances_GetOverdue (@EmployeeId)` cho 2.1.

**(c) Gia hạn** (G4)
- Bảng mới `Tbl_AdvanceExtension (Id, AdvanceId, RequestedDueDate, Reason, Status, RequestedBy, ApprovedBy, ApprovedAt, CreatedAt, Deleted)`.
- SP mới: `SP_AdvanceExtension_Create / _Accept / _GetPaging / _GetByAdvance`. Khi Accept → cập nhật `Advances.DueDate = RequestedDueDate`.
- FunctionCode mới (vd **F048** "Gia hạn tạm ứng") + grant (file riêng).
- FE: nút "Xin gia hạn" trên dòng TƯ quá/sắp hạn + màn duyệt gia hạn.

**(d) Khóa tạo mới khi quá hạn** → dùng 2.1 (`CheckEmployeeLockState`), chặn ở Create của cả Tạm ứng (và P3 nợ HĐ).

---

### ▶ P2 — Thanh toán đối ứng N tạm ứng + auto phiếu chi/thu + duyệt theo nhóm
Phụ thuộc P0. Phần phức tạp nhất.

**(a) Đối ứng 1→N tạm ứng cùng nhóm** (G5)
- Bảng mới `Tbl_PaymentAdvanceLink (Id, PaymentId, AdvanceId, AppliedAmount, CreatedAt)` thay cho `AdvancesRefNo` đơn. (Giữ cột cũ để tương thích đọc; ghi sang bảng link.)
- SP mới: `SP_PaymentAdvanceLink_Save (TVP)` / `_GetByPayment` / `_ReleaseByPayment` (mirror pattern MarkUsed/Release của PendingInvoice).
- Ràng buộc: tất cả AdvanceId link phải cùng `GroupFeeCode` với Payment (validate BE + SP) → khác nhóm = chặn.
- **Gom toàn bộ TƯ tiền mặt cùng nhóm**: khi TT tiền mặt, FE auto chọn + BE enforce mọi TƯ tiền mặt outstanding cùng nhóm phải nằm trong link.

**(b) Auto Phiếu chi/Phiếu thu chênh lệch** (G6)
- Khi Payment duyệt xong bước cuối: `diff = PaymentAmount − Σ AppliedAmount`.
  - `diff > 0` → tự sinh **Phiếu chi** (chi thêm cho người làm TT).
  - `diff < 0` → tự sinh **Phiếu thu** (người làm TT nộp lại).
  - `diff = 0` → đóng, không phiếu.
  - TT không có tạm ứng → toàn bộ = Phiếu chi.
- SP mới `SP_Payments_GenerateCashVoucher (@PaymentId)` ghi vào schema `Fund`/`Accounts` (đọc kỹ FundController/Accounts trước). Gọi trong luồng AcceptStep khi đạt bước cuối.
- ⚠️ Cần đọc schema Fund/Accounts/phiếu chi hiện tại để khớp cột — flag bước thiết kế.

**(c) Duyệt 2 bước theo nhóm phí** (G7)
- B1 = Kế toán (cố định). B2 route theo nhóm: 01→GĐ/GĐ CN; 02→TP nghiệp vụ/GĐ CN; 03→TP nghiệp vụ; 04/06→GĐ công ty; 05→(chốt).
- Bảng cấu hình `Tbl_PaymentApprovalRoute (GroupFeeCode, StepNo, RoleId, BranchScope)` + SP CRUD; engine duyệt đọc route theo `Payment.GroupFeeCode`.
- ⚠️ "Phân quyền chi tiết" spec hoãn sang tài liệu khác → P2 chỉ dựng **khung route + seed tối thiểu**; bảng chi tiết role điền sau.
- `NeedExtraApproval` (P0) = +1 cấp duyệt cho hàng bán thiếu KH/JobID.

---

### ▶ P3 — Nợ hóa đơn đầy đủ rule (G8)
Phụ thuộc P1 (cơ chế hạn mức + lock + working days).

- TT chọn "Nợ hóa đơn" (`HasInvoice=2`) → khi tạo: **auto ghi tăng tạm ứng (giảm hạn mức)** người tạo. Cơ chế: sinh bản ghi dư nợ tính vào outstanding (đồng bộ `SP_Advances_GetOutstandingBalance`).
- `ALTER Tbl_Payments ADD DebtInvoiceDueDate DATE NULL, IsInvoiceReturned BIT NULL, InvoiceReturnedAt DATETIME NULL`.
- Deadline = ngày TT + **3 ngày làm việc** (2.2); nếu rơi cuối tháng → ngày LV đầu tháng sau. Quá hạn → 2.1 khóa tài khoản.
- **Flow trả hóa đơn**: người tạo upload/kê khai HĐ (từ danh mục AI01 / pending-invoice) → **Kế toán duyệt** → đổi trạng thái + ghi đối ứng (P5) + **hoàn hạn mức** (giảm dư nợ TƯ).
- SP mới: `SP_Payments_ReturnInvoice` / `SP_Payments_AcceptInvoiceReturn` / `SP_Payments_GetDebtInvoiceReport`.
- FE: hoàn thiện `payment-debt-invoice` (nút trả HĐ + màn duyệt KT) + báo cáo nợ HĐ dở dang.

---

### ▶ P4 — Phiếu chi/thu Thủ quỹ hoàn thiện (G9)
- Thủ quỹ xuất Phiếu chi từ **tạm ứng đã duyệt** (flow 5.1.2.3) + từ Payment (P2 auto). Field mặc định khóa: số tiền, số phiếu TƯ/TT, ngày chi; sửa được **ngày hạch toán**.
- **Quỹ không đủ → không lưu**: validate `Fund.Amount >= ChiAmount` ngay trong SP ghi phiếu chi (tìm SP hiện hành; thêm bản V mới nếu phải đổi thân) → chặn xác nhận.
- Ghi chọn quỹ (`FundId`).

---

### ▶ P5 — Ghi chép đối ứng + Báo cáo (G10/G11) — *cần workshop kế toán*
- **Bút toán đối ứng**: spec tự ghi "cần lập bảng mô tả đầy đủ" + nhiều `???`. ⇒ TÁCH: chốt **bảng ánh xạ tài khoản** (sự kiện → Nợ/Có TK) với kế toán trước. Hạ tầng: service `AccountingPostingService` ghi `AccountingDetail` mỗi sự kiện (chi TƯ, chi/thu TT, tăng/giảm dư nợ TƯ, trả HĐ). Hook cài sẵn ở P1–P4, bật khi có bảng ánh xạ.
- **Báo cáo bổ sung**: số dư tạm ứng theo chi nhánh/công ty (SP + trang); báo cáo nợ HĐ dở dang (P3); mở rộng filter chi nhánh cho báo cáo chi tiết TT (đã có filter, thêm trang).

## 4. Thứ tự thực hiện + phụ thuộc
```
P0 (nền tảng)
 ├─► P2 (đối ứng cùng nhóm, route duyệt)
 └─► P3 (nợ HĐ)        P1 (hạn mức+thời hạn+lock+working-days) ─► P3
P2 ─► P4 (phiếu chi/thu)      P1+P2+P3+P4 ─► P5 (bút toán + báo cáo)
```
Đề xuất chạy tuần tự: **P0 → P1 → P2 → P3 → P4 → P5**. Mỗi phase: (1) đọc SP/schema liên quan → (2) soạn SQL trình anh duyệt → (3) chạy SQL → (4) BE → (5) FE → (6) test E2E.

## 5. Quyết định còn để ngỏ (chốt khi tới phase)
1. **TermDays "khác" tính theo gì** (nhập tay theo hợp đồng vs cấu hình mặc định)? — P1.
2. **DueDate đếm ngày lịch hay ngày làm việc** cho trả hộ 4 ngày? — P1.
3. **Khóa tài khoản** chặn TẤT CẢ thao tác (TƯ+TT) hay chỉ tạo TƯ mới? — P1/P3.
4. **Bảng route duyệt B2** map role cụ thể (chờ "tài liệu phân quyền" của anh) — P2.
5. **Cấu trúc số TƯ/số TT** (spec hoãn tới khi xong mã NV) — làm sau cùng.
6. **Bảng ánh xạ bút toán Nợ/Có** — workshop kế toán P5.
7. Comment anh Nghĩa: có quản hạn mức cho **chuyển khoản** không (spec nói CK không trừ hạn mức tiền mặt) hay chấp nhận rủi ro người duyệt? — ảnh hưởng P1(a).

## 6. Nhạy cảm / rủi ro
- Advance/Payment là module LIVE, nhiều dữ liệu — mọi đổi hành vi Create/Update đi qua SP **mới** (V3), không sửa thân SP đang chạy.
- Phiếu chi/thu + Fund + AccountingDetail đụng kế toán thật → đọc kỹ schema, trình SQL trước, test trên DB test.
- `SP_Advances_Create2/Update2`, `SP_Payments_*` = cực nhạy ([[feedback-no-auto-db-writes]]). Chỉ ĐỌC để clone.
