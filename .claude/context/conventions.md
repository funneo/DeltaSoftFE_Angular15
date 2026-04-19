# Coding Conventions

## Frontend (Angular 15 / TypeScript)

### Service pattern
- All services extend `BaseService` (for `handleError`) or are standalone `@Injectable({ providedIn: 'root' })`
- HTTP calls are `POST` for everything — reads included; pass filter params in body
- URL format: `` `${environment.apiUrl}/api/{controller}/{action}` ``
- Cacheable services use `CacheService.get(key, source$, ttl?)` — key format: `'entity-name'` or `'entity-name-{id}'`
- After mutating data, invalidate cache: `this.cacheService.clear('key')` or `clearPattern(/regex/)`

### Cache key constants
Defined in `src/app/shared/constants/cache.constants.ts`. Always use `CacheConstants.XXX` — never hardcode strings.

### Module structure
Each feature module has:
- `{name}-routing.module.ts` — routes with `data: { functionCode: 'FEATURECODE' }` for auth guard
- `{name}.module.ts` — imports `CommonModule`, `FormsModule`, `ModalModule`, shared feature-specific modules
- Component folders: `{feature-name}/{component}/` with `.component.ts`, `.component.html`, `.component.css`

### Permissions in templates
```html
<!-- Show button only if user has CREATE permission -->
<button *ngIf="authService.hasPermission('DISPATCHORDER_CREATE')">Add</button>
```

### Notifications
Use `NotificationService` (wraps alertifyjs):
```typescript
this.notificationService.success('Lưu thành công');
this.notificationService.error('Có lỗi xảy ra');
```

### Date handling
Use `moment.js` for formatting; display format: `DD/MM/YYYY`, API format: ISO string.

### Export Excel
Use `export-excel.service.ts` wrapping `xlsx` library.

### SignalR cache refresh
After a mutation that affects shared master data, call:
```typescript
this.signalRService.notifyUpdate('entity-name');
```
Backend broadcasts `sendToAll` with `refresh-{entity-name}`.

### File paths
Use `@app/` path alias for `src/app/`, `@environments/` for `src/environments/`.

---

## Backend (ASP.NET Core / C#)

### Controller pattern
```csharp
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class XxxController : ControllerBase
{
    private IXxx _context;
    public XxxController(IXxx context) { _context = context; }

    [HttpPost, Route("GetAll")]
    [ClaimRequirement(FunctionCode.XXX, ActionCode.VIEW)]
    public async Task<IActionResult> GetAll([FromBody] FromBodyBase<FilterModel> obj)
    {
        if (!await CheckTokenKey(obj.TokenKey)) return BadRequest(...);
        var result = await _context.GetAll(obj.Model);
        return Ok(result);
    }
}
```

### Repository pattern
- Interface in `Interfaces/{Domain}/IXxxRepository.cs`
- Implementation in `Repositories/{Domain}/XxxRepository.cs`
- Auto-scanned by Scrutor: any class ending with `Repository` is registered as `Transient`
- Exceptions: `IEmployee`, `IBranch`, `IDepartment`, `ITitle`, `IAttachFiles` registered explicitly as `Scoped`

### Dapper usage
All DB access through `IDapperAdapter`:
```csharp
// Query list
var result = await _dapper.QueryAsync<T>("SELECT...", new { Param = value });
// Query single
var item = await _dapper.QuerySingleAsync<T>("SELECT...", new { Id = id });
// Execute (insert/update/delete)
var rows = await _dapper.ExecuteAsync("UPDATE...", new { ... });
// Stored procedure
var result = await _dapper.QueryAsync<T>("sp_name", params, CommandType.StoredProcedure);
```

### ResponseValue wrapper
Repositories return `ResponseValue` for mutations:
```csharp
var rval = new ResponseValue();
// ...
rval.ErrorCode = 0; // success
rval.Message = "OK";
return rval;
```
Controller returns `Ok(rval)`.

### FromBody wrapper
All request bodies:
```csharp
public class FromBodyBase<T>
{
    public T Model { get; set; }
    public string TokenKey { get; set; }
}
```

### Claim helpers
```csharp
var userId = User.GetUserId();       // extension method
var branchId = User.GetBranchId();
var employeeId = User.GetEmployeeId();
```
Defined in `Extensions/ClaimsPrincipalExtension.cs`.

### Error handling
- Global exception handler in `Program.cs` returns `500` with `{ message: "..." }`
- No throw in controllers — catch in repository, return `ResponseValue` with error info
- Logs to file via `Serilog` (configured in `appsettings.json` `PathFormat`)

### Naming
- Controllers: `{Domain}Controller` in `Controllers/{Group}/`
- Interfaces: `I{Domain}` or `I{Domain}Repository`
- ViewModels: `{Name}ViewModel` in `ViewModels/`
- Models: flat POCOs in `Models/`
- SQL: raw SQL strings in repository methods; stored procedures for complex operations

### SignalR broadcast
```csharp
// Inject IHubContext<RefreshHub>
await _hubContext.Clients.All.SendAsync("sendToAll", $"refresh-{entityName}");
```

### PDF generation
Use `DinkToPdf` via `IConverter`:
```csharp
var pdf = _converter.Convert(new HtmlToPdfDocument { ... });
return File(pdf, "application/pdf");
```
Templates stored in `Templates/` folder.

### External API calls
Use `RestSharp` (`RestClient`, `RestRequest`). Pattern used for Innvie and other partners.
`HttpClient` (injected via `IHttpClientFactory`) used for Google/Gemini APIs.
