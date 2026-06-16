# Module Nhân sự — Hợp đồng lao động & Hồ sơ NV (HR)

> Mục tiêu: thay thế file Excel "Danh sách theo dõi HĐLĐ" bằng module quản lý trong ERP,
> theo dõi vòng đời hợp đồng + **in tự động HĐLĐ ra Word (tải hàng loạt, không lưu file)**.
> Trạng thái: **SQL design xong (chờ chạy) → tiếp BE/FE**. Ngày: 2026-06-16.

---

## 1. Người dùng quản lý được gì

### A. Hồ sơ nhân viên (mở rộng từ bảng Employee có sẵn)
Bổ sung các trường chuẩn HR để đủ in hợp đồng & lưu hồ sơ:
- **Nhân thân:** nơi sinh, nguyên quán/quê quán, chỗ ở hiện tại (tách khỏi hộ khẩu thường trú), quốc tịch, loại giấy tờ (CCCD / Hộ chiếu / CMND).
- **Ngân hàng:** số tài khoản, ngân hàng, **chi nhánh ngân hàng**.
- **Liên hệ khẩn cấp:** họ tên, SĐT, quan hệ.
- **Trạng thái nhân viên** (đang làm / nghỉ / thử việc…).

> Các trường cũ vẫn giữ nguyên: mã NV, họ tên, ngày sinh, giới tính, số CCCD, ngày/nơi cấp,
> mã số thuế, dân tộc, tôn giáo, tình trạng hôn nhân, phòng ban, chức danh, BHXH, BHYT…

### B. Hợp đồng lao động (HĐLĐ) — 1 nhân viên có NHIỀU hợp đồng
Quản lý **toàn bộ lịch sử hợp đồng** của từng người (Thử việc → Xác định thời hạn → Không xác định thời hạn):
- Số hợp đồng, loại hợp đồng (Thử việc / XĐTH / KXĐTH / Khoán–CTV).
- Ngày ký, nơi ký, ngày hiệu lực (từ ngày), ngày hết hạn (đến ngày — để trống = không xác định thời hạn).
- Thời hạn tự tính (vd "12 tháng" / "Không xác định").
- Địa điểm làm việc, chi nhánh/VP ký, ghi chú.
- Đánh dấu **hợp đồng hiện hành** (mỗi NV chỉ 1 HĐ đang hiệu lực).

### C. Lương & BHXH — có lịch sử (cơ chế "ký phụ lục khi tăng lương")
- Lương cơ bản + lương đóng BHXH theo từng mốc thời gian (ngày hiệu lực).
- Khi tăng lương → thêm bản ghi lương mới (active), bản cũ tự tắt → **lương in trên HĐ luôn lấy mốc đang hiệu lực**.
- Đáp ứng yêu cầu KPI: tăng mức lương đóng BHXH thì phải ký phụ lục với toàn bộ người được tăng.

### D. Các hồ sơ phụ (tái dùng bảng có sẵn — làm dần)
- **Phụ cấp** (EmployeeAllowance + danh mục Allowances): giá trị, hiệu lực, ngày ký.
- **Bằng cấp / trình độ** (EmployeeDegree).
- **Người phụ thuộc / gia đình** (EmployeeFamily) — phục vụ giảm trừ thuế.
- **File đính kèm** (EmployeeFile) — scan HĐ, bằng cấp…

---

## 2. Màn hình "Theo dõi HĐLĐ" (thay Excel)

Danh sách tổng hợp toàn công ty, tự tính tại thời điểm xem:
- **Còn bao nhiêu ngày** đến hạn HĐ / chuyển KXĐTH.
- **Trạng thái cần theo dõi** tự gán màu:
  - Còn hiệu lực / Cần chuẩn bị gia hạn (≤60 ngày) / Sắp hết hạn (≤30 ngày) / Đã hết hạn / Không xác định thời hạn.
- **Lọc:** từ khóa (tên, mã, số HĐ), chi nhánh/VP, loại HĐ, năm, "sắp hết hạn trong N ngày", chỉ HĐ hiện hành.
- Hiển thị kèm lương cơ bản / BHXH đang hiệu lực.
- Phân trang.

---

## 3. In hợp đồng tự động ra Word

- Chọn 1 hoặc **nhiều nhân viên** → bấm **In HĐLĐ**.
- Hệ thống ghép dữ liệu vào **mẫu Word** (placeholder `{{HoTen}}`, `{{SoHopDong}}`, `{{LuongCoBan}}`, `{{NgayKy}}`…).
- **Tải hàng loạt** (nhiều người → đóng gói .zip), sinh tại chỗ, **không lưu file trên server**.
- Mẫu Word do bộ phận HR cung cấp (đang chờ).

---

## 4. Phạm vi kỹ thuật (tham chiếu nội bộ)

- **SQL:** 2 file migration ở `NewAPI/` — `Migration_HR_LaborContract_DDL_20260616.sql` (ALTER + seed loại HĐ),
  `Migration_HR_LaborContract_SPs_20260616.sql` (13 SP: EmployeeSalary ×5, EmployeeContract ×8 gồm GetPaging theo dõi + GetForPrint in hàng loạt).
- **Tái dùng tối đa** schema HR sẵn có, không tạo bảng mới; bảng EmployeeContract được vá thêm `EmployeeId` + cột phụ.
- **Còn lại:** chạy SQL → BE (Model/Repo/Controller) → FE (tab Hợp đồng/Lương trong hồ sơ NV + màn Theo dõi HĐLĐ + nút In Word) → wire mẫu Word khi HR gửi.

