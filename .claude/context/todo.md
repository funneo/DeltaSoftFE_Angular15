# Pending / In-Progress Work

## ▶ HR — Hợp đồng lao động & Hồ sơ NV (F045, Mức B) — SQL design XONG, chờ chạy SQL + mẫu Word → BE/FE (2026-06-16)
Thay Excel "Danh sách theo dõi HĐLĐ" bằng module trong ERP: theo dõi vòng đời HĐ + **in HĐLĐ ra Word (tải hàng loạt, KHÔNG lưu file)**. Quyết định: **Mức B** = tái dùng tối đa schema HR có sẵn (EmployeeContract/EmployeeSalary/EmployeeAllowance/EmployeeDegree/EmployeeFamily/EmployeeFile), không tạo bảng mới. Lương in từ `EmployeeSalary` IsActived=1 (cơ chế phụ lục khi tăng lương). Chức năng chi tiết: [hr-nhan-su-chuc-nang.md](hr-nhan-su-chuc-nang.md).

**Đã check lại theo yêu cầu chi tiết của anh (2026-06-16) + 3 mẫu Word — đã vá SQL (chưa chạy):**
- Số HĐ tự sinh dạng **STT/VP/<token> Năm** (CT01→"HĐ TV", CT02+CT03→"HĐLĐ", CT04→"HĐ Khoán"), **STT đếm theo VP+Năm+nhóm token** → SP mới `SP_EmployeeContract_GetNextNumber`. Khớp đúng mẫu Word (`045/HN/HĐLĐ 2025`, `001/HN/HĐ TV 2026`).
- **Email tách 2**: Email cũ = email công ty + thêm cột `Employee.PersonalEmail`.
- **Địa điểm làm việc = dropdown**: thêm `Employee.WorkLocationId` + seed `WORK_LOCATION` (HN IDMC / HP 1023 Nguyễn Bỉnh Khiêm); contract.WorkLocation lưu snapshot text in HĐ.
- **Trạng thái NV**: seed `EMPLOYEE_STATUS` (Đang hoạt động/Thử việc/Tạm hoãn/Đã nghỉ) cho `EmployeeStatusId`.
- **Cảnh báo trước 10 ngày**: GetPaging + GetByEmployee thêm tier ≤10 ngày + cờ `IsExpiringSoon`.
- **Chuỗi tính ngày** (TV→XĐ1→XĐ2→KXĐ: start = end trước +1; end = start + N tháng −1 ngày) = prefill ở FE bước B5/B6 (không nằm SQL).
- Bộ phận/Chức danh đã sẵn dropdown (`DEPT`/`TITLES`). Bằng cấp + Người phụ thuộc: SP để bước B6.

**Anh cần (trước khi em code BE/FE):**
1. ⬜ Chạy `Migration_HR_LaborContract_DDL_20260616.sql` (ALTER Employee +12 cột gồm **PersonalEmail/WorkLocationId**, ALTER EmployeeContract +9 cột gồm **EmployeeId** + index, seed CONTRACT_TYPE + EMPLOYEE_STATUS + WORK_LOCATION).
2. ⬜ Chạy `Migration_HR_LaborContract_SPs_20260616.sql` (14 SP: EmployeeSalary ×5; EmployeeContract ×9 gồm **GetNextNumber** + Create/Update/SetActive/Delete(soft)/GetById/GetByEmployee/**GetPaging**/**GetForPrint**).
3. ✅ Có **3 mẫu Word** ở `NewAPI/`: `Hợp đồng thử việc_xxx.docx`, `HĐLĐ xác định thời hạn.docx`, `HĐLĐ không xác định thời hạn.docx` → em wire placeholder ở bước B3 (chọn lib Word sẽ hỏi anh).

