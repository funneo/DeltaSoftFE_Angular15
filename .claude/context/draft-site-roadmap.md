# Lộ trình: Site nháp song song ERP (Draft Site)

> Tài liệu thiết kế + lộ trình triển khai. Chốt 2026-05-23. Xem thêm memory `project-draft-site-architecture`.

## Mục tiêu nghiệp vụ

Xây **site nháp** chạy song song ERP thật. AI hoặc người nhập **lô hàng / công việc / thanh toán / debit NHÁP** (trường y hệt thật), sau đó người vào **ERP thật** xem + xác nhận → **promote** thành dữ liệu thật. Báo cáo làm sau.

## Tổng quan kiến trúc (đã chốt)

```
   AI / Người ─► SITE NHÁP (Angular mới, public, login ERP → token aud=draft)
                   │ tạo nháp                      │ đọc-only (lookup/báo cáo/lệnh VC,FCL,TT) + export có hạn
                   ▼                               ▼
        DRAFT API (.NET process riêng)         ERP API THẬT (thêm lớp chặn aud=draft)
          login DB: draft_app                      │
          chỉ schema draft                         │
                   ▼                               │
        ┌──────────────────────────────────────┐  │
        │  DB DeltaSoft (CHUNG)                 │  │
        │   ├─ dbo.*  (bảng thật)               │◄─┘ ERP duyệt: đọc draft.* + PROMOTE
        │   └─ draft.DraftEntries (JSON nháp)   │    (quyền *_DRAFT_APPROVE, SP thật, 1 transaction)
        └──────────────────────────────────────┘
```

## Nguyên tắc bất biến

- AI/site nháp chỉ **ĐỀ XUẤT** (ghi nháp) + **ĐỌC** ERP (đúng quyền VIEW/EXPORT). Không bao giờ ghi thật.
- Ghi thật **chỉ** qua **promote** do người bấm trong ERP.
- **3 lớp bảo vệ độc lập**: (1) lọc quyền lúc cấp token (giữ `{VIEW, EXPORT}` + `*_DRAFT_CREATE`, bỏ hết quyền ghi), (2) ERP API chặn theo `aud=draft` (default-deny allowlist, độc lập role/admin), (3) login DB `draft_app` không chạm `dbo`.
- Mọi SQL: **soạn → user chạy** (không tự ghi DB). Không sửa SP/logic/luồng thật hiện có — chỉ **cộng thêm**.
- Làm **từng loại một**, bắt đầu **Lô hàng**.

## Quyết định đã chốt

- DB: **chung `DeltaSoft`**, schema riêng `draft`, login `draft_app` chỉ quyền schema `draft`.
- Lưu nháp: **JSON envelope** (`Payload` = DTO tạo-thật) → promote chỉ deserialize + gọi service thật → parity 100%.
- Draft API: **process .NET riêng**, connection dùng `draft_app`.
- Login: dùng login ERP, thêm endpoint `/login-draft` cấp token `aud=draft`.
- Site nháp: **public**, sau Cloudflare, bắt buộc login; chỉ tạo nháp + xem read-only; tự vẽ trang đọc (gọi ERP read-only API); export có giới hạn.
- View + duyệt nháp: **trong ERP thật** (không ở site nháp).
- ActionCode hệ hiện tại: `ACCEPT, ACCOUNT, CLOSING, COPY, CREATE, DELETE, EXPORT, OPEN, PAYMENT, UPDATE, VIEW` → scope nháp giữ `{VIEW, EXPORT}`.

### Quyết định chi tiết (chốt tối 2026-05-23)

