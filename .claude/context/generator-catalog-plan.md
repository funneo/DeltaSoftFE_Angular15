# Kế hoạch — Danh mục Máy phát điện (Generator Catalog)

**Ngày lập:** 2026-07-16 · **Trạng thái:** CHỜ ANH CHỐT 5 điểm → soạn SQL. CHƯA CODE.
**Phương án:** A (quản lý danh mục thuần) — **KHÔNG tính khấu hao** (anh chốt 2026-07-16, bỏ phương án B).
**Nguồn:** `D:\Delta\DeltaSoft\NewAPI\Danh sách máy phát điện chuẩn.xlsx` (sheet "Generators", 29 máy, B5:S34).

## Bối cảnh
File Excel gốc là **sổ khấu hao TSCĐ** cho 29 máy phát điện gắn trên đầu kéo cont lạnh (Owner=VT).
Thống kê: 29 máy · hãng Shindaiwa 11 / Airman 9 / Denyo 7 / Hữu Toàn 1 / Kibii 1 · vị trí 27 "Container tractor" + 1 Hub Hải Phòng + 1 Hub Hải Dương · công suất chủ yếu 25KVA (1 máy 44KVA).
Điểm yếu file Excel: số thẻ TSCĐ rỗng hết; ngày lộn định dạng (text vs serial); hãng không chuẩn hóa (Shindawa vs SHINDAIWA).

**Anh chốt phạm vi:**
- Máy phát để **độc lập, KHÔNG nối dầu máy phát ở lệnh FCL** (2026-07-16). Cột "Số xe" chỉ lưu **text tham chiếu**, không link `Vihicle`.
- **Không tính khấu hao** — chỉ quản lý lý lịch (2026-07-16).

## Bảng `Tbl_Generator` (MỚI, song song, không đụng gì đang chạy)
| Cột | Kiểu | Nguồn Excel |
|---|---|---|
| Id | INT IDENTITY PK | — |
| FixedAssetCard | NVARCHAR(30) | Số thẻ TSCĐ |
| BranchId | INT | Owner (gán từ token BE) |
| PlateNumber | NVARCHAR(20) | Số xe (text tham chiếu, KHÔNG link Vihicle) |
| OperatingLocation | NVARCHAR(100) | Vị trí (Container tractor / Hub HP…) |
| Manufacturer | NVARCHAR(100) | Hãng (chuẩn hóa Shindawa→Shindaiwa) |
| Capacity | NVARCHAR(20) | Công suất (25KVA) |
| Model | NVARCHAR(100) | Model (tách từ DESCRIPTION) |
| SerialNumber | NVARCHAR(50) | Serial |
| YearMake | INT | Năm SX |
| Description | NVARCHAR(300) | Mô tả đầy đủ |
| Note | NVARCHAR(500) | Ghi chú |
| *(tùy chọn)* OriginalCost | DECIMAL(18,2) | Nguyên giá — CHỈ lưu tra cứu, không tính KH |
| *(tùy chọn)* DateOfOperating | DATE | Ngày đưa vào SD — lưu thông tin |
| Meta | CreatedBy/Date, ModifiedBy/Date, Deleted BIT | — |

**BỎ hẳn** (so với phương án B): số kỳ KH, ngày hết KH, kỳ đã/còn, đã khấu hao, GTCL, KH/năm, ô "Tính đến ngày", công thức đường thẳng, mọi cột tính động.

## SP (`SP_Generator_*`)
`_Create` · `_Update` · `_Delete` (soft) · `_GetById` · `_GetPaging` (@BranchId, @Keyword, @Manufacturer, @PageIndex, @PageSize — không @AsOf, không cột tính). BranchId gán từ token ở Controller (`obj.BranchId ?? obj.Item?.BranchId ?? User.GetBranchId()`).

## Backend
`Generator` Model + `GeneratorViewModel` + `IGenerator` + `GeneratorRepository` + `GeneratorController` (Create/Update/Delete/GetPaging/GetById, POST `FromBodyBase`). FunctionCode **F046** (mới nhất đang dùng F045=HR HĐLĐ → F046 dự kiến trống, cần xác nhận) + 5 ActionCode.

## Frontend (nhóm `danhmuc/`)
- `generator/` list (khuôn `deltasoft-list`): filter **Chi nhánh + Hãng + Từ khóa** · bảng lý lịch · toolbar Thêm/Sửa/Xóa/Xem · **xuất Excel** (thay file gốc).
- `modal-generator` (1 form, khuôn `deltasoft-modals`) · service · model · routing/module · menu + gate quyền.

## File SQL & thứ tự chạy
1. `Migration_Generator_Schema_YYYYMMDD.sql` — bảng + 5 SP.
2. `Migration_Generator_GrantF046_YYYYMMDD.sql` — đăng ký F046 + action + grant role.
3. `Migration_Generator_SeedData_YYYYMMDD.sql` — import 29 dòng từ Excel (một lần).

## Giai đoạn
P0 chốt thiết kế (đang) → P1 SQL (trình duyệt → anh chạy) → P2 BE → P3 FE list+modal → P4 import 29 dòng + grant + test E2E.

## ⬜ CHỜ ANH CHỐT (rồi em mới soạn Migration_Generator_Schema)
1. **Mô tả máy**: tách Hãng + Công suất(KVA) + Model thành cột riêng (dễ lọc — em đề xuất) hay giữ 1 ô mô tả free-text?
2. **Nguyên giá + Ngày sử dụng**: giữ làm trường thông tin (chỉ lưu) hay bỏ luôn cho gọn?
3. **Hãng/Vị trí**: nvarchar + gợi ý gõ (gọn — em đề xuất) hay danh mục OtherCategories chuẩn hóa?
4. **F046** — xác nhận chưa ai giữ.
5. **Import 29 dòng** seed từ Excel — OK chứ?