**✅ ĐÃ LÀM (2026-06-16) — Hồ sơ NV (Tab 1) BE+FE build 0 lỗi, chờ deploy + test:**
- SQL #3 `Migration_HR_Employee_HR_SPs_20260616.sql` (anh ĐÃ CHẠY): `SP_Employee_GetByIdHR/CreateHR/UpdateHR` MỚI (không đụng SP cũ); mã NV tự sinh `NV00xxx` y chang SP cũ.
- BE: `Employee.cs` +12 field; `EmployeeViewModel` +EmployeeStatusName/WorkLocationName; `IEmployee`+repo (CreateHRAsync/UpdateHRAsync/GetByIdHR, output param); `EmployeeController` 3 endpoint `/addHR /updateHR /getByIdHR` (gate FunctionCode.EMPLOYEE).
- FE: `Employee` model +field mới; `EmployeeService` +addHR/updateHR/getDetailHR; **component MỚI `modal-employee-hr`** (modal-xl 4 tab; **Tab 1 đầy đủ 6 nhóm A-F**, Tab 2/3/4 placeholder); wire nút **"Hồ sơ HR"** trong list NV (danhmuc/employee) để test.
- **Anh cần**: deploy API mới + `ng build` → vào Danh mục Nhân viên → chọn 1 NV → **Hồ sơ HR** (hoặc test tạo mới qua nút này nếu muốn) → kiểm tra Tab 1 lưu/đọc đủ field mới (email cá nhân, địa điểm LV, trạng thái, liên hệ khẩn cấp, BHXH/BHYT). *(Nút "Hồ sơ HR" hiện mở chế độ sửa NV đang chọn; muốn tạo mới HR thì bấm khi không chọn dòng — em có thể tách nút Thêm HR riêng nếu anh cần.)*

**✅ ĐÃ LÀM (2026-06-16, cụm 2) — F045 + F046 đầy đủ, BE+FE build 0 lỗi:**
- **SQL grant** `Migration_HR_F045_F046_Grant_20260616.sql` (⬜ anh CHẠY): Functions F045 (`/main/hrm/employee-hr`) + F046 (`/main/hrm/labor-contract`) nhóm HRM, **CHỈ VIEW** + Permissions Admin VIEW. (Thao tác CUD vẫn gate EMPLOYEE.)
- **BE EmployeeContract + EmployeeSalary** (build 0 lỗi): Model + ViewModel (DaysToExpire/IsExpiringSoon/TrackingStatus + ContractNumberSuggestion) + Interface + Repository (map 9 SP Contract gồm GetNextNumber, 5 SP Salary; output param; parse ngày dd/MM/yyyy) + Controller (`/api/employeecontract/*`, `/api/employeesalary/*`, gate EMPLOYEE). Scrutor auto-DI.
- **FE**: model `employee-contract.model` + service `employee-contract.service` / `employee-salary.service`.
- **modal-employee-hr Tab 2 (Hợp đồng) + Tab 3 (Lương)** giờ FUNCTIONAL: bảng lịch sử + thêm/sửa/đặt hiện hành/xóa; **Thêm HĐ → chọn loại → tự sinh số `001/HN/HĐ TV 2026` + prefill ngày theo chuỗi** (TV today/+2th−1d; XĐ end trước+1/+12th−1d; KXĐ end+1 không hạn); tô đỏ HĐ ≤10 ngày. Tab 3 mốc lương (thêm mốc tự tắt mốc cũ).
- **Màn F045 `employee-hr`** (list NV + Thêm/Sửa/Xem mở modal-employee-hr) + **Màn F046 `labor-contract`** (Theo dõi HĐLĐ: lọc chi nhánh/loại HĐ/năm/sắp hết hạn/chỉ hiện hành + keyword; cột còn N ngày màu + trạng thái theo dõi + lương; nút "Quản lý" mở modal NV tại Tab Hợp đồng). Route đăng ký trong hrm-routing (F045/F046).
- **Anh cần**: (1) chạy grant SQL F045/F046; (2) deploy API + `ng build`; (3) **relogin** → menu Nhân sự có "Hồ sơ nhân viên" + "Theo dõi HĐLĐ"; (4) test: thêm/sửa HĐ (kiểm tra tự sinh số + prefill ngày chuỗi TV→XĐ→KXĐ), mốc lương, bảng theo dõi cảnh báo ≤10 ngày.
- **Còn lại**: Tab 4 Hồ sơ phụ (bằng cấp/người phụ thuộc) + **In Word HĐLĐ** (B3, cần chọn lib + dùng 3 mẫu .docx).

