# PROMPT bàn giao đội Mobile — Cập nhật workflow lệnh FCL v2 sang `ChangeStatus`

> Copy nguyên khối "PROMPT" bên dưới cho AI agent / dev của app mobile. Contract đã verify từ source ERP (2026-07-11). App mobile KHÔNG cần source ERP — mọi thứ cần đã ở đây (và trong skill `fcl-mobile-api`).

---

## PROMPT

Bạn đang bảo trì **app mobile của lái xe** (repo riêng, gọi API ERP DeltaSoft). Nhiệm vụ: **chuyển luồng đổi trạng thái lệnh FCL MỚI (isLegacy=0) từ `updatestate` sang endpoint mới `ChangeStatus`**. ERP đã đổi quy trình duyệt; nếu app mobile còn gọi `updatestate` cho lệnh v2 thì DB sẽ đi nhầm stored procedure cũ (SP cũ KHÔNG chặn chiều này) → sai trạng thái mà không báo lỗi.

### Bối cảnh thay đổi
- Lệnh FCL mới (`isLegacy=0`) nay dùng SP `SP_DispatchOrderFCL_ChangeStatus` — 1 transaction: validate transition + ghi audit log + (khi chốt) tự chốt dầu. SP **chặn `isLegacy=1`** (RAISERROR).
- Trạng thái khởi tạo của lệnh = **1** (không còn 0). Không còn status 4 (Duyệt B2 đã bỏ).
- Lái xe chỉ thao tác **3 action**: Nhận lệnh, Hoàn thành lệnh, Từ chối nhận. Các action duyệt/chốt (3/4/6/7) là của web (điều vận/người chốt).

### Endpoint & envelope (POST, JSON, header `Authorization: Bearer <JWT>` — hoặc `tokenKey` trong body theo chuẩn hiện có của app)
**Đổi trạng thái:**
```
POST /api/DispatchOrderFcl/ChangeStatus
{ "tokenKey": "<JWT>",
  "item": { "refNo": "FCL-...", "actionType": <1..7>, "reason": <string|null> } }
```
- **KHÔNG gửi `status`** — server tự suy target status từ `actionType`.
- `reason` **BẮT BUỘC** khi từ chối (actionType 5/6/7); rỗng → server RAISERROR → HTTP 400.
- Response thành công: `{ "code": "200", "data": { "fromStatus", "toStatus", "isReject" } }`.
- Mọi vi phạm luật (sai transition, không phải lái xe của lệnh, lệnh legacy…) → **`code = "400"` + `message` nguyên văn** → hiển thị message đó cho user, KHÔNG coi là lỗi hệ thống.

**Bảng ActionType (app mobile chỉ dùng 1, 2, 5):**

| actionType | Tên | From→To | Ai (server kiểm) |
|---|---|---|---|
| **1** | Nhận lệnh | 1→2 | **lái xe của lệnh** (SP kiểm `@EmployeeId == DriverId`) |
| **2** | Hoàn thành lệnh | 2→3 | **lái xe của lệnh** (SP) |
| **5** | Từ chối nhận | 1→1 (IsDeny) | **lái xe** (SP) — reason bắt buộc |
| 3 | Duyệt B1 | 3→5 | FCL_ACCEPT (web) — *không dùng ở mobile* |
| 4 | Chốt lệnh | 5→6 | FCL_CLOSING (web) — *không dùng ở mobile* |
| 6 | Từ chối B1 | 3→2 | FCL_ACCEPT (web) |
| 7 | Từ chối CHỐT | 5→3 | FCL_CLOSING (web) |

**Timeline lịch sử (màn "Lịch sử lệnh"):**
```
POST /api/DispatchOrderFcl/GetStatusLog
{ "tokenKey": "<JWT>", "item": { "refNo": "FCL-..." } }
```
→ mảng `{ actionType, fromStatus, toStatus, isReject, reason, actionByName, createdDate }` (append-only). Dòng `isReject=true` tô đậm + hiện `reason`.

### Luồng màn lái xe theo status (v2)
| status | Nghĩa | Nút hiện cho lái xe |
|---|---|---|
| **1** | Đã giao lái xe | **Nhận lệnh** → `ChangeStatus(actionType:1)` · **Từ chối nhận** → nhập lý do → `ChangeStatus(actionType:5, reason)` |
| **2** | Lái xe đã nhận | Nhập km/chi phí → `POST /api/DispatchOrderFcl/driverUpdate` (lưu, không đổi status) · **Hoàn thành lệnh** = gọi `driverUpdate` (lưu km/chi phí, `finished:true`) **rồi** `ChangeStatus(actionType:2)` |
| **3** | Chờ duyệt | (khóa — điều vận duyệt trên web) |
| **5** | Chờ chốt | (khóa) |
| **6** | Đã chốt | (khóa) |