1. **Không có bước "Submitted"** — tạo nháp xong là vào thẳng trạng thái chờ duyệt. States chỉ còn `Draft → Promoted`.
2. **Không có chức năng từ chối** — bỏ `Rejected`/`RejectReason`/endpoint reject. Nháp sai thì sửa (ở ERP) hoặc xóa.
3. **Sửa nháp ở ERP** — người duyệt sửa payload trong màn duyệt ERP (form thật, editable) rồi promote. Site nháp chủ yếu chỉ tạo.
4. **1 nháp = 1 bản ghi thật** — không cha–con.
5. **Promote: validate mã tham chiếu → CHẶN** nếu mã KH/NCC/phí... không còn hợp lệ (không chỉ cảnh báo).
6. **Quyền tách riêng từng loại**: `SHIPMENT_DRAFT_CREATE/APPROVE`, `JOB_DRAFT_*`, `PAYMENT_DRAFT_*`, `DEBIT_DRAFT_*`.
7. **AI dùng tài khoản cá nhân** (không phải service account chung) → phân quyền + audit theo đúng người vận hành AI.
8. **Endpoint `/login-draft` riêng**.
9. **Token nháp hạn 1h, KHÔNG refresh** — hết giờ phải đăng nhập lại.
10. **Domain site nháp: `drafterp.delta.com.vn`**. Báo cáo cho phép (read-only allowlist): `report-payment-detail`, `workflow-report-bc01`, và các report khác (`report-bcxxx`, `report-xxxx` — liệt kê cụ thể sau); **list lệnh `dispatchorder` và list `FCL`: chỉ hiển thị nút "Báo cáo"** (không hiện các nút thao tác khác).
11. **Thông báo nháp mới + tự động cập nhật list nháp trong ERP** (dùng SignalR sẵn có — `sendToAll`/`Update:Entity`).

---

## CẤU TRÚC JSON PAYLOAD (master → children)

### Quy tắc thiết kế (để promote dựng lại bản ghi thật)

1. **Payload = đúng object `Item` trong `FromBodyBase<T>` của endpoint tạo-thật** (camelCase theo Newtonsoft resolver). Promote: deserialize JSON → `T` → bọc lại `FromBodyBase<T>` với **TokenKey mới của người duyệt** → gọi **SP thật**. → parity 100%, không thêm/bớt field.
2. **Gồm master + TOÀN BỘ collection con** (và cháu nếu có). 1 draft = 1 master + children của nó (QĐ 4).
3. **Khóa con (`Id`) + FK về cha (`ShipmentId`/`PaymentId`/...) để 0/bỏ trống** — SP tự sinh lúc promote. Master `Id` cũng = 0.
4. **Mã tham chiếu** (`CustomerId, ContractId, FeeId, SupplierId, ShipmentId, WorkflowId, QuotationId, TeamId, ...`) là **Id thật** từ ERP — AI/site nháp lấy qua lookup ERP read-only. **Đây chính là phần validate-CHẶN lúc promote** (QĐ 5).
5. **Trường audit** (`CreatedBy/CreatedDate/...` từ `Auditable`) **KHÔNG lưu trong payload** — fill lúc promote theo người duyệt.
6. **File đính kèm** (Workflow POD/ảnh, hóa đơn...): lưu tham chiếu `pathFile`/URL; nháp chưa có thì để rỗng.
7. **Cột phẳng** `CustomerName/TotalAmount/RefHint` trong `DraftEntries` = trích từ payload lúc lưu (để list/filter nhanh), không phải nguồn sự thật.

### Cây master→children từng loại (đọc từ code tạo-thật)

**1. Lô hàng — `Shipment`** · `POST /api/shipment/Create` · Repository gọi **`SP_Shipment_CreateNew`** (4 TVP) · model `Models/Shipments/Shipment.cs` (FE `shared/models/shipment.model.ts`). *(Đã đọc đầy đủ model + SP.)*
```
Shipment (master: ~55 field scalar — JobId, CustomerId, ContractId, JobType, JobDate,
          CDSNumber/Date, HAWB_HBL, MAWB_MBL, InvoiceNo, Cartons, Weight, Volume, Pallets,
          Containers, *Staff, Pickup*/Delivery*/EmptyCont*, ImportExport, FreightTerm,
          ShipmentType, ShippingType, TeamId, Notes, BranchId, QuotationId, JobDig, ...)
 ├─ ShipmentBranches[]      {BranchId, IsFinish, DateFinish, Notes}
 ├─ ShipmentContSeals[]     {ContNo, ContType, SealNo, GW, Notes}
 ├─ ShipmentPackages[]      {PackageCode, PackageNum, PackageSize, GW, CBM, Notes}
 └─ ShipmentServiceDetails[]{FeeId, Contents, Amount, Code, ServiceId, ServiceName,
                             BranchId, Unit, Currency, Num, IsOk, Notes}
```

