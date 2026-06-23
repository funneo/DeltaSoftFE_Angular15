# Prompt cho Claude Code (App mobile FCL) — Hiển thị Dầu máy phát + Tổng dầu lệnh (CHỈ VIEW)

> Dán nguyên khối dưới đây cho Claude Code trong repo app mobile.

---

Bổ sung **hiển thị Dầu máy phát (generator fuel)** vào màn **lệnh FCL** của app, đồng bộ với ERP web.

**QUAN TRỌNG — App CHỈ VIEW, KHÔNG cho edit/nhập/lưu.** Giống cách màn "thực hiện lệnh" trên app chỉ xem chứ không sửa. Việc nhập dầu máy phát do bên web ERP làm; app chỉ đọc và hiển thị lại. **KHÔNG gọi endpoint lưu, KHÔNG cần đổi API.**

Tham chiếu hợp đồng: skill `fcl-mobile-api` **§5.2 Generator fuel** và **§5 Order total fuel**. Đọc kỹ §5.2 trước khi code.

## 1. Model — thêm các field vào model FCL (đều optional)
| Field | Kiểu | Ghi chú |
|---|---|---|
| `generatorRunningHours` | number? | số giờ chạy máy phát |
| `generatorTemperature` | number? | nhiệt độ °C (chỉ ghi nhận) |
| `generatorFuelNorm` | number? | định mức lít/giờ |
| `generatorFuelAmount` | number? | server tính = round(hours × norm, 2) lít |
| `generatorFuelCost` | number? | server tính = round(amount × oilPrice, 0) VND |
| `generatorNote` | string? | ghi chú |

## 2. Đọc dữ liệu
`GetByRefNoWithTO` đã trả về sẵn các field trên cho **cả lệnh cũ (legacy) lẫn lệnh mới**. Chỉ map vào model, không gọi thêm API.

## 3. UI — CHỈ HIỂN THỊ (read-only), trên màn chi tiết lệnh FCL
Hiển thị nhóm "Dầu máy phát" dạng label/value (KHÔNG input, KHÔNG nút lưu):
- **Số giờ chạy máy phát** = `generatorRunningHours`
- **Nhiệt độ (°C)** = `generatorTemperature`
- **Định mức (lít/giờ)** = `generatorFuelNorm`
- **Dầu máy phát (lít)** = `generatorFuelAmount`
- **Thành tiền** = `generatorFuelCost`
- **Ghi chú** = `generatorNote`
- Ẩn nhóm này khi lệnh là nhà thầu phụ (`isSubcontractors == true`), hoặc khi tất cả field generator đều rỗng/0.

## 4. Tổng dầu lệnh (chỉ HIỂN THỊ, client tự cộng)
```
Tổng dầu lệnh = tongdau + generatorFuelAmount
```
- **Không** lưu DB, **không** đổi `tongdau` (tongdau giữ nguyên = dầu định mức tuyến).
- Hiển thị ở phần tổng kết dầu của lệnh (chỗ đang hiện "Tổng dầu" → đổi nhãn thành **"Tổng dầu lệnh"** và dùng giá trị tổng này).

## Lưu ý
- App **không** có chức năng nhập/lưu dầu máy phát — bỏ qua endpoint `UpdateGenerator` (đó là phần của web).
- Không sửa SP/BE — chỉ FE app, và chỉ phần hiển thị.
