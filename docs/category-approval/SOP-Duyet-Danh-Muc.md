# SOP — Quy trình Đề xuất & Duyệt Danh mục (Master Data Change Approval)

**Mã tài liệu:** SOP-CATAPP-001
**Phiên bản:** 0.2 (Draft — MỌI thao tác đều qua đề xuất; áp chung mọi loại danh mục)
**Ngày:** 2026-08-01
**Áp dụng cho:** Người đề xuất, Người duyệt, Quản trị hệ thống DeltaSoft ERP
**Tài liệu kỹ thuật kèm theo:** SRS-CATAPP-001

---

## 1. Mục đích
Quy định trình tự chuẩn để **thay đổi dữ liệu Danh mục** (Khách hàng, NCC, Xe, Phí, Cung đường, Trạm thu phí...). **Mọi** thao tác **tạo mới / cập nhật / xóa** đều phải qua bước **đề xuất → duyệt**; chỉ khi được duyệt, thay đổi mới thực sự có hiệu lực trên danh mục.

## 2. Phạm vi & nguyên tắc
- Áp dụng **chung cho mọi loại danh mục** đã nối vào cơ chế.
- **KHÔNG ai được sửa trực tiếp** — kể cả người có quyền duyệt: khi họ tự thao tác thì vẫn tạo ra 1 đề xuất.
- KHÔNG áp dụng cho thao tác nghiệp vụ (lô hàng, lệnh vận chuyển...) — chỉ áp cho master data.

## 3. Vai trò & trách nhiệm

| Vai trò | Ai | Trách nhiệm |
|---|---|---|
| **Người đề xuất** | Nhân viên có quyền Tạo/Sửa/Xóa danh mục | Nhập đúng, đủ; gửi đề xuất; theo dõi & rút đề xuất khi cần |
| **Người duyệt** | Nhân viên có quyền Duyệt (`{CODE}_ACCEPT`) của loại đó | Kiểm tra; Duyệt hoặc Từ chối kèm lý do; xử lý lỗi khi thực thi |
| **Quản trị (Admin)** | Vai trò Admin | Duyệt mọi loại; xử lý ngoại lệ |

## 4. Trạng thái đề xuất

| Trạng thái | Ý nghĩa | Ai xử lý tiếp |
|---|---|---|
| 🟡 **Chờ duyệt** (0) | Đã gửi, chưa xử lý | Người duyệt |
| 🟢 **Đã duyệt** (1) | Đã thực thi vào danh mục thật | (chốt) |
| 🔴 **Từ chối** (−1) | Bị từ chối, có lý do | Người đề xuất xem lý do, gửi lại nếu cần |
| ⚪ **Đã hủy** (−2) | Người đề xuất tự rút | (chốt) |

---

## 5. Quy trình TẠO MỚI danh mục

**Người đề xuất:**
1. Vào màn Danh mục tương ứng → bấm **Thêm** → điền form → **Lưu**.
2. Hệ thống báo **"Đã gửi đề xuất, chờ duyệt"**. Bản ghi **CHƯA** xuất hiện trong danh mục.
3. Theo dõi ở **Đề xuất của tôi**.

**Người duyệt:** khi duyệt, hệ thống **tạo mới 1 bản ghi** danh mục từ nội dung đề xuất (xem Mục 8).

> ⚠️ Bản ghi mới **chưa dùng được** trong nghiệp vụ (lô/lệnh) cho tới khi được duyệt. Cần gấp thì báo người duyệt xử lý sớm.

---

## 6. Quy trình CẬP NHẬT danh mục

**Người đề xuất:**
1. Chọn bản ghi → **Sửa** → chỉnh sửa → **Lưu**.
2. Hệ thống tạo **đề xuất cập nhật**. **Bản ghi cũ giữ nguyên hiệu lực** cho tới khi được duyệt.
3. Theo dõi ở **Đề xuất của tôi**.

**Người duyệt:** khi duyệt, hệ thống **cập nhật đúng bản ghi đó** bằng nội dung đề xuất.

---

## 7. Quy trình XÓA danh mục

**Người đề xuất:**
1. Chọn bản ghi → **Xóa** → xác nhận.
2. Hệ thống tạo **đề xuất xóa**; bản ghi **vẫn còn** cho tới khi được duyệt.
3. Theo dõi ở **Đề xuất của tôi**.