**2. Công việc — `Workflow`** (DTO mở rộng `FromBodyWorkflow`) · `POST /api/workflow/Create` · `SP_Workflow_Create` · `Models/Workflows/Workflow.cs`. *(Đọc kỹ lại ở Phase 5.)*
```
Workflow (master: BranchId, CustomerId, JobId, ShipmentId, Estimated Start/Finish Time,
          HandlingGroupId, ListHandlingGroupId[int], JobGroupId, JobName/Description,
          Pickup/Delivery LocationId+text+Time, ContType, Status, IsMainJob, MainJobId, ...)
 ├─ WorkflowJobOptions[]          {JobOptionId}
 ├─ WorkflowJobOptionProcedures[] {JobGroupId, JobOptionId, ProcedureId, ProcedureName,
 │                                 HandlingTime, IsFinish, IsPass, Latitude, Longtitude, Note}
 ├─ ListWorkflowFiles[] / ListWorkflowImages[] / ListWorkflowPod[]  (cùng class
 │                                 WorkflowAttackFiles {Title, FileName, PathFile, Type})
 └─ WorkflowContSeals[]           {ContNo, ContType, SealNo, GW, Notes}
```

**3. Thanh toán — `Payments`** · `POST /api/payments/Create` · `SP_Payments_Create` · `Models/AdvanceAndPayments/Payments.cs`. *(Đọc kỹ lại ở Phase 5.)*
```
Payments (master: BranchId, EmployeeId, RefDate, WorkflowId, Type, Contents, TotalAmount,
          Notes, RelatedDocuments, SupplierId, ShipmentId, IsDirectPayment)
 └─ PaymentDetails[] {FeeId, Contents, ReferCode, Amount, VAT, AmountAfterVAT, InvoiceNo,
                      InvoiceDate, InvoicePattern, TaxNumber, Web, Code, Currency,
                      ExchangeRate, HasInvoice, DebitAccount, CreditAccount, Notes, ...}
```

**4. Debit — `DebitNotes`** · `POST /api/debitnote/Create` · `SP_DebitNotes_Create` · `Models/Accounting/DebitNotes.cs`. *(Đọc kỹ lại ở Phase 5.)*
```
DebitNotes (master: Type, BranchId, DebitType, DebitDate, AccountingDate, DebitBranchId,
            EmployeeId, CustomerId, PartnerId, ShipmentId, ContractId, QuotationId,
            ExchangeRate, Currency, Notes, TotalAmount, InvoiceNo/Date, IsCanon, ...)
 └─ DebitNoteDetails[] {FeeId, Contents, ReferCode, Amount, VAT, AmountAfterVAT, GroupFee,
                        Unit, Price, Quantity, RVat, Currency, InvoiceNo/Date, WorkflowId}
   (RatingCS là phần tùy chọn, không thuộc luồng tạo nháp.)
```

### Ground truth từ SP CREATE (đã đọc trực tiếp DB 2026-05-24)

| Loại | SP thật Repository gọi | Con truyền kiểu | SP auto-sinh | SP tự phái sinh (KHÔNG cần trong payload) |
|---|---|---|---|---|
| Lô hàng | **`SP_Shipment_CreateNew`** (KHÔNG phải `SP_Shipment_Create`) | **4 TVP**: Type_ShipmentBranch / Type_ShipmentContSeal / Type_ShipmentPackage / ShipmentServiceDetail | `Id`, `JobId` | `TeamId` (từ Customer), `MergeBranchCode`, tự thêm dòng ShipmentBranch của BranchId gốc |
| Công việc | `SP_Workflow_Create` | **2 XML**: WorkflowJobOptions (`Roots/JobOption`{JobOptionId}), WorkflowContSeals (`Roots/ContSeals`) | `Id` | **WorkflowJobOptionProcedure tự sinh từ option đã chọn**; `JobName`; `ShipmentId` (từ JobId). File POD/ảnh KHÔNG thuộc SP create |
| Thanh toán | `SP_Payments_Create` | **1 TVP**: PaymentDetails | `Id`, `RefNo` | `ShipmentId` (từ Workflow). Chỉ insert detail có `FeeId` |
| Debit | `SP_DebitNotes_Create` | **1 TVP**: DebitNoteDetail | `Id`, `DebitNo` | side-effect: khóa Shipment `IsFinish=1, IsDebited=1` |

**KẾT LUẬN KIẾN TRÚC (chốt):** Promote **gọi lại `Repository.CreatedAsync(model)` của ERP**, KHÔNG gọi SP trực tiếp — vì Repository đã tự dựng TVP/XML + sinh mã + side-effect. → payload nháp = **đúng model DTO mà FE gửi hôm nay**, không cần lo TVP/XML. Promote chỉ: deserialize JSON → model → set `CreatedBy` = người duyệt → gọi `CreatedAsync`.

