# Phát hành & điều chỉnh hóa đơn điện tử qua MISA meInvoice OpenAPI

Nguồn yêu cầu: `NewAPI/Phát hành hóa đơn_Sep 18 2026.docx` (18/09/2026).
Trạng thái: **PHÂN TÍCH & ĐỊNH HƯỚNG — chưa duyệt thiết kế, chưa code, chưa SQL.**

## 1. Tóm tắt yêu cầu gốc (từ docx)

Mục tiêu: tích hợp phát hành HĐĐT tự động vào **Quy trình 5.2** (cung cấp dịch vụ tổng quát), thay thế việc kế toán đăng nhập web MISA nhập tay.

Vai trò 3 bên:
- **Delta MIS** (ERP hiện tại): điều phối — cung cấp dữ liệu, duyệt phát hành, nhận kết quả (mã CQT, PDF, XML).
- **MISA meInvoice**: cổng phát hành HĐĐT, làm việc trực tiếp với Cục thuế + gọi **MISA eSign Cloud** (gói DN kết nối API) để ký số từ xa → mục tiêu "100% không con người can thiệp" (không cắm USB Token thủ công).
- **MISA AMIS**: phần mềm kế toán, lưu trữ + hạch toán hóa đơn.

**Luồng 1 — Phát hành hóa đơn mới:**
1. NV khởi tạo yêu cầu từ "Bảng kê doanh thu dịch vụ" hoặc "Doanh thu trả hộ" trên Delta MIS.
2. Delta MIS gửi thông tin theo **mã DK05** + Bảng kê cần xuất.
3. meInvoice tạo hóa đơn → tự gọi eSign Cloud ký → gửi CQT lấy mã → trả mã CQT + link PDF/XML.
4. Delta MIS lưu trữ + gửi KH; AMIS lưu trữ + hạch toán.

**Luồng 2 — Thay thế/điều chỉnh hóa đơn đã phát hành:**
1. NV chọn hóa đơn sai → chọn "Điều chỉnh" hoặc "Thay thế", nhập lý do, chọn Bảng kê mới.
2. Delta MIS gửi (a) định danh hóa đơn sai (số, ký hiệu, ngày phát hành) + (b) dữ liệu hóa đơn mới theo DK05 + Bảng kê mới.
3. meInvoice tạo → ký → gửi CQT → trả kết quả + cập nhật hóa đơn gốc thành "Bị thay thế"/"Bị điều chỉnh".
4. Delta MIS cập nhật trạng thái hóa đơn cũ, lưu hóa đơn mới; AMIS cập nhật + hạch toán hóa đơn mới.

Tài liệu KHÔNG đề cập: hủy hóa đơn (cancel), tra cứu hàng loạt, gửi email lại — cần hỏi anh có nằm trong scope phase 1 không.

## 2. MISA meInvoice OpenAPI — thực tế xác minh (doc.meinvoice.vn)

### 2.1 Hai kiểu tích hợp MISA cung cấp
- **Tích hợp nhanh**: phần mềm quản lý chỉ đẩy data thô sang, MISA lo phần còn lại (kế toán vẫn thao tác trên web/app MISA để duyệt/ký).
- **Tích hợp sâu (Open API)**: gọi trực tiếp API/SDK để tạo — ký — phát hành — tải — tra cứu, không cần thao tác tay trên MISA. **Đây là hướng đúng với yêu cầu "100% tự động" của Delta.**

### 2.2 Xác thực
- `POST <BaseURL>/auth/token` — body: `appid` (MISA cấp), `taxcode`, `username`, `password` (tài khoản đăng nhập MISA). Trả JWT, **hạn dùng 15 ngày**.
- `POST <BaseURL>/auth/refreshtoken` khi gặp lỗi `TokenExpiredCode`.
- Mọi API khác đính token vào header `Authorization`, header `CompanyTaxCode` khi cần.
- Có `testapi.meinvoice.vn` (sandbox) tách biệt production.

