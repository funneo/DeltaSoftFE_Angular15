# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DeltaSoft ERP — logistics/transport management system for a Vietnamese freight forwarding company.

- **Frontend**: Angular 15 SPA (`web-app-update/`)
- **Backend**: ASP.NET Core (.NET 9) REST API (`d:/Delta/DeltaSoft/NewAPI/API/`)
- **Database**: SQL Server via Dapper (stored procedures and raw SQL)
- **Realtime**: SignalR hub at `/signalr`
- **Push notifications**: Firebase Cloud Messaging

## Core Working Principles (ĐỌC TRƯỚC KHI CODE)

Bốn nguyên tắc nền (phỏng theo Karpathy skills), đã "siết" theo bài học thực tế của project này. Khi mâu thuẫn với mong muốn "làm nhanh", **nguyên tắc thắng**.

### 1. Think Before Coding — thiết kế & duyệt trước, code sau
- **SQL/SP thiết kế trước, trình user DUYỆT, rồi mới viết BE/FE.** Mọi SP mới phải show thiết kế để user duyệt trước khi tạo. Không tự ý quyết định schema/flow.
- Nêu **giả định** rõ ràng (về schema, format ngày, quyền, chi nhánh…). Khi chưa chắc → hỏi, đừng đoán ngầm.
- Với thay đổi hành vi lớn: trình bày tradeoff **"tạo mới song song" vs "sửa cái cũ"** thay vì tự chọn.
- Giao tiếp tiếng Việt; user xưng "anh", assistant xưng "em".

### 2. Simplicity First — tối thiểu & đúng phạm vi
- Code tối thiểu giải đúng bài. Không tính năng/trừu tượng/abstraction suy đoán.
- **Không vượt parity**: ví dụ form nháp chỉ thêm đúng field ERP có; không thêm field server/auto/workflow.
- Không thêm dependency mới hay viết lookup chỉ để làm đẹp (vd: bỏ qua tên Nhóm TH cho dòng nháp thay vì inject repo mới) — trừ khi user yêu cầu.
- Tận dụng skill `deltasoft-*` + `UtilityService`/pipes/`BaseService` sẵn có trước khi tự viết helper.

### 3. Surgical Changes — chạm tối thiểu, KHÔNG đụng cái đang chạy (quan trọng nhất ở project này)
- **DB CHỈ ĐỌC.** Tuyệt đối KHÔNG tự chạy/soạn-rồi-chạy `ALTER/DROP/UPDATE/DELETE/INSERT` lên DB thật. Chỉ `SELECT`/`OBJECT_DEFINITION` để đọc, và **soạn file `.sql`** cho user tự chạy.
- **SP/BE/FE hiện hữu là BẤT KHẢ XÂM PHẠM.** Thay đổi lớn → tạo MỚI song song (`*WithTO`, `*FromDraft`, `SP_Employee_*HR`), KHÔNG sửa cái cũ. "Đụng SP cũ là cực nhạy cảm."
- **KHÔNG đụng list FCL/legacy hay trang TO.** Cần list mới → tạo component MỚI hoàn toàn (copy logic, lọc `isLegacy=0`), không kế thừa/route-data.
- Match style sẵn có. **Reuse modal ERP thật** (chỉ đổi màu, vd draft = vàng giống shipment) thay vì tạo modal mới.
- SP đặt tên nghiêm: `SP_<TableName>_<Action>` (không gộp action với tên bảng khác).
- **DB là SQL Server 2014**: KHÔNG dùng `JSON_VALUE`/`CREATE OR ALTER`/`DROP IF EXISTS`/`STRING_SPLIT`/`STRING_AGG`. Dùng `IF OBJECT_ID...DROP`, XML/CSV split, `FOR XML PATH`, LIKE thay JSON_VALUE.

### 4. Goal-Driven Execution — pilot → verify → nhân rộng
- **Pilot trước, nhân rộng sau.** Thay đổi diện rộng (vd vendorize directive ~180 module): chứng minh trên 1 màn/1 case, để user xác nhận chuẩn, RỒI mới áp dụng toàn bộ.
- **Verify trước khi báo xong**: `npx tsc --noEmit` / `ng build` sạch; phân biệt lỗi mới vs lỗi cũ có sẵn (spec files…).
- Báo trung thực: thay đổi nào là **BE-only cần redeploy** (lưu ý: API đang chạy KHÓA DLL — phải tắt API mới build được), cái nào FE cần `ng build`.
- Promote/duyệt phải **idempotent** (guard `GetForPromote` trước khi tạo thật).

