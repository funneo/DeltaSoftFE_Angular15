# Completed Features

## FCL v2 — Màn THỰC HIỆN lái xe: mở khóa nhập + lưu chi phí/trốn vé + phân loại hóa đơn + phụ lục phí dùng chung — SQL đã chạy, BE build sạch, FE tsc 0 lỗi, chờ deploy — 2026-07-11
Nối tiếp workflow v2. Anh test thật phát hiện lái xe **không nhập được** ở modal thực hiện + chi phí **không được lưu**. Xử trọn 3 việc + đưa phụ lục phí về API dùng chung web+app.
- **Bug mở khóa lái xe** [modal-execute-fcl.ts](../../src/app/shared/components/transports/modal-execute-fcl/modal-execute-fcl.component.ts): `edit()` ép `flagXem=true` cho ai không phải admin/accept/creator ⇒ **lái xe bị khóa hết** (creator = điều vận). Fix: nhận diện **lái xe của lệnh** (`EmployeeId` token == `entity.driverId`, cùng int; precedent `advance.component.ts:83`) cho nhập khi **status ≤ 2**; từ B1 (≥3) tự khóa lại. Dropdown phí bị `table-responsive` cắt → `appendTo="body"`.
- **driverUpdate cũ chỉ lưu 4 cột** (km/note/finished) — `listFee` + `listEtc.isPassed` lái xe khai **mất trắng**. Mở rộng lưu **batch 1 lần** (không auto-save từng dòng — tiện app+web). BE `DriverUpdate(item)`; SP `SP_DispatchOrderFCL_DriverUpdate` MERGE `listFee` theo Id + `UPDATE IsPassed` theo Id, **GATE `IsLegacy=0`** (legacy dùng chung endpoint qua `modal-perform-fcl` → chỉ update 4 cột như cũ; TVP rỗng của legacy bị bỏ qua). ⚠ TVP không truyền = bảng rỗng ≡ "xóa hết dòng" nên bắt buộc gate bằng IsLegacy chứ không tin TVP.
- **Phân loại chứng từ mỗi dòng phí** `InvoiceType`: 0 không HĐ · 1 có phiếu thu (không nhập thêm, số phiếu ghi ở Nội dung) · 2 có hóa đơn → **bắt đủ 6 field HĐ** (InvoiceNo/InvoiceDate/InvoicePattern/TaxNumber/Web/Code, đúng tên `PaymentDetail`). FE: cột "Chứng từ" + **hàng con nền vàng** 6 ô, validate chặn Lưu/Hoàn thành nếu thiếu; đổi loại về 0/1 tự xóa 6 ô. **Surgical**: TYPE MỚI `TypeDispatchOrderFCLFeeV2` (10 cột cũ + 7 mới), CHỈ recreate SP DriverUpdate — `CreateWithTO`/`UpdateWithTO` KHÔNG đụng.
- **Phụ lục phí lái xe → API dùng chung** (bỏ JSON tĩnh `driver-fcl-fees.json`): `SP_Fee_GetForDriver` fix cứng **9 FeeId** + DisplayOrder từ bảng Fee (anh chốt "khỏi bảng mới, sửa SP là xong"); endpoint `POST /api/fee/GetForDriver` không gắn quyền (chỉ token) → lái xe/app gọi được. Cả modal tạo lệnh (điều vận) + modal thực hiện (lái xe) dùng chung `FeeService.getForDriver()`.
- **SQL (anh đã chạy hết)**: [Migration_Fee_GetForDriver](../../../NewAPI/Migration_Fee_GetForDriver_20260711.sql) · [Migration_FCL_DriverUpdate_SaveFeeEtc](../../../NewAPI/Migration_FCL_DriverUpdate_SaveFeeEtc_20260711.sql) · [Migration_FCL_DriverFeeInvoice](../../../NewAPI/Migration_FCL_DriverFeeInvoice_20260711.sql) (supersede SP DriverUpdate + ALTER 7 cột + type V2).
- **Mobile**: prompt + skill `fcl-mobile-api` §4.7/§11 cập nhật đủ (driverUpdate fee/etc/invoiceType + `GetForDriver`) — đội mobile làm được không cần source ERP.
- **CÒN (deploy)**: tắt IIS Express → redeploy API; `ng build` FE. Rồi test E2E lái xe nhập chi phí + hóa đơn.