### 2.3 Tạo — Ký — Phát hành (3 bước)
1. **Tạo hóa đơn** — `POST <BaseURL>/itg/invoicepublishing/createinvoice`, body = mảng `OriginalInvoiceData` (seller/buyer, `InvoiceDetail[]`, thuế suất...). Trả `RefID`, `TransactionID`, `InvNo`, `InvDate`, `InvoiceData` (XML **chưa ký**).
2. **Ký số**:
   - Cách cục bộ (USB Token/PIN) qua `SignXML` localhost port 12019-12023 — dành cho máy kế toán, KHÔNG dùng được cho automation server-to-server.
   - Cách **eSign Cloud** (gói DN mà Delta định mua) — cần MISA xác nhận cụ thể: bước ký này được meInvoice tự gọi ngầm khi publish, hay Delta phải tự gọi 1 API riêng của eSign Cloud trước khi publish. **Đây là điểm mù kỹ thuật quan trọng nhất — phải hỏi thẳng MISA/đọc thêm tài liệu eSign Cloud, docx gốc mô tả acts như thể bước ký nằm trong nội bộ luồng của meInvoice.**
3. **Phát hành** — `POST <BaseURL>/itg/invoicepublishing`, body: `RefID`, `TransactionID`, `InvoiceData` (XML đã ký), `IsSendEmail`, `ReceiverEmail`... Trả `Success` + mảng kết quả từng hóa đơn kèm `ErrorCode` cụ thể (SignatureEmpty, InvalidXMLData, RequireInfo_{field}, InvoiceNumberNotContinuous, InvalidTaxCode, InvoiceDuplicated...). **Lưu ý: `Success: true` chỉ nghĩa là request tới được server, phải đọc `ErrorCode` trong `Data` mới biết hóa đơn có thật sự phát hành hay không.**
- Giới hạn: **tối đa 50 hóa đơn/request**.

### 2.4 Thay thế / Điều chỉnh
Cùng 2 API tạo+phát hành ở trên, nhưng `OriginalInvoiceData` thêm:
`ReferenceType` (1 = Thay thế, 2 = Điều chỉnh), `OrgInvoiceType`, `OrgInvTemplateNo`, `OrgInvSeries`, `OrgInvNo`, `OrgInvDate` — trỏ về hóa đơn gốc bị sai. Không có API "sửa" riêng — về bản chất vẫn là phát hành 1 hóa đơn mới có tham chiếu.

### 2.5 Tra cứu trạng thái
`POST <BaseURL>/invoice-status/refid` (hoặc theo mã tra cứu), body = mảng RefID. Trả `InvNo`, `InvDate`, `PublishStatus`, `InvoiceCode` (mã CQT), `SendTaxStatus`, `EInvoiceStatus` (1=gốc/2=đã xóa), `ReferenceType`, `IsSentEmail`, `ReceivedStatus`. → Dùng để **polling xác nhận mã CQT** sau khi publish (vì cấp mã CQT có độ trễ, không đồng bộ tức thời).

### 2.6 Tải PDF/XML
`POST <BaseURL>/.../download?downloadDataType=XML|PDF|ALL`, body = mảng mã tra cứu (tối đa 50/request). `ALL` = ZIP base64 chứa cả PDF+XML.

## 3. Đối chiếu với Delta MIS hiện tại

| Khái niệm trong docx | Ánh xạ hiện có trong ERP |
|---|---|
| "Bảng kê doanh thu dịch vụ" | Module **Debit Note** (`shipments/debit-note`) — bảng kê phí gửi khách hàng |
| "Doanh thu trả hộ" | Module **On-Behalf Payment** (`accounting/on-behalf-payment`) |
| Mã DK05 | Gắn với `SalesCustomer` (đã có `SP_SalesCustomer_ExportDK05`) — cần xác nhận DK05 chứa đúng thông tin buyer (tên/MST/địa chỉ) cho hóa đơn |
| Sổ hóa đơn đã phát hành | **`ExportInvoice`** (`accounting/export-invoice`) — model đã có sẵn gần như đúng field MISA trả về (`InvoiceNo`, `FormNo`/`Serial`, `InvoiceDate`, seller Delta_*, buyer Customer*, `VatRate/VatAmount/Total/GrandTotal`, `InvoiceDetails[]`). Hiện tại đây là **sổ nhập tay** sau khi kế toán tự phát hành thủ công trên web MISA. |