**✅ ĐÃ LÀM (2026-06-16, cụm 3) — polish UI modal Hồ sơ NV (FE đã push main):**
- Modal Hồ sơ NV chuyển **full màn hình** (`.modal-hr-full` 98vw, body cao theo viewport, cuộn dọc) vì nhiều dữ liệu.
- **Chuẩn hóa Tab 1 về lưới 3 cột `col-sm-4`** (bỏ lệch bậc thang do trộn 3/4 cột) — `beb4475`.
- **Lề ngang 20px cho thân/header/footer modal** (`.modal-body.hr-body padding:12px 20px`; input không còn dính mép trái/phải do `.row` margin âm) — `7c7b6e3`.
- Commit FE đẩy main đủ để **app mobile** cập nhật.

**Kế hoạch thực hiện (theo thứ tự):**
- ✅ **B1 — BE Model/VM Employee** (XONG): `Employee.cs` +12 prop; `EmployeeViewModel` +field hiển thị. (EmployeeContract.cs / EmployeeSalary.cs VM cho Tab 2/3 — làm ở bước sau.)
- **B2 — BE Repo/Interface**: `IEmployeeContract`/`EmployeeContractRepository` (CRUD + GetPaging + GetByEmployee + GetForPrint), `IEmployeeSalary`/`EmployeeSalaryRepository` (CRUD + GetByEmployee). Map 13 SP qua DapperAdapter. (Scrutor auto-scan.)
- **B3 — BE Controller**: `EmployeeContractController` + `EmployeeSalaryController` (POST hết, FromBodyBase<T> + CheckTokenKey + ClaimRequirement). Riêng endpoint **In Word**: nhận `@Ids` → gọi GetForPrint → merge docx (lib: DocX/OpenXML hoặc Syncfusion) → nhiều người đóng .zip → trả file stream (KHÔNG lưu Path).
- **B4 — FE service/model**: `employee-contract.service.ts`, `employee-salary.service.ts`, models tương ứng (theo BaseService/CacheService convention).
- **B5 — FE màn Theo dõi HĐLĐ**: list mới (giống Excel) — cột tên/CCCD/loại HĐ/từ-đến ngày/lương BHXH/còn N ngày/trạng thái màu; filter keyword/chi nhánh/loại HĐ/năm/sắp hết hạn; chọn nhiều dòng → nút **In HĐLĐ** (tải .zip).
- **B6 — FE hồ sơ NV**: dựng **component MỚI `modal-employee-hr`** (modal-xl, 4 tab — KHÔNG đụng modal-employee cũ). Tab1 Thông tin chung (đủ field cũ+mới), Tab2 Hợp đồng (lịch sử + thêm/sửa/đặt hiện hành/in + auto số HĐ qua GetNextNumber + prefill ngày theo chuỗi), Tab3 Lương/BHXH (lịch sử + thêm mốc), Tab4 Hồ sơ phụ (phụ cấp/bằng cấp/người phụ thuộc/file). **Thiết kế đã chốt 2026-06-16** — chi tiết mockup + field từng tab ở [hr-nhan-su-chuc-nang.md](hr-nhan-su-chuc-nang.md) §4b. Chờ anh duyệt mới code.
- **B7**: rà permission (FunctionCode HR riêng nếu cần) + test E2E.

**Lưu ý:** chưa chọn lib Word — đề xuất hỏi anh khi tới B3 (DocX free vs OpenXML thuần vs Syncfusion). KHÔNG đụng SP/bảng cũ; bảng EmployeeContract trống nên ALTER an toàn.

## ▶ Bảng công văn phòng (F044) — chờ grant SQL + deploy + test E2E (2026-06-14, SQL chính đã chạy, BE+FE build 0 err, ✅ ĐÃ COMMIT — layout box chuẩn HRM + box chạm đáy)
Module tổng hợp công tháng + tiền phạt NV văn phòng (xem done.md). **Anh cần:**
1. ✅ Chạy `Migration_OfficeAttendance_20260614.sql` (XONG).
2. ⬜ Chạy `Migration_OfficeAttendance_Grant_20260614.sql` (Functions F044 + quyền Admin → hiện menu).
3. ⬜ Deploy API mới + `ng build` FE.
4. ⬜ Test E2E: relogin → Nhân sự → **Bảng công văn phòng** → **Cấu hình** (nhập ngày lễ + số dư phép/online đầu kỳ nếu cần) → **Import chấm công** (chọn file HN_T4/VT_T4, chọn dòng bắt đầu, import, map tên chưa khớp) → **Tính** → đối chiếu bảng với file tay chị Huệ → **Xuất Excel**.