---

## 4b. Thiết kế Modal "Hồ sơ nhân viên" (CHỐT 2026-06-16 — chờ duyệt mới code)

> **Quyết định:** tạo **component MỚI `modal-employee-hr`** (modal-xl, dạng tab), KHÔNG đụng `modal-employee` cũ
> (cũ vẫn dùng ở Danh mục NV). Modal mới dùng ở màn **Nhân sự / Theo dõi HĐLĐ**.
> Lý do: gom toàn bộ hồ sơ + HĐ + lương + hồ sơ phụ vào 1 nơi một cách khoa học; modal cũ quá đơn giản
> và đang thiếu nhiều field vốn có sẵn trong DB (Mã NV, CCCD/ngày-nơi cấp, MST, số TK, ngân hàng, BHXH, BHYT).

**Header:** avatar nhỏ + Họ tên + [Mã NV] + badge Trạng thái (● Đang hoạt động) + nút ✕. Header kéo được (ngDraggable [handle]).

**4 tab (nav-tabs):**

**TAB 1 — Thông tin chung** (hiện cả khi tạo mới). Chia nhóm có tiêu đề (fieldset):
- **A. Định danh & nhân thân:** Mã NV*, Họ tên*, Ngày sinh, Giới tính, Nơi sinh, Nguyên quán, Quốc tịch (mặc định Việt Nam), Dân tộc, Tôn giáo, Tình trạng hôn nhân.
- **B. Giấy tờ tùy thân:** Loại GT (CCCD/Hộ chiếu/CMND), Số CCCD, Ngày cấp, Nơi cấp, Mã số thuế.
- **C. Liên hệ:** Điện thoại, **Email công ty** (Email cũ), **Email cá nhân** (PersonalEmail), Địa chỉ thường trú (Address), Chỗ ở hiện tại (CurrentAddress), Liên hệ khẩn cấp {Họ tên/SĐT/Quan hệ}.
- **D. Công việc:** Chi nhánh/VP*, **Bộ phận**▾* (DEPT), **Chức danh**▾* (TITLES), **Địa điểm làm việc**▾ (WORK_LOCATION), Ngày vào công ty, **Trạng thái NV**▾ (EMPLOYEE_STATUS).
- **E. Ngân hàng & Bảo hiểm:** Số tài khoản, Ngân hàng, Chi nhánh NH, Số sổ BHXH, Số thẻ BHYT.
- **F. Ảnh + Ghi chú:** avatar upload (cột phải) + textarea ghi chú.

**TAB 2 — Hợp đồng lao động** (chỉ khi đã có id NV):
- Nút `+ Thêm HĐ ▾` chọn loại → gọi `GetNextNumber` tự sinh số (`001/HN/HĐ TV 2026`) + **prefill ngày theo chuỗi**: TV (today → today+2th−1d); XĐ1 (end TV+1 → +12th−1d); XĐ2 (gia hạn, +12th−1d); KXĐ (end XĐ+1, không hạn).
- Bảng lịch sử: Số HĐ · Loại · Từ ngày · Đến ngày · Thời hạn · Còn N ngày (badge) · Hiện hành · Thao tác (Sửa/In/Đặt hiện hành/Xóa). Dòng `IsExpiringSoon` (≤10 ngày) tô đỏ.
- Form thêm/sửa HĐ (modal con hoặc inline panel): Loại, Số HĐ, Nơi ký, Ngày ký, Từ-Đến ngày, Địa điểm làm việc, VP ký, Ghi chú, [✔] Hiện hành.

**TAB 3 — Lương & BHXH** (chỉ khi có id): nút `+ Thêm mốc lương`. Bảng: Hiệu lực từ · Lương cơ bản · Lương đóng BHXH · Đang áp dụng · Ghi chú · Thao tác. Mốc active highlight (cơ chế ký phụ lục khi tăng lương). Thêm mốc mới = tự tắt mốc cũ.

**TAB 4 — Hồ sơ phụ** (chỉ khi có id): 3 bảng nhỏ — Phụ cấp (EmployeeAllowance) · Bằng cấp (EmployeeDegree) · Người phụ thuộc (EmployeeFamily, phục vụ giảm trừ thuế) + nút **Hồ sơ đính kèm** (reuse modal-attachfile, FrmName='EMPLOYEE').

**Footer:** [📎 Hồ sơ đính kèm] · [🖨 In HĐ hiện hành] · [💾 Lưu] · [✕ Hủy].

**Phụ thuộc khi code:**
- Tab 1: chạy DDL + sửa BE `Employee` model/Repo + SP_Employee_Create/Update nhận field mới.
- Tab 2/3/4: cần BE EmployeeContract/EmployeeSalary (Controller/Repo) + (sau) SP Degree/Family.
- Convention modal: theo skill `deltasoft-modals` (ngDraggable+[handle], [config] backdrop static, ViewChild + @Output SaveSuccess/CloseModal, lazy-mount *ngIf, custom-checkbox pointer-events).

---

## 5. Lộ trình (mở rộng về sau)
- [ ] Nhắc tự động (SignalR/thông báo) khi HĐ sắp hết hạn.
- [ ] Quản lý phụ lục HĐ độc lập (nếu cần tách khỏi lịch sử lương).
- [ ] Phân quyền xem/sửa HR theo chức năng (FunctionCode riêng).
- [ ] Export danh sách theo dõi ra Excel (đối chiếu file cũ).
