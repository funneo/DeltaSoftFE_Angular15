# Pending / In-Progress Work

## Transport Order (Lệnh vận chuyển) — modal-transport-order

### Pending confirmation (not yet tested in browser)
- Scroll tables flex chain fix (tabset→tab-content→tab-pane.active→tab-table-wrap overflow-y:auto)
- Driver 1 dropdown uses `listDrivers` filtered to `departmentId == 1174`
- Vehicle select → auto-bind driver 1 + SĐT + fuelDriverId from `vehicle.employeeId`
- Per-segment `payloadWeight` = VehicleOilQuota.id from `listOilQuota` dropdown
- `onSegmentQuotaChange` → fuelNorm + fuelAmountCalculated per segment
- `calulateOil()` sums tongdau; `orderTypeChange` recalcs all segments
- "Xem bản đồ" button → `modal-vietmap-routes` with all waypoints
- `edit()` calls `loadVehicle(vehicleId)` to restore listOilQuota on reopen

### Still TODO
- `onAttachFileChanged()` — upload ảnh hiện trường is a stub, needs actual S3 upload logic
- Save / submit lệnh vận chuyển (POST to API) — not yet wired up

## Backend — SQL Stored Procedures (cần tạo trong SQL Server)
- `SP_CustomerLocations_UpdateGeocode (@Id int, @Latitude decimal, @Longtitude decimal)`
- `SP_Ports_UpdateGeocode (@Code varchar, @Latitude decimal, @Longtitude decimal)`

## AI Invoice Extraction — frontend UI
- Backend complete: `POST /api/geminiAI/extract-invoice` (Gemini 2.5 Flash)
- Frontend: cần tạo UI để upload ảnh/PDF hóa đơn → hiển thị dữ liệu trích xuất → cho phép chỉnh sửa → lưu vào phiếu chi/thu

## Other Known Pending
- Claude AI controller — endpoint exists but no frontend integration
- `appsettings.json` ClaudeApiKey is empty (Anthropic key not configured)