**Còn để dành (đã chốt hoãn):** quy tắc giải trình ≤5 lần/lần 6+ =30k (cột PenaltyExplain/ExplainCount đã có, chưa tính); phụ cấp giờ đặc biệt (IT phía Nam +60', nữ nuôi con nhỏ +60'); đẩy tiền phạt sang module lương VP. Điểm cần soi khi test: bậc phạt về sớm T7 (so mốc 10:00), nửa ngày phép+công, match tên trùng.

## ▶ PendingInvoice/Payment (F043) phân loại phí 2 CẤP — chờ chạy 2 SQL còn lại + deploy + test E2E (2026-06-15, BE+FE build 0 err; xem done.md)
Nâng từ 1 cấp (GroupFeeCode) lên 2 cấp (Lv1→Lv2) + cờ IsInvoiceInput + list group lồng 2 cấp + payment 2 dòng nhóm phí dưới Số tạm ứng + scroll ngang cố định đáy. **Anh cần:**
1. ✅ Đã chạy 3 SQL: `Migration_FeeCodes_2Level_Invoice_20260615.sql` + `Migration_PendingInvoice_SubFee_20260615.sql` + `Migration_Payments_SubFee_20260615.sql`.
2. ⬜ **Chạy nốt 2 SQL**:
   - `Migration_FeeCodes_CreateUpdate_IsInvoiceInput_20260615.sql` (ALTER SP_FeeCodes_Create/Update +@IsInvoiceInput → cho chỉnh cờ tay trong Danh mục phí).
   - `Migration_PendingInvoice_SeedSubFee_DEV_20260615.sql` (CHỈ DB test — giả lập SubFeeCode cho HĐ nháp cũ để xem list group 2 cấp).
3. ⬜ **Deploy API mới + `ng build` FE** (BE giờ truyền @IsInvoiceInput/@SubFeeCode; cần Stop IIS Express trước khi build vì lock Common.dll).
4. ⬜ **Test E2E:**
   - Danh mục phí mới → phí Cấp 2: cột "HĐ đầu vào" ✓/−; sửa mã → tích/bỏ tích "Có hóa đơn đầu vào" → lưu; thêm Lv2 mới (mặc định tích).
   - Modal đọc hóa đơn: 2 dropdown Cấp 1 → Cấp 2 (Cấp 2 chỉ mã được tích invoice); phải chọn đủ 2 cấp mới upload; lưu → DB có SubFeeCode/Name.
   - List PendingInvoice: group LỒNG 2 cấp (Lv1 → Lv2 → hóa đơn), collapse từng cấp; cả 2 tab.
   - Payment: 2 dòng Nhóm phí cấp 1/Phân nhóm cấp 2 dưới Số tạm ứng, thẳng hàng; picker lọc đúng nhóm+phân nhóm; đổi Cấp 1 → reset Cấp 2 + xóa detail; lưu Payments.SubFeeCode; mở lại phiếu hiện đúng 2 cấp.
   - **Scroll ngang** bảng chi tiết phiếu: thanh cuộn ngang cố định ở đáy màn hình (không nhích theo số dòng). Nếu bị che → chỉnh số `430px` trong `.table_wrapper` của payment-detail.component.css.

## ▶ Bảo mật key (2026-06-15) — đã dời Vietmap key khỏi source
Đã dời `VietmapApiKey` vào `appsettings.Development.json` + `.Production.json` (gitignore), bỏ hardcode trong controller (xem done.md). **Anh cân nhắc:** xin Vietmap cấp key MỚI vì key cũ còn trong git history; đảm bảo `appsettings.Production.json` trên server prod có key (file không theo git). Có thể rà thêm các key khác (Google Maps/Firebase/S3) nếu cần.

## ▶ Draft Site — "Công việc vận chuyển" + tài liệu giao nhận do BOT đính kèm (2026-06-12, Phase A/B/C XONG — còn Phase D ERP + E Bot)

**Mục tiêu**: thêm 1 list bên site nháp hiển thị **công việc vận chuyển** (mirror `shipping-task-opman`). Một **BOT** lấy ảnh **biên bản giao hàng + chứng từ giao nhận hàng hóa**, gắn vào từng chuyến. Tài liệu nằm ở draft; **ERP shipping-task-opman vẫn link tới xem được** (giống view draft lô hàng).

