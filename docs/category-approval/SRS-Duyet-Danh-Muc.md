# SRS — Quy trình Đề xuất & Duyệt Danh mục (Master Data Change Approval)

**Mã tài liệu:** SRS-CATAPP-001
**Phiên bản:** 0.2 (Draft — sửa theo phản hồi: MỌI thao tác đều qua đề xuất; áp chung mọi loại danh mục)
**Ngày:** 2026-08-01
**Hệ thống:** DeltaSoft ERP (Angular 15 + ASP.NET Core .NET 9 + Dapper + SQL Server 2014)
**Phạm vi kiến trúc:** Phương án A — Hàng chờ đề xuất song song (Pending Change Request Queue)

---

## 1. Giới thiệu

### 1.1. Mục đích
Thiết lập **quy trình đề xuất — duyệt** cho **mọi thay đổi Danh mục** (master data). Mọi thao tác **Tạo mới / Cập nhật / Xóa** trên bất kỳ loại danh mục nào (Khách hàng, NCC, Xe, Phí, Cung đường, Trạm thu phí...) sẽ **không tác động trực tiếp** vào dữ liệu thật nữa, mà tạo thành một **ĐỀ XUẤT** chờ duyệt. **Chỉ khi được duyệt**, hệ thống mới thực sự **tạo mới / cập nhật / xóa** bản ghi danh mục tương ứng.

### 1.2. Nguyên tắc cốt lõi (đã chốt với anh)
1. **KHÔNG ai áp thẳng.** Mọi thao tác tạo/sửa/xóa danh mục — kể cả của người có quyền duyệt — đều phải đi qua bước **đề xuất → duyệt**. Không còn CRUD trực tiếp cho các danh mục đã bật cơ chế này.
2. **Áp chung cho MỌI loại danh mục** ngay từ đầu (không pilot lẻ, không dính logic Locked riêng của Customer).
3. Khi duyệt → hệ thống thực thi **đúng 1 hành động** trên **đúng 1 bản ghi** danh mục (Create → thêm 1 bản ghi; Update → sửa 1 bản ghi; Delete → xóa 1 bản ghi).

### 1.3. Nguyên tắc thiết kế (bám CLAUDE.md)
- **Surgical:** KHÔNG ALTER bảng danh mục, KHÔNG sửa SP danh mục cũ. Cơ chế nằm ở bảng + SP + code MỚI song song.
- **Reuse:** Khi duyệt, BE gọi lại **đúng repo/SP Create/Update/Delete hiện có** — không viết lại logic.
- **Verify trước khi báo xong:** `tsc`/`ng build` sạch; BE build sạch.
- **DB chỉ đọc từ phía Claude:** thay đổi schema giao dưới dạng file `.sql`, anh tự chạy.

### 1.4. Thuật ngữ
| Thuật ngữ | Ý nghĩa |
|---|---|
| **Danh mục / Category** | Master data: Khách hàng, NCC, Xe, Phí, Cung đường, Trạm thu phí... (31 loại) |
| **Đề xuất / Change Request** | 1 dòng trong `Tbl_CategoryApproval` mô tả 1 thao tác Create/Update/Delete đang chờ duyệt |
| **Người đề xuất / Requester** | Bất kỳ ai có quyền thao tác danh mục (`_CREATE/_UPDATE/_DELETE`) |
| **Người duyệt / Approver** | Người có quyền `{CODE}_ACCEPT` của loại danh mục đó |
| **Apply / Thực thi** | BE gọi SP thật để hiện thực hóa đề xuất khi được duyệt |
| **Payload** | JSON chứa DTO đầy đủ của thao tác (giống envelope draft-site) |

### 1.5. Tài liệu liên quan
- SOP-CATAPP-001 — Quy trình vận hành (song sinh).
- CLAUDE.md — nguyên tắc & kiến trúc dự án.
- Draft-site architecture — tiền lệ envelope JSON + promote.

---

## 2. Mô tả tổng quan

### 2.1. Bối cảnh sản phẩm
Cơ chế **thay thế** đường CRUD trực tiếp của danh mục bằng một trạm đề xuất — duyệt:

```
[Modal Danh mục]  --Lưu / Xóa-->  LUÔN tạo ĐỀ XUẤT (Tbl_CategoryApproval, Status=0)
                                          │
                       [Màn Duyệt Danh mục]
                                          │
                 ┌────── Duyệt ───────────┼───────── Từ chối ──────┐
                 ▼                         │                        ▼
   BE apply: gọi SP thật                   │              Status=-1 + lý do
   (Create/Update/Delete 1 bản ghi)        │              (không đụng dữ liệu thật)
                 ▼                    Người đề xuất Rút
   Status=1 (Đã duyệt)               → Status=-2 (Đã hủy)
```

**Không có nhánh "áp thẳng".** Người thao tác dù có quyền duyệt hay không, khi bấm Lưu/Xóa đều sinh ra 1 đề xuất.

### 2.2. Chức năng chính
1. **Tạo đề xuất** (Submit) — từ modal danh mục, cho cả 3 hành động Create/Update/Delete.
2. **Danh sách chờ duyệt** (Review list) — màn duyệt chung, lọc theo loại/hành động/trạng thái/chi nhánh/từ khóa.
3. **Xem chi tiết + so sánh (diff)** — bản hiện tại vs đề xuất (cho Update); bản sắp xóa (cho Delete).
4. **Duyệt** (Approve) — thực thi thao tác vào bảng thật, đánh dấu đã duyệt (idempotent).
5. **Từ chối** (Reject) — kèm lý do.
6. **Rút đề xuất** (Cancel) — chỉ người tạo đề xuất, khi còn đang chờ.

### 2.3. Đối tượng người dùng
| Vai trò | Quyền | Hành vi |
|---|---|---|
| Người đề xuất | `{CODE}_CREATE/_UPDATE/_DELETE` | Thao tác trên danh mục → LUÔN tạo đề xuất; theo dõi & rút đề xuất của mình |
| Người duyệt | `{CODE}_ACCEPT` | Duyệt/Từ chối đề xuất; khi tự thao tác vẫn tạo đề xuất (không áp thẳng) |
| Admin | bypass quyền | Toàn quyền duyệt |

### 2.4. Ràng buộc
- **SQL Server 2014:** KHÔNG `JSON_VALUE`/`CREATE OR ALTER`/`DROP IF EXISTS`/`STRING_SPLIT`/`STRING_AGG`. PayloadJson lưu/đọc dạng NVARCHAR; parse ở C# (Newtonsoft).
- **TokenKey:** endpoint mutating theo chuẩn `FromBodyBase<T>` + `CheckTokenKey()`.
- **Phân quyền:** `[ClaimRequirement(FunctionCode, ActionCode)]`; duyệt gate bằng `{CODE}_ACCEPT`.

### 2.5. Giả định & phụ thuộc
- **GĐ-1:** Bản ghi mới đề xuất **CHƯA có mặt** trong nghiệp vụ (lô/lệnh) cho tới khi được duyệt — chấp nhận được với master data.
- **GĐ-2:** `CreatedBy/ReviewedBy` kiểu `UNIQUEIDENTIFIER` (UserId từ JWT).
- **GĐ-3 (✅ đã chốt):** Người duyệt **ĐƯỢC tự duyệt đề xuất của chính mình** (không bắt tách bạch người đề xuất ≠ người duyệt). Miễn có quyền `{CODE}_ACCEPT` của loại đó là duyệt được, kể cả đề xuất do mình tạo.

---

## 3. Yêu cầu chức năng (Functional Requirements)

> Ưu tiên: **M** = Bắt buộc, **S** = Nên có, **C** = Có thể.

### FR-01 (M) — Tạo đề xuất (Submit)
- **FR-01.1** Khi bấm Lưu (thêm/sửa) hoặc Xóa ở modal/màn danh mục, hệ thống **KHÔNG gọi SP tạo/sửa/xóa thật** mà gọi `Submit` để ghi 1 dòng `Tbl_CategoryApproval` với `Status=0`. **Áp cho mọi người dùng** (kể cả người có `_ACCEPT`).
- **FR-01.2** Payload lưu đúng DTO mà luồng CRUD thật cần (đủ field để thực thi không thiếu dữ liệu).
- **FR-01.3** `Action` = `Create` (TargetId NULL) / `Update` (TargetId = id bản ghi) / `Delete` (TargetId = id bản ghi).
- **FR-01.4** `Summary` sinh từ trường đại diện (vd tên KH, mã phí) để hiển thị nhanh ở màn duyệt.
- **FR-01.5** `BranchId` lấy từ token (`obj.BranchId ?? obj.Item?.BranchId ?? User.GetBranchId()`), KHÔNG cho FE tự nhập.
- **FR-01.6** Thành công → thông báo "Đã gửi đề xuất, chờ duyệt", đóng modal, KHÔNG thay đổi bảng danh mục thật.