**Field auto/phái sinh KHÔNG đưa vào payload nháp** (SP/Repository tự lo): `Id`, mã auto (`JobId`/`RefNo`/`DebitNo`), `CreatedBy`/`CreatedDate`/`Status` (audit/hệ thống), `TeamId`, `JobName`, `ShipmentId`-phái-sinh, `WorkflowJobOptionProcedure`, `MergeBranchCode`. Khóa con + FK cha để 0/rỗng.

### Create nháp LÔ HÀNG — payload đầy đủ tham số (mẫu chuẩn cho form FE Phase 3)

Payload cho `draftType='Shipment'` (gửi qua `POST /draft`) — camelCase, đúng các field Repository map sang `SP_Shipment_CreateNew`:
```jsonc
{
  // ---- Master (đúng field ShipmentRepository.CreatedAsync truyền) ----
  "customerId": 0, "contractId": null, "jobType": null, "jobDate": "dd/MM/yyyy",
  "cdsNumber": "", "cdsDate": null, "hawB_HBL": "", "mawB_MBL": "",
  "invoiceNo": "", "salesContract_PO": "",
  "cartons": null, "weight": null, "volume": null, "pallets": null, "containers": null,
  "documentStaff": "", "cdsStaff": "", "handlingStaff": "", "jobStaff": "",
  "customerRefNo": "", "shipmentNo": "", "services": "", "bookingNo": "",
  "freeDemTime": null, "siCutoffTime": null,
  "pickupPlace": "", "pickupTime": null, "pickupContact": "",
  "deliveryPlace": "", "deliveryTime": "", "deliveryContact": "",
  "emptyContReturn": "", "emptyContDeadline": null, "cutoffTime": null,
  "loloInvoiceInfo": "", "otherInvoiceInfo": "", "emptyContPickupPlace": "",
  "customsInspectionReposition": null, "importExport": null, "freightTerm": "",
  "shipmentType": null, "shippingType": null,
  "branchId": 0, "isFinish": false, "notes": "", "quotationId": null,
  // ---- 4 bảng con ----
  "shipmentBranches":     [ { "branchId": 0, "notes": "" } ],
  "shipmentContSeals":    [ { "contNo": "", "contType": "", "sealNo": "", "gw": null, "notes": "" } ],
  "shipmentPackages":     [ { "packageCode": "", "packageSize": "", "packageNum": null, "cbm": null, "gw": null, "notes": "" } ],
  "shipmentServiceDetails":[ { "feeId": 0, "contents": "", "amount": null, "code": "", "serviceId": null, "serviceName": "", "branchId": 0, "unit": "", "currency": "VND", "num": null, "isOk": true, "notes": "" } ]
}
```
Draft API: bọc payload này thành `Payload` (JSON) trong `draft.DraftEntries`, trích cột phẳng `CustomerName` (lookup từ `customerId`), `TotalAmount` (Σ serviceDetails.amount), `RefHint` (jobId nếu có / customerRefNo). **Mã tham chiếu validate-CHẶN lúc promote**: `customerId, contractId, quotationId, shipmentServiceDetails[].feeId, *.branchId`.

> ⚠️ Loại 2–4: signature SP đã đọc & ghi ở bảng trên; khi dựng form FE (Phase 3) và làm promote (Phase 5) đọc lại `Repository.CreatedAsync` từng loại để chốt danh sách field master đầy đủ (như đã làm với Lô hàng).

---

## PHASE 0 — Nền tảng DB nháp (SQL, user chạy)

**Việc:**
1. `CREATE SCHEMA draft`.
2. Bảng `draft.DraftEntries`:
   - Id BIGINT IDENTITY PK; DraftType VARCHAR(20) (`Shipment`/`Job`/`Payment`/`Debit`); Payload NVARCHAR(MAX) (JSON=DTO thật); Status VARCHAR(20) (`Draft`/`Promoted` — bỏ Submitted/Rejected theo QĐ 1,2); Source VARCHAR(10) (`AI`/`Manual`).
   - BranchId, CreatedBy, CreatedByName, CreatedAt; ReviewedBy, ReviewedAt; PromotedRefNo, PromotedAt. (Bỏ SubmittedAt/RejectReason.)
   - Cột phẳng để list/filter: CustomerName, TotalAmount, RefHint.
   - Index `(DraftType, Status)`, `(CreatedBy)`.