`driverUpdate` — **CẬP NHẬT 2026-07-11**: nay lưu THÊM Chi phí (`listFee`) + Trốn vé (`listEtc.isPassed`). Lưu **1 LẦN (batch)** khi lái xe bấm Lưu / Hoàn thành — KHÔNG gọi API cho từng dòng phí. Gửi **nguyên `entity`** (toàn bộ `listFee`, `listEtc` đã sửa) trong 1 request:
```
POST /api/DispatchOrderFcl/driverUpdate
{ "tokenKey":"<JWT>", "item": {
    "refNo":"FCL-...", "startVehicleOdor":<int>, "finishVehicleOdor":<int>,
    "finished":<bool>, "noteFinished":"...",
    "listFee": [ { "id":<int|null>, "feeId":<int>, "contents":"...", "cost":<num>, "vat":<num>, "totalCost":<num> } ],
    "listEtc": [ { "id":<int>, "isPassed":<bool> } ]      // các field khác của etc giữ nguyên như GetByRefNoWithTO trả về
} }
```
Mỗi dòng `listFee` có thêm **phân loại chứng từ** `invoiceType` (2026-07-11):
- `invoiceType`: **0** = Không có hóa đơn · **1** = Có phiếu thu (không nhập thêm; số phiếu ghi vào `contents`) · **2** = Có hóa đơn → **BẮT nhập đủ 6 field**: `invoiceNo`, `invoiceDate` (dd/MM/yyyy), `invoicePattern` (ký hiệu), `taxNumber` (MST người bán), `web` (trang tra cứu), `code` (mã tra cứu). App phải **validate** đủ 6 field trước khi gửi; thiếu → chặn tại app.
- Khi đổi `invoiceType` về 0/1 → app tự xóa 6 field HĐ.
- Ví dụ 1 dòng "có hóa đơn": `{ "id":123, "feeId":45, "contents":"...", "cost":100000, "vat":8000, "totalCost":108000, "invoiceType":2, "invoiceNo":"0001234", "invoiceDate":"05/07/2026", "invoicePattern":"1C25TAA", "taxNumber":"0101234567", "web":"tracuuhoadon.gdt.gov.vn", "code":"ABC123" }`.

Quy tắc BE (SP tự xử, chỉ áp cho `isLegacy=0`):
- **listFee**: MERGE theo `id` — dòng có `id` = sửa; dòng mới (không `id`/`id`=0) = thêm; dòng đã bỏ khỏi mảng = xóa. → App phải gửi **toàn bộ** danh sách phí hiện có (không phải chỉ dòng mới), giữ nguyên `id` của dòng cũ. 6 field HĐ + `invoiceType` lưu kèm mỗi dòng.
- **listEtc**: chỉ đổi cờ `isPassed` theo `id` (không thêm/xóa trạm). App gửi lại nguyên list ETC (đã lấy từ `GetByRefNoWithTO`), chỉ toggle `isPassed`.
- km đầu/cuối lưu kiểu **int** (số lẻ bị cắt).

### Việc cần làm
1. Thêm 2 hàm API client: `changeStatus(refNo, actionType, reason?)` và `getStatusLog(refNo)`.
2. Thay MỌI chỗ đang gọi `updatestate` cho lệnh v2 (Nhận/Hoàn thành/Từ chối nhận) bằng `changeStatus` với đúng actionType. **Không gửi `status`.**
3. "Hoàn thành lệnh": gọi `driverUpdate(finished:true)` (kèm `listFee`+`listEtc` hiện tại) trước, thành công thì `changeStatus(actionType:2)`.
3b. Màn nhập của lái xe (status 1/2): cho thêm/sửa/xóa dòng **Chi phí** + tick **Trốn vé** trên UI (in-memory), chỉ đẩy lên server khi bấm **Lưu thông tin** hoặc **Hoàn thành** (batch). Gửi TOÀN BỘ `listFee`/`listEtc`, giữ `id` dòng cũ.
4. "Từ chối nhận": bắt buộc nhập lý do (không rỗng) trước khi gọi `changeStatus(5, reason)`.
5. Bắt lỗi: response `code=="400"` → hiển thị `message` (là văn bản tiếng Việt từ SP), KHÔNG hiển thị "lỗi hệ thống".
6. (Nếu có) màn "Lịch sử lệnh": nạp từ `getStatusLog`, dòng từ chối tô đậm + hiện lý do.
7. Nếu app còn hỗ trợ lệnh cũ (`isLegacy=1`): GIỮ `updatestate` cho các lệnh đó; chỉ lệnh `isLegacy=0` mới dùng `ChangeStatus`. (Field `isLegacy` có trong response `GetByRefNoWithTO`/`getPaging`.)

### Tiêu chí nghiệm thu
- Lái xe mở lệnh status 1 → Nhận lệnh → lệnh về status 2 (mobile refresh thấy).
- Nhập km + thêm 2 dòng Chi phí + tick 1 Trốn vé → bấm Lưu → đọc lại (`GetByRefNoWithTO`) thấy đủ km + 2 phí + cờ trốn vé đã lưu.
- Xóa 1 dòng phí rồi Lưu → đọc lại thấy dòng đó biến mất (MERGE xóa đúng).
- Hoàn thành → status 3; đọc lại thấy km/chi phí/trốn vé đã lưu.
- Từ chối nhận không nhập lý do → app chặn; nhập lý do → `IsDeny`, lệnh vẫn status 1, có dòng trong GetStatusLog.
- Không lái xe của lệnh bấm Nhận → nhận HTTP 400 + message "không phải lái xe…" (SP chặn), app hiển thị message.
- KHÔNG còn lời gọi `updatestate` nào cho lệnh `isLegacy=0`.

> Chi tiết đầy đủ (auth, model TO↔FCL, công thức dầu, ETC, extra segment, lookups) xem skill **`fcl-mobile-api`** — §4.6 (ChangeStatus/GetStatusLog), §4.7 (driverUpdate), §6 (status workflow & locking).

---

## Ghi chú cho phía ERP (không thuộc prompt mobile)
- Endpoint `ChangeStatus`/`GetStatusLog` đã có ở `DispatchOrderFCLController` (BE deploy kèm đợt FCL v2).
- Điều kiện chạy: SQL `Migration_FCLStatusLog_20260710.sql` đã chạy; grant `FCL_ACCEPT` cho DV/DV-M (owner tự làm); status khởi tạo=1 trong `SP_DispatchOrderFCL_CreateWithTO` (owner tự sửa).
- Nguồn: skill `fcl-mobile-api` + done.md "FCL v2 Workflow" (2026-07-10 BE, 2026-07-11 FE).
