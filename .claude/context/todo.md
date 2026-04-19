# Pending / In-Progress Work

## In Progress

### Transport Order (Lệnh vận chuyển) — New Module
- Backend: `TransportOrderController` + `TransportOrderRepository` — basic CRUD + status workflow done
- Frontend: `transports/` module partially built
- Integration: Vietmap API for route + toll calculation is implemented
- Google Maps API for display is wired up
- Modal tabs (Chi tiết công việc, Chi phí, Hình ảnh hiện trường) đã thêm — chưa implement upload ảnh (onAttachFileChanged là stub)
- Status: đang phát triển

### AI Invoice Extraction
- Backend: `GeminiAIController.extract-invoice` using Gemini 2.5 Flash — in dev/refactoring
- `DocumentAIController` — exists, integration status unclear
- `ClaudeAIController` — controller exists, implementation status unknown
- Frontend UI for invoice extraction: not yet built

## Known Issues / Bugs Fixed Recently
- Phiếu chi (accounting receipts) written from dispatch order — fixed (`db538dc`, `09ee18c`)
- Driver payment from dispatch order — fixed

## Pending Features (inferred from codebase gaps)

### Frontend incomplete screens
- `training-materials-management` module folder exists but contents not deeply explored
- Canon module sub-pages: workflow-canon, db-chitiet-canon — status unknown

### Backend services awaiting frontend
- `ClaudeAIController` — Claude AI integration in backend, no frontend UI
- `OpenSourceMapController` — alternative map service, no frontend UI observed
- `DeltaGetController` — internal Delta API aggregator, usage unclear

### Infrastructure
- `appsettings.json` has `ClaudeApiKey: ""` — Claude AI not yet configured with real key
- Google Document AI credentials stored in `Templates/delta-erp-vn-2550393a36c2.json` — active
- Gemini AI: `ModelId: "gemini-2.5-flash"` configured

## Technical Debt
- `WeatherForecastController.cs` — default ASP.NET template file, never cleaned up
- Some controllers still use old `JwtSecurityTokenHandler` (deprecated path) vs new `JsonWebTokenHandler`
- `console.log(user)` left in `AuthService.hasPermission()` — should be removed
- `tslint.json` used (deprecated, should migrate to ESLint)
- `@types/googlemaps` version `3.39.13` is old — should use `@types/google.maps`

## Upgrade Considerations
- Frontend on Angular 15; Angular 20 workspace exists at `web-app-angular20/` — migration in progress
- New web app at `new-web-app/` and `logistics-v2/` — parallel development tracks
- See `d:/Delta/DeltaSoft/SYSTEM_UPGRADE_ROADMAP.md` for upgrade plans
