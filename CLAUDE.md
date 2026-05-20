# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DeltaSoft ERP — logistics/transport management system for a Vietnamese freight forwarding company.

- **Frontend**: Angular 15 SPA (`web-app-update/`)
- **Backend**: ASP.NET Core (.NET 9) REST API (`d:/Delta/DeltaSoft/NewAPI/API/`)
- **Database**: SQL Server via Dapper (stored procedures and raw SQL)
- **Realtime**: SignalR hub at `/signalr`
- **Push notifications**: Firebase Cloud Messaging

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