**2 quyết định đã chốt (2026-06-11):**
- **Nguồn list = mirror chuyến ERP read-only** (KHÔNG nhân bản chuyến). Draft chỉ chứa *tài liệu*, link bằng `ShippingTaskId`. Draft site đọc chuyến qua ERP API (cần thêm `ShippingTask/getAllByOpMan` vào `Draft:ReadAllowlist`).
- **Ảnh lưu S3 + bảng draft riêng `draft.DraftTaskDocs`** (không nhúng Payload). **Draft API tự nhận multipart → đẩy S3 → insert** (bot chỉ POST ảnh).

**QĐ MỚI (2026-06-12):**
- **BỎ PROMOTE.** Tài liệu giữ vĩnh viễn ở `draft.DraftTaskDocs`; ERP chỉ ĐỌC NGƯỢC đường dẫn để hiển thị, KHÔNG bê vào `Attachfiles` thật → Phase F bị loại; cột `Status='Promoted'/PromotedAttachId` để không (vô hại).
- **S3 PUBLIC, KHÔNG presign.** Bucket `files-manager-delta-erp` có policy public-read; upload NoACL (giống hệt ERP). `viewUrl = https://{bucket}.s3.{region}.amazonaws.com/{key}` (vĩnh viễn). → ERP đọc ngược chỉ cần ghép URL, KHÔNG cần S3 cred/SDK.
- **File đa loại**: ảnh / PDF / Word / Excel (không chỉ ảnh). BE không chặn loại (chỉ 50MB); FE render thumbnail ảnh + icon Word/Excel/PDF.

**Thứ tự:**
- ✅ **Phase A — SQL XONG (2026-06-12)**: anh chạy [Migration_DraftSite_TaskDocs_20260611.sql]. Bảng `draft.DraftTaskDocs` + 5 SP draft + `dbo.SP_DraftTaskDocs_GetForErp_GetByDateRange` đã tồn tại.
- ✅ **Phase A.2 — KHÔNG cần sửa allowlist**: `GetAllByOpMan` đã có `[ClaimRequirement(WORKFLOW, VIEW)]` → DraftAudienceGuard cho VIEW qua + ClaimRequirementFilter pass nếu token nháp có `WORKFLOW_VIEW` (FilterDraftPermissions giữ `_VIEW`). → user nháp cần WORKFLOW_VIEW ở ERP.
- ✅ **Phase C — draft-web XONG (2026-06-12, build pass)**: `src/app/shipping-task/` list mirror opman read-only (ERP `/api/shippingtask/getallbyopman`) + date range/keyword + cột "Tài liệu (n)" badge + **modal `shipping-task-docs-modal`** (upload nhiều file ảnh/PDF/Word/Excel theo loại, thumbnail ảnh + icon theo loại, xem qua public URL, xóa của mình) + `docCount` thật (1 call `draftTaskDocs/getPaging` gộp client-side). `LookupService.shippingTasksOpMan()` + `DraftTaskDocsService` + interface `ShippingTaskOpManLookup`/`DraftTaskDoc` + route `/shipping-task` + nav nhóm cha **"Quản lý vận tải" → "CV vận chuyển"**.
- ✅ **Phase B — Draft API XONG (2026-06-12, build 0 err)**: `DraftTaskDocsController` (create multipart→S3→insert / getByTask / getPaging / delete, all trả `viewUrl` public) + `DraftTaskDocsRepository` (4 SP draft) + `Services/S3StorageService` (upload NoACL + `GetViewUrl` ghép **public URL**, bucket `files-manager-delta-erp` ap-southeast-1, prefix `DraftTaskDocs/<taskId>/`) + DTOs + DI + `appsettings.AwsConfiguration` + pkg `AWSSDK.S3`. **PathFile lưu S3 KEY**; viewUrl = `https://{bucket}.s3.{region}.amazonaws.com/{key}` (public, vĩnh viễn, không presign).
  - ▶ **Anh cần**: (1) `dotnet restore/run` DraftAPI (nạp AWSSDK.S3 + endpoints); (2) đổi password `draft_app` thật trong appsettings (đang `CHANGE_ME`); (3) `ng serve` draft-web → test upload/xem/xóa chứng từ theo chuyến.