3. Login least-privilege: `CREATE LOGIN draft_app` + `CREATE USER` trong DeltaSoft; `GRANT SELECT, INSERT, UPDATE ON SCHEMA::draft`; KHÔNG cấp dbo (cân nhắc DENY rõ).
4. **SP nháp** (đúng convention `SP_DraftEntries_<Action>`) — **trình user duyệt trước khi tạo** (QĐ 2026-05-24). Với JSON envelope: details nằm sẵn trong Payload JSON → SP insert KHÔNG cần TVP, **1 SP generic cho cả 4 loại**:
   - `SP_DraftEntries_Insert` (@DraftType, @Payload, @Source, @BranchId, @CreatedBy, @CreatedByName, @CustomerName, @TotalAmount, @RefHint, @Id OUTPUT) → insert 1 dòng Status='Draft'. **KHÔNG side-effect lên dbo.**
   - `SP_DraftEntries_Update`, `SP_DraftEntries_GetPaging`, `SP_DraftEntries_GetById`, `SP_DraftEntries_Delete` (mềm), `SP_DraftEntries_UpdateStatus` (dùng lúc promote).

**RÀNG BUỘC tạo nháp:** TUYỆT ĐỐI không side-effect lên dữ liệu thật. **Debit nháp KHÔNG khóa shipment** (`IsFinish/IsDebited` chỉ set lúc PROMOTE qua Repository thật, không lúc tạo nháp). Đảm bảo sẵn vì draft chỉ ghi `draft.*` + login draft_app không chạm dbo.

**Deliverable:** schema + bảng + login + SP nháp (đã duyệt) sẵn sàng.
**Kiểm thử:** `draft_app` chỉ đọc/ghi `draft.*`; `SELECT dbo.<bảng thật>` bị từ chối.

> **THỨ TỰ TRIỂN KHAI (chốt 2026-05-24):** xây **TRỌN VẸN site nháp trước** (đủ 4 menu Lô hàng/Công việc/Thanh toán/Debit note như ERP) → báo cáo (chỉ view) làm sau → **CHƯA đụng gì FE ERP**; chỉ khi site nháp OK mới làm bước view + approve bên ERP (Phase 5). Phase đánh số lại theo thứ tự này.

## PHASE 1 — ERP API: cấp token nháp + lớp đọc-only (BE thuần, KHÔNG đụng FE ERP)

Cần làm sớm vì site nháp phải login qua ERP + đọc master data để điền nháp. Tất cả **cộng thêm, gated sau `aud=="draft"`**; làm trên **branch riêng + checklist hồi quy**.

**Code thật đã verify (2026-05-24):** JWT validation `Program.cs:95-116` (`ValidAudience = Tokens:Issuer`); login + sinh token `AccountController.cs:73-186` (`Audience = Issuer`, hết hạn 1 ngày, claim `permissions` JSON array, dùng `JsonWebTokenHandler`); `ClaimRequirementFilter.cs:12-48` (admin bypass `IsInRole("Admin")` rồi check `permissions.Contains(func+"_"+action)`); `ActionCode.cs` có sẵn VIEW/EXPORT; quyền từ `UserRepository.GetPermissionByUserId` → SP `SP_sys_Permission_GetByUserId`.

1. `Program.cs`: `ValidAudience` → `ValidAudiences = { Tokens:Issuer, "draft" }` (token ERP cũ vẫn hợp lệ).
2. `POST /api/account/login-draft` (endpoint riêng — QĐ 8, method MỚI không đụng `login`): xác thực như `/login`, lọc quyền còn `{*_VIEW, *_EXPORT, *_DRAFT_CREATE}`, helper sinh token riêng `aud=draft`, **hạn 1h KHÔNG refresh** (QĐ 9).
3. **Global filter mới `DraftAudienceGuardFilter`** (`options.Filters.Add`, `IOrderedFilter` Order thấp để chạy trước `ClaimRequirementFilter`): đọc claim `aud`; `≠draft` → **no-op** (0 hồi quy). `=draft` → **default-deny** theo **PHƯƠNG ÁN B (chốt 2026-05-24)**:
   - Action CÓ `[ClaimRequirement(_, act)]`: cho qua nếu `act ∈ {VIEW, EXPORT}`, còn lại 403.
   - Action KHÔNG có `[ClaimRequirement]`: chỉ cho qua nếu route nằm trong **allowlist** (`appsettings: Draft:ReadAllowlist`); còn lại 403.
   - **Độc lập admin/role** (chặn ghi kể cả token draft của admin).
   - Thêm 2 property public `Function`/`Action` vào `ClaimRequirementAttribute` (cộng thêm) để filter đọc được ActionCode.