### FR-02 (M) — Không CRUD trực tiếp
- **FR-02.1** Với các loại danh mục đã bật cơ chế, **không tồn tại đường tạo/sửa/xóa trực tiếp** trên UI — tất cả đi qua đề xuất. (BE có thể vẫn giữ endpoint CRUD cũ cho hệ thống/khởi tạo, nhưng UI danh mục không gọi trực tiếp nữa.)

### FR-03 (M) — Danh sách chờ duyệt
- **FR-03.1** Màn "Duyệt Danh mục" hiển thị các đề xuất qua `GetPaging`.
- **FR-03.2** Bộ lọc: `CategoryType`, `Action`, `Status` (mặc định 0=chờ), `BranchId`, `Keyword`.
- **FR-03.3** Cột: Loại danh mục, Hành động, Tóm tắt, Người đề xuất, Ngày gửi, Trạng thái, Tác vụ.
- **FR-03.4** Phân trang chuẩn dự án.

### FR-04 (S) — Xem chi tiết + so sánh (diff)
- **FR-04.1** Mở 1 đề xuất → `GetById` trả payload + (với Update/Delete) bản hiện tại thật.
- **FR-04.2** Update: hiển thị **diff theo field** (giá trị cũ ↔ mới), tô khác biệt.
- **FR-04.3** Create: hiển thị toàn bộ payload. Delete: hiển thị bản sắp xóa + cảnh báo.

### FR-05 (M) — Duyệt (Approve) + Thực thi
- **FR-05.1** Chỉ người có `{CODE}_ACCEPT` của loại đó được duyệt. **Được phép tự duyệt** đề xuất do chính mình tạo (GĐ-3).
- **FR-05.2** BE nạp đề xuất, **guard `Status=0`** (nếu khác → "đã xử lý", idempotent).
- **FR-05.3** Theo `CategoryType` chọn **applier**; deserialize payload → DTO → gọi repo thật:
  - `Create` → `SP_<Cat>_Create` (thêm 1 bản ghi)
  - `Update` → `SP_<Cat>_Update` (sửa 1 bản ghi theo TargetId)
  - `Delete` → `SP_<Cat>_Delete` (xóa 1 bản ghi theo TargetId)
- **FR-05.4** CHỈ khi SP thật thành công mới gọi `SP_CategoryApproval_Approve` set `Status=1`, `ReviewedBy/Date`, `AppliedRefId` (Create → id mới).
- **FR-05.5** Nếu SP thật lỗi (trùng mã, ràng buộc) → giữ `Status=0`, trả lỗi rõ, KHÔNG đánh dấu đã duyệt.

### FR-06 (M) — Từ chối (Reject)
- **FR-06.1** Người duyệt nhập **lý do bắt buộc** → set `Status=-1` + Reason + reviewer.
- **FR-06.2** Không đụng bảng danh mục thật.

### FR-07 (S) — Rút đề xuất (Cancel)
- **FR-07.1** Chỉ **người tạo đề xuất** và chỉ khi `Status=0` → set `Status=-2`.
- **FR-07.2** KHÔNG yêu cầu quyền ACCEPT.

### FR-08 (C) — Theo dõi đề xuất của tôi
- **FR-08.1** Người đề xuất xem lại các đề xuất đã gửi + trạng thái + lý do từ chối.

### FR-09 (M) — Chống xung đột & trùng
- **FR-09.1** Update/Delete: khi duyệt, nếu bản ghi thật `TargetId` không còn tồn tại → báo lỗi, không thực thi.
- **FR-09.2** Nhiều đề xuất chờ trên cùng `TargetId`: cho phép tồn tại; khi duyệt cái sau BE dùng dữ liệu bảng thật tại thời điểm duyệt.

---

## 4. Yêu cầu phi chức năng (Non-Functional)

| Mã | Yêu cầu |
|---|---|
| NFR-01 | **An toàn dữ liệu:** không thao tác nào làm hỏng/mất bản ghi hiện có. Từ chối/hủy không đụng bảng thật. |
| NFR-02 | **Idempotent:** bấm Duyệt 2 lần không tạo/sửa trùng (guard Status). |
| NFR-03 | **Truy vết:** mỗi đề xuất lưu đủ ai gửi / ai duyệt / khi nào / lý do / id kết quả. |
| NFR-04 | **Hiệu năng:** màn duyệt tải nhanh với index theo `CategoryType, Status, BranchId`. |
| NFR-05 | **Mở rộng:** thêm 1 loại danh mục vào cơ chế = thêm 1 applier + chuyển modal sang Submit, KHÔNG đụng hạ tầng. |
| NFR-06 | **Tương thích SQL 2014.** |
| NFR-07 | **Bảo mật:** mọi endpoint qua `[ClaimRequirement]` + `CheckTokenKey`. |