- ⬜ **Phase D — ERP opman** (cách đã chốt: KHÔNG viết SP mới): (1) chạy [Migration_DraftSite_TaskDocs_OpManDocCount_20260612.sql] — **ALTER `SP_ShippingTask_GetByOpMan`** (SP màn opman THẬT, lọc 1 ngày `@Day`) thêm 1 cột `DraftDocCount` (correlated subquery sang draft.DraftTaskDocs). ⚠️ KHÔNG nhầm sang `SP_ShippingTask_GetAllByOpMan` (cái đó draft-web dùng). (2) thêm property `int DraftDocCount` vào `ShippingTaskViewModel`. (3) endpoint ERP đọc file theo `ShippingTaskId` (Dapper inline schema draft, **không SP mới**) → FE ghép public URL. (4) nút 📎 + modal read-only trong `shipping-task-opman`. → `dbo.SP_DraftTaskDocs_GetForErp_GetByDateRange` thành thừa, có thể DROP. **File ALTER mới chỉ là ĐỀ XUẤT — chưa chạy.**
- ⬜ **Phase E — Bot**: chốt hợp đồng API (POST multipart `api/draftTaskDocs/create` kèm token aud=draft). Code bot làm sau.

## ▶ Session 2026-06-07 — chờ anh test E2E (SQL đã chạy xong 2026-06-08)
5 SQL trên đã chạy: SP_DriverFuelClosing_Delete (@Id), SP_DraftEntries_GetPaging (LIKE pattern), SP_DispatchOrder_GetForSummary (+FuelDriverName), SP_DriverFuelApproval_CancelExpired, F039 grant.

**Anh cần**:
1. Restart ERP API (load token Draft 24h + SP changes + appsettings allowlist).
2. Restart DraftAPI port 44362 (code `(int?)` cast + LIKE pattern hoạt động khi SP mới đã chạy).
3. **Test E2E F039**: relogin → `/main/transports/vehiclefuelclosing` → chọn xe + kỳ + Tải dữ liệu → nhập TopUp → Lưu nháp → Tải lại verify candidates pick biến mất → Duyệt → check `IsFuelClosing/IsSummarized`. Edge: tạo phiếu thứ 2 cùng xe → chặn "Xe đang có phiếu chưa duyệt".
4. **Test Hủy IGAS hết hạn**: phiếu fuel-summary đã xuất IGAS mà chưa đổ → nút "Hủy IGAS hết hạn" → nhập lý do → status chuyển -2.
5. **Test Người nhận dầu**: modal-fuel-summary cột mới hiển thị đúng tên NV (từ `Employee.EmployeeFullName` JOIN qua `FuelDriverId`).
6. **Test draft AI**: employee login draft → list job thấy nháp có `Payload.targetEmployeeId` = mình.

## ▶ Phase 5a — View Draft ở ERP — **2/5 list XONG (2026-06-08), 3 list + 5 modal chi tiết còn lại**

**Tiến độ**:
- ✅ **Stage 1 SQL** — `Migration_DraftSite_GetForErp_20260602.sql` (LIKE pattern, bỏ JSON_VALUE). Anh đã chạy 2026-06-08, SP `dbo.SP_DraftEntries_GetForErp_GetPaging` đã tồn tại + 2 list Lô hàng/Canon đã thấy dòng vàng nháp.
- ✅ **Stage 2 BE ERP** — endpoint `POST /api/draft/getPagingForErp` build clean, chạy OK.
- ✅ **Stage 3 FE shared** — `shared/services/draft.service.ts` xong (interface `DraftFilterRequest`/`DraftEntryView`, gọi BE, catch 500 → empty).
- ✅ **Stage 4 — 2/5 list**: Lô hàng thường + Lô hàng Canon merged draft, verified runtime OK. Chi tiết: done.md section đầu.
- 🟡 **Stage 4 — 3/5 list còn lại**: Thanh toán, Phân công CV, Debit Note.
- 🟡 **Stage 3 — modal-draft-*-view (5 modal)**: chưa code. Hiện click vào badge nháp KHÔNG mở gì — anh muốn xem chi tiết payload thì chưa có.

### ▶ Stage 4 — 3 list còn lại (clone pattern shipment-normal)
| List | Component | DraftType | ShipmentType param |
|---|---|---|---|
| Thanh toán | payments-list | Payment | — (omit) |
| Phân công CV | workflow-list | Workflow | — (omit) |
| Debit Note | debit-notes-list | Debit | — (omit) |