**Người duyệt:** khi duyệt, hệ thống **xóa đúng bản ghi đó** (qua SP xóa hiện có, giữ mọi ràng buộc/kiểm tra sẵn có).

---

## 8. Quy trình DUYỆT / TỪ CHỐI (Người duyệt)

1. Vào màn **Duyệt Danh mục**.
2. Lọc theo Loại danh mục / Hành động / Trạng thái (mặc định *Chờ duyệt*) / Chi nhánh / Từ khóa.
3. Mở 1 đề xuất để xem chi tiết:
   - **Tạo mới:** xem toàn bộ dữ liệu sắp tạo.
   - **Cập nhật:** xem **so sánh** giá trị cũ ↔ mới (ô khác biệt được tô).
   - **Xóa:** xem bản sắp xóa + cảnh báo.
4. Quyết định:
   - **Duyệt:** hệ thống thực thi (tạo/sửa/xóa 1 bản ghi) vào danh mục thật. Đề xuất chuyển 🟢 *Đã duyệt*, rời hàng chờ.
   - **Từ chối:** **bắt buộc nhập lý do** → đề xuất chuyển 🔴 *Từ chối*, không đụng dữ liệu thật.
5. **Xử lý lỗi khi Duyệt:** nếu báo lỗi (trùng mã, vi phạm ràng buộc, bản ghi đã bị xóa) → đề xuất **vẫn ở Chờ** — liên hệ người đề xuất chỉnh lại hoặc Từ chối.

> Bấm **Duyệt** nhiều lần trên cùng đề xuất là an toàn — hệ thống chỉ thực thi 1 lần (idempotent).

---

## 9. Quy trình RÚT đề xuất (Người đề xuất)
1. Vào **Đề xuất của tôi** → chọn đề xuất đang 🟡 *Chờ duyệt*.
2. Bấm **Rút** → đề xuất chuyển ⚪ *Đã hủy*.
3. Chỉ **người tạo đề xuất** rút được, và chỉ khi còn *Chờ duyệt*.

---

## 10. Xử lý ngoại lệ

| Tình huống | Cách xử lý |
|---|---|
| Gửi nhầm dữ liệu | Rút đề xuất (Mục 9) rồi gửi lại; hoặc nhờ người duyệt Từ chối. |
| Bị Từ chối | Xem lý do ở **Đề xuất của tôi**, chỉnh lại, gửi đề xuất mới. |
| Duyệt báo lỗi trùng mã | Người đề xuất sửa mã → gửi lại; người duyệt Từ chối đề xuất cũ. |
| Bản ghi cần sửa đã bị người khác xóa | Đề xuất sửa/xóa sẽ báo lỗi khi duyệt → Từ chối. |
| Cần bản ghi mới gấp | Báo trực tiếp người duyệt ưu tiên xử lý. |

---

## 11. Câu hỏi thường gặp (FAQ)

**H: Tôi vừa tạo khách hàng mà không thấy trong danh sách?**
Đ: Vì mọi thay đổi phải qua duyệt → bản ghi đang là *đề xuất Chờ duyệt*, chưa hiển thị. Xem **Đề xuất của tôi**.

**H: Tôi có quyền duyệt, tự sửa danh mục có phải chờ không?**
Đ: Có. Không ai áp thẳng — kể cả người có quyền duyệt, khi tự thao tác vẫn tạo đề xuất. **Nhưng bạn được tự duyệt đề xuất của chính mình** (nếu có quyền duyệt loại đó), nên thực tế chỉ tốn thêm 1 bước bấm Duyệt.

**H: Cập nhật mà chờ duyệt thì dữ liệu cũ có bị mất không?**
Đ: Không. Bản cũ giữ nguyên cho tới khi được duyệt.

**H: Ai duyệt được loại danh mục nào?**
Đ: Theo quyền `{CODE}_ACCEPT` của từng loại (vd `CUSTOMER_ACCEPT` cho Khách hàng).

---

## 12. Ghi chú triển khai
- Cơ chế đề xuất — duyệt là **chung cho mọi loại danh mục**; các loại được nối vào cơ chế theo đợt (mỗi loại: chuyển modal sang tạo đề xuất + thêm bộ thực thi ở BE).
- **Đã chốt:** người duyệt được tự duyệt đề xuất của chính mình.
- SOP cập nhật khi các **vấn đề mở còn lại** (xem SRS mục 11) được anh chốt.

---
*Hết SOP. Chi tiết kỹ thuật: SRS-CATAPP-001.*