4. `appsettings.json`: thêm section `Draft { Audience:"draft", TokenHours:1, ReadAllowlist:[...] }`. Báo cáo thêm vào allowlist ở Phase 4.
5. Export khi `aud=draft`: rate-limit policy riêng + audit (cap dòng để Phase 4/6).

**Deliverable:** site nháp login được + đọc lookup; ghi thật → 403. **Kiểm thử hồi quy:** `/login` cũ (user + admin) y như trước; token `aud=draft` gọi endpoint ghi → 403; token draft của admin gọi ghi vẫn 403. **Phụ thuộc:** Phase 0.

## PHASE 2 — Draft API (process .NET riêng) — generic cho cả 4 loại

1. Project .NET mới (app pool/site riêng), connection `draft_app`; JWT chấp nhận `aud=draft`.
2. Endpoints **generic** (JSON envelope nên không phân biệt loại ở tầng lưu) — **TẤT CẢ POST giống ERP** (QĐ user 2026-05-24): `POST /api/draft/create`, `/update`, `/delete` (mềm), `/getPaging`, `/getById`. Gọi bộ `SP_DraftEntries_*`. **Bỏ `/submit`** (QĐ 1), **không reject** (QĐ 2).
3. Auth: `aud=draft` + **quyền suy ra từ quyền ERP của user** (QĐ user 2026-05-24, KHÁC QĐ 6 ban đầu): ERP có `X_CREATE` → tạo nháp X được, tương tự `X_UPDATE`/`X_DELETE`. Map `draftType→mã quyền` trong appsettings (`Draft:Permissions`): Shipment→SHIPMENT_*, Job→WORKFLOW_VIEW (ERP gate create Workflow bằng VIEW!), Payment→PAYMENT_*, Debit→DEBITNOTES_*. Admin bypass. Chạy dưới **tài khoản cá nhân** (QĐ 7).

**CODE XONG (2026-05-24)** tại `D:\Delta\DeltaSoft\DraftAPI` (project .NET 9 riêng, build 0 error):
- `DraftAPI.csproj` (Dapper 2.1.35, JwtBearer 9, System.Data.SqlClient 4.8.6, Newtonsoft, Swashbuckle).
- `Program.cs`: JWT **chỉ** nhận `aud=draft` (ValidAudience="draft"), cùng `Tokens:Key`/`Issuer` ERP; `RoleClaimType="roles"` để IsInRole("Admin") chạy; CORS; Swagger.
- `Models/DraftDtos.cs`: Create/Update/Query/Id requests + DraftEntryListItem/Detail + DraftOptions.
- `Data/DraftRepository.cs`: gọi `draft.SP_DraftEntries_Insert/Update/Delete/GetPaging/GetById` qua Dapper (DynamicParameters + output param).
- `Auth/DraftIdentity.cs`: đọc claim (id/userName/fullName/branchId/permissions/roles) + `CanDraft(draftType, action, options)`.
- `Controllers/DraftController.cs`: 5 endpoint POST; create lấy CreatedBy/BranchId từ claim; update/delete fetch nháp để biết DraftType + check Status=Draft + ownership (admin bypass=truyền updatedBy null); getPaging/getById giới hạn chủ sở hữu (admin xem hết).
- `appsettings.json`: connection `draft_app` (⚠️ password placeholder `CHANGE_ME_StrongPassw0rd!` — user điền), Tokens khớp ERP, map `Draft:Permissions`.
- NewAPI (branch `feature/draft-site-phase2`): sửa `FilterDraftPermissions` giữ `{VIEW,EXPORT,CREATE,UPDATE,DELETE}` (bỏ ACCEPT/ACCOUNT/CLOSING/COPY/OPEN/PAYMENT) để token nháp mang đủ quyền cho Draft API.

**Deliverable:** CRUD nháp cho cả 4 loại (lưu JSON). **Phụ thuộc:** Phase 0. **Cần user:** điền password draft_app + chạy thử end-to-end (login-draft lấy token → gọi Draft API).

## PHASE 3 — Site nháp FE (Angular app mới) — ĐỦ 4 MENU như ERP