## FCL v2 Workflow — FE XONG (modal tạo + modal thực hiện + list + timeline), ng build 0 lỗi, chờ deploy — 2026-07-11
Nối tiếp SQL+BE 2026-07-10. FE giờ đi TRỌN qua `ChangeStatus` (SP mới) — **bỏ SẠCH updateState khỏi luồng v2** (chốt chặn ngăn đi nhầm SP cũ). Anh chốt: thao tác **lái xe** (Nhận/Hoàn thành/Từ chối nhận) nằm ở **modal THỰC HIỆN** (`modal-execute-fcl`), KHÔNG ở modal tạo lệnh.
- **Service** [dispatch-order-fcl.service.ts](../../src/app/shared/services/fcl/dispatch-order-fcl.service.ts): +`changeStatus(refNo, actionType, reason)` +`getStatusLog(refNo)`.
- **Modal TẠO/SỬA** [modal-dispatch-order-fcl-v2](../../src/app/shared/components/transports/modal-dispatch-order-fcl-v2/modal-dispatch-order-fcl-v2.component.ts): bỏ nút **Gửi lệnh** + **Duyệt B2** + mọi `updateState`. Điều vận **Duyệt B1**(3→5)/**Từ chối B1**(3→2) [FCL_ACCEPT] + người chốt **Chốt**(5→6)/**Từ chối chốt**(5→3) [FCL_CLOSING]. Từ chối bắt buộc lý do (prompt). +Section **"Lịch sử lệnh"** timeline (`loadStatusLog`+`actionTypeLabel`, dòng từ chối tô đỏ +CSS). Khóa nhập tab Chi phí đổi `status>=4`→`>=5` (3 chỗ).
- **Modal THỰC HIỆN** [modal-execute-fcl](../../src/app/shared/components/transports/modal-execute-fcl/modal-execute-fcl.component.ts) (= perform v2, mở qua `viewModalFclNew` trong `perform-dispatch-order`): lái xe **Nhận lệnh**(→2)/**Từ chối nhận**(→1 IsDeny +lý do)/**Hoàn thành lệnh**(driverUpdate rồi →3) — tất cả qua `changeStatus`. Bỏ nút status-4 (Chốt/Từ chối chốt dữ liệu). ⚠ còn 1 `updateState` trong `saveSuccess()` **code chết** (nút mở nó đã gỡ) — dọn sau.
- **List** [dispatch-order-fcl-new](../../src/app/main/transports/dispatch-order-fcl-new/dispatch-order-fcl-new.component.ts): nhãn filter + mapping status mới (1 Đã giao·2 Đã nhận·3 Chờ duyệt·5 Chờ chốt·6 Đã chốt) + `getStatusText()` FE tự tính (không phụ thuộc `rStatus` BE đang lệch).
- **Verify**: `npx tsc --noEmit` sạch; `npx ng build` exit 0 (chỉ warning CommonJS có sẵn).
- **CÒN (owner/anh làm):** grant `FCL_ACCEPT` cho DV/DV-M; status khởi tạo=1 trong `SP_DispatchOrderFCL_CreateWithTO`; 2 lệnh v2 đang status 0 sẽ kẹt (UPDATE=1); mobile skill; nhãn `rStatus` trong SP getPaging; deploy (`ng build`+API). Test E2E full flow sau deploy.

## FCL v2 — Workflow MỚI: SQL + BE xong (SQL đã chạy, BE compile 0 err), **FE chưa làm** — 2026-07-10
Anh hỏi "FCL v2 đã theo quy trình mới chưa" → **chưa**: modal v2 vẫn còn nút Gửi lệnh + Duyệt B2, `duyetB1()` vẫn `updateState(3)`.
### 4 phát hiện từ DB làm đổi thiết kế so với ghi chú todo cũ
1. **KHÔNG thể tái dùng `DispatchOrderFCLHistory`** (172.171 dòng): `SP_DispatchOrderFCL_UpdateState` ghi vào nó bằng `INSERT INTO DispatchOrderFCLHistory VALUES (...)` **không có column list** ⇒ ALTER thêm bất kỳ cột nào là câu INSERT gãy ngay, kéo sập FCL cũ. ⇒ bảng mới song song là bắt buộc, không phải lựa chọn.
2. **`SP_DispatchOrderFCL_UpdateState` KHÔNG generic** (todo ghi "verify generic" — sai): nó hardcode transition `SET @Status = IIF(@CurrentStatus=1,0,IIF(@CurrentStatus=3,2,...))`, truyền `@Status` gì cũng bị tính lại ⇒ không mượn được cho luồng mới.
3. **`SP_DispatchOrderFCL_Chotdau` bị chôn trong `UpdateState`**: `IF @Status=6 AND @IsSub=0 EXEC SP_DispatchOrderFCL_Chotdau`. SP mới **phải gọi lại** nhánh này, quên là chốt lệnh không chốt dầu.
4. **`FCL_ACCEPT` ĐÃ có** trong `ActionInFunctions` + đã cấp 8 role (CSVT-M, DV-CBT, DV-HCM, DVM-HCM, GĐ, IT, QL, TQ-TC), nhưng role **`DV`** và **`DV-M`** (điều vận) **THIẾU** ⇒ họ sẽ không thấy nút Duyệt B1.
### SQL — [Migration_FCLStatusLog_20260710.sql](../../../NewAPI/Migration_FCLStatusLog_20260710.sql) (✅ anh đã chạy)
- `Tbl_DispatchOrderFCLStatusLog` (append-only) + `IX_FCLStatusLog_RefNo`; CHECK `IsReject=0 OR Reason<>''` — lý do bắt buộc chặn ở tầng DB, không tin FE.
- **`SP_DispatchOrderFCL_ChangeStatus`** (anh chốt tên này, không phải `..._StatusLog_Add` — SP không chỉ ghi log mà còn UPDATE status + chốt dầu). 1 transaction: đọc lệnh `WITH (UPDLOCK, ROWLOCK)` → validate → `INSERT` log → `UPDATE` status → `IF @ToStatus=6 AND @IsSub=0 EXEC SP_..._Chotdau`. Trả về `FromStatus/ToStatus/IsReject`.
  - **KHÔNG nhận `@ToStatus` từ caller** — suy ra từ `@ActionType`; để FE truyền là một lỗi FE ghi sai trạng thái vào DB mà không ai biết.
  - **Chặn `IsLegacy=1`** → RAISERROR (lệnh cũ chỉ đi `UpdateState`). Chiều ngược lại không chặn (không đụng SP cũ); FE v2 sẽ bỏ hết lời gọi `updateState`.
  - **`@EmployeeId`**: ActionType 1/2/5 phải khớp `DriverId` (anh yêu cầu kiểm ngay trong SP) ⇒ bỏ hẳn `GetGuardInfoAsync` + câu SQL thô em định viết ở repo.
- `SP_DispatchOrderFCLStatusLog_GetByRefNo` (timeline) — giữ tên theo bảng vì chỉ SELECT.
- **KHÔNG ghi vào `DispatchOrderFCLHistory`** (anh chốt). Đã verify: BE có nạp `ListHistory` nhưng **không màn FE nào đọc** ⇒ không mất gì.
### Bảng transition (nhãn theo anh: "Từ chối B1" / "Từ chối CHỐT", không phải "Trả lại")
| ActionType | Tên | From→To | IsReject | Kiểm quyền ở |
|---|---|---|---|---|
| 1 | Nhận lệnh | 1→2 | 0 | **SP** (`@EmployeeId=DriverId`) |
| 2 | Hoàn thành lệnh | 2→3 | 0 | **SP** |
| 3 | Duyệt B1 | 3→5 | 0 | **BE** `FCL_ACCEPT` |
| 4 | Chốt lệnh | 5→6 | 0 | **BE** `FCL_CLOSING` |
| 5 | Từ chối nhận lệnh | 1→1 (`IsDeny=1`) | 1 | **SP** |
| 6 | Từ chối B1 | 3→2 | 1 | **BE** `FCL_ACCEPT` |
| 7 | Từ chối CHỐT | 5→3 | 1 | **BE** `FCL_CLOSING` |
### BE (compile 0 error, chờ deploy)
- `POST /api/DispatchOrderFCL/ChangeStatus` + `POST /GetStatusLog` ở [DispatchOrderFCLController.cs](../../../NewAPI/API/Controllers/FCL/DispatchOrderFCLController.cs). `[ClaimRequirement(FCL, VIEW)]` chỉ là rào tối thiểu — **1 endpoint / 7 ActionType / 3 nhóm quyền**, attribute gắn được 1 mã nên quyền thật kiểm trong thân action.
- Bắt riêng `System.Data.SqlClient.SqlException` → trả **400** kèm nguyên văn RAISERROR (không phải 500 "lỗi hệ thống"). ⚠ Project dùng `System.Data.SqlClient`, KHÔNG phải `Microsoft.Data.SqlClient`.
- [IdentityExtensions.cs](../../../NewAPI/API/Extensions/IdentityExtensions.cs) +`HasPermission(perm)` (admin bypass, claim `permissions` format `"FCL_ACCEPT"` — giống `ClaimRequirementFilter`) +`GetFullName()`.
- Models `FclActionType` enum + `DispatchOrderFCLChangeStatus/Result/StatusLog`; `IDispatchOrderFCL.ChangeStatusAsync/GetStatusLogAsync`.
### CÒN LẠI (xem todo.md)
⬜ chạy lại file SQL (vừa thêm `@EmployeeId`) · ⬜ chạy [Migration_FCL_GrantAcceptClosing_20260710.sql](../../../NewAPI/Migration_FCL_GrantAcceptClosing_20260710.sql) (anh nói **để sau, anh tự bổ sung**) · ⬜ **FE modal v2 + list** · ⬜ mobile skill · ⬜ 2 lệnh v2 đang ở status 0 sẽ kẹt (anh nói chỉnh dữ liệu sau).

## Danh mục Cảng bãi — phân loại theo **CHI NHÁNH** (`Ports.BranchId`) — SQL chờ anh chạy, BE 0 err + FE 0 err — 2026-07-10
- **Quy ước**: `Ports.BranchId` NULL/0 = **cảng dùng chung**, hiện ở mọi chi nhánh. Tham số `@BranchId` NULL/0 khi query = **lấy tất cả** (không lọc). ⇒ `WHERE (ISNULL(@BranchId,0)=0 OR ISNULL(p.BranchId,0)=0 OR p.BranchId=@BranchId)`.
- **★ BranchId do BE tự gán, FE KHÔNG nhập.** Dùng extension có sẵn [IdentityExtensions.GetBranchId()](../../../NewAPI/API/Extensions/IdentityExtensions.cs#L36) (claim `branchId` cấp lúc login), theo đúng pattern `AccountsController`:
  `obj.Item.BranchId = obj.BranchId ?? obj.Item?.BranchId ?? User.GetBranchId();` → truyền xuống repository. Áp cho cả **Create** và **Update** (Update fallback thêm `existing?.BranchId` vì FE không gửi ⇒ nếu không, `SP_Ports_Update` sẽ ghi đè NULL và biến cảng thành "dùng chung").
  ⇒ **Không cần đụng SQL** cho việc này (em suýt sửa SP — anh chặn đúng).
- **Modal KHÔNG hiển thị chi nhánh; list KHÔNG có cột chi nhánh.** List chỉ giữ **dropdown lọc** chi nhánh, `[readonly]="!adminPermission"` (chỉ Admin đổi được; user thường khóa ở chi nhánh đăng nhập).
- **Hiển thị = MÃ chi nhánh** (`BranchCode`: HN/SG/VT/BN/HD/BD), không dùng `BranchName`.
- **`GetAll` KHÔNG fallback về token**: `obj?.BranchId ?? obj?.Item?.BranchId` — vì 0 ("Tất cả chi nhánh", Admin chọn) là giá trị hợp lệ, không phải "thiếu dữ liệu".
- **★ Bẫy CacheService** (anh phát hiện: *"đổi chi nhánh mà không thấy gọi api"*): `CacheService.get()` giữ **TTL 60 phút theo key**. Với key `ports_all_<branchId>`, mỗi chi nhánh chỉ gọi API **đúng 1 lần**; đổi qua đổi lại giữa các chi nhánh đã xem → **không request nào nữa**. ⇒ `getAll(branchId?, useCache = true)`; **trang danh mục truyền `false`** (màn quản trị phải thấy dữ liệu mới), modal/FCL giữ `true`.
- **Áp lọc chi nhánh vào 2 màn nghiệp vụ** (2026-07-10): `loadPorts()` của [modal-shipping-task-cs](../../src/app/shared/components/transports/modal-shipping-task-cs/modal-shipping-task-cs.component.ts) và [modal-dispatch-order-fcl-v2](../../src/app/shared/components/transports/modal-dispatch-order-fcl-v2/modal-dispatch-order-fcl-v2.component.ts) truyền `getAll(userLoged.branchId)`; thêm nhánh `else` xóa list (trước đó 204 = giữ nguyên list cũ). Các màn còn lại (`modal-dispatchorder`, `modal-perform-fcl`, `modal-dispatch-order-fcl` legacy, `modal-customer-routes`, `transit-ports`) **giữ `getAll()` = lấy tất cả**.
- **Pool điểm dựng cung đường cũng lọc chi nhánh** (SQL#2 chờ chạy): [Migration_GetAllLocations_BranchId_20260710.sql](../../../NewAPI/Migration_GetAllLocations_BranchId_20260710.sql) — DROP/CREATE `SP_GetAllLocations` +`@BranchId` (DEFAULT NULL), **chỉ lọc nhánh `Ports`**; nhánh `CustomerLocations` (nhà máy/kho KH) không có cột chi nhánh nên giữ nguyên. File có guard `RAISERROR + SET NOEXEC ON` nếu chạy trước migration Ports. BE: `ITransportOrder.GetAllLocations(listCustId, int? branchId = null)`, controller đọc `obj.BranchId`, **không fallback token** ⇒ trang TO (`modal-transport-order`, không truyền) giữ nguyên hành vi. FE: `getLocations(listCustId?, branchId?)`; chỉ `modal-dispatch-order-fcl-v2._loadAllLocations()` truyền chi nhánh.
- **Rủi ro dữ liệu**: 86/86 cảng đang `BranchId = 6` (VT). ⇒ user chi nhánh khác mở FCL/ShippingTask sẽ có **danh sách cảng rỗng**, và sửa bản ghi cũ thì ng-select không tìm thấy cảng đã chọn → ô hiển thị trống. Cần `UPDATE Ports SET BranchId = NULL` cho các cảng dùng chung (anh tự chạy).
- **`null` khi bấm × ở ng-select**: `_updateNgModel()` gọi `this._onChange(isDefined(model[0]) ? model[0] : null)` ⇒ ngModel = `null`, rồi mới `changeEvent.emit(selected[0])` = `undefined`. Nên `changedBranch()` phải `event?.id ?? 0`. (Lưu ý: `$event` của ng-select là **object item**, không phải bindValue — `route.component.ts` viết `event?.id` là đúng.)
- **SQL (chờ chạy)** [Migration_Ports_BranchId_20260710.sql](../../../NewAPI/Migration_Ports_BranchId_20260710.sql): `ALTER TABLE Ports ADD BranchId INT NULL` + `IX_Ports_BranchId` + DROP/CREATE 4 SP `SP_Ports_Create` / `_Update` (+`@BranchId`, tự quy 0→NULL) / `_GetAll` (+`@BranchId` lọc, JOIN `Branch` trả `BranchCode`) / `_GetByCode` (trả `BranchId`+`BranchCode`). Không FK (tránh khóa bảng Branch).
- **Non-breaking**: mọi tham số mới đều có DEFAULT ⇒ caller cũ chạy y nguyên. 86 cảng đang có sẽ là `NULL` = dùng chung ⇒ **không bản ghi nào biến mất** khỏi FCL / lệnh điều xe / công việc giao nhận.
- **BE**: `Ports.BranchId` (Model) + `PortsViewModel.BranchCode`; `IPorts.GetAll(int? branchId = null)`; repo truyền `@BranchId`; `PortsController.GetAll` đọc `obj?.Item?.BranchId`.
- **FE**: `ports.model.ts` +`branchId`/`branchCode`; **`PortsService.getAll(branchId?)` — cache key đổi thành `ports_all_${branchId||0}`** (nếu giữ key cũ `ports_all` thì mọi màn khác sẽ ăn chung kết quả đã lọc của trang danh mục); trang [ports](../../src/app/main/danhmuc/ports/ports.component.ts) thêm ng-select chi nhánh `[readonly]="!adminPermission"` (mặc định = chi nhánh user, theo pattern `route.component`) + cột "Chi nhánh" (rỗng → *Dùng chung*); [modal-ports](../../src/app/shared/components/danhmuc/modal-ports/modal-ports.component.ts) thêm ô chọn chi nhánh, `add()` gán sẵn chi nhánh user cho non-admin, Admin để trống = dùng chung.
- **Không tạo `SP_Ports_GetPaging`** — SP này KHÔNG tồn tại trong DB dù `PortsRepository.GetPaging()` có gọi; không controller nào dùng ⇒ code chết.
- **2 bug cũ phát hiện, CHƯA sửa** (ngoài phạm vi, chờ anh quyết): ① [modal-ports.html](../../src/app/shared/components/danhmuc/modal-ports/modal-ports.component.html) bind `entity.groupPortId` nhưng model/BE là `groupPort` (nvarchar(3) = `'01'`) và `bindValue="id"` (1/2/3) ⇒ **chọn Nhóm cảng không bao giờ lưu được**. ② Cột "Nhóm cảng/bãi" ở list bind `item.groupPortName` — `SP_Ports_GetAll` không trả cột này ⇒ **luôn rỗng**. Cũng vậy: ô "Từ khóa" ở list không được `loadData()` dùng.
- **Verify**: `dotnet build -t:Compile` = 0 Error; `npx ng build` = 0 error. **Anh cần**: chạy file .sql → tắt API → build/publish → `ng build` + deploy FE.

## FCL v2 — cho phép **1 điểm xuất hiện nhiều lần** trong lộ trình (nhiều công việc / quay đầu) — FE only, `ng build` 0 lỗi — 2026-07-10
Anh: *"trong 1 lệnh có nhiều công việc hoặc quay đi quay về thì 1 location xuất hiện >1 lần, hiện đang cấm, bỏ cấm."*
- **DB không hề chặn.** UNIQUE `(StartLocationId, EndLocationId)` chỉ nằm trên `Tbl_RouteSegmentDefaults` (bảng tra cung đường **mặc định** A→B — ở đó unique là đúng), KHÔNG phải `Tbl_TransportOrder_Segments` (khóa theo `OrderIndex`). ⇒ **không cần SQL/BE.**
- **Bỏ 2 chốt chặn FE** ở [modal-dispatch-order-fcl-v2.ts](../../src/app/shared/components/transports/modal-dispatch-order-fcl-v2/modal-dispatch-order-fcl-v2.component.ts): `addToRoute()` (return sớm nếu `isLocInRoute`) và `confirmAddCustomPoint()` (toast *"Điểm này đã có trong lộ trình"*).
- **Vẫn chặn lặp LIỀN KỀ (A→A)** qua `_isSameAsLastLocation()`: chặng 0 km, Vietmap không tìm được đường. Lặp cách quãng (A→B→A) hợp lệ.
- **★ Bug tiềm ẩn phải sửa kèm** — `_rebuildSegments()` tìm segment cũ bằng `existing.find(s => s.startLocationId===… && s.endLocationId===…)`, tức **theo cặp điểm**. Khi A→B lặp 2 lần, `find` luôn trả về chặng đầu ⇒ chặng sau **nuốt km/polyline/định mức dầu của chặng đầu** mỗi lần rebuild (thêm/xóa/kéo thả điểm). Đã đổi sang **ưu tiên khớp đúng vị trí `existing[i]`**, chỉ dò theo cặp khi vị trí đã đổi. Nếu không sửa, tính năng này sẽ âm thầm sai số dầu.
- **UI**: thẻ điểm ở danh sách công việc không còn bị khóa/làm mờ khi đã thêm; icon luôn là `+`, kèm badge `×N` cho biết điểm đã nằm trong lộ trình mấy lần (`locCountInRoute()` thay `isLocInRoute()`). `lastSegmentFinal` vẫn khóa như cũ.
- **Không đụng** [modal-transport-order](../../src/app/shared/components/transports/modal-transport-order/modal-transport-order.component.ts) (trang TO) — vẫn giữ cấm trùng, đúng nguyên tắc.
- ETC: mỗi chặng sinh dòng ETC auto riêng theo `_segIndex` ⇒ **quay đầu qua cùng 1 trạm 2 lần vẫn tính tiền 2 lần**, đúng thực tế.
- **Verify**: `npx ng build` = 0 error.

## Vietmap — chuyển ROUTE sang **v4** (profile theo hạng xe) + giữ route-tolls cho giá 5 hạng — BE compile 0 err + FE build 0 err, chờ deploy — 2026-07-10
Nguồn chốt: `NewAPI/routing.txt` (Agent Integration Guide của Vietmap) + đo API thật bằng key trong appsettings.
- **Kiến trúc mới** (đúng khuyến nghị Vietmap: *"Use the standalone Route-tolls … for vehicle-class BOT estimation"*): ① `GET /api/route/v4?...&vehicle={car|truck|container}&capacity=` → đường/km/instructions; ② `POST /api/route-tolls?api-version=1.1&vehicle={1..5}` ×5 → trạm + giá. **Route v3 mới là legacy**, route-tolls KHÔNG deprecated (em từng nói nhầm).
- **Vì sao không dùng `annotations=toll` của v4** (dù nó trả sẵn `toll_cost`+`tolls`): (a) tài liệu cảnh báo *"with > 2 waypoints, annotation data may be unreliable"* — mà modal cho chèn điểm trung gian; (b) v4 chỉ ra **3 mức giá** (car=hạng1 216k · truck=hạng3 412k · container=hạng5 849k), **không ra được hạng 2 (309k) / hạng 4 (659k)** — mà đội xe có **18 xe hạng 2 + 14 xe hạng 4**. Đã thử `vehicle_class`/`toll_class`/`toll_vehicle`/`class`/`weight`/`axles`/`vehicle_type` + `capacity` 1.500→40.000kg: **tất cả bị bỏ qua**.
- **Bảng hạng xe của Vietmap khớp CHÍNH XÁC danh mục BOT** (1132 `2T`→1 · 1133 `4T`→2 · 1134 `10T`→3 · 1135 `C1`→4 · 1136 `C2`→5) ⇒ `_botTypeMap` trong FE là đúng.
- **BE** [VietmapApiController.cs](../../../NewAPI/API/Controllers/Commons/VietmapApiController.cs): `RouteRequest` +`vehicleClass` (1..5, null→`car` = hành vi cũ); `MapVehicleProfile()` (2,3→`truck`+capacity 3500/9000; 4,5→`container`); đổi URL `/api/route?api-version=1.1` → `/api/route/v4`; **retry 1 lần sau 600ms** (Vietmap chặn burst, xem dưới); bỏ đoạn `encodedPolyline` chết; thêm khối `diagnostics {vehicleClass, vehicleProfile, capacity, routeDistanceM, tollDistanceM, mismatchPercent, routeMismatch}`.
- **FE**: `modal-vietmap-routes` + `modal-route-compare` (+`@Input vehicleKey`) + `modal-dispatch-order-fcl-v2._fetchTollForSegment` đều gửi `vehicleClass`; modal v2 HTML bind `[vehicleKey]="vietmapVehicleKey"` cho cả 2 modal; compare bỏ hardcode `vehicle===1`; vietmap modal **fallback** lấy trạm từ hạng bất kỳ nếu hạng của lệnh lỗi (trước đó mất sạch trạm); **debounce 800ms cho click thêm điểm** (trước bắn API tức thì → 6 request/click).
- **★ Đo được (quan trọng khi đọc `diagnostics`)**: `route-tolls` **LUÔN routing kiểu xe con** — 115,48 km + bộ trạm `[77,168]` **giống hệt cho cả 5 hạng**; còn v4 đi đường riêng: car 121,33 · truck 123,24 · container 123,28 km. ⇒ lệch **4,8–6,3% là BÌNH THƯỜNG**, ngưỡng cảnh báo đặt **>20%** (bản đầu em đặt 5% → báo động giả mọi lệnh container).
- **★ Vietmap chặn burst**: bắn 3–4 request v4 liên tiếp → **HTTP 400** dù URL hợp lệ; giãn ≥600ms → 200. Không phải quota. Nên mới thêm retry BE + debounce FE.
- **★ KM SẼ ĐỔI** (anh đồng ý vì "đang test"): cùng tuyến, v1.1 `car` **115,5 km** → v4 `container` **123,3 km** (+7,8 km ≈ **+2,7 lít dầu**). Số mới đúng hơn (đường xe cont thật) nhưng lệnh mới không so được với lệnh cũ. **Trang TO (`modal-transport-order`, 4 chỗ gọi) không truyền `vehicleClass` → vẫn `car`, nhưng km vẫn đổi vì đổi engine v1.1→v4.**
- **Sai sót em đã đính chính**: `tolls[].prices` KHÔNG phải "giá theo hạng xe" (tài liệu Vietmap ghi sai) mà là **giá theo trạm vào** — đổi `vehicle` thì cả 7 giá trị đều đổi. Và `capacity` **không có tác dụng** dù tài liệu nói bắt buộc cho `truck`.
- **Chưa dùng**: `POST /api/match-tolls` — đối chiếu vệt GPS thật ↔ trạm đã đi qua. Hợp để kiểm chứng cột "Đã tránh trạm" (hiện lái xe tự khai). Ghi lại làm sau.
- **Verify**: `dotnet build -t:Compile` = **Build succeeded, 0 Error**; `npx ng build` = **0 error**. **Anh cần**: tắt API → build/publish → chạy lại; `ng build` + deploy FE.

## FCL v2 — 3 bug tab Cung đường / modal chọn lộ trình Vietmap — FE only, `ng build` 0 lỗi, chờ deploy — 2026-07-10
Anh báo 2 triệu chứng: (a) tab Cung đường vào được khi chưa chọn xe; (b) modal **Chọn lộ trình** (KHÔNG phải So sánh) lần đầu báo "không có trạm", thêm 1 điểm mới ra trạm, và giá vé hiện là **giá nhỏ nhất** chứ không theo loại xe.
- **Verify bằng gọi thật Vietmap API** (key từ appsettings): body **2 điểm** VẪN trả đủ trạm (Đình Vũ + CT Hà Nội–Hải Phòng); body **full polyline (867 điểm)** → **HTTP 400**; 5 request song song 3 lượt → **5/5 = 200**, không rate-limit. ⇒ **BE `VietmapApiController` KHÔNG có lỗi, không sửa.** Giá theo loại xe: v1=216.000 · v2=309.000 · v3=412.000 · v4=659.000 · v5=849.000 ⇒ v1 = nhỏ nhất, khớp triệu chứng.
- **Bug #1 — "lần đầu không có trạm"**: [modal-dispatch-order-fcl-v2.ts:2396](../../src/app/shared/components/transports/modal-dispatch-order-fcl-v2/modal-dispatch-order-fcl-v2.component.ts#L2396) `showMapForSegment()` gọi `showSaved(steps, polyline)` **thiếu tham số thứ 3 `tollStations`** → chặng đã có `listWaypoints` (lộ trình mặc định/đã lưu) mở ra `tollInfo=null` → không trạm. Kéo/thêm điểm → `_fetchRoutesAndTolls()` gọi API thật → trạm hiện ra. Fix: truyền `seg.listStations`. (2 chỗ gọi `showSaved` khác — dòng 2288 xem toàn tuyến, 2753 cung phát sinh — vốn đã truyền đủ.)
- **Bug #2 — giá vé = loại 1**: [modal-vietmap-routes.component.ts](../../src/app/shared/components/danhmuc/modal-vietmap-routes/modal-vietmap-routes.component.ts) hardcode `res.toll.find(x => x.vehicle === 1)` cho `allStations` + `station.cost`. Modal **không hề nhận loại xe**. Fix: `@Input() vehicleKey` (1..5, default null→fallback 1); modal v2 truyền qua getter public `vietmapVehicleKey` (`_vehicleBotTypeId` → `_botTypeMap`); bảng "Biểu phí theo loại xe" **tô xanh + badge "Xe của lệnh"** dòng đang áp; nhãn nguồn giá cạnh tổng phí.
- **Bug #3 (ẩn, phát hiện thêm)**: `vehicleCosts.find(c => c.v === 1)` — object map ra **không có field `v`** → `totalCost` LUÔN `'0'`. Vì `'0'` là chuỗi truthy nên cả 2 nhánh badge (`totalCost && !=='0'` và `!totalCost`) đều false ⇒ **hàng tổng phí không bao giờ hiện**. Fix: thêm `v` + `isActive` vào `VehicleCostRow`, tính `activeTotal` theo `vehicleKey`; HTML đổi điều kiện badge sang `stationCount > 0` / `=== 0`.
- **YC tab mờ**: [html:411](../../src/app/shared/components/transports/modal-dispatch-order-fcl-v2/modal-dispatch-order-fcl-v2.component.html#L411) `<tab [heading]="routeTabHeading" [disabled]="!canOpenRouteTab">`. Lý do: loại BOT của xe quyết định giá vé; vào tab sớm → mọi trạm về 0.
- **YC xe thiếu BOT (2026-07-10)**: cảnh báo + cấm chọn cung đường. **Verify DB**: 467 xe → **11 xe `VihicleTypeBotId` NULL** (xe nâng/xưởng/"ĐỘI XE") + **19 xe đầu kéo THẬT mang id mồ côi 478/479/480/482** (không có trong `OtherCategories Type='BOT'`, danh mục chỉ có 1132–1136) → `_botTypeMap` không map → giá 0. Tổng **30/467 (6,4%)** dính. ⇒ `vehicleBotMissing` = `vehicleId && !vehicleLoading && vietmapVehicleKey===null` (bắt CẢ 2 loại, không chỉ NULL).
  - **Mức khóa (anh chốt)**: lệnh **MỚI** thiếu BOT → tab mờ hẳn (`canOpenRouteTab` = `vehicleId && (!botMissing || !!refNo)`); lệnh **đã có refNo** → vào tab XEM lộ trình cũ được, nhưng 3 nút Chọn/Tính lại + So sánh + Thêm cung phát sinh bị `[disabled]` (`routeToolsDisabled`) + banner đỏ. Tránh chặn 19 xe đầu kéo đang chạy.
  - Toast lỗi ngay trong `loadVehicle()` khi phát hiện thiếu BOT; guard TS `_blockRouteTools()` ở `editSegmentRoute`/`openCompareModal`/`openExtraSegmentPopup` (nút disabled có thể bị bỏ qua).
  - ⚠️ **Nợ dữ liệu**: 19 xe đầu kéo cần gán lại loại BOT (nên là `1135` C1 hoặc `1136` C2) — anh sửa ở Danh mục > Phương tiện, KHÔNG có SQL nào trong đợt này. `_botTypeMap` vẫn hardcode id 1132–1136; nếu danh mục BOT đổi id thì phải sửa FE (cân nhắc map theo `CategoryCode` 2T/4T/10T/C1/C2).
- **KHÔNG đụng**: BE `VietmapApiController`, `modal-route-compare`, và `modal-transport-order.ts:485` — **dính đúng bug #1 y hệt** nhưng là trang TO ([[feedback_no_touch_fcl_legacy]]), chờ anh cho phép mới sửa.
- **Verify**: `npx tsc --noEmit` exit 0; `npx ng build` **0 error**. **Anh cần**: `ng build` + deploy FE, không cần deploy API.

## Bút toán đối ứng (P5.0) — thiết kế + SQL nền tảng sổ cái, CHỜ ANH DUYỆT + CHẠY — 2026-07-10
Yêu cầu: chứng từ (Phiếu thu/chi, Tạm ứng, Thanh toán) tự sinh bút toán Nợ/Có; tra số dư theo TK; validate ΣNợ=ΣCó. Verify DB read-only trước khi thiết kế.
- **Hiện trạng đo được:** `AccountingDetail` **44.966 dòng** (treo vào `Accounts` 183.103 phiếu thu/chi), kế toán **gõ tay**; **0/44.966 dòng có DebitAmount≠CreditAmount** → thực tế luôn là cặp Nợ/Có 1-1. Danh mục TK = `OtherCategories Type='ACCOUNTING'` (**76 TK cấp 1**, `CategoryName` trùng mã, **thiếu 1331/1388**). `Fee` 545 mã chỉ **18** có TK Nợ / **16** có TK Có. `PaymentDetail` 556.781 dòng **0** dòng có DebitAccount. **Không** có auto-generate phiếu từ Advance/Payment (`IAccount` chỉ inject vào `AccountsController`). Validate ΣNợ=ΣCó chỉ ở FE (`modal-phieu-chi.ts:299` `setDinhKhoan`/`flagDinhKhoan`), API bypass được.
- **3 quyết định chốt (AskUserQuestion 2026-07-10):** (1) **bảng mới song song**, không đụng `AccountingDetail`/TVP/4 SP legacy; (2) **chỉ ghi sổ chứng từ mới từ go-live**, không hồi tố 94.018 Advances + 337.546 Payments + 183.103 Accounts; (3) sửa/xóa → **bút toán đảo**, không xóa dòng ⇒ **bỏ** `Tbl_AccountingPeriod` + SP `_Unpost` khỏi P5.0.
- **SQL (chờ chạy)** `NewAPI/Migration_AccountingEntry_P50_20260710.sql`: 3 bảng `Tbl_AccountingEntry` (header, unique filtered index `(DocType,DocId,EventCode) WHERE Status=1 AND ReversalOfEntryId IS NULL` = idempotent) + `Tbl_AccountingEntryLine` (**1 cột `Amount` DECIMAL(18,2)** thay vì tách Debit/CreditAmount ⇒ ΣNợ=ΣCó **đúng theo cấu trúc**; + chiều phân tích JobId/Shipment/Customer/Supplier/Employee/FeeId/GroupFeeCode/AccountListId) + `Tbl_AccountingRule` (bảng ánh xạ = Phụ lục 6.4, `DebitSource/CreditSource` = FIXED|FEE|FUND); TVP `TypeAccountingEntryLine`; 6 SP `SP_AccountingEntry_Post` (idempotent + validate `SUM(Amount)=@ExpectedAmount`, chặn số tiền ≤0) / `_Reverse` (đảo Nợ↔Có, set gốc Status=2) / `_GetTrialBalance` (GROUP BY TK → ΣNợ−ΣCó) / `_GetLedger` (sổ cái + cột TK đối ứng miễn phí) / `_GetJournal` (nhật ký chung) / `SP_AccountingRule_GetAll`.
- **★ Gỡ blocker A2 (Phụ lục 6.4 trống):** seed 19 rule rút từ chính 44.966 dòng lịch sử — 12 rule có bằng chứng (141/111 = 16.485 dòng chi tạm ứng tiền mặt; 331/112 = 9.521; 141/112 = 4.198; 112/131 = 2.166; 642/111+112 = 1.658; 112/244 = 611…) đặt `IsActive=1`; 7 rule suy đoán (244/811/1388/1331, PAYMENT_SETTLE_ADVANCE, ONBEHALF 131) đặt **`IsActive=0` chờ kế toán duyệt**.
- **KHÔNG đụng:** `Accounts`, `AccountingDetail`, TVP `@AccountingDetails`, `SP_Accounts_Create/_CreateNew/_Update/_Delete/_CreateForDriver`, `SP_Accounting_Debit_Credit(_Detail)`, `SP_Advances_*`, `SP_Payments_*`, modal-phieu-chi/thu. Ghi sổ gọi từ **BE sau khi SP legacy commit**.
- **Anh cần:** ⬜ đọc + duyệt file SQL → chạy (login `delta.erp`). Chưa có BE/FE — chờ SQL chạy xong.

## Chốt dầu lái xe — "Tiền lái xe được hưởng 90%" khi CHI cho lái xe + Bằng chữ theo 90% — FE only, tsc sạch, chờ ng build — 2026-07-09
Anh chốt: khi chốt dầu mà **phải trả tiền cho lái xe** (NET>0 = "Chi tiền cho lái xe") thì lái xe **chỉ hưởng 90%** (giữ lại 10%). NET<0 (thu tiền lái xe) không áp.
- **FE** [modal-vehicle-fuel-closing](../../src/app/shared/components/transports/modal-vehicle-fuel-closing/): TS +`driverEntitledRate=0.9` + getter `entitledAmount()` (net>0 → `0.9×|netAmount|`, net≤0 → null); HTML thêm **1 dòng dưới TỔNG** "Tiền lái xe được hưởng (90% — giữ lại 10%)" chỉ hiện khi `netLiters>0`; `amountInWords()` đổi đọc theo `entitledAmount() ?? |netAmount|` (Bằng chữ khớp 90% khi chi). tsc 0 lỗi mới.
- **Lưu ý:** `netAmount` DB vẫn lưu **100% (gộp)**; 90% chỉ tính lúc hiển thị. `SP_DriverFuelClosing_Approve` **KHÔNG sinh phiếu chi** (chỉ set cờ summary + Status=1) nên không lệch. Khi nào làm **thực chi/báo cáo phải trả lái xe** phải lấy `entitledAmount` (90%), không lấy thẳng netAmount — nếu cần chốt cứng thì thêm cột `EntitledAmount` (chờ SQL duyệt).
- **Anh cần**: `ng build` (gộp chung). Test: phiếu chốt có NET>0 → thấy dòng 90% dưới TỔNG + Bằng chữ = 90%.

## ERP list Thanh toán — fix `QuotaExceededError` localStorage khi load cả năm — FE only, tsc sạch, chờ ng build — 2026-07-09
Bug: list Thanh toán load cả năm rồi click 1 item → `QuotaExceededError: setItem 'PAYMENT' exceeded quota`. Gốc: `edit()` nhét **nguyên `groupedItem`** (toàn bộ list nhóm + mọi dòng) vào `localStorage['PAYMENT']` (~vài MB > 5MB), trong khi `ngOnInit` chỉ dùng lại để **nhớ nhóm mở/đóng** (match `key`+`isExpanded`).
- **FE** [payment.component.ts:484](../../src/app/main/advance-payment/payment/payment.component.ts#L484): thay `groupedItem: this.groupedItem` → `(this.groupedItem ?? []).map(g => ({ key: g.key, isExpanded: g.isExpanded }))` → payload từ vài MB xuống vài KB; giữ nguyên tính năng khôi phục nhóm mở/đóng. Quét cả module: chỉ list này dính (payment-accept-step1 đã comment sẵn, payment-accept không lưu). tsc 0 lỗi mới.
- **Anh cần**: `ng build`. Test: load cả năm → click phiếu → vào detail không báo quota; back giữ đúng nhóm mở.

## Draft site — picker lô 3 form (Công việc/Thanh toán/Debit) đổi sang LÔ NHÁP đã promote — ✅ ĐÃ DEPLOY draft-web + TEST OK (2026-07-11) — 2026-07-09
Anh chốt phương án B: người nhập làm **trọn gói trong site nháp** — picker lô 3 form không lấy lô ERP nữa mà lấy **lô nháp `status=Promoted` của chính họ**, dùng `promotedShipmentId→shipmentId` + `promotedRefNo→jobId` (bảng nháp đã trả sẵn 2 cột này từ migration 2026-06-18).
- **FE draft-web** [lookup.service.ts](../../../draft-web/src/app/core/lookup.service.ts): +hàm dùng chung `promotedDraftShipments(customerId)` — `draft.getPaging({draftType:'Shipment',status:'Promoted'})`, lọc dòng có `promotedShipmentId`, map id/jobId + field hiển thị parse từ Payload (loại hình resolve `SHIPMENT_T02`), lọc theo customerId. 3 form ([workflow-form](../../../draft-web/src/app/workflow/workflow-form.ts)/[payment-form](../../../draft-web/src/app/payment/payment-form.ts)/[debit-form](../../../draft-web/src/app/debit/debit-form.ts)) đổi `shipmentsForDebitNotes`→`promotedDraftShipments` (debit nhánh **sửa** giữ `shipmentDetail`). Giữ nguyên `shipmentsForDebitNotes` (chưa xóa) để dễ chuyển sang phương án C gộp 2 nguồn nếu cần. tsc app 0 lỗi.
- ✅ **ĐÃ DEPLOY draft-web + DraftAPI, test E2E OK (2026-07-11)**: tạo lô nháp → promote → form Công việc/TT/Debit chọn KH → tìm lô thấy lô vừa promote với JobId thật.

## FCL v2 tab Chi phí — lọc gọn dropdown phí lái xe qua JSON tĩnh (9 phí + cờ actived) — FE only, tsc sạch, chờ ng build — 2026-07-08
Anh chốt (mục 4 thiết kế "3 loại chi phí lái xe"): **trước mắt dùng file JSON tĩnh** ở **FE assets** (không dùng bảng DB `Tbl_DispatchOrderFCLFeeConfig`), phạm vi giai đoạn này **chỉ danh sách phí + `actived`** (chưa DocType/VAT — form động 3 loại chứng từ để sau, cùng đợt SQL TVP V2).
- **JSON** [src/assets/config/driver-fcl-fees.json](../../src/assets/config/driver-fcl-fees.json): 9 phí anh đưa (`id/feeCode/feeName/actived/displayOrder`) — CP02036 dầu DO mua ngoài, CP02034 đặt cọc vỏ cont, CP03057 cân xe, CP02044 bến bãi, CP02039 vận tải thuê ngoài, CP02037 dầu cấp phiếu, CP02056 đường cấm, CP03014 nâng hạ cont, CP01050 phụ cấp ngoài giờ. Đặt `actived:false` để tạm ẩn 1 phí (không xóa).
- **FE** [modal-dispatch-order-fcl-v2](../../src/app/shared/components/transports/modal-dispatch-order-fcl-v2/): +`listDriverFee` + `loadDriverFee()` (đọc JSON qua `_http`, lọc `actived`, sort `displayOrder`, format `feeName=feeCode-tên`, fallback về `listFee` nếu đọc lỗi), gọi trong ngOnInit sau `loadFee()`; HTML tab **Chi phí** ng-select đổi `[items]="listFee"`→`[items]="listDriverFee"` (chỉ tab này; các ng-select khác giữ catalog đầy đủ). tsc 0 lỗi mới.
- **Anh cần**: `ng build` (gộp chung đợt). Test: mở lệnh FCL v2 → tab Chi phí → dropdown chỉ 9 phí đúng thứ tự; sửa JSON + build lại để ẩn/thêm phí.

## Chốt dầu phương tiện — bổ sung B (dầu còn thừa Type=2) + đồng bộ demand đúng GetForSummary — SQL ĐÃ CHẠY + BE/FE built — 2026-07-07
Bug: chốt dầu phương tiện (`modal-vehicle-fuel-closing`, F039) không lấy đủ dữ liệu. Chẩn đoán (xe 34 / T6): SP `SP_DriverFuelClosing_GetCandidates` **thiếu hoàn toàn B** (dầu còn thừa phiếu cấp theo lệnh Type=2) và **C (demand) lệch** so với `SP_DispatchOrder_GetForSummary` (nguồn máy phát lọc sai cờ `IsSummarized` thay vì `IsGeneratorSummarized`, thiếu tách `MergeJobId='GENERATOR'`). Công thức nghiệp vụ chốt với anh: **A**=Σ igas Type=0 (cấp dầu xe nhà); **B**=Σ(`Quantity−QuantityIgas`) Type=2 (dầu còn thừa, không bao giờ âm); **C**=Σ định mức lệnh (VC+FCL Tongdau+phát sinh+FCL máy phát) đã duyệt, CHƯA summary, KHÔNG nằm phiếu cấp theo lệnh; **NET=B+C−A**; NET<0→phiếu **thu** tiền lái xe, >0→**chi**.
- **SQL** ✅ ĐÃ CHẠY `NewAPI/Migration_DriverFuelClosing_LeftoverB_20260707.sql`: ① ALTER `Tbl_DriverFuelClosing` +cột `LeftoverQty` (idempotent); ② `SP_DriverFuelClosing_GetCandidates` thêm **nguồn 6=B** (Type=2, `Quantity−QuantityIgas>0`, guard chưa closing) + viết lại nguồn 2/3/4/5 (C) đúng y GetForSummary (nguồn 5 đổi `IsGeneratorSummarized` + `MergeJobId='GENERATOR'`) + **fallback JOIN `Vihicle`/`Employee`** (`ISNULL(a.DriverName,e.EmployeeFullName)`/`ISNULL(a.LicensePlate,v.LicensePlates)`) cho nguồn 1/6 khi cột denormalized NULL; ③ `_Create` net=`(C−A)+B`, lưu `LeftoverQty`; ④ `_Approve` nguồn 3→`IsSummarized`, **nguồn 5→`IsGeneratorSummarized`** (không dùng chung), nguồn 6→`IsFuelClosing`; ⑤ `_GetById` trả thêm `LeftoverQty`.
- **BE** [DriverFuelClosingViewModel.cs](../../../NewAPI/API/ViewModels/Transports/DriverFuelClosingViewModel.cs) +`LeftoverQty` (cần redeploy).
- **FE** [driver-fuel-closing.model.ts](../../src/app/shared/models/transports/driver-fuel-closing.model.ts) +`leftoverQty` +nguồn 6; [modal-vehicle-fuel-closing](../../src/app/shared/components/transports/modal-vehicle-fuel-closing/): `recalcSummary` net=**B+C−A** (re-sign bucket = định mức−cấp), `sourceLabel` +6, `directionLabel` NET<0→"Thu tiền lái xe"/>0→"Chi", HTML thêm dòng "Dầu còn thừa" + đảo màu (net<0 đỏ). tsc 0 lỗi.
- **KHÔNG đụng FCL cũ/luồng khác:** module riêng, chỉ ĐỌC FCL/DispatchOrder; Approve set cờ summary như vốn có. Verify xe 34/T6: A=175.37, B=21.47, C=0 → NET=−153.90 → thu 153.90 lít.

## 3-bug FCL v2 (báo cáo đánh giá) — #1 cung phát sinh không vào tổng · #3 tải trọng màn lái xe · #10 VAT ETC — SQL + FE, chờ chạy SQL + ng build — 2026-07-07
Từ báo cáo "Đánh giá triển Lệnh vận chuyển.pdf". 3 bug độc lập workflow, đã truy gốc rễ bằng subagent + verify DB.
- **Bug #1** (cung đường phát sinh KHÔNG cộng Tổng Km/Tổng dầu/Chi phí dầu — lệch 2km/0.4 lít): 2 lỗi. (1a) `SP_DispatchOrderFCL_CreateWithTO`/`UpdateWithTO` tự SUM lại 3 cột CHỈ từ `@ListSegments` → ghi đè, xoá extra. (1b) `SP_DispatchOrderFCL_GetAll` (list dùng chung) tính TongKm từ cột legacy → lệnh mới=0. **SQL** `NewAPI/Migration_FCL_Bug1_ExtraSegmentTotals_20260707.sql`: thêm `EXEC SP_TransportOrder_RecomputeTotals @ToId` trước COMMIT ở 2 SP WithTO (Create đặt sau SELECT output NewToId); GetAll bọc `CASE WHEN IsLegacy=1 THEN <công thức legacy nguyên văn> ELSE m.TongKm` (**legacy giữ 100%**). **FE (D)** [modal-dispatch-order-fcl-v2.ts](../../src/app/shared/components/transports/modal-dispatch-order-fcl-v2/modal-dispatch-order-fcl-v2.component.ts): `calculateTotal`/`calulateOilSegments` cộng thêm km+dầu `extraSegments` để tổng modal khớp list. User duyệt sửa trực tiếp 2 SP WithTO ("đang thử nghiệm").
- **Bug #3** (tải trọng màn lái xe sai): `modal-execute-fcl` in thẳng `seg.payloadWeight` = **ID bậc định mức dầu**, không phải trọng tải. Sửa: nạp `listOilQuota` theo `vehicleId` (`VihicleService.getDetail`) + helper `payloadLabel()` → 2 cột "Tải trọng" (chặng chính + cung phát sinh) hiện **tên bậc** ("18-20 tấn"). User chốt cột này = tên bậc định mức.
- **Bug #10** (VAT vé ETC=0): **no-op** — bảng ETC đã đúng ý anh (cột Số tiền=trước VAT + VAT nhập tay mặc định 0 + Tổng=cost+vat). Bỏ hướng bóc 8/10%.
- tsc 0 lỗi. **Anh cần**: chạy SQL bug#1 + `ng build`. Test lệnh có cung phát sinh → list ra 387km/115.30 lít (thay 0/114.90); màn lái xe cột tải trọng ra tên bậc.

## FCL — nút CHỐT LỆNH ở list gate nhầm quyền (FCL_ACCOUNT → FCL_CLOSING), khớp modal — FE 3 dòng, chờ ng build — 2026-07-06
Nút **CHỐT LỆNH theo dòng** ở list FCL cũ (cột Tác vụ, hiện khi `status==5`) gate nhầm `account_permission` (**FCL_ACCOUNT** — vốn là quyền chốt B2/status==3), nên ai có FCL_CLOSING mà thiếu FCL_ACCOUNT thì mất nút. Modal cùng chức năng ([modal-dispatch-order-fcl.html:1058/1061](../../src/app/shared/components/transports/modal-dispatch-order-fcl/modal-dispatch-order-fcl.component.html#L1058)) đã gate đúng `closing_permission` (**FCL_CLOSING**). Anh duyệt sửa list cho khớp modal (2026-07-06).
- **FE** (chỉ list cũ, KHÔNG đụng modal/list mới): [dispatch-order-fcl.component.ts](../../src/app/main/transports/dispatch-order-fcl/dispatch-order-fcl.component.ts) +biến `closing_permission` = `hasPermission("FCL_CLOSING") || adminPermission`; [dispatch-order-fcl.component.html:172](../../src/app/main/transports/dispatch-order-fcl/dispatch-order-fcl.component.html#L172) đổi gate nút CHỐT LỆNH `account_permission`→`closing_permission` (điều kiện `closing_permission && item.status==5`). `account_permission` giữ nguyên vai trò chốt B2.
- **Anh cần**: `ng build` + deploy FE. Test: user có FCL_CLOSING (không FCL_ACCOUNT) → thấy nút CHỐT LỆNH ở dòng status==5; Admin vẫn thấy.

## FCL list MỚI (`dispatch-order-fcl-new`) — bổ sung lối chốt lệnh (thiếu hẳn trước đó) — FE, chờ ng build — 2026-07-06
List FCL mới có sẵn logic chốt trong TS (`chotlenhMulti()`, `chotlenh()`, `checkClosing()`/`flagChecked`, modal `modal-closing-fcl-process` đã mount) nhưng **HTML chưa có nút nào gọi** → không chốt được. Anh duyệt bổ sung **cả 2 lối** (AskUserQuestion 2026-07-06), gate **FCL_CLOSING** (khớp modal + list cũ).
- **FE** ([dispatch-order-fcl-new.component.ts](../../src/app/main/transports/dispatch-order-fcl-new/dispatch-order-fcl-new.component.ts) +biến `closing_permission`=`hasPermission("FCL_CLOSING")||adminPermission`): (1) toolbar +nút **"Chốt lệnh"** hàng loạt (`dof-btn--chot`, `[disabled]="!flagChecked"`, `appPermission FCL/CLOSING` → `chotlenhMulti()`); (2) bảng +cột **"Tác vụ"** + nút **"Chốt lệnh"** theo dòng (`dof-btn--chot dof-btn--sm`, `*ngIf="closing_permission && item.status==5"` → `chotlenh(item)`, có `$event.stopPropagation()`). Kích hoạt `chotlenh()` vốn là dead code. tsc sạch.
- **Anh cần**: `ng build` + deploy. Test: tick nhiều dòng status==5 → nút "Chốt lệnh" toolbar sáng → mở modal chốt hàng loạt; hoặc bấm "Chốt lệnh" ở 1 dòng status==5 → chốt lẻ (status=6); user thiếu FCL_CLOSING (không Admin) → cả 2 nút ẩn.

## Chấm công (F044) — "Nữ nuôi con nhỏ +60p" đặt trên hồ sơ NV — SQL ĐÃ CHẠY + BE/FE xong (tsc sạch, C# compile sạch), chờ tắt API build + ng build + test — 2026-07-03
Chốt hướng: "nuôi con nhỏ" là **thuộc tính hồ sơ NV** (KHÔNG dùng loại lịch NUOICON của F047 đang hoãn). HR check ở Danh mục NV (modal **Hồ sơ HR**) + điền ngày sinh con; engine tự cộng quỹ 60p/ngày (muộn trước, dư tới sớm) tới khi con tròn 12 tháng (chặn kép). Chạy được ngay trong **F044 lõi**, không cần mở F047. Chốt pháp lý: chỉ nữ **nuôi con <12 tháng** +60p; phụ nữ **mang thai KHÔNG** mặc nhiên hưởng.
- **SQL** ✅ ĐÃ CHẠY `NewAPI/Migration_OfficeAttendance_NursingChild_20260703.sql`: (1) ALTER `Employee` +`IsNursingChild BIT`/`ChildBirthDate DATE` (idempotent); (2) DROP+CREATE `SP_OfficeAttendance_Calculate` (bản 06-14 + cột `Flex`=60 khi con<12th + block 5.6a2 trừ quỹ → tự chảy vào bậc phạt + cờ ½ ngày); (3) DROP+CREATE `SP_Employee_GetByIdHR/CreateHR/UpdateHR` mang 2 field (SP MỚI F045, KHÔNG đụng SP Employee cũ).
- **BE** ([Employee.cs](../../../NewAPI/API/Models/Categories/Employee.cs) +2 field; [EmployeeRepository.cs](../../../NewAPI/API/Repositories/Categories/EmployeeRepository.cs) `AddHRParams` +2 p.Add, `ChildBirthDate` parse dd/MM/yyyy y `DateOfBirth`; ViewModel kế thừa Employee nên tự có; controller truyền thẳng — không sửa). C# compile sạch (2 "error" chỉ là khóa API.dll do IIS chạy).
- **FE** ([employee.model.ts](../../src/app/shared/models/employee.model.ts) +`isNursingChild`/`childBirthDate`; [modal-employee-hr](../../src/app/shared/components/danhmuc/modal-employee-hr/): `childOptions`, load `_toVn(childBirthDate)`, `selectedChild()`, `onToggleNursing()` bỏ tick→xóa ngày; HTML **section G "Chế độ chấm công"** checkbox "Đang nuôi con nhỏ (+60p)" + datepicker "Ngày sinh của con" (`*ngIf` khi tick, required)). tsc sạch.
- **Dọn**: file F047 `Migration_OfficeAttendance_Schedule_20260623.sql` đã đổi `THAISAN→NUOICON` (nhưng hướng này BỎ — nguồn nuôi con nhỏ giờ ở Employee; F047 vẫn hoãn).
- **Anh cần**: (1) **tắt API** → `dotnet build`/publish → chạy lại (khóa DLL); (2) `ng build` + deploy FE. Test: Danh mục NV → **Hồ sơ HR** 1 NV → Tab "Thông tin chung" mục G tick "Đang nuôi con nhỏ" + chọn ngày sinh con → Lưu → mở lại giữ đúng; chạy **Tính** chấm công tháng có ngày con <12th → NV đó được miễn tối đa 60' muộn/sớm mỗi ngày; bỏ tick → xóa ngày, lần tính sau không còn +60p.

## Draft — SỬA nháp trong ERP trước khi promote (5 modal: Lô thường/Canon/PCCV/Thanh toán/Debit) — BE build 0 err + FE tsc sạch, chờ redeploy API + ng build — 2026-07-02
Bổ sung khả năng người duyệt **sửa dữ liệu nháp ngay trong ERP** rồi mới "Xác nhận chuyển sang ERP". Trước đó modal xem nháp read-only hoàn toàn (`flagXem=true`). User chốt (AskUserQuestion 2026-07-02): **nút "Lưu nháp" riêng** (ghi ngược draft, chưa promote) + **làm cả 4 (thực tế 5 modal)**. **KHÔNG SQL mới** — SP `draft.SP_DraftEntries_Update` đã có sẵn (DraftAPI dùng), ERP login db_owner EXEC được.
- **BE** (additive, KHÔNG đụng SP): [IDraft](../../../NewAPI/API/Interfaces/IDraft.cs)/[DraftRepository](../../../NewAPI/API/Repositories/DraftRepository.cs) +`UpdateDraft(id, payloadJson, customerName, totalAmount, refHint)` → gọi `draft.SP_DraftEntries_Update` với **`@UpdatedBy=NULL`** (bỏ guard chủ-tạo vì người duyệt ERP ≠ người tạo nháp; SP vẫn tự guard `Status='Draft'`+`IsDeleted=0`). VM `DraftUpdateRequest` + endpoint `POST /api/draft/updateDraft` ([DraftController](../../../NewAPI/API/Controllers/DraftController.cs), chỉ check token; rows=0 → trả 409 "đã promote/xóa"). Gate quyền để ở FE (nút Sửa ẩn/hiện theo `*_UPDATE`).
- **FE service** [draft.service.ts](../../src/app/shared/services/draft.service.ts): interface `DraftUpdateRequest` + `updateDraft(req)` POST `/api/draft/updateDraft`.
- **5 modal** (reuse modal thật, thêm chế độ sửa nháp — KHÔNG đụng luồng add/edit/save thật):
  - Mỗi modal +`_isDraftEdit`/`_canEditDraft` (suy quyền: SHIPMENT/JOBCANON/PAYMENT/DEBITNOTES/WORKFLOW `_UPDATE`), +`@Output() SavedDraft`, +`editDraft()` (mở khóa `flagXem=false`, giữ `_isDraftView=true` nền vàng; debit thêm `flagLocked=false` mở bảng phí), +`saveDraft()` (dựng payload = entity đã sửa; ngày ghi CHUẨN NHÁP dd/MM/yyyy(+HH:mm:ss) — dùng holders `_*Date` sẵn có, workflow bind ngày trực tiếp entity nên serialize thẳng → `updateDraft` → toast + về read-only + emit SavedDraft, GIỮ modal mở). Reset `_isDraftEdit=false` ở add()/edit()/viewDraft().
  - **HTML**: nút **"Sửa nháp"** (`_isDraftView && !_isDraftEdit && _canEditDraft`) + **"Lưu nháp"** (`_isDraftView && _isDraftEdit`) đặt trước nút "Xác nhận chuyển sang ERP"/"Duyệt"; nút Lưu THẬT thêm guard `&& !_isDraftView` (shipment/canon/workflow; payment/debit vốn đã `!_isDraftView`).
  - **Guard Enter-submit**: thêm `if (this._isDraftView) return;` đầu hàm lưu thật (`saveChange`/`save`) của cả 5 modal — chặn nhấn Enter khi đang xem/sửa nháp vô tình tạo phiếu thật (luồng thật `_isDraftView=false` nên vô hại).
  - Files: [modal-shipment](../../src/app/shared/components/shipments/modal-shipment/), [modal-job-canon](../../src/app/shared/components/canon/modal-job-canon/), [modal-payment-detail](../../src/app/shared/components/advance-payment/modal-payment-detail/), [modal-debit-notes](../../src/app/shared/components/shipments/modal-debit-notes/), [modal-workflow](../../src/app/shared/components/workflows/modal-workflow/).
- **5 list** wire `(SavedDraft)="onSavedDraft()"` → `loadData()` refresh nền (KHÔNG đóng modal): shipment-normal, job-canon, payment, debit-note, workflow.
- **Verify**: `dotnet build` NewAPI = **0 error** (997 warning cũ); `tsc --noEmit` = không lỗi mới ở file đã sửa (chỉ lỗi cũ spec/driver-fuel-closing).
- **Lưu ý cột phẳng**: `saveDraft` truyền `customerName`/`totalAmount`/`refHint` best-effort từ entity (payment/debit có totalAmount; shipment/canon/workflow totalAmount=null). SP ghi đè cột phẳng → nếu draft-web list dựa cột phẳng có thể lệch nhẹ; ERP list đọc payload nên không ảnh hưởng.
- **Anh cần**: (1) **tắt API** → `dotnet build`/publish → chạy lại (khóa DLL); (2) `ng build` + deploy FE. Test: mở nháp (Lô/Canon/PCCV/TT/Debit) → **Sửa nháp** (form vàng mở khóa) → đổi field/chi tiết → **Lưu nháp** → toast "Đã lưu nháp", list refresh, mở lại nháp thấy số liệu đã sửa; rồi **Xác nhận chuyển sang ERP** tạo phiếu thật đúng số đã sửa. Kiểm quyền: user không có `*_UPDATE` KHÔNG thấy nút "Sửa nháp".

## Draft — Debit view ở ERP + PROMOTE thật Payment & Debit (`AddFromDraft`) — BE build 0 err + FE tsc sạch, chờ redeploy API + ng build — 2026-07-01
Nối nốt 2 mảnh còn thiếu của Draft Site tài chính: (1) xem nháp **Debit** trong ERP (reuse `modal-debit-notes`), (2) **duyệt nháp → tạo phiếu thật** cho cả Payment lẫn Debit (thay placeholder). Clone y hệt pattern Shipment/Workflow `AddFromDraft`. **KHÔNG SQL mới** (`GetForPromote`/`MarkPromoted` generic theo draftId; `SP_DraftEntries_GetForErp_GetPaging` đã filter `@DraftType='Debit'` sẵn).

### Debit view ở ERP — reuse `modal-debit-notes` (mirror Payment/Workflow)
- [modal-debit-notes](../../src/app/shared/components/shipments/modal-debit-notes/modal-debit-notes.component.ts): +`_isDraftView`/`_draftId`, +`@Output() ApproveDraft`, +`viewDraft(payload,draftId)` (parse JSON→`entity`+`listDetail`, `flagXem/flagLocked=true`, parse ngày khoan dung `DD/MM/YYYY`+ISO, seed `listShipments`+`_thongTinLoHang` từ payload, `loadChiPhi`/`loadEmployee`, KHÔNG gọi getDetail), `_isDraftView=false` đầu `edit()`. HTML `[class.draft-view]` nền vàng + badge **NHÁP #id** + nút **"Xác nhận chuyển sang ERP"**. CSS `.draft-view`/`.draft-badge` (#FFFDF5/#FFC107/#FFF8E1).
- [debit-note list](../../src/app/main/shipments/debit-note/debit-note.component.ts): `loadData` = `forkJoin({erp: getPaging, draft: draftService.getPagingForErp({draftType:'Debit',...})})` (draft `catchError`→[]), `mapDraftToDebitRow` (payload→row `_isDraft/_draftId/_draftPayload`, `debitNo='NHÁP'`), `[...draftRows,...erpItems]`; `clickRow` guard `_isDraft`; badge "Nháp #" → `showDraft`→`viewDraft`. CSS `.row-draft` vàng. **Không cần BE redeploy cho phần view** (endpoint `getPagingForErp` generic đã live).

### PROMOTE thật Payment + Debit — endpoint `AddFromDraft` (BE cần redeploy)
- **BE** (clone `ShipmentController.AddFromDraft`, KHÔNG đụng Create cũ):
  - [PaymentsController.AddFromDraft](../../../NewAPI/API/Controllers/AdvanceAndPayments/PaymentsController.cs) (+inject `IDraft`): guard token → parse draftId → `GetForPromote` idempotent (đã Promoted → trả phiếu cũ) → `CreatedAsync(Payments)` → `MarkPromoted(draftId, result.RefNo, result.Id, reviewer)` best-effort → trả `{paymentId, refNo, alreadyPromoted}`. `[ClaimRequirement(PAYMENT, CREATE)]`.
  - [DebitNoteController.AddFromDraft](../../../NewAPI/API/Controllers/Shipments/DebitNoteController.cs) (+inject `IDraft`): tương tự → `MarkPromoted(draftId, result.DebitNo, result.Id, ...)` → `{debitId, debitNo, alreadyPromoted}`. `[ClaimRequirement(DEBITNOTES, CREATE)]`. (Payment `CreatedAsync`→`Payments{Id,RefNo}`; Debit `CreatedAsync`→`DebitNotes{Id,DebitNo}`.)
- **FE**:
  - `payments.service`/`debit-notes.service`: +`addFromDraft(entity,draftId)` → POST `/api/payments/addFromDraft` | `/api/debitnote/addFromDraft` (FromBodyBase: `item=entity`, `id=draftId`).
  - `modal-payment-detail`/`modal-debit-notes`: `approveDraft()` → confirm → `_doApproveDraft()` dựng entity giống `save()` (ngày→CLIENTDATE, details lọc `feeId`, `id=undefined`) → gọi service → success emit `ApproveDraft`+hide (KHÔNG đụng `save()` thật).
  - `payment.component`/`debit-note.component`: `onConfirmPromote` → đóng modal + `loadData()` (bỏ toast placeholder; nháp biến mất, phiếu/debit thật hiện).
- **Validate promote MINIMAL** (giống Shipment): Payment cần `shipmentId||workflowId` + ≥1 mã phí; Debit cần `shipmentId` + ≥1 chi tiết. KHÔNG replicate check "ngày doanh thu trong tháng"/"job đã khóa" của Create thật (reviewer đã duyệt).
- **Verify**: `dotnet build` NewAPI = 0 error (997 warning cũ); `tsc --noEmit` web-app-update = exit 0.
- **Anh cần**: (1) **tắt API** đang chạy → `dotnet build`/publish → chạy lại (khóa DLL khi đang chạy); (2) `ng build` + deploy FE. Rồi test: list Debit "Nháp #" mở modal vàng; nút "Xác nhận chuyển sang ERP" ở cả Payment/Debit tạo phiếu thật + nháp biến mất + reload. Idempotent (bấm 2 lần không tạo trùng).

## Draft view ở ERP — REUSE modal phiếu thật + cờ `isDraft` (Payment + Workflow) — FE, tsc sạch, chờ build/deploy — 2026-06-30
Nguyên tắc chốt với anh: xem nháp trong ERP phải **reuse chính modal chi tiết thật** (đổi nền vàng + cờ `isDraft`, giống modal-shipment), **KHÔNG đẻ modal mới**.
### Payment (phiên này) — thay `modal-draft-payment-view` mới đẻ → reuse `modal-payment-detail`
- **Xóa** hẳn folder `modal-draft-payment-view` (modal thừa đã lỡ tạo). Payment khác shipment/workflow ở chỗ "xem phiếu thật" của list là **route sang trang** `payment-detail`, nên trước đó nhầm là "không có modal để reuse" → đẻ modal mới. Thực ra modal render **cả phiếu** là [modal-payment-detail](../../src/app/shared/components/advance-payment/modal-payment-detail/modal-payment-detail.component.ts) (`entity: Payments` + bảng `listDetail`, đã sẵn `flagXem` khóa read-only). ⚠ Đừng nhầm `modal-payment-detailed` (có "ed") = chỉ 1 dòng phí.
- **modal-payment-detail** (additive, an toàn 23 chỗ khác đang dùng — cờ default `false`, `add()`/`edit()` reset cờ): +`_isDraftView`/`_draftId`, +`@Output() ApproveDraft`, +`viewDraft(payload,draftId)` (parse JSON→`entity`+`listDetail`, ép `flagXem=true`, KHÔNG gọi BE getDetail), +`approveDraft()`. HTML: `[class.draft-view]` nền vàng + badge **NHÁP #id** + nút **"Xác nhận chuyển sang ERP"** (chỉ khi draft) + ẩn Lưu khi draft. CSS `.draft-view` (#FFC107, đồng bộ workflow/shipment).
- **payment list**: `showDraft()` gọi `modalPaymentDetail.viewDraft(...)`; host `<modal-payment-detail (ApproveDraft)=onConfirmPromote (CloseModal)=closeDraftModal>`; module đổi `ModalDraftPaymentViewModule`→`ModalPaymentDetailModule`.
- ⚠ **Promote Payment vẫn PLACEHOLDER**: `onConfirmPromote()` chỉ báo "BE promote nối bước sau" (BE tạo phiếu thật từ nháp Payment chưa code — xem memory `project_draft_promote_payment_debit`).
### Workflow (phiên trước, cùng commit) — reuse `modal-workflow` + promote THẬT
- [modal-workflow](../../src/app/shared/components/workflows/modal-workflow/modal-workflow.component.ts): `viewDraft(payload,draftId)` + `_isDraftView` (flagXem=true, nền vàng, badge) + `approveDraft()` → `workflowService.promoteFromDraft(entity,draftId)` POST **`/api/Workflow/PromoteFromDraft`** (id=draftId + item=entity) → BE tạo Công việc thật + ghi ngược draft, trả `{jobId,shipmentId,alreadyPromoted}`.
- [workflow list](../../src/app/main/workflows/workflow/workflow.component.ts): dòng `isDraft` nền vàng + label "Nháp" + nút **"Xem nháp"** (`showDraft`→`viewDraft`); `clickRow` guard `isDraft`; `onConfirmPromote`→`loadData()` (nháp biến mất, job thật hiện). Host modal-workflow `(ApproveDraft)`. Model +`isDraft`/`draftId`/`draftPayload`.
- ⚠ Cần **verify BE endpoint `Workflow/PromoteFromDraft`** đã tồn tại/deploy trước khi test nút duyệt.
### Phụ — modal-fuel-summary (Cấp dầu theo lệnh)
- [modal-fuel-summary](../../src/app/shared/components/transports/modal-fuel-summary/modal-fuel-summary.component.html): thêm cột **"Loại dầu"** — badge **"Máy phát"** khi `mergeJobId==='GENERATOR'`, còn lại hiện `mergeJobId` (phân biệt dòng dầu máy phát đã tách).
- **Anh cần**: `ng build` + deploy ERP → (1) list Payment: click "Nháp #" mở modal vàng read-only đúng phiếu; (2) list Workflow: "Xem nháp" mở modal vàng, "Xác nhận chuyển ERP" tạo job thật (sau khi chắc BE PromoteFromDraft có). tsc sạch (chỉ còn lỗi cũ spec/driver-fuel-closing không liên quan).

## FIX — List FCL công ty NUỐT lệnh thầu phụ (BValue non-nullable) — BE 1 dòng, chờ deploy — 2026-06-27
**Triệu chứng**: trang `dispatch-order-fcl` (list FCL công ty) không thấy/không view được lệnh **thầu phụ** (`IsSubcontractors=1`).
**Gốc rễ**: `SP_DispatchOrderFCL_GetAll` lọc `AND (m.IsSubcontractors=@IsSubcontractors OR @IsSubcontractors IS NULL)` → chỉ "không lọc" khi param **NULL**. Nhưng `FromBodyBase.BValue` là `bool` **KHÔNG nullable** (mặc định `false`); controller `getPaging` truyền thẳng `obj.BValue` → khi list công ty không gửi cờ thầu phụ, BE gửi `@IsSubcontractors=0` → SP chỉ trả `IsSubcontractors=0` → **loại sạch lệnh thầu phụ**. (done.md 06-25 ghi "false = không lọc" là SAI giả định — SP cần NULL.)
**Fix** ([DispatchOrderFCLController.cs](../../../NewAPI/API/Controllers/FCL/DispatchOrderFCLController.cs) getPaging): map `false → null` — `bool? isSubFilter = obj.BValue ? true : (bool?)null;` rồi truyền `isSubFilter`. Tab thầu phụ (gửi BValue=true) vẫn lọc đúng; list công ty (BValue=false) giờ truyền null → ra cả 2 loại. KHÔNG đụng SP/FE.
**Anh cần**: deploy API → list FCL công ty hiện + view lại được lệnh thầu phụ; tab "Lệnh FCL" thầu phụ vẫn chỉ ra thầu phụ.

## Bộ skill nội bộ — cài skill-creator + viết 4 skill (sql-migration, list, picker, detail-form) — ĐÃ COMMIT + PUSH main — 2026-06-26
Xây bộ skill nội bộ cho Claude Code để khỏi đọc lại cùng file mỗi phiên. KHÔNG đụng code app — chỉ thêm `.claude/skills/`.
- **Cài `skill-creator`** (anthropics/skills) qua `npx skills add ... -g` → **global** `~/.claude/skills/` (không commit vào repo ERP). Dùng để tạo/bảo trì skill nội bộ sau này.
- **Quyết định kiến trúc**: skill generic (Angular/dotnet/Flutter/SQL của bên thứ 3) **KHÔNG cài vào repo này** — lệch version (Angular 15 vs hiện đại), đá luật cứng (Dapper+SP ≠ EF Core, NO auto DB writes). Giá trị thật nằm ở **skill nội bộ "đóng đinh DeltaSoft"**. Flutter sai stack (web là Angular). `code-review-expert` trùng `/code-review` built-in.
- **4 skill MỚI** (project-level, commit cùng repo, rút từ code thật — không bịa):
  - **`deltasoft-sql-migration`**: quy trình soạn file `.sql` (header Bối cảnh/Quy ước/Thay đổi/KHÔNG đụng/Login; ALTER idempotent `IF NOT EXISTS sys.columns`; 2 kiểu sửa SP **DROP+CREATE** vs **ALTER** giữ grant; bẫy **"too many arguments"** = param mới ở cuối `=NULL` + `ISNULL` preserve + chạy SQL TRƯỚC khi deploy BE; grant Function template + relogin; anti-patterns). ⚠ **DB là SQL Server 2014** → cấm `CREATE OR ALTER`/`DROP IF EXISTS`/`STRING_SPLIT`/`STRING_AGG`/`JSON_*`. Rút từ `Migration_*.sql`.
  - **`deltasoft-list`**: màn list/grid (shell `box box-chieu-cao`; filter bar date-range+chi nhánh+keyword; `loadData` params `YYYYMMDD` + 200/204/else; server-paging vs **load-all 9999**; hàng filter cột client-side; nút gate **directive `appPermission appFunction/appAction`** KHÔNG dùng `*ngIf hasPermission`; `clickRow`/`icheck` single-select + checkbox `disabled`; lazy modal `*ngIf`+`setTimeout 50`+`SaveSuccess→loadData`; export). Canonical `driver-fuel-approval`.
  - **`deltasoft-picker`**: modal `modal-pick-*` chọn 1 dòng read-only emit về parent (`@Output SelectItem` interface đã export + `CloseModal`; `show(mode?)` reset hết filter; đa nguồn theo `@Input mode` → unified `PickRow`; `buildGroups()` group theo KH collapsible; `pick()`+hide; `OnHidden()→CloseModal`). Canonical `modal-pick-job`.
  - **`deltasoft-detail-form`**: form header + bảng chi tiết (2 shape lưu: TVP `detaileds` vs JSON `lineItemsJson`; `show()` **deep-clone** entity; `addRow/removeRow`; `recalcLine` trên `(input)`; `totalAmount` **getter**; view↔edit `canEdit` creator/admin+status; `save()` guard `saving`+refresh từ row BE+emit SaveSuccess+xử lý 403). Canonical `modal-pending-invoice-detail`.
- Tất cả **không lặp** `deltasoft-stack`/`deltasoft-modals` — đào sâu pattern riêng + trỏ chéo. Bộ skill nội bộ giờ **9 cái**.
- **Commit** `43fb342` (4 file, 723 insertions) + **push** main. Memory: thêm 6 pointer + fact `reference-sql-server-2014` (áp mọi SQL sau này).

## Thầu phụ — thêm tab "Lệnh FCL" (FCL legacy thầu phụ) vào trang thực hiện lệnh thầu phụ — BE+FE, SP do anh tự viết, chờ deploy + test — 2026-06-25
Trang `subcontractors-dispatch-order` (thực hiện lệnh thầu phụ) trước chỉ có lệnh xe thường (tham khảo `dispatchorder`). Nay bổ sung tab thứ 2 "Lệnh FCL" = **FCL legacy** (`IsLegacy=1`) **của thầu phụ** (`IsSubcontractors=1`). FCL **mới** (v2) chưa làm — KHÔNG đụng. Scope: **list + thực hiện lệnh (nhận lệnh)**, KHÔNG tạo/sửa.
- **SQL (anh tự viết)**: `SP_DispatchOrderFCL_GetAll` thêm 2 tham số **`@IsSubcontractors`** + **`@SupplierId`** (đều `DEFAULT NULL` = không lọc → giữ nguyên hành vi module FCL công ty đang chạy). ⚠️ Tên 2 param phải đúng chính xác, lệch là Dapper báo "too many arguments" hỏng cả list FCL công ty.
- **BE** (additive, default null): [DispatchOrderFCLRepository.cs](../../../NewAPI/API/Repositories/FCL/DispatchOrderFCLRepository.cs) + [IDispatchOrderFCL.cs](../../../NewAPI/API/Interfaces/FCL/IDispatchOrderFCL.cs) `GetAll(... bool? isSubcontractors=null, int? supplierId=null)` → add `@IsSubcontractors`/`@SupplierId`. [DispatchOrderFCLController.cs](../../../NewAPI/API/Controllers/FCL/DispatchOrderFCLController.cs) `getPaging`: truyền cờ thầu phụ qua **`obj.BValue`** có sẵn (KHÔNG thêm field envelope mới) + `obj.Item?.ShippingUnitId` (=supplierId, nullable).
- **FE service** [dispatch-order-fcl.service.ts](../../src/app/shared/services/fcl/dispatch-order-fcl.service.ts) `getAll`: param `isSubcontractors='1'`→`p.bValue=true`; `supplierid`→`p.item.shippingUnitId`. Caller cũ không truyền → `bValue=false` → BE không lọc.
- **FE component** [subcontractors-dispatch-order](../../src/app/main/transports/dispatchorders/subcontractors-dispatch-order/): `<tabset>` 2 tab, **mỗi tab chứa nguyên 1 `box box-chieu-cao`** (để `box-body` là con trực tiếp → cuộn trong khung, CSS `100vh-200px` chừa thanh tab). Tab "Lệnh FCL" tự load qua `(selectTab)`; tab thường mặc định **gọi `loadData()` trong ngOnInit** (tabset không bắn selectTab cho tab đầu). **Bộ lọc 2 tab TÁCH RIÊNG** (ngày/chi nhánh/NCC/từ khóa → biến `*Fcl`, danh mục NCC riêng `listSupplierFcl`) vì mỗi tab kiểm tra NCC/điều kiện khác nhau.
- **Modal dùng chung** `modal-perform-fcl` + thêm `@Input() subcontractorMode=false`: khi `true` (chỉ tab thầu phụ) **chỉ hiện nút "Nhận lệnh" (status==1)**, ẩn 5 nút còn lại (Từ chối nhận/Chốt/Từ chối chốt/Lưu/Kết thúc). Mặc định false → modal công ty không đổi.
- **Anh cần**: chạy SP đã sửa + deploy API + build FE → mở tab "Lệnh FCL" thầu phụ thấy đúng list FCL legacy của thầu phụ; lọc theo NCC/ngày độc lập với tab thường; mở 1 lệnh status Gửi lệnh chỉ có nút "Nhận lệnh". Kiểm tra lại list FCL **công ty** vẫn chạy bình thường (param mới default null).

## Garage API (GaragesController) — thêm endpoint danh mục Nhân viên — BE only, additive, chờ deploy — 2026-06-25
App Garage (Innvie) cần danh mục NV để chọn. Tái dùng controller/repo nhân viên có sẵn ở NewAPI — KHÔNG tạo SP/repo mới, KHÔNG đụng DB.
- **BE** ([GaragesController.cs](../../../NewAPI/API/Controllers/CustomerCommunicate/GarageInnvie/GaragesController.cs)): thêm region **Nhân viên** + endpoint `POST /api/Garages/GetEmployees` (`[AllowAnonymous]` + check header `Api-Key` giống `GetOtherCategories`). Dùng `_employee.GetbyAll()` (đã inject sẵn, gọi `SP_Employee_GetbyAll`), lọc `Status==true`, **trả TOÀN BỘ trường của Employee** (bỏ projection cắt trường — chốt 2026-06-27: `.Where(Status==true).ToList()`, không `.Select` gọn nữa). Bọc `ResponseGarageAPI{isAcknowledged,Errors,Result}` đồng nhất các endpoint garage khác.
- **Anh cần**: deploy API → app garage gọi `GetEmployees` (header `Api-Key`) lấy list NV (full field NV đang hoạt động). Nếu cần lấy cả NV nghỉ → báo bỏ filter `Status`.

## Draft Site — chuẩn hóa định dạng ngày + fix datepicker không hiện ngày (draft-web + ERP) — FE build 0 lỗi, draft-web ĐÃ deploy, ERP chờ deploy — 2026-06-24
Loạt fix hiển thị/lưu ngày bên site nháp `draft-web` (Angular 21). Toàn bộ FE-only, KHÔNG đụng BE/SQL.

### YC1 — List không convert ngày → rỗng (helper parse đa định dạng)
draft-web lưu ngày trong Payload theo NHIỀU định dạng (Lô/Canon cũ `YYYYMMDD`, TT/Debit `DD/MM/YYYY`, PCCV `DD/MM/YYYY HH:mm:ss`, `createdAt` ISO). List cũ dùng `new Date()`/slice tay → `new Date('20260624')` Invalid → cột ngày rỗng. ERP không gặp vì API trả ISO.
- **MỚI** [core/date-util.ts](../../../draft-web/src/app/core/date-util.ts): `parseDraftDate()` (strict 8 định dạng → fallback ISO) + `formatDateVN()` (`DD/MM/YYYY`) + `formatDateTimeVN()` (`DD/MM/YYYY HH:mm`). Dùng `dayjs + customParseFormat` (đã có sẵn).
- [data-table.component.ts](../../../draft-web/src/app/shared/components/data-table/data-table.component.ts): formatter `type:'date'` đổi `new Date()` → `formatDateVN()`.
- **5 list** (shipment/canon/payment/debit/workflow): cột `createdInfo` + cột ngày (`cdsDate`/`refDate`/`estimatedStartTime/FinishTime`) qua helper; bỏ slice tay YYYYMMDD ở canon.

### YC2 — Chuẩn hóa ĐỊNH DẠNG LƯU (user chốt)
Chốt: ngày = `dd/MM/yyyy`; ngày-giờ PCCV (estimatedStart/Finish + đóng/trả hàng) = `dd/MM/yyyy HH:mm:ss`; debit (ngày doanh thu/vận hành) + chi tiết TT (ngày hóa đơn) = `dd/MM/yyyy`. Kiểm thực tế: payment/debit/workflow form **đã** lưu đúng; chỉ **shipment-form + canon-job-form** còn lưu `YYYYMMDD`/`YYYYMMDD HH:mm:ss`.
- shipment-form + canon-job-form: `API_DATE=VN` (dd/MM/yyyy), `API_TIME=VN_TIME` (dd/MM/yyyy HH:mm:ss).
- **ERP** [modal-shipment](../../src/app/shared/components/shipments/modal-shipment/modal-shipment.component.ts) + [modal-job-canon](../../src/app/shared/components/canon/modal-job-canon/modal-job-canon.component.ts) `_draftDate()`: thêm `DD/MM/YYYY` + `DD/MM/YYYY HH:mm:ss` (đặt TRƯỚC `MM/DD/YYYY` tránh nhầm ngày↔tháng) → promote nháp đọc được cả nháp cũ lẫn mới. **ERP chờ build+deploy.**

### YC3 — Datepicker form sửa hiện TRỐNG dù payload có ngày (gốc rễ: dayjs/esm)
`ngx-daterangepicker-material` import **`dayjs/esm`** = instance dayjs RIÊNG với app. Truyền model `{startDate,endDate}` là **object dayjs của app** → thư viện không nhận (cross-instance) → `chosenLabel` rỗng → ô input trống dù model đã set. `setStartDate` có nhánh **string** → `dayjs(str, locale.format)` bằng chính instance nó (an toàn).
- Fix: `toModel`/`toTimeModel` của **cả 5 form** trả về **CHUỖI** đã chuẩn hóa đúng locale picker (date `DD/MM/YYYY`, time `DD/MM/YYYY HH:mm:ss`) thay vì object dayjs. Vẫn dùng `parseDraftDate` để đọc mọi định dạng nháp rồi format lại.
- Memory: `reference_draftweb_daterangepicker_dayjs_esm`.

**Anh cần**: (1) draft-web ĐÃ deploy — test mở sửa nháp PCCV/lô/canon/debit/TT: datepicker hiện đúng; list ra ngày `dd/MM/yyyy`; tạo nháp mới kiểm payload lưu `dd/MM/yyyy`. (2) build+deploy **ERP** → màn xem nháp/promote đọc định dạng mới. Build: draft-web `ng build` 0 lỗi (3 vòng); ERP `ng build` 0 lỗi (chỉ warning CommonJS).

## Dầu máy phát — BỔ SUNG cho FCL CŨ (legacy, dùng song song FCL mới đang test) — BE+FE build 0 lỗi, chờ deploy + test — 2026-06-23
FCL cũ (`modal-dispatch-order-fcl`) trước chỉ FCL **mới** (v2) có dầu máy phát. Nay thêm vào FCL cũ vì 2 bản chạy song song một thời gian. **Tái dùng toàn bộ hạ tầng có sẵn** — KHÔNG đụng SP lớn/Create/Update cũ:
- **Bảng/SP/endpoint dùng chung**: cùng bảng `DispatchOrderFCL` (6 cột Generator* đã có) + `SP_DispatchOrderFCL_UpdateGenerator`/`_GetGenerator` + endpoint `UpdateGenerator` + FE service `updateGenerator()` + model `DispatchOrderFcl` (6 field) — tất cả đã tồn tại từ đợt 17/06, không tạo mới gì.
- **BE** ([DispatchOrderFCLRepository.cs](../../../NewAPI/API/Repositories/FCL/DispatchOrderFCLRepository.cs)): thêm block nạp generator vào method legacy `GetByRefNo` (mirror y `GetByRefNoWithTOAsync` — gọi `SP_DispatchOrderFCL_GetGenerator` qua `_conn`, gán 6 field). Vì SP lớn `SP_DispatchOrderFcl_GetByRefNo` không trả cột generator. KHÔNG sửa SP nào.
- **FE** ([modal-dispatch-order-fcl](../../src/app/shared/components/transports/modal-dispatch-order-fcl/)): thêm `computeGenerator()` + `saveGenerator()` (copy từ v2) + khối UI "Dầu máy phát" (giờ chạy/nhiệt độ/định mức/Dầu MP tự tính + nút Lưu, disable khi chưa có refNo) đặt trong vùng dầu, gate `*ngIf="!entity.isSubcontractors"`.
- **UI tinh chỉnh (FCL cũ)**: hàng dầu máy phát đưa **lên trên** "Tổng dầu định mức"; label đổi **"Số giờ chạy máy phát"**; ô nhập căn phải.
- **"Tổng dầu lệnh" (cả 2 modal cũ + v2)**: thêm getter `totalOrderOil = tongdau + generatorFuelAmount` (CHỈ hiển thị, KHÔNG cột DB — `tongdau` giữ = định mức vì chốt dầu dựa vào tách này). FCL cũ + v2 thêm dòng "Tổng dầu lệnh = định mức + máy phát"; v2 đổi luôn ô thống kê footer "Tổng dầu" → "Tổng dầu lệnh" dùng `totalOrderOil`.
- **Mobile contract**: cập nhật skill `fcl-mobile-api/SKILL.md` thêm §5.2 (6 field generator + endpoint `UpdateGenerator` + đọc qua `GetByRefNoWithTO` + công thức "Tổng dầu lệnh" client-side). App chỉ cần thêm 1 ô hiển thị cộng 2 field — KHÔNG đổi API.
- **Build**: FE `ng build` **0 lỗi** (chỉ warning CommonJS). BE chỉ thêm code (additive), chờ `dotnet build`.
- **Anh cần**: deploy API + (FE đã build) → mở 1 lệnh FCL **cũ** → nhập giờ/nhiệt độ/định mức → "Dầu MP" tự tính → **Lưu** (sau khi lệnh có refNo) → đóng/mở lại thấy số liệu giữ; ô "Tổng dầu lệnh" = định mức + máy phát. Chốt dầu: lệnh cũ giờ cũng cho ra source 5 (máy phát) như lệnh mới.

## PendingInvoice (F043) list — icon loading khi tải + fix vạch đỏ editor (strictNullChecks) — FE only — 2026-06-23
2 chỉnh nhỏ FE/editor, KHÔNG đụng BE/SQL:
- **(1) Loading list pending** ([pending-invoice.component](../../src/app/main/advance-payment/pending-invoice/)): thêm cờ `loading` (bật khi `loadData()`, tắt khi xong/lỗi + thêm nhánh xử lý lỗi trước đó thiếu). HTML: nút tìm đổi icon `fa-search`↔`fa-spinner fa-spin` + disable; **overlay trắng mờ phủ bảng** (`.loading-overlay`) có spinner lớn + chữ "Đang tải hóa đơn..."; ẩn dòng "Không có hóa đơn" khi đang load. Lý do màn này lâu hơn màn khác: **load-all** (`pageSize 99999`, status=null) rồi tách 2 tab/group/lọc cột client-side (không phân trang server) — chưa đổi, chỉ thêm loading. (Đã xác nhận: list chỉ gọi **1 API** getPaging; 2 dòng trong Network = preflight OPTIONS 204 + POST thật, bình thường.)
- **(2) Fix vạch đỏ `Type 'null' is not assignable to type 'string'`** (ts2322) ở editor: nguyên nhân `tsconfig.json`/`tsconfig.app.json` KHÔNG bật strict nên `ng build` 0 lỗi, nhưng file component nằm ngoài `include` (chỉ `src/**/*.d.ts`) → VS Code xếp vào *inferred project* (mặc định bật strictNullChecks). Sửa: thêm `"js/ts.implicitProjectConfig.strictNullChecks": false` vào [.vscode/settings.json](../../.vscode/settings.json) (chỉ ảnh hưởng editor, KHÔNG đụng build). Cần "TypeScript: Restart TS Server" để có hiệu lực. Cách 2 dự phòng nếu vẫn đỏ: thêm `"include": ["src/**/*.ts"]` vào tsconfig.app.json.

## PendingInvoice (F043) — modal đọc AI bỏ "Gán cho" + auto Lô/CV theo role, link file gốc từ S3, đổi tên thẻ NCC/KH — FE only, build 0 lỗi — 2026-06-22
3 chỉnh nhỏ FE-only (KHÔNG đụng BE/SQL — BE đã upload S3 + trả `PathFileS3` qua GetPaging sẵn).
- **(1) Modal đọc HĐ AI ([modal-doc-hoa-don](../../src/app/shared/components/advance-payment/modal-doc-hoa-don/))**: bỏ nhãn + cụm radio "Gán cho" (Lô hàng/Công việc). Phí KHÔNG cần job → ẩn hẳn vùng gán (`*ngIf="isAssignRequired"`). CHỈ khi nhóm **trả hộ** HOẶC **trả hộ nhóm bán hàng** (`salesSubType==='reinvoice'`) mới cần gán → tự quyết Lô/CV theo **role** (`defaultAssignTypeByRole()`: `OPS*`→workflow/Công việc, `CS*`→job/Lô hàng), bỏ bước chọn tay. `onChangeGroupFee()`/`onChangeSalesSubType()` gọi `syncAssignByGroup()`.
- **(2) Link file gốc từ S3** (cả list + modal xem chi tiết): trước trỏ `PathFileLocal` (cần server public mới mở được — dev không xem được). Nay `fileUrl` ưu tiên `environment.s3BaseUrl + pathFileS3` (public-read, xem mọi nơi), fallback local + nhãn "(local)" cho HĐ cũ/S3 lỗi. Thêm `s3BaseUrl` vào `environment.ts` + `environment.prod.ts` (`https://files-manager-delta-erp.s3.ap-southeast-1.amazonaws.com/`). Sửa: `pending-invoice.component` (list), `modal-pending-invoice-detail.component` (getter `fileUrl`/`fileIsS3`).
- **(3) Đổi tên thẻ** ở CẢ 2 modal (detail + đọc AI): "Nhà cung cấp" → **"Đơn vị phát hành hóa đơn"**, "Khách hàng" → **"Đơn vị thanh toán"** (chỉ text nhãn, binding `vendorName`/`customerName` giữ nguyên).
- **Build**: FE `ng build` 0 lỗi (chỉ warning CommonJS quen thuộc). Không có thay đổi BE/SQL → deploy chỉ cần build lại FE.