## Active Major Refactor — TO ↔ FCL (2026-05-14, IN PROGRESS)

Restructuring relationship between Transport Order (TO) and FCL Dispatch Order:
- **TO**: pure route module (segments + km + toll stations only)
- **FCL**: owns vehicle/driver/notes/approval workflow (all moved out of TO)
- **Link**: `Tbl_TransportOrders.FclRefNo` → `DispatchOrderFCL.RefNo` (1-1 enforced via UNIQUE filtered index on TO side; FCL untouched for minimum impact)
- **Legacy detection**: `DispatchOrderFCL.IsLegacy BIT` (=1 for pre-refactor records, =0 for new ones)
- **Flow**: tạo FCL bắt buộc tạo TO cùng lúc (transactional); không có nhân bản FCL
- **Trạm thu phí (ETC)**: bỏ tab ETC riêng, gộp vào section "Thông tin cung đường" (bảng editable `entity.listEtc`); dùng `TollStationName` thay `TollStationId`; auto-thêm từ route Vietmap; khóa khi đã có `refNo`. SQL: cột `DispatchOrderFCLEtc.TollStationName` + type `TypeDispatchOrderFCLEtcV2`.
- **Cung đường phát sinh**: thêm SAU khi tạo lệnh, qua modal riêng `modal-add-extra-segment` (Vietmap/Compare nằm bên trong). Bảng `Tbl_TransportOrder_ExtraSegments`, 5 SP `SP_TransportOrder_ExtraSegments_*`.
- **Migration files** at `D:\Delta\DeltaSoft\NewAPI\`:
  - `Migration_TO_FCL_Phase1A_20260514.sql` — non-breaking column adds (run first)
  - `Migration_TO_FCL_Phase1C_20260514.sql` — DROP ~59 cột TO + 2 bảng phụ (run AFTER BE/FE refactor + 1-2 tuần thử nghiệm)
- **Full design + checklist**: `.claude/context/todo.md` section đầu

## Draft Site — site nháp song song ERP (2026-05-27, Phase 3 IN PROGRESS)

Site nháp public cho AI/người nhập (lô hàng / công việc / thanh toán / debit nháp); người duyệt + **promote** trong ERP thật. 3 process tách biệt:
- **Site nháp FE**: app Angular **21** mới `D:\Delta\DeltaSoft\draft-web` (Bootstrap 5 + ag-grid + ngx-daterangepicker-material). KHÔNG đụng ERP `web-app-update`. `ng serve` cổng 4300.
- **Draft API**: process .NET 9 riêng `D:\Delta\DeltaSoft\DraftAPI` (cổng 44360), login `draft_app` chỉ chạm schema `draft`. Endpoint POST `/api/draft/create|update|delete|getPaging|getById` → `draft.SP_DraftEntries_*` (JSON envelope `Payload` = DTO tạo-thật).
- **ERP API**: cấp token `aud=draft` qua `POST /api/account/login-draft` (hạn 1h); `DraftAudienceGuardFilter` default-deny — token nháp chỉ đọc (VIEW/EXPORT + `Draft:ReadAllowlist`). Promote diễn ra trong ERP.
- **Quy ước:** xóa nháp KHÔNG cần quyền ERP nhưng chỉ **chủ tạo** xóa được; quyền tạo/sửa suy từ quyền ERP. Mọi SP nháp mới phải trình user duyệt trước khi tạo.
- Trạng thái: Phase 0–2 xong + test; Phase 3 (FE) đang ở vertical slice "Lô hàng". Chi tiết: `.claude/context/done.md` + `todo.md` (section Draft Site) + `draft-site-roadmap.md`.

## Commands

### Frontend (Angular 15)
```bash
npm start               # dev server on http://localhost:4200
ng build                # development build
ng build --configuration production   # production build
ng test                 # run unit tests (Karma/Jasmine)
ng lint                 # TSLint
```

### Backend (ASP.NET Core .NET 9)
```bash
# From d:/Delta/DeltaSoft/NewAPI/API/
dotnet run              # dev server on https://localhost:44352
dotnet build
dotnet publish
```
Swagger UI available at `https://localhost:44352/swagger` in Development mode.