Trọng tâm — xây trọn vẹn trước khi đụng ERP.
1. App Angular mới tách hẳn, domain **`drafterp.delta.com.vn`** (QĐ 10); login → `/login-draft` (token 1h); 2 base URL: ERP API (đọc) + Draft API (ghi nháp).
2. **4 menu giống ERP**: **Lô hàng, Công việc, Thanh toán, Debit note** — mỗi menu có form tạo + list + sửa/xóa nháp; field **y hệt form thật** (đọc lại `Repository.CreatedAsync` + model từng loại để đủ field, như đã làm với Lô hàng). Lookup KH/NCC/phí/doanh thu gọi ERP read-only.
3. Lưu → `POST /draft`. Hỗ trợ cả người nhập tay lẫn AI điều khiển trình duyệt.

**Deliverable:** site nháp tạo/sửa/xóa đủ 4 loại nháp end-to-end. **Phụ thuộc:** Phase 1 + 2. **KHÔNG đụng FE ERP.**

## PHASE 4 — (sau) Trang xem báo cáo read-only trên site nháp

- Thêm vào allowlist `aud=draft`: `report-payment-detail`, `workflow-report-bc01`, các report khác (liệt kê sau); list `dispatchorder` + `FCL` (chỉ nút "Báo cáo").
- Site nháp tự vẽ trang xem (gọi ERP read-only). Chỉ view nên ưu tiên thấp.

## PHASE 5 — (chỉ khi site nháp OK) ERP: View danh sách nháp + Approve/Promote

Đây là bước **đụng FE ERP** — chỉ làm sau khi site nháp chạy ổn.
1. Quyền `<TYPE>_DRAFT_APPROVE` (SQL, user chạy).
2. ERP FE: màn "Duyệt nháp" (list `draft.DraftEntries`); mở payload vào form thật **EDITABLE** (QĐ 3); chỉ nút **Xác nhận** (không Từ chối — QĐ 2); list auto-refresh qua SignalR (QĐ 11).
3. ERP BE: GET list/chi tiết nháp; `POST promote` — **validate mã tham chiếu → CHẶN nếu không hợp lệ** (QĐ 5) → set `CreatedBy`=người duyệt → gọi `Repository.CreatedAsync` thật → `Status=Promoted` + `PromotedRefNo`, idempotent, 1 transaction. **Side-effect thật (vd khóa shipment khi promote debit) xảy ra ĐÚNG ở đây.** Không có reject.
4. Nháp mới → SignalR thông báo + `Update:Draft` để list ERP tự refresh.

**Deliverable:** khép vòng tạo nháp → duyệt → dữ liệu thật (cả 4 loại). **Phụ thuộc:** Phase 1–3.

## PHASE 6 — Hardening

- Cloudflare trước site nháp (WAF/DDoS, không challenge lên API); tên miền riêng + CORS ERP API.
- MFA + rút ngắn JWT + refresh token (áp cả ERP).
- Audit log đầy đủ (tạo/promote/reject/export) + anomaly/velocity.
- Rà allowlist aud=draft + giới hạn export.

---

## QUYẾT ĐỊNH (đã chốt tối 2026-05-23)

| # | Quyết định | Chốt |
|---|---|---|
| 1 | Bước "Submitted"? | **Không** — tạo xong chờ duyệt luôn (`Draft→Promoted`) |
| 2 | Từ chối? | **Không có reject** — sửa hoặc xóa |
| 3 | Sửa nháp ở đâu? | **Ở ERP** (người duyệt sửa form thật rồi promote) |
| 4 | Quan hệ nháp↔thật | **1 nháp = 1 bản ghi thật** |
| 5 | Validate mã tham chiếu lúc promote | **CHẶN** nếu không hợp lệ |
| 6 | Quyền create/approve | **Tách riêng từng loại** |
| 7 | Tài khoản AI | **Tài khoản cá nhân** (phân quyền theo người dùng AI) |
| 8 | Login | **`/login-draft` riêng** |
| 9 | Token nháp | **1h, KHÔNG refresh** (hết → login lại) |
| 10 | Domain + báo cáo | **`drafterp.delta.com.vn`**; report-payment-detail, workflow-report-bc01, report-bcxxx/xxxx (liệt kê sau); dispatchorder + FCL list chỉ hiện nút "Báo cáo" |
| 11 | Thông báo + cập nhật list | **Có** — SignalR thông báo + auto-update list nháp ERP |