## PendingInvoice (F043) modal đọc HĐ — picker Công việc dùng SP mới + FE fix gán Lô/CV — FE+BE build 0 lỗi, SQL soạn xong (chờ chạy + deploy) — 2026-06-19
Nối tiếp mục dưới. User chốt: **bỏ getpaging2** cho picker Công việc → viết **SP mới gọn** `SP_Workflow_GetForPicker`.
- **SQL MỚI** (chờ chạy) `NewAPI/Migration_Workflow_GetForPicker_20260619.sql`: `SP_Workflow_GetForPicker` (DROP+CREATE, **SP mới hoàn toàn**, KHÔNG đụng GetPagingByOp/ByCs_New). Lọc `JobAssignedUserId=@UserId` (chỉ CV người đó **thực hiện**) + `Shipment.IsFinish=0` (lô chưa khóa) + branch/date/customer/keyword. Trả: Id CV, JobId, ShipmentId, JobName, JobDescription, ReferCode, CustomerName, CreatedDate, JobAssigningUserFullName (tên+SĐT). Join `Shipment k ON k.Id=m.ShipmentId`.
- **BE**: `IWorkflow.GetForPicker` + `WorkflowRepository.GetForPicker` (QueryAsync, gọn — KHÔNG enrich option/procedure/shipment như GetPaging2) + endpoint `POST /api/Workflow/GetForPicker`.
- **FE**: `WorkflowsService.getForPicker(params)`; `modal-pick-job` mode workflow đổi sang `getForPicker` (bỏ filter client `jobLocked`/`isFinish` — đã lọc ở SP), **bảng cột riêng** (Mã CV / JobId / Chi tiết CV / Thông tin job / Mã tham chiếu / Người giao việc-SĐT / Ngày lập) + **dòng filter cột** (`wfFilters`, sticky header). ShipmentId ẩn.
- **FE fix modal-doc-hoa-don** (bug "nhầm"): khi `assignType='workflow'` → ô **Job disable + ẨN nút 🔍 Job**, hiện ô **Công việc + nút 🔍**; Job & Công việc **xuống hàng** (`.gf-break` flex-basis:100%). Mode job giữ nút 🔍 ở ô Job.
- **Build**: FE `ng build` 0 lỗi; BE `dotnet build` **Build succeeded 0 Error** (IIS Express không chạy lúc build).