**Nhận xét quan trọng**: `ExportInvoice` gần như là "bản sao dữ liệu" của response MISA trả về — đây chính là chỗ landing tự nhiên cho hóa đơn phát hành tự động, KHÔNG cần bảng mới cho phần lưu trữ hiển thị. Nhưng theo nguyên tắc "SP/BE/FE hiện hữu bất khả xâm phạm", **không sửa trực tiếp** luồng nhập tay hiện tại của `ExportInvoice`.

## 4. Điểm mù / giả định cần anh xác nhận trước khi thiết kế SQL

1. **Hợp đồng & tài khoản MISA**: Delta đã có `AppId` + tài khoản meInvoice (username/password) + gói eSign Cloud API chưa, hay đang ở bước đề xuất mua? (Quyết định timeline — không thể pilot nếu chưa có sandbox `testapi.meinvoice.vn`.)
2. **Cơ chế ký eSign Cloud**: server-to-server ký tự động nằm trong bước nào của API (cần hỏi MISA support / đọc thêm tài liệu riêng eSign Cloud, chưa thấy trong doc.meinvoice.vn phần Open API chung).
3. **DK05 chứa gì**: cần xem output thật của `SP_SalesCustomer_ExportDK05` để biết đã đủ field buyer cho hóa đơn (tên, MST, địa chỉ, email) hay phải bổ sung.
4. **Landing hóa đơn tự động vào đâu**: mở rộng thêm cột (RefID, TransactionID, PublishStatus, InvoiceCode-CQT, ReferenceType, OriginalInvoiceId, link PDF/XML) vào bảng `ExportInvoice` hiện có (ALTER thêm cột, không đụng cột cũ) **hay** tạo bảng mới hoàn toàn song song? → Đề xuất nghiêng về **mở rộng `ExportInvoice`** vì schema đã khớp ~80%, nhưng đây là quyết định tradeoff cần anh chốt.
5. **Phạm vi phase 1**: có bao gồm "Hủy hóa đơn" không, hay chỉ Phát hành mới + Thay thế/Điều chỉnh như docx mô tả?
6. **Polling mã CQT**: cấp mã có độ trễ — cần cơ chế nào (background job / SignalR refresh) để cập nhật `PublishStatus` sau khi publish, tránh user phải tự bấm tra cứu?
7. **Đồng bộ MISA AMIS**: docx nói AMIS tự "lưu trữ + hạch toán" — việc này MISA tự làm nội bộ (vì meInvoice + AMIS cùng hệ sinh thái MISA) hay Delta MIS phải gọi thêm API AMIS riêng? Chưa có thông tin — cần hỏi MISA.

## 5. Đề xuất hướng kiến trúc (chờ anh duyệt)

- **Tạo mới hoàn toàn song song** theo nguyên tắc dự án: 1 tầng tích hợp mới `MeInvoiceApiClient` (BE, .NET 9) đóng gói auth/token-cache/createinvoice/publish/status/download; KHÔNG đụng `ExportInvoiceRepository`/SP nhập tay hiện tại.
- Thêm hành động **"Phát hành hóa đơn điện tử"** trên 2 màn hình nguồn (Debit Note, On-Behalf Payment) → gọi SP mới (vd `SP_ExportInvoice_CreateFromDraft` hoặc tên khác theo đúng quy ước, sẽ chốt tên khi duyệt) tạo bản ghi `ExportInvoice` ở trạng thái "Đang phát hành" → BE gọi MISA → cập nhật kết quả.
- Thay thế/Điều chỉnh: hành động mới trên list `export-invoice`, tham chiếu `OriginalInvoiceId` sang chính bảng `ExportInvoice`.
- **Pilot**: 1 khách hàng / 1 luồng (chọn Debit Note trước, vì đơn giản hơn On-Behalf Payment) → chạy sandbox `testapi.meinvoice.vn` → anh xác nhận đúng → nhân rộng sang luồng còn lại + Thay thế/Điều chỉnh.

## 6. Việc cần làm tiếp theo (KHÔNG tự làm, chờ anh)

- [ ] Anh xác nhận trạng thái hợp đồng/tài khoản MISA (mục 4.1) — nếu chưa có sandbox, không thể pilot kỹ thuật ngay.
- [ ] Anh trả lời mục 4.3–4.5 (DK05, landing table, phạm vi phase 1).
- [ ] Sau khi chốt, em soạn thiết kế SQL chi tiết (cột thêm vào `ExportInvoice`, SP mới) để anh duyệt trước khi tạo.