---

## 5. Thiết kế dữ liệu

### 5.1. Bảng `Tbl_CategoryApproval`
```
Id            INT IDENTITY(1,1) PRIMARY KEY
CategoryType  VARCHAR(50)   NOT NULL   -- 'Customer','Fee','Vehicle',...
Action        VARCHAR(10)   NOT NULL   -- 'Create'|'Update'|'Delete'
TargetId      INT           NULL       -- id bản ghi thật (Update/Delete)
PayloadJson   NVARCHAR(MAX) NOT NULL   -- DTO đầy đủ
Summary       NVARCHAR(255) NULL       -- mô tả ngắn cho list
Status        INT           NOT NULL DEFAULT(0)  -- 0 chờ,1 duyệt,-1 từ chối,-2 hủy
Reason        NVARCHAR(500) NULL
BranchId      INT           NULL
CreatedBy     UNIQUEIDENTIFIER NULL
CreatedName   NVARCHAR(100) NULL
CreatedDate   DATETIME      NOT NULL DEFAULT(GETDATE())
ReviewedBy    UNIQUEIDENTIFIER NULL
ReviewedDate  DATETIME      NULL
AppliedRefId  INT           NULL       -- id bản ghi thật sau khi thực thi
```
**Index:** `IX_CategoryApproval_Type_Status (CategoryType, Status, BranchId)`.

### 5.2. Trạng thái (state machine)
```
Submit → [0 Chờ duyệt] → Approve (thực thi SP thật OK) → [1 Đã duyệt] (chốt)
                       → Reject (+ lý do)               → [-1 Từ chối] (chốt)
                       → Cancel (người tạo đề xuất)     → [-2 Đã hủy]  (chốt)
```
Chỉ `Status=0` mới chuyển tiếp. Các trạng thái `1/-1/-2` là chốt.

---

## 6. Thiết kế Stored Procedure (mới — chờ anh duyệt)

| SP | Tham số chính | Vai trò |
|---|---|---|
| `SP_CategoryApproval_Submit` | `@CategoryType,@Action,@TargetId,@PayloadJson,@Summary,@BranchId,@CreatedBy,@CreatedName` | INSERT đề xuất, trả `Id` |
| `SP_CategoryApproval_GetPaging` | `@CategoryType,@Action,@Status,@BranchId,@Keyword,@PageIndex,@PageSize` | List + tổng dòng |
| `SP_CategoryApproval_GetById` | `@Id` | 1 đề xuất chi tiết |
| `SP_CategoryApproval_Approve` | `@Id,@ReviewedBy,@AppliedRefId` | Guard `Status=0` → `Status=1` |
| `SP_CategoryApproval_Reject` | `@Id,@ReviewedBy,@Reason` | Guard `Status=0` → `Status=-1` |
| `SP_CategoryApproval_Cancel` | `@Id,@CreatedBy` | Guard `Status=0` AND người tạo đề xuất → `Status=-2` |

> Tên chuẩn `SP_<TableName>_<Action>`. Additive, idempotent (guard trước khi đổi). KHÔNG đụng SP danh mục.

---

## 7. Thiết kế API (Backend)

`CategoryApprovalController` (mới) + `ICategoryApproval`/`CategoryApprovalRepository` (Scrutor auto-scan):

| Endpoint (POST) | Quyền | Ghi chú |
|---|---|---|
| `/api/CategoryApproval/Submit` | `{CODE}_CREATE/_UPDATE/_DELETE` theo Action | Ghi đề xuất |
| `/api/CategoryApproval/GetPaging` | `{CODE}_ACCEPT` | List duyệt |
| `/api/CategoryApproval/GetById` | `{CODE}_ACCEPT` | Chi tiết + bản hiện tại |
| `/api/CategoryApproval/Approve` | `{CODE}_ACCEPT` | **Thực thi** rồi mark |
| `/api/CategoryApproval/Reject` | `{CODE}_ACCEPT` | Từ chối |
| `/api/CategoryApproval/Cancel` | token, người tạo đề xuất | Rút |