Mỗi list cần:
1. Inject `DraftService` + `forkJoin` ERP + draft.
2. `mapDraftToRow*` parse `d.payload` → row shape của list. Field mapping:
   - **Payment**: `Payload.refNo→refNo`, `Payload.targetEmployeeId→người làm`, `Payload.amount→total`, `Payload.shipmentId→lô hàng`.
   - **Workflow**: `Payload.jobId→jobid`, `Payload.handlingGroupId→nhóm`, `Payload.targetEmployeeId→người thực hiện`.
   - **Debit**: `Payload.customerId→KH`, `Payload.totalAmount→tổng`, `Payload.debitDate→ngày`.
3. HTML: `[class.row-draft]` + badge JobId/RefNo + `<ng-container *ngIf="!item._isDraft">` quanh cột Tác vụ. CSS copy 4 dòng `row-draft`/`badge-draft`.
4. Defensive guard 3 lớp: `code=200/201` + `Array.isArray` + client-side filter loại Canon (chỉ áp cho Shipment).

### ▶ Stage 3 — view chi tiết draft (read-only)
- ✅ **Lô hàng thường — XONG (2026-06-11)**: KHÔNG tạo modal riêng, **reuse y nguyên `modal-shipment`** ở chế độ draft-view. Cách làm (pattern cho các list sau):
  - `modal-shipment.component.ts`: thêm cờ `_isDraftView`/`_draftId` + method `viewDraft(payload, draftId)` (parse payload→entity, `flagXem=true`, format ngày tolerant `_draftDate()` cho YYYYMMDD/MM-DD/ISO) + `approveDraft()` (hiện chỉ toast "sẽ bổ sung sau" + emit `@Output ApproveDraft`). Reset `_isDraftView=false` ở `add()`/`edit()` để KHÔNG ảnh hưởng luồng thật.
  - HTML: `.modal-content [class.draft-view]` + badge "NHÁP #id" header + footer nút **Duyệt** (`*ngIf="_isDraftView"`) + nút đổi label "Hủy". Lưu/Lưu&Thêm tự ẩn vì `flagXem`.
  - CSS: `.draft-view` nền `#FFFDF5` viền `#FFC107`, header `#FFF8E1` (đồng bộ list).
  - List `shipment-normal`: badge nháp thêm `(click)="showDraft(item)"` → `modalAddEdit.viewDraft(item._draftPayload, item._draftId)`.
- ✅ **Lô hàng Canon — XONG (2026-06-11)**: áp y hệt pattern trên vào `modal-job-canon` (thêm `_isDraftView`/`_draftId`/`viewDraft()`/`_draftDate()`/`approveDraft()` + reset ở add/edit; HTML nền vàng + badge + nút Duyệt; CSS `.draft-view`; list `job-canon` badge `(click)="showDraft(item)"`).
- 🟡 **3 list còn lại** (Payment / Workflow / Debit): áp cùng pattern — reuse modal gốc tương ứng thêm `viewDraft()`.
- **▶ Phase 4 Promote**: nút "Duyệt" hiện chỉ toast; khi AI đủ chính xác → wire `ApproveDraft` → controller promote (bê Payload→Tbl_* thật, parse `targetEmployeeId`, `jobDate/refDate` từ `createdAt`).

### Phase 4 — Promote (sau khi view xong)
ERP cần màn "Duyệt nháp" để bê record `draft.DraftEntries.Payload` → `Tbl_*` thật. Controller promote phải:
- Parse `targetEmployeeId` từ Payload → gán `Tbl_*.EmployeeId`.
- `jobDate/refDate` lấy từ `createdAt` envelope (override Payload).
- Audit log + đóng draft (set `Status='Promoted'`, `PromotedRefNo`, `PromotedAt`).

### Quyết định UX đã chốt (2026-06-02, giữ nguyên)
- Gộp 2 nguồn vào 1 list (không tab riêng).
- Highlight nền vàng `#FFF8E1`, badge `#FFC107`.
- Dòng nháp KHÔNG có action button nào ngoài "Xem" qua badge JobId.
- Sort theo `createdDate desc` chung.

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