## PendingInvoice (F043) modal đọc HĐ — bỏ Cấp 2 + sort Cấp 1 + gán Lô hàng/Công việc — FE build 0 err, BE compile OK, SQL soạn xong (chờ chạy + deploy) — 2026-06-19
3 yêu cầu trong modal đọc hóa đơn AI ([modal-doc-hoa-don](../../src/app/shared/components/advance-payment/modal-doc-hoa-don/)). Quyết định chốt với user: Công việc = **Workflow (PCCV)**; gán cấp **batch**, **chỉ lưu PendingInvoice** (không sang Payment); **không chặn quyền**.
- **(1) Ẩn Cấp 2**: bỏ dropdown SubFee khỏi modal; `canUpload` chỉ cần Cấp 1 + đối tượng; `createBatch` gửi `subFeeCode/subFeeName=null`. (Cột SubFee DB vẫn còn, list group 2 cấp & Payment KHÔNG đổi.)
- **(2) Sort Cấp 1**: `sortLvl1Priority()` — tên chứa "bán hàng"→0, "trả hộ"→1, else→2 (Array.sort ổn định giữ thứ tự gốc).
- **(3) Gán Lô hàng / Công việc**: radio `assignType` ('job'|'workflow'); ô Job read-only + nút 🔍; mode workflow thêm ô Công việc read-only. Picker MỚI `modal-pick-job` (đặt trong nhóm advance-payment): `@Input mode`, `@Output SelectItem{jobId,shipmentId,customerName,refDisplay,workflowId?}`; lọc KH (ng-select) + date range (`dateOptionMultis`) + keyword; **nhóm theo customerName** (collapsible); mode `job`=`ShipmentService.getPagingNormal` lọc `!isFinish`; mode `workflow`=`WorkflowsService.getPaging`(getpaging2, scope userid+isFinish=0) lọc `!jobLocked`. Module imports: ng2-daterangepicker + ng-busy + ng-select + draggable (theo `modal-list-shipping-task`).
- **BE** (mirror pattern SubFee, per-item param vô hướng): `PendingInvoice.cs` +`JobId/ShipmentId?/WorkflowId?`; `PendingInvoiceCreateBatchRequest` +3 field; Controller `CreateBatch` set 3 field cho mỗi item từ req; `PendingInvoiceRepository.Create` +3 `p.Add`.
- **SQL** (chờ user chạy) `NewAPI/Migration_PendingInvoice_JobShipment_20260619.sql`: ALTER +JobId/ShipmentId/WorkflowId; DROP+CREATE `SP_PendingInvoice_Create` (tái tạo y thân bản SubFee 06-15 + 3 param). KHÔNG đụng GetPaging/GetForPicker.
- **Build**: FE `ng build` 0 lỗi; BE chỉ vướng khóa Common.dll do IIS Express = C# compile sạch.
- ⚠️ Workflow picker scope theo userid+isFinish=0 — nếu kế toán cần thấy job người khác/đã hoàn thành thì nới (xem todo).