## Architecture

### Frontend structure (`src/app/`)
- `login/` — login page (standalone module, no auth guard)
- `main/` — all authenticated pages; lazy-loaded child modules:
  - `home/` — dashboard
  - `systems/` — users, roles, functions, permissions
  - `danhmuc/` — master data (customers, suppliers, vehicles, routes, toll stations, fees, etc.)
  - `shipments/` — shipment records, debit notes, reports
  - `transports/` — dispatch orders, fuel/gas management, shipping tasks
  - `cbts/` — CBT customer-specific dispatch, payments, reports
  - `advance-payment/` — advances, payments, deposits, personal loans
  - `accounting/` — fund, debt, export invoices, phieu chi/thu
  - `workflows/` — job assignment & workflow management
  - `sales-marketing/` — CRM, quotations, contracts
  - `hrm/` — leave, overtime, timekeeping
  - `canon/` — Canon customer jobs & pricing
  - `garage/` — vehicle inspection (Innvie integration)
  - `training-materials-management/` — training documents
- `shared/` — services, interceptors, guards, components, pipes, models

### Backend structure (`NewAPI/API/`)
- `Controllers/` — 142 controller files grouped by domain
- `Repositories/` — all business logic; each implements a matching `Interface`
- `Interfaces/` — DI contracts
- `Models/` — domain models
- `ViewModels/` — request/response DTOs
- `FromBodies/` — typed request wrappers (`FromBodyBase<T>` wraps body + `TokenKey`)
- `Data/DapperAdapter.cs` — single Dapper wrapper used by all repositories
- `SignalR/RefreshHub.cs` — broadcasts cache-invalidation messages
- `Services/RsaKeyService.cs` — RSA encrypt/decrypt for external password sync

### Authentication flow
1. `POST /api/account/login` → JWT valid for 24 hours
2. JWT stored in `localStorage` as `TOKEN`
3. `AuthInterceptor` attaches `Authorization: Bearer <token>` to every request
4. `AuthGuard` reads JWT claims; checks `permissions` array for `{FUNCTION_CODE}_VIEW`
5. Admin role bypasses all permission checks
6. On login, `CacheService` is cleared; SignalR reconnects

### Key cross-cutting patterns
- **Repository pattern**: every feature has `IXxx` interface → `XxxRepository` class, auto-scanned by Scrutor in `Program.cs`
- **TokenKey validation**: all mutating endpoints receive `FromBodyBase<T>` which contains a `TokenKey`; backend calls `_logs.CheckTokenKey()` before processing
- **CacheService** (frontend): in-memory cache with 60-minute TTL; SignalR `sendToAll` / `Update:EntityName` messages trigger `clearByEntity()`
- **Permission codes**: `[ClaimRequirement(FunctionCode.XXX, ActionCode.YYY)]` attribute on controller actions; frontend `authService.hasPermission(code)` for UI visibility
- **All API calls use POST** — even reads; request bodies carry filter parameters

### External integrations
- **Vietmap API** — route planning & toll calculation (`VietmapApiController`)
- **Google Maps API** — geocoding (`GoogleMapController`)
- **Firebase FCM** — push notifications
- **AWS S3** — file storage (`S3Controller`)
- **Innvie/Garage API** — vehicle inspection system (external partner)
- **Google Gemini 2.5 Flash** — invoice extraction (`GeminiAIController`)
- **Google Document AI** — document processing
- **DBS EDI** — customer EDI integration
- **Vietcombank rate API** — exchange rate fetch

### Environment config
- `src/environments/environment.ts` — dev; `environment.prod.ts` — prod
- Key env vars: `apiUrl` (main API), `apiReportUrl`, `apiXuong` (Innvie), `googleMap_ApiKey`, `firebase.*`
- Backend config in `appsettings.json`; sensitive keys kept out of source via `appsettings.Development.json`

## Context files

Detailed reference docs are in `.claude/context/`:
- [modules.md](.claude/context/modules.md) — per-module feature inventory
- [auth.md](.claude/context/auth.md) — auth & permission system deep-dive
- [api-map.md](.claude/context/api-map.md) — frontend service ↔ API controller mapping
- [conventions.md](.claude/context/conventions.md) — coding conventions for both stacks
- [done.md](.claude/context/done.md) — implemented features
- [todo.md](.claude/context/todo.md) — pending / in-progress work