## ▶ Đọc hóa đơn AI / PendingInvoice (F043) — SQL+BE+FE XONG (2026-06-09, chờ test E2E + theo dõi chi phí)
Module hoàn chỉnh. Chi tiết: done.md section đầu. **3 SQL đã chạy + Functions.F043 anh tạo tay**:
- `Migration_PendingInvoice_20260609.sql` (bảng + TVP + 7 SP).
- `Migration_PendingInvoice_AddDuplicateRef_20260609.sql` (+2 cột `IsDuplicate/DuplicatesJson` + DROP+CREATE Create/Update).
- `Migration_F043_PendingInvoice_Grant_20260609.sql` (ActionInFunctions × 5 + Permissions Admin).

### ▶ Anh cần test E2E
1. **Restart ERP API** (Stop Shift+F5 → F5 trong VS) — load BE mới + DLL được copy. Relogin → claim JWT có `F043_*`.
2. `/main/advance-payment/pending-invoice` → bấm "Đọc hóa đơn AI".
3. Upload ZIP 5-10 file (có 1-2 file trùng Payment đã có) → modal hiện list: row trùng vàng + badge "TRÙNG" + tooltip RefNo.
4. Test **checkbox**: uncheck dòng test → bấm "Lưu hóa đơn chờ TT (N)" → toast "Đã lưu N hóa đơn" → list reload → row trùng vẫn vàng + badge.
5. Test **Đọc lại đã chọn** (modal): check 1 dòng OK + bấm → BE đọc lại không upload lại. Restart ERP API → retry → phải hiện "Phiên upload hết hạn".
6. Test **Đọc lại 1 dòng** (list): bấm nút Đọc lại 1 row → BE đọc từ `PathFileLocal` → reload → snapshot dup mới.
7. Test **Discard**: đóng modal không lưu → folder `UploadFiles/InvoiceTemp/<uploadId>/` xóa ngay.
8. Test **Cron cleanup**: tạo folder bỏ rơi >24h → sau 6h `InvoiceTempCleanupService` tự dọn (xem log API).

### ▶ Theo dõi chi phí
- Token usage hiển thị trực tiếp ở footer modal: `{in} / {out} = {total}`.
- Cuối tháng anh check Cloud Billing → APIs & Services → Generative Language API → Metrics. Ước tính ~$0.001-0.002/hóa đơn với `gemini-2.5-flash-lite` + LOW + thinking off.
- Nếu ảnh chụp điện thoại dày chữ đọc sai → đổi `mediaResolution=MEDIA_RESOLUTION_LOW` → `MEDIUM` ([GeminiAIRepository.cs:421](D:/Delta/DeltaSoft/NewAPI/API/Repositories/CustomerCommunicate/GoogleServices/GeminiAIRepository.cs#L421)).

### ✅ Tích hợp Payment — XONG (2026-06-10, commit web 9c10562 / API bb88319; chi tiết done.md section đầu)
- ✅ Modal `modal-pending-invoice-picker` (Status=0 + UsedByPaymentId IS NULL, scope user/admin) → fill dòng PaymentDetail kèm `pendingInvoiceId`.
- ✅ Save/Update/Delete Payment → Mark/Release `UsedByPaymentId` (đã nối trong PaymentsRepository).
- ✅ Hóa đơn trùng vẫn cho chọn, UI row vàng + badge "TRÙNG" + tooltip RefNo.
- ✅ **Đính kèm file** (move file `Invoice/`→`UploadFiles/` + AttachFiles `hoa-don<sốHĐ>`), SP mới `SP_PendingInvoice_UpdatePathFileLocal`.
- ▶ **Còn lại**: restart/build API rồi test E2E pick→Lưu phiếu→mở nút file thấy `hoa-don<sốHĐ>` + file đã move sang `~/UploadFiles/`.

### Mặc định có thể chỉnh nếu cần (hardcode trong [GeminiAIRepository.cs](D:/Delta/DeltaSoft/NewAPI/API/Repositories/CustomerCommunicate/GoogleServices/GeminiAIRepository.cs))
- `MaxFilesPerArchive=30`, `MaxTotalUncompressedBytes=100MB`, `MaxParallel=5`.

### Cleanup đã làm
- ✅ Dời API key Gemini → `appsettings.Development.json` (đã gitignore, verified no git leak).
- ✅ Bỏ Vertex AI cũ: `appsettings.json` chỉ còn `Gemini.ModelId`, `API.csproj` xóa `Google.Cloud.AIPlatform.V1`. GIỮ `delta-erp-vn-...json` credential + `GOOGLE_APPLICATION_CREDENTIALS` env var vì DocumentAI vẫn dùng.

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