## Draft Site — Lọc nháp theo chi nhánh (ERP) + Site nháp hiện JobId/ShipmentId sau promote — BE+FE+SQL XONG, ĐÃ DEPLOY — 2026-06-19
Hai yêu cầu nối tiếp Phase 4 Promote. SQL đã chạy + verify trực tiếp DB; 4 build sạch (2 FE + DraftAPI 0 lỗi, ERP API chỉ vướng khóa DLL khi IIS chạy = C# OK); user đã build + deploy.

### YC1 — Site nháp (draft-web) hiển thị JobId + ShipmentId sau promote
Chốt với user: hiện ở **site nháp** (ERP giữ nguyên — promote xong ẩn nháp, list thật hiện job). Sau promote, `draft.DraftEntries` đã có `PromotedRefNo` (JobId thật) + `PromotedShipmentId` (Id shipment thật) nhưng SP đọc của DraftAPI chưa trả `PromotedShipmentId`.
- **SQL** `DraftAPI/Migration_DraftSite_ShowPromotedRef_20260618.sql` (ĐÃ CHẠY): `draft.SP_DraftEntries_GetPaging` + `GetById` SELECT thêm `[PromotedShipmentId]` (PromotedRefNo + Status đã có sẵn). Chỉ đổi SELECT, không đổi tham số/điều kiện.
- **DraftAPI BE**: `DraftEntryListItem` + `DraftEntryDetail` +`int? PromotedShipmentId`.
- **draft-web FE** ([core/models.ts](../../../draft-web/src/app/core/models.ts) +`promotedRefNo`/`promotedShipmentId`): `shipment-list` + `canon-job-list` `toRow` khi `Status='Promoted'` → cột **JobId** hiện `SHN...` thật (thay `#id`), badge trạng thái = **"Đã tạo SHN... #shipmentId"** (canon nới cột badge 110→190px vì không có cột JobId riêng).
- **Verify DB**: GetById #87 trả `PromotedRefNo=SHN26060000700001` + `PromotedShipmentId=295002` ✓.

### YC2 — Lọc nháp theo chi nhánh ở ERP (áp cho MỌI user, kể cả admin)
Chốt với user: nháp tạo ở chi nhánh nào chỉ hiện ở chi nhánh đó, lọc theo **chi nhánh đang chọn trên màn** (không phân biệt admin).
- **SQL** `NewAPI/Migration_DraftErp_BranchFilter_20260618.sql` (ĐÃ CHẠY): `dbo.SP_DraftEntries_GetForErp_GetPaging` +`@BranchId INT=NULL` + `AND (@BranchId IS NULL OR [BranchId]=@BranchId)`. Phần quyền view/Canon/dải ngày/keyword giữ nguyên. ⚠ Phải chạy SQL TRƯỚC khi deploy BE (BE truyền `@BranchId`, SP cũ chưa có param → "too many arguments").
- **ERP BE**: `DraftFilterRequest.BranchId` → `IDraft.GetPagingForErp(+int? branchId)` → repo `@BranchId` → `DraftController` truyền `obj.BranchId`.
- **ERP FE**: `DraftFilterRequest.branchId` ([draft.service.ts](../../src/app/shared/services/draft.service.ts)); `job-canon` truyền chi nhánh đang chọn, `shipment-normal` truyền chi nhánh user — cả 2 `branchId: this._branchId || null` (null=tất cả).
- **Verify DB**: `@BranchId=4`→39 dòng; `=999`→0; `=NULL`→40 (lọc thật sự thu hẹp 40→39, loại đúng 1 nháp Canon chi nhánh khác).

## FCL cung đường phát sinh — fix Tải trọng + nới modal + nhãn "tên - địa chỉ" + chẩn đoán list nháp — FE XONG (build 0 lỗi) — 2026-06-18
Loạt fix nhỏ trong/quanh modal `modal-add-extra-segment` (Thêm cung đường phát sinh) + chẩn đoán "list nháp biến mất".

### Tải trọng không hiển thị trong modal phát sinh — ĐÃ FIX (build 0 lỗi)
- **Root cause:** [modal-add-extra-segment.module.ts](../../src/app/shared/components/transports/modal-add-extra-segment/modal-add-extra-segment.module.ts) **THIẾU `NgSelectModule`** → thẻ `<ng-select>` (có dấu gạch) bị Angular coi là custom element → render **trống không**, KHÔNG báo lỗi build nên lọt lâu. (Picker cảng/nhà máy vẫn chạy vì là table HTML thường.) → thêm `NgSelectModule` vào imports.
- **Fallback dữ liệu:** thêm `vehicleId` vào `ExtraSegmentOpenContext`; FCL v2 truyền `vehicleId: entity.vehicleId`; modal `open()` nếu `listOilQuota` rỗng mà có vehicleId → tự gọi `VihicleService.getDetail` nạp định mức dầu (`_loadOilQuota`, cờ `loadingQuota`). Không phụ thuộc parent nạp kịp.
- **UX:** ng-select `[loading]="loadingQuota"`; hint "Đang tải định mức dầu của xe…"; nếu xe chưa cấu hình định mức → báo đỏ "Xe của lệnh chưa cấu hình định mức dầu theo tải trọng — vào Danh mục xe để thêm". (Trước đó nút Lưu đã đổi sang validate báo rõ thiếu gì thay vì disable câm.)

### Nới rộng modal + nhãn "tên - địa chỉ"
- Modal phát sinh nới **620px → 860px** ([.scss](../../src/app/shared/components/transports/modal-add-extra-segment/modal-add-extra-segment.component.scss), giữ `max-width:96vw`) để đọc địa chỉ rõ hơn.
- Picker điểm (cả FCL v2 lẫn modal phát sinh) hiển thị **"Tên - Địa chỉ"** cho cảng/bãi, **chỉ Địa chỉ** cho CustomerLocations (không có cột Name). Helper `locationLabel(loc)` = `name ? name+' - '+address : address`. SQL `Migration_GetAllLocations_AddName_20260618.sql` ALTER `SP_GetAllLocations` +cột `[Name]` (Ports lấy Name, CustomerLocations NULL→fallback address). UnifiedLocation BE/FE +`Name`. (User chốt: CustomerLocations chỉ có address là đúng.)

### Chẩn đoán "list nháp gộp ERP biến mất" — KHÔNG phải bug, do bộ lọc (verify trực tiếp DB, chỉ đọc)
- Code gộp [shipment-normal.component.ts:154-185](../../src/app/main/shipments/shipment-normal/shipment-normal.component.ts#L154-L185) **còn nguyên** (`forkJoin(erp+draft)` → `[...draftRows,...erpItems]`). Dữ liệu nháp **còn**: `draft.DraftEntries` có **58 nháp Shipment** (Status='Draft', chưa xóa).
- SP `dbo.SP_DraftEntries_GetForErp_GetPaging` chạy thử đúng tham số FE (window 7 ngày, admin) → trả **8 dòng** (các nháp 06-12). → pipeline OK.
- **2 bộ lọc giấu nháp:** (a) **dải ngày mặc định = 7 ngày** (hôm nay −7 → cuối tháng): 39 nháp ngày **06-08** nằm ngoài cửa sổ → biến mất; chỉ 8 nháp 06-12 lọt. (b) **quyền xem theo NV**: 58 nháp đều do `ai.delta` tạo + gắn `targetEmployeeId` (381×39, 599×8, 33×5, 680, 103, 138…); user thường chỉ thấy nháp mình tạo HOẶC `targetEmployeeId==employeeId mình` → đăng nhập tài khoản không khớp sẽ thấy 0. → **Cách xem lại:** nới dải ngày về đầu tháng + đăng nhập admin (hoặc đúng NV được giao). Chờ user xác nhận đăng nhập bằng tài khoản nào trước khi cân nhắc chỉnh logic quyền.

## Draft Site — Phase 4 PROMOTE: Duyệt nháp Lô hàng/Canon → Job THẬT + ghi ngược shipmentId/jobId — XONG + ĐÃ DEPLOY/TEST THẬT — 2026-06-18
> ✅ SQL đã chạy. Test thật: promote draft Canon #87 → job thật `SHN26060000700001` (shipmentId 295002, ShipmentType=1176, CustomerId=589, JobDate 06-08 khớp payload); `draft.DraftEntries` #87 `Status='Promoted'` + `PromotedRefNo`/`PromotedShipmentId` ghi đúng. Luồng duyệt nháp → tạo job → ghi ngược id chạy ổn.
Nút "Duyệt" trong view nháp ở ERP (modal-shipment + modal-job-canon) giờ tạo job thật rồi ghi ngược kết quả vào draft. Trước đó `approveDraft()` chỉ là stub rỗng + nút disabled cứng. Anh chốt: **1 endpoint BE tách hẳn `AddFromDraft`** (FE gửi entity đã map + draftId, BE tạo job xong **mới** ghi ngược draft).

### SQL (⬜ CHƯA CHẠY) — `NewAPI/Migration_DraftSite_PromoteShipment_20260618.sql`
- ADD cột `draft.DraftEntries.PromotedShipmentId INT` (lưu Id job thật; `PromotedRefNo` đã có = JobId).
- 2 SP **MỚI** schema draft (KHÔNG đụng SP nháp cũ): `SP_DraftEntries_GetForPromote` (đọc Status/PromotedRefNo/PromotedShipmentId → guard chống duyệt 2 lần) + `SP_DraftEntries_MarkPromoted` (Status='Promoted'+JobId+ShipmentId+ReviewedBy, idempotent chỉ khi đang 'Draft'). ERP login db_owner EXEC được, không cần grant.

### BE (build 0 lỗi)
- Endpoint **mới** `POST /api/shipment/AddFromDraft` (ShipmentController, gate SHIPMENT_CREATE; inject IDraft): guard nếu đã Promoted → trả lại `{shipmentId,jobId,alreadyPromoted:true}` không tạo trùng; tạo job qua `CreatedAsync` (Repo cũ, định dạng ngày MM/dd/yyyy như Create); ghi ngược `MarkPromoted` best-effort (lỗi bước này KHÔNG hủy job đã tạo). `obj.Id`=draftId, `obj.Item`=entity.
- `IDraft`/`DraftRepository` +`GetForPromote`/`MarkPromoted` (output param @RowsAffected). VM `DraftPromoteInfo`.

### FE (build 0 lỗi) — cả Lô hàng thường + Canon
- `shipmentService.addFromDraft(entity, draftId)` → POST AddFromDraft (id=draftId).
- `modal-shipment` + `modal-job-canon`: `approveDraft()` confirm → `_doApproveDraft()` dựng entity y như `saveChange` (KHÔNG đụng saveChange) → `addFromDraft` → toast (báo cả trường hợp alreadyPromoted) + hide + emit `ApproveDraft`. Nút "Duyệt" mở khóa (`[disabled]="flagSave"` + `(click)`), bỏ disabled cứng.
- List `shipment-normal` + `job-canon`: bind `(ApproveDraft)="onApproveDraft()"` → `viewModal=false` + `loadData()`. Dòng nháp tự biến mất vì `SP_DraftEntries_GetForErp_GetPaging` đã lọc `Status='Draft'`; job thật hiện ở list thường.

**Anh cần (tối nay)**: (1) chạy `Migration_DraftSite_PromoteShipment_20260618.sql`; (2) deploy API + `ng build`; (3) test: list Lô hàng/Canon → bấm badge "NHÁP #id" → modal vàng → **Duyệt** → xác nhận → job thật xuất hiện, dòng nháp biến mất; bấm Duyệt lại nháp cũ (nếu còn) phải báo "đã duyệt trước đó" không tạo trùng; kiểm `draft.DraftEntries`: `Status='Promoted'`, `PromotedRefNo`=JobId, `PromotedShipmentId`=Id.

## Dầu — Reason phiếu cấp dầu + Dầu máy phát FCL + Chốt dầu 2-bucket — BE+FE XONG (build 0 lỗi), chờ chạy 2 SQL + deploy + test E2E — 2026-06-17
Tái cấu trúc mảng dầu: (1) phiếu Type=0 đổi nghĩa = **"Tạm ứng dầu"** + thêm **lý do** (4 mục); phiếu Type=1 thêm **loại hình** (3 mục); (2) lệnh FCL thêm **dầu máy phát** (giờ × định mức, tách riêng dầu định mức); (3) chốt dầu **bỏ "Đổ đầy bình"**, tính **2 bucket** (Vận hành/Máy phát) độc lập, NetAmount **có dấu** (trừ lương / trả tiền).

### Quyết định chốt (AskUserQuestion 2026-06-17)
- Dầu máy phát = `RunningHours × FuelNorm`; **kế toán nhập FuelNorm theo nhiệt độ** (nhiệt độ ghi nhận, KHÔNG cần giờ bắt đầu/kết thúc). `Tongdau` GIỮ NGUYÊN = định mức; tổng dầu lệnh = `Tongdau + GeneratorFuelAmount`.
- Bỏ hẳn TopUp; **supply** chốt = `QuantityIgas (Y)` từ phiếu Tạm ứng Type=0. Bucket theo lý do: **FA02→Máy phát**, FA01/FA03/FA04→Vận hành (FA03 chỉ ghi chú). `Net = supply − demand`; NetAmount = Net×giá (có dấu).
- Chốt **tách 2 net riêng**, tổng = cộng lại. Sửa Part7 tại chỗ (chưa lên production).

### SQL (NewAPI/) — đọc SP cũ qua sqlcmd để ALTER chính xác
- ✅ ĐÃ CHẠY: `Migration_FuelGrant_Reasons_20260617.sql` (seed OtherCategories FA01–04 `FUEL_ADVANCE_REASON` + FC01–03 `FUEL_COMMON_TYPE`; ALTER `DriverFuelApproval` +ReasonId/ReasonName); `Migration_DriverFuelClosing_Part8_2Bucket_20260617.sql` (DROP+CREATE chốt dầu 2-bucket thay Part7: 8 cột bucket, Detail +Bucket/ReasonName, Source=5 FCL máy phát, GetCandidates lấy Y theo lý do, Net có dấu, Delete @Id INT).
- ✅ ĐÃ CHẠY (2026-06-19): `Migration_DriverFuelApproval_Reason_SPs_20260617.sql` (ALTER `SP_DriverFuelApproval_Create` v1 + `_Update` +`@ReasonId/@ReasonName` default NULL — an toàn API cũ; Update ISNULL preserve). Verify cả 2 SP đã có 2 param → lỗi runtime "SP_DriverFuelApproval_Update has too many arguments specified" đã hết (BE đã deploy truyền sẵn 2 param).
- ⬜ CHƯA CHẠY: **chạy LẠI** `Migration_FCL_GeneratorFuel_20260617.sql` (đã thêm `SP_DispatchOrderFCL_GetGenerator`; ALTER DispatchOrderFCL +6 cột Generator* + `SP_DispatchOrderFCL_UpdateGenerator`).

### BE (build 0 lỗi)
- **Chốt dầu**: `DriverFuelClosing.cs`/VM (8 cột 2-bucket thay 4 cột cũ); Detail +Bucket/ReasonName; Repo `BuildDetailTvp` thứ tự cột khớp Part8 (Source,Bucket,…,ReasonName), bỏ @TopUpLiters.
- **Generator FCL**: `DispatchOrderFCL.cs` +6 field (VM kế thừa); `IDispatchOrderFCL`+Repo `UpdateGeneratorAsync` + nạp generator trong `GetByRefNoWithTOAsync` (SP riêng, không đụng SP lớn); Controller `UpdateGenerator`.
- **Reason**: `DriverFuelApproval.cs` +ReasonId/ReasonName; Repo Create/Update truyền 2 param. (Create2/Type=2 không đụng.)

### FE (build 0 lỗi)
- `modal-driver-fuel-approval`: dropdown **Lý do/Loại hình** (`OtherCategoriesService.getAll` type FA*/FC* theo entity.type) + đổi nhãn Type=0 → **"Tạm ứng dầu"** (modal + tiêu đề list `driver-fuel-approval`).
- `modal-vehicle-fuel-closing`: rebuild `recalcSummary()` **2-bucket signed** (bỏ ô Đổ đầy bình); bảng tổng 2 dòng Vận hành/Máy phát + dòng TỔNG; net đỏ=trừ lương / xanh=trả tiền; chi tiết thêm source 5 + cột Lý do (source 1).
- `modal-dispatch-order-fcl-v2`: khối **Dầu máy phát** (`computeGenerator()` tự tính; `saveGenerator()` gọi UpdateGenerator, nút Lưu cần refNo); model/service FE +6 field + `updateGenerator()`.

**Anh cần**: (1) chạy `Migration_DriverFuelApproval_Reason_SPs` + chạy lại `Migration_FCL_GeneratorFuel`; (2) deploy API + `ng build`; (3) relogin → test E2E. Lưu ý: 2 dòng định mức+máy phát cùng 1 lệnh FCL nên chọn/bỏ cùng nhau (FCL set IsSummarized khi có Source 3 HOẶC 5). Chi tiết: memory `project_fuel_redesign_reason_generator`.

## HR — Hợp đồng lao động & Hồ sơ NV (F045 + F046, Mức B) — BE+FE XONG (build 0 lỗi, đã push BE+FE main), chờ chạy SQL grant + deploy + in Word — 2026-06-16
Module thay Excel "Danh sách theo dõi HĐLĐ_03042025.xlsx": hồ sơ NV mở rộng + theo dõi vòng đời HĐ + (sắp tới) in HĐLĐ ra Word hàng loạt. **Quyết định Mức B**: tái dùng tối đa bảng HR sẵn có (đang trống + chưa wire), KHÔNG tạo bảng mới; SP/BE/FE MỚI hoàn toàn, KHÔNG đụng Employee cũ.

### ✅ BE+FE đã build 0 lỗi + push (2026-06-16)
- **SQL ĐÃ CHẠY**: DDL (`Migration_HR_LaborContract_DDL_20260616.sql`), 14 SP (`..._SPs_...`), 3 SP Employee HR (`Migration_HR_Employee_HR_SPs_...`). **⬜ CHƯA CHẠY**: `Migration_HR_F045_F046_Grant_20260616.sql` (Functions F045 `/main/hrm/employee-hr` + F046 `/main/hrm/labor-contract`, CHỈ VIEW; CUD gate EMPLOYEE).
- **BE**: Employee +12 field HR + 3 endpoint `/addHR /updateHR /getByIdHR`; EmployeeContract (9 SP gồm GetNextNumber) + EmployeeSalary (5 SP) đủ Model/VM/Interface/Repo/Controller, Scrutor auto-DI.
- **FE**: component MỚI **`modal-employee-hr`** (4 tab) — Tab 1 hồ sơ đủ 6 nhóm A-F, Tab 2 Hợp đồng (tự sinh số `001/HN/HĐ TV 2026` + prefill chuỗi ngày TV→XĐ→KXĐ, tô đỏ ≤10 ngày), Tab 3 mốc lương/BHXH có lịch sử, Tab 4 placeholder. Màn **F045 `employee-hr`** (list NV) + **F046 `labor-contract`** (theo dõi HĐLĐ + lọc). Route trong hrm-routing.
- **Polish UI**: modal **full màn hình** (`.modal-hr-full` 98vw); Tab 1 chuẩn lưới 3 cột `col-sm-4` (commit `beb4475`); **lề ngang 20px** thân/header/footer (`7c7b6e3`) — input không dính mép.
- **Anh cần**: chạy grant SQL F045/F046 → deploy API + `ng build` → **relogin** → menu Nhân sự có "Hồ sơ nhân viên" + "Theo dõi HĐLĐ".
- **Còn lại (todo)**: Tab 4 Hồ sơ phụ (bằng cấp/người phụ thuộc) + **In Word HĐLĐ** (chọn lib + 3 mẫu .docx ở `NewAPI/`).

### Thiết kế DB (đã chạy) — phân tích Excel (3 sheet: XĐTH/KXĐTH/TB KPI) → map cột vào schema HR có sẵn.

### Map tái dùng
EmployeeContract = HĐLĐ (1 NV nhiều HĐ, IsActived = HĐ hiện hành); EmployeeSalary = lương cơ bản + BHXH có lịch sử (= cơ chế ký phụ lục khi tăng lương, lương in lấy bản IsActived=1); EmployeeAllowance+Allowances = phụ cấp; EmployeeDegree = bằng cấp; EmployeeFamily = người phụ thuộc; EmployeeFile = file đính kèm; OtherCategories Type='CONTRACT_TYPE' = loại HĐ.

### SQL đã soạn (⬜ CHƯA CHẠY, ở `NewAPI/`) — đã refine theo yêu cầu chi tiết + 3 mẫu Word (2026-06-16)
- `Migration_HR_LaborContract_DDL_20260616.sql`: ALTER Employee **+12 cột** chuẩn HR (PlaceOfBirth, HomeTown, CurrentAddress, Nationality, IdType, EmployeeStatusId, BankBranch, EmergencyContact{Name,Phone,Relation}, **PersonalEmail** [email cá nhân; Email cũ=công ty], **WorkLocationId** [địa điểm làm việc dropdown]); ALTER EmployeeContract +9 cột (**EmployeeId** đang thiếu, BranchId, SigningPlace, WorkLocation, audit, Deleted) + index `IX_EmployeeContract_EmployeeId`; seed OtherCategories **CONTRACT_TYPE** CT01–CT04 + **EMPLOYEE_STATUS** (Đang hoạt động/Thử việc/Tạm hoãn/Đã nghỉ) + **WORK_LOCATION** (HN IDMC / HP 1023 Nguyễn Bỉnh Khiêm). Idempotent (COL_LENGTH/IF NOT EXISTS).
- `Migration_HR_LaborContract_SPs_20260616.sql`: **14 SP** mới. **EmployeeSalary** ×5 (Create deactivate-others / Update / SetActive / Delete / GetByEmployee). **EmployeeContract** ×9: **GetNextNumber** (sinh số HĐ `STT/VP/<token> Năm`; token CT01→"HĐ TV", CT02+CT03→"HĐLĐ", CT04→"HĐ Khoán"; STT=MAX leading số +1, đếm theo VP+Năm+nhóm token), Create (auto ContractDuration DATEDIFF; deactivate current), Update, SetActive, Delete (soft), GetById, GetByEmployee (history + DaysToExpire + **IsExpiringSoon** ≤10 ngày), **GetPaging** (bảng theo dõi: filter Keyword/BranchId/ContractTypeId/Year/ExpiringInDays/OnlyActive; TrackingStatus có tier **CẢNH BÁO ≤10 ngày** + cờ IsExpiringSoon; lương active OUTER APPLY), **GetForPrint** (@Id hoặc @Ids CSV split XML; Result1 = HĐ + full field NV (gồm PersonalEmail) + lương active; Result2 = phụ cấp active). App login db_owner → không cần grant.

### Tài liệu chức năng
[hr-nhan-su-chuc-nang.md](hr-nhan-su-chuc-nang.md) — mô tả cho người dùng: quản lý hồ sơ NV mở rộng, lịch sử HĐ, lương/BHXH có lịch sử, hồ sơ phụ, màn Theo dõi HĐLĐ, in Word hàng loạt. **Tiếp theo**: chạy 2 SQL + gửi mẫu Word → BE/FE (kế hoạch B1–B7 trong todo.md).

## PendingInvoice/Payment (F043) — phân loại phí 2 CẤP (Lv1→Lv2) + cờ "được quét invoice" + list group lồng 2 cấp + fix scroll ngang — 2026-06-15 (BE+FE build 0 error, 3/5 SQL ĐÃ CHẠY, chờ chạy 2 SQL còn lại + deploy API + test E2E)
Nâng cấp phân loại hóa đơn từ 1 cấp (GroupFeeCode Lvl1) lên **2 cấp** theo file `Danh mục chi phí_Phân loại hóa đơn_June 15 2026.xlsx` (ở `NewAPI/`). Hệ phí `FeeCodes` là cây: Level1 = nhóm phí 01–05, Level2 = phân nhóm 0101…. User chốt 3 hướng: sync Lv2 theo Excel + thêm cờ `IsInvoiceInput` + giữ GroupFeeCode (Lv1) thêm SubFeeCode (Lv2).

### SQL ✅ ĐÃ CHẠY (2026-06-15, `NewAPI/`)
- `Migration_FeeCodes_2Level_Invoice_20260615.sql`: ADD `FeeCodes.IsInvoiceInput BIT`; **MERGE 48 mã Lv2 từ Excel** (UPSERT tên + insert mã thiếu 0113/0114/0206–0212/0307–0309/0504–0507…, set cờ theo cột "x"); ALTER `SP_FeeCodes_GetAll` +`@IsInvoiceInput` (SELECT t1.* tự trả cột mới). ⚠️ Có đổi tên một số mã Lv2 cũ cho khớp Excel (tên đã lưu trên HĐ/phiếu là snapshot → không ảnh hưởng).
- `Migration_FeeCodes_CreateUpdate_IsInvoiceInput_20260615.sql` (⬜ CHƯA CHẠY): ALTER `SP_FeeCodes_Create` (+`@IsInvoiceInput` default 0) + `SP_FeeCodes_Update` (+`@IsInvoiceInput` default NULL → `ISNULL` giữ giá trị cũ) → cho phép chỉnh cờ tay trong màn Danh mục phí. (GetPaging `SELECT t1.*` tự trả cột — không cần sửa.)
- `Migration_PendingInvoice_SubFee_20260615.sql`: `Tbl_PendingInvoice` +`SubFeeCode/SubFeeName`; DROP+CREATE `SP_PendingInvoice_Create` (+2 param) + `SP_PendingInvoice_GetForPicker` (+2 cột + filter `@SubFeeCode`).
- `Migration_Payments_SubFee_20260615.sql`: `Payments` +`SubFeeCode`; ALTER (giữ grant) `SP_Payments_Create/_Update/_GetById` +`@SubFeeCode` (thân SP y nguyên bản 06-13).

### BE (build 0 err)
`FeeCodes` model +`IsInvoiceInput`; `IFeeCode`/`FeeCodeRepository`/`FeeCodeController` GetAll +`isInvoiceInput`; `FeeCodeRepository.CreateAsync/UpdateAsync` truyền `IsInvoiceInput`. PendingInvoice model/VM (CreateBatchRequest/PickerFilter/PickerItem)/Controller (CreateBatch set SubFee)/Repository (Create +2 param, GetForPicker +`@SubFeeCode`). Payments model/repo (Create+Update) +`SubFeeCode`.

### FE (build 0 err)
- `fee-code.service.getAll(parentId, level, status, isInvoiceInput?)`; FeeCode model +`isInvoiceInput`.
- **modal-doc-hoa-don**: 2 dropdown nối tầng — Cấp 1 (01–05, hiện đủ) → Cấp 2 (`getAll(parentId,2,2,true)` = lọc theo cha + **chỉ mã được quét invoice**). `onChangeGroupFeeLvl1()` reset+load Lv2; `canUpload` cần ĐỦ 2 cấp; createBatch gửi `subFeeCode/subFeeName`.
- **payment-detail**: bật lại field đã ẩn tạm → 2 ng-select cạnh nhau (nested row col-6). `_listSubFee` + `loadSubFee()` (robust nếu list Lv1 chưa load); onChangeGroupFee reset Lv2; `edit()` loadSubFee để hiện lựa chọn đã lưu; `showInvoicePicker` truyền cả `subFeeCode`.
- **modal-pending-invoice-picker**: +`subFeeCode` (parent set trước show) → filter.
- Interfaces `pending-invoice.service` + `payments.model` +`subFeeCode/subFeeName`.
- **Quản lý cờ trong Danh mục phí mới**: `modal-fee-code-lvl2` thêm ô check "Có hóa đơn đầu vào (được quét invoice)" (add mặc định tích); list `fee.component` (subTab==2) thêm cột "HĐ đầu vào" ✓/− như cột "x" Excel.

### List PendingInvoice — group LỒNG 2 CẤP (Lv1 → Lv2) + SQL giả lập (2026-06-15)
- `pending-invoice.component`: `buildGroups()` group 2 cấp — `PendingInvoiceGroup{code,name,subGroups[],count,expanded}` → `PendingInvoiceSubGroup{code,name,items[],expanded}`. Mỗi cấp collapse riêng (`expandedCodes` + `expandedSubCodes` key `"lv1|lv2"`), nhóm rỗng xuống cuối. HTML tbody lồng: header cấp 1 → header cấp 2 (thụt lề 34px, class `subgroup-header` nền nhạt) → dòng hóa đơn. Áp cho cả 2 tab.
- **SQL giả lập (DEV)**: `Migration_PendingInvoice_SeedSubFee_DEV_20260615.sql` — gán `SubFeeCode/Name` cho HĐ nháp cũ chưa có, chọn 1 mã Lv2 (`IsInvoiceInput=1`) thuộc đúng GroupFeeCode, rải đều bằng `ORDER BY ABS(CHECKSUM(Id, FeeCode))`. CHỈ chạy môi trường test.

### Payment-detail layout + scroll ngang (chốt 2026-06-15)
- **Nhóm phí → 2 DÒNG riêng dưới "Số tạm ứng"** (cột phải col-md-4, label `col-sm-4`/`col-sm-8`) thay vì chia 2 cột nửa-nửa ở cột trái (bị lệch hàng). Cấp 1 trên, Cấp 2 dưới.
- **Scroll ngang CỐ ĐỊNH đáy màn hình**: đặt scroll trên CHÍNH thẻ `<table>` `.table_wrapper{ display:block; overflow:auto; height: calc(100vh - 430px); white-space:nowrap }` — chỉ table `display:block` mới chịu clip theo chiều rộng (container ngoài không clip được table `display:table`); dùng `height` cố định (không `max-height`) → thanh cuộn ngang luôn ở đáy viewport, không nhích theo số dòng. (Bỏ approach overflow-trên-container trước đó vì không clip width.) Số `430px` chỉnh theo độ cao form nếu cần.

## Bảo mật — dời Vietmap API key khỏi source (2026-06-15)
Key Vietmap trước hardcode trong [VietmapApiController.cs] (fallback `8ee07d…`). Đã: thêm `"VietmapApiKey"` vào `appsettings.Development.json` + `appsettings.Production.json` (cả 2 đều gitignore + không track); controller bỏ literal, chỉ đọc `_configuration["VietmapApiKey"]`, trống → trả lỗi rõ ràng. `git status`: chỉ controller (không còn key) là tracked → commit an toàn. ⚠️ Key cũ VẪN trong git history → cân nhắc xin key mới (giống vụ Gemini). Deploy prod: máy prod phải có `appsettings.Production.json` chứa key (copy tay / env var).

**Quy tắc lọc (user chốt)**: Cấp 1 hiện đủ; chỉ Cấp 2 lọc "được quét invoice". **Anh cần**: deploy API mới + `ng build` FE → test E2E (modal đọc HĐ chọn 2 cấp/lọc quét invoice/lưu SubFee; payment 2 dropdown nối tầng + picker lọc nhóm+phân nhóm + lưu Payments.SubFeeCode; scroll ngang). Chi tiết quyết định: memory `project_pending_invoice_groupfee`.

## Bảng công văn phòng (F044) — tổng hợp công tháng + tiền phạt đi muộn/về sớm cho NV văn phòng — 2026-06-14 (SQL chính đã chạy, BE+FE build 0 error, chờ grant SQL + deploy + test E2E)
Module HRM mới thay file Excel chấm công tay của HR. Import "Chi tiết chấm công" (Vào/Ra) → engine tính ngày công + tiền phạt + nghỉ không lương + tổng hợp phép/online lũy kế → bảng Tổng + export. Nguồn `Luong-Delta/` (HN_T4, VT_T4, PDF, ảnh quy định).

### Quy định (PDF + ảnh) đã code
Đi muộn so 8h00 (ân hạn ≤5'): 06–15'=10k/16–35'=20k/36–65'=40k/66–185'=100k/>185'=½ ngày. Về sớm so 17h30: 1–10'=10k/11–30'=20k/31–60'=40k/61–180'=100k/>180'=½ ngày. **T7 chỉ làm sáng, mốc ra 10:00**; CN+lễ nghỉ; không nghỉ trưa. Đăng ký đi muộn/về sớm đã duyệt → miễn. Vắng không phép = nghỉ không lương. Online duyệt = ngày làm. Giải trình 30k HOÃN.

### Đã verify từ DB thật
ReasonId **1368=muộn/1369=sớm** (HRM01); **OnLeave.Type 0=phép/1=online**; **Status=2=Duyệt** (cả GoLate+OnLeave); map `CreatedBy→Users.Id→Users.EmployeeId→Employee.Id`; match chấm công theo **TÊN** (mã CC≠mã NV).

### SQL
- ✅ ĐÃ CHẠY: [Migration_OfficeAttendance_20260614.sql] — 6 bảng (Import/NameMap/Holiday/Opening/Attendance header/Detail) + TVP + ~15 SP gồm engine `SP_OfficeAttendance_Calculate` (dựng lịch tháng, join OnLeave/GoLate, áp bậc phạt, lũy kế phép/online cap 15).
- ⬜ CHƯA CHẠY: [Migration_OfficeAttendance_Grant_20260614.sql] — Functions F044 (menu HRM, Url /main/hrm/office-attendance) + ActionInFunctions VIEW/CREATE/UPDATE/EXPORT + Permissions Admin.

### BE (NewAPI, build 0 err) — FunctionCode F044
Models/ViewModels/Interface/Repository/Controller HRMs. Controller: Import (multipart, EPPlus parse, date M/d/yyyy, match theo tên qua SP_ApplyMatch) + ImportPreview (chọn dòng bắt đầu) + ReMatch + NameMapSave/GetAll + Calculate + GetPaging/GetDetail + SetStatus + Holiday/Opening CRUD + Export (EPPlus).

### FE (web-app-update, build 0 err) — ✅ ĐÃ COMMIT
main/hrm/office-attendance (list + toolbar chi nhánh/tháng/năm + Import/Tính/Export/Cấu hình + tổng phạt) + 3 modal: import (upload→preview chọn dòng→import→map tên chưa khớp), detail (drill ngày), config (2 tab Ngày lễ + Số dư đầu kỳ). Route data.functionCode='F044'. Layout **box box-primary box-chieu-cao** chuẩn AdminLTE (giống các trang HRM), box-body chạm đáy (height calc(100vh-165px)+overflow scoped) + sticky 2-row header; nút Import/Tính/Export gắn appPermission F044.

**Commit**: BE `90c6413`, FE `eeb09e0` (module + skill invoice-ai-reader + done/todo) → `1877583` (đổi card→box) → `0878d92` (box chạm đáy + sticky header). `Luong-Delta/` KHÔNG commit (data lương thật, binary lớn).

**Anh cần**: (1) chạy grant SQL; (2) deploy API mới + ng build FE; (3) relogin → Nhân sự → Bảng công văn phòng → Cấu hình lễ/số dư → Import HN/VT → map tên → Tính → kiểm tra bảng vs file chị Huệ → Export. Chi tiết: memory `project_office_attendance_module`.

## PendingInvoice (F043) — gắn Nhóm phí cấp 1 (GroupFeeCode) + modal auto-insert + list 2-tab group + Payment lọc theo nhóm — 2026-06-13 (BE+FE build 0 error, ✅ 2 SQL ĐÃ CHẠY, chờ deploy API cuối tuần → test E2E)
Nâng cấp module Đọc hóa đơn AI / PendingInvoice: gắn **nhóm phí cấp 1 = FeeCode Level 1 (Lĩnh vực)** trong hệ phí MỚI vào hóa đơn + phiếu thanh toán. Lưu **GroupFeeCode = `FeeCodes.FeeCode`** (chuỗi code, KHÔNG id) + `GroupFeeName` snapshot; hiển thị mọi nơi `feeCode - feeName`.

### Modal đọc hóa đơn (`modal-doc-hoa-don`)
- Bắt **chọn FeeCode Lvl1 TRƯỚC** khi cho upload (khóa upload-area tới khi chọn nhóm); cả batch gắn 1 nhóm. ng-select load `feeCodeService.getAll(null,1,2)`.
- Checkbox **"Hiển thị thông tin hóa đơn trước khi lưu"** (mặc định TẮT): tắt = đọc xong tự `createBatch` insert luôn (tick hết dòng OK → saveSelected); bật = giữ màn review + nút Lưu như cũ. createBatch kèm groupFeeCode/groupFeeName.

### List PendingInvoice → 2 tab group
- Tab1 **Chờ thanh toán** (status0 + !isDuplicate + UsedByPaymentId null), Tab2 **Bị từ chối** (isDuplicate=trùng). Mỗi tab group theo GroupFeeCode (collapsible, header = `code - name` + count). Tab1: đọc-lại + xóa; Tab2: chỉ xem + xóa. Load-all theo date range → tách + group client-side. Hóa đơn đã Used ẩn khỏi cả 2 tab.

### Payment (`payment-detail`)
- Thêm field FeeCode Lvl1 (ng-select, bindValue=feeCode, label `code - name`) đặt **dưới Lô hàng/Công việc, trên Nội dung**. Chọn xong MỚI hiện nút **"Lấy hóa đơn đã đọc"** (*ngIf groupFeeCode); picker truyền `groupFeeCode` lọc đúng nhóm. ĐỔI nhóm phí → `confirm()` đồng bộ (revert được) → xóa TOÀN BỘ listDetail. Lưu `Payments.GroupFeeCode` vào DB.

### SQL ✅ ĐÃ CHẠY (2026-06-13), `NewAPI/`
- `Migration_PendingInvoice_GroupFeeCode_20260613.sql`: Tbl_PendingInvoice +GroupFeeCode/Name +index; SP_Create +2 param; SP_GetForPicker +@GroupFeeCode filter +2 cột. GetPaging GIỮ NGUYÊN (SELECT * tự trả).
- `Migration_Payments_GroupFeeCode_20260613.sql`: Tbl_Payments +GroupFeeCode; **ALTER (không drop, giữ grant)** SP_Payments_Create/_Update/_GetById thêm `@GroupFeeCode NVARCHAR(50) = NULL` (default → API cũ đang chạy không lỗi). Đã verify diff chuẩn hóa khớp logic gốc; chỉ PaymentsRepository gọi 3 SP, không trigger/dependency.

### BE (NewAPI, build 0 err)
PendingInvoice.cs +GroupFeeCode/Name; PendingInvoiceViewModel (CreateBatchRequest/PickerFilter/PickerItem); Controller.CreateBatch set GroupFee mỗi item; Repository Create +2 param, GetForPicker +@GroupFeeCode. Payments.cs +GroupFeeCode; PaymentsRepository Create/Update +param (GetById tự map qua VM kế thừa).

**Anh cần**: ~~(1) chạy 2 SQL~~ ✅ XONG; (2) deploy API mới cuối tuần (~06-14/15) — lúc đó BE bắt đầu truyền @GroupFeeCode; (3) test E2E. Chi tiết quyết định: memory `project_pending_invoice_groupfee`.

## Draft Site — TaskDocs: Phase B (Draft API) + Phase C (draft-web) — đính kèm chứng từ vào chuyến — 2026-06-12 (build sạch, chờ test E2E)
Vòng đầy đủ end-to-end: draft-web đọc chuyến ERP → mở "Chứng từ" theo chuyến → upload ảnh/PDF/Word/Excel → DraftAPI đẩy S3 → insert `draft.DraftTaskDocs` → list hiện badge "Tài liệu (n)" thật; xem qua public URL, xóa của mình.

### Quyết định chốt trong session
- **BỎ PROMOTE**: tài liệu ở mãi `draft.DraftTaskDocs`; ERP chỉ đọc ngược đường dẫn để hiển thị, KHÔNG copy vào Attachfiles thật → Phase F loại.
- **S3 PUBLIC, KHÔNG presign**: bucket `files-manager-delta-erp` có policy public-read; upload NoACL (giống ERP — đã kiểm chứng `S3StorageServiceRepository`/`S3Controller` của ERP cũng NoACL, không presign). `viewUrl = https://{bucket}.s3.{region}.amazonaws.com/{key}` (vĩnh viễn). Trước đó làm private+presign rồi đổi sang public.
- **File đa loại**: ảnh/PDF/Word/Excel (không chỉ ảnh). BE không chặn loại (chỉ 50MB).

### Phase B — DraftAPI (`D:\Delta\DeltaSoft\DraftAPI`, build 0 err)
`Controllers/DraftTaskDocsController` (create multipart→S3→insert / getByTask / getPaging / delete; trả `viewUrl` public; xóa chỉ chủ tạo, admin null) + `Data/DraftTaskDocsRepository` (4 SP draft) + `Services/S3StorageService` (`UploadAsync` NoACL + `GetViewUrl` ghép public URL, encode segment) + `Models/DraftTaskDocsDtos` + DI `Program.cs` + `appsettings.AwsConfiguration` + pkg AWSSDK.S3 3.7.203.7. **PathFile lưu S3 key**, prefix `DraftTaskDocs/<taskId>/`.

### Phase C — draft-web (`D:\Delta\DeltaSoft\draft-web`, ng build pass)
`src/app/shipping-task/`: `shipping-task-list` (mirror opman read-only qua ERP `/api/shippingtask/getallbyopman`, date range/keyword, cột "Tài liệu (n)" badge, nút 📎) + `shipping-task-docs-modal` (upload nhiều file theo loại, thumbnail ảnh + icon Word/Excel/PDF via `fileKind()`, xem public URL, xóa của mình, phát `countChanged`) + `core/draft-task-docs.service` + `LookupService.shippingTasksOpMan()` + interface `ShippingTaskOpManLookup`/`DraftTaskDoc` + route `/shipping-task` + nav nhóm cha **"Quản lý vận tải" → "CV vận chuyển"**.

### Phase A.2 — KHÔNG cần sửa allowlist
`GetAllByOpMan` đã có `[ClaimRequirement(WORKFLOW, VIEW)]` → DraftAudienceGuard cho VIEW qua; user nháp chỉ cần `WORKFLOW_VIEW` ở ERP.

**Anh cần**: (1) `dotnet restore/run` DraftAPI; (2) đổi password `draft_app` thật trong appsettings (đang `CHANGE_ME`); (3) `ng serve` draft-web → test upload/xem/xóa. Còn lại: Phase D (ERP opman badge + modal) + Phase E (bot) — xem todo.md.

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