## Rủi ro & quay lui

- **Phase 1** (ERP API: token nháp + lớp đọc-only) rủi ro hồi quy cao nhất → branch riêng + checklist hồi quy trước merge; lỗi thì revert branch.
- **Phase 5** mới đụng **FE ERP** (view + approve) — chỉ làm sau khi site nháp OK.
- Phase 0/5 đụng SQL → script kèm lệnh kiểm tra; không DROP gì của dbo.
- Mỗi phase chạy độc lập để dừng/đánh giá giữa chừng.

## Trạng thái

- 2026-05-23: chốt thiết kế + lộ trình + **toàn bộ 11 quyết định**.
- 2026-05-24: **Phase 0 XONG** (user đã chạy). Schema `draft` + `draft.DraftEntries` + 6 SP `SP_DraftEntries_*` (Insert/Update/GetPaging/GetById/Delete-mềm/UpdateStatus) + login `draft_app` (GRANT schema draft / DENY schema dbo). Script: `NewAPI/Migration_DraftSite_Phase0_20260524.sql` (db_owner chạy) + `..._Login_20260524.sql` (sa chạy).
  - **Phát hiện môi trường:** DB là **SQL Server 2014** (v12) → KHÔNG có `ISJSON`/JSON functions → validate JSON + trích cột phẳng (CustomerName/TotalAmount/RefHint) làm ở **Draft API (C#)**, không ở SQL. Login ERP `delta.erp` là **db_owner (không sysadmin)** → đã sẵn full quyền schema draft, Phase 5 promote KHÔNG cần grant thêm.
- 2026-05-24: **Phase 1 CODE XONG** (branch `feature/draft-site-phase1` ở repo NewAPI, build 0 error — **chờ user chạy checklist hồi quy + test login-draft trước khi merge**). Thay đổi (cộng thêm):
  - `Program.cs`: `ValidAudiences = { Issuer, "draft" }` + đăng ký global `DraftAudienceGuardFilter` qua `AddControllers(options.Filters.Add<>)`.
  - `Filters/DraftAudienceGuardFilter.cs` (MỚI): `IAuthorizationFilter + IOrderedFilter (Order=int.MinValue)`. aud≠draft → no-op. aud=draft → action có `[ClaimRequirement]` chỉ cho VIEW/EXPORT (EXPORT có audit-log), action không có ClaimRequirement chỉ cho route trong `Draft:ReadAllowlist`; còn lại 403; độc lập admin.
  - `Filters/ClaimRequirementAttribute.cs`: thêm property public `Function`/`Action`.
  - `AccountController.cs`: thêm `POST /api/account/login-draft` (method MỚI, không đụng `login`) + helper `FilterDraftPermissions` (giữ `_VIEW`/`_EXPORT`/`_DRAFT_CREATE`); token `aud=draft`, hạn `Draft:TokenHours`(=1h), không refresh.
  - `appsettings.json`: section `Draft { Audience, TokenHours, ReadAllowlist:[] }` (allowlist rỗng — điền route lookup khi làm Phase 3, báo cáo ở Phase 4).
  - Export rate-limit per-aud bị hoãn: `UseRateLimiter` chạy TRƯỚC `UseAuthentication` nên không đọc được `aud` lúc phân vùng → để Cloudflare/Phase 6; Phase 1 chỉ audit-log EXPORT.
  - Việc kế tiếp: user test hồi quy → **Phase 2** (Draft API process riêng).
- 2026-05-24: **Phase 1 ĐÃ TEST ĐẠT** (user xác nhận): login cũ tạo công việc OK (0 hồi quy); login-draft tạo shipment → 403 (kể cả admin). Branch `feature/draft-site-phase1` đã merge vào master (fast-forward, cùng commit hóa đơn ZIP/RAR `16a452d`).
- 2026-05-24: **Phase 2 CODE XONG** — project Draft API riêng `D:\Delta\DeltaSoft\DraftAPI` (.NET 9, build 0 error) + sửa `FilterDraftPermissions` ở NewAPI (branch `feature/draft-site-phase2`). Quyết định mới của user: **quyền nháp suy ra từ quyền ERP** (không cần SQL quyền riêng) + **tất cả endpoint POST**. Chi tiết ở mục PHASE 2. **Chờ user:** điền password `draft_app` trong `appsettings.json` + test end-to-end. Kế tiếp: Phase 3 (site nháp FE).