### 7.1. Cơ chế Apply (dispatch) — dùng chung cho MỌI loại danh mục
```
interface ICategoryApprovalApplier {
    string CategoryType { get; }        // "Customer","Fee",...
    Task<int> ApplyCreate(string payloadJson, ...);  // → id mới
    Task<int> ApplyUpdate(string payloadJson, int targetId, ...);
    Task<int> ApplyDelete(int targetId, ...);
}
```
- Đăng ký các applier vào `IReadOnlyDictionary<string, ICategoryApprovalApplier>` (DI).
- `Approve` → resolve theo `CategoryType` → gọi đúng hàm → nhận `AppliedRefId` → `SP_..._Approve`.
- **Mỗi loại danh mục = 1 applier ~30 dòng** gọi lại repo/SP Create/Update/Delete hiện có. Vì áp chung mọi loại, ta đăng ký applier cho toàn bộ (làm theo đợt, nhưng cơ chế chung sẵn sàng từ đầu).

---

## 8. Luồng xử lý (sequence tóm tắt)

### 8.1. Tạo đề xuất
```
FE modal Lưu/Xóa → POST Submit(CategoryType, Action, TargetId, Payload)
   → SP_CategoryApproval_Submit → Status=0 → toast "Đã gửi đề xuất, chờ duyệt"
```
### 8.2. Duyệt → thực thi
```
FE màn duyệt → chọn đề xuất → POST Approve(Id)
   BE: GetById (guard Status=0)
       → applier[CategoryType].Apply<Create/Update/Delete>(payload/targetId) → SP_<Cat> thật → refId
       → SP_CategoryApproval_Approve(Id, reviewer, AppliedRefId=refId) → Status=1
   → FE reload; bản ghi danh mục thật được thêm/sửa/xóa
```
### 8.3. Từ chối / Rút — set -1 / -2, không đụng bảng thật.

---

## 9. Ma trận phân quyền

| Hành động | Người đề xuất (`_CRUD`) | Người duyệt (`_ACCEPT`) | Admin |
|---|:---:|:---:|:---:|
| Tạo/Sửa/Xóa danh mục | → tạo đề xuất | → tạo đề xuất (không áp thẳng) | → tạo đề xuất |
| Xem màn duyệt | (chỉ đề xuất của mình – FR-08) | ✔ | ✔ |
| Duyệt / Từ chối | ✘ | ✔ | ✔ |
| Rút đề xuất | ✔ (của mình) | ✔ (của mình) | ✔ |

---

## 10. Kế hoạch triển khai

| Giai đoạn | Nội dung | Đầu ra |
|---|---|---|
| **P0** | Anh duyệt SRS + SOP này | Chốt thiết kế |
| **P1** | File `.sql`: `Tbl_CategoryApproval` + 6 SP | Anh tự chạy |
| **P2** | BE: controller + repo + interface + cơ chế applier (dictionary DI) | build sạch |
| **P3** | FE: màn "Duyệt Danh mục" chung + chuyển các modal danh mục sang Submit | `ng build` sạch |
| **P4** | Nhân rộng applier + chuyển modal cho từng loại danh mục (theo đợt) + test E2E | Anh xác nhận |

> Cơ chế **chung cho mọi loại danh mục** ngay từ P2; P3/P4 là công đoạn nối từng loại vào cơ chế (mỗi loại: 1 applier + chuyển modal). Có thể làm cuốn chiếu để giảm rủi ro, nhưng không phải "pilot 1 loại rồi mới thiết kế lại".

---

## 11. Vấn đề mở (cần anh quyết)
> **Đã chốt:** GĐ-3 — người duyệt được tự duyệt đề xuất của chính mình.
1. Thứ tự nối các loại danh mục vào cơ chế (làm loại nào trước)?
2. Chính sách nhiều đề xuất chờ trên cùng bản ghi (FR-09.2) — cho phép hay khóa 1 đề-xuất/bản-ghi?
3. Có cần **thông báo** (SignalR/FCM) cho người duyệt khi có đề xuất mới không?
4. Có cần giữ lại đường CRUD trực tiếp cho **Admin/khởi tạo dữ liệu** (bỏ qua đề xuất) không, hay tuyệt đối mọi thứ qua đề xuất?

---
*Hết SRS. Xem SOP-CATAPP-001 cho quy trình vận hành người dùng.*
