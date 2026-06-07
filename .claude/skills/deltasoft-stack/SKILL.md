---
name: deltasoft-stack
description: Conventions, templates, and snippets for DeltaSoft ERP (Angular 15 + ASP.NET Core .NET 9 + Dapper + SQL Server). Invoke when adding a new feature module (BE Controller/Repo + FE service/modal/list), wiring permissions, or writing a new SP. Saves token by skipping repeated reads of DriverFuelApproval pattern, auth.guard, FunctionCode/ActionCode, ClaimRequirementFilter, Permissions SP, DispatchOrder schema quirks.
---

# DeltaSoft Stack — Quick Reference

Authoritative one-page cheatsheet so we don't re-read the same 10 files every session.

## 1) Add a new feature module — checklist

For a CRUD module (header + optional detail):

**Backend** (`D:\Delta\DeltaSoft\NewAPI\API\`):
1. `Filters/FunctionCode.cs` → add enum value (legacy style or `F0xx`). Enum name **must equal** `Functions.Id` in DB.
2. `Models/<Group>/<Entity>.cs` (+ `<Entity>Detail.cs` if TVP)
3. `ViewModels/<Group>/<Entity>ViewModel.cs` (+ `<Entity>DetailViewModel`)
4. `Interfaces/<Group>/I<Entity>.cs`
5. `Repositories/<Group>/<Entity>Repository.cs` — implements `I<Entity>`. Scrutor auto-scans; no manual DI.
6. `Controllers/<Group>/<Entity>Controller.cs` — `[ApiController][Authorize]` + `[ClaimRequirement(FunctionCode.X, ActionCode.Y)]`.

**Frontend** (`src/app/`):
1. `shared/models/<group>/<entity>.model.ts` — include `checked?: boolean; totalRows?: number;`
2. `shared/services/<group>/<entity>.service.ts` — extends `BaseService`, POST every endpoint.
3. `shared/components/<group>/modal-<entity>/` — modal create/edit/view + module.
4. `main/<group>/<entity>/` — list component + module + routing.
5. `main/<group>/<group>-routing.module.ts` — add: `{ path: 'xxx', loadChildren: ..., data: { functionCode: 'XXX' }, canActivate: [AuthGuard] }`. `functionCode` must equal enum name.

**Database**:
1. Tables `Tbl_<Entity>` + `Tbl_<Entity>Detail` (new entities use `Tbl_` prefix; legacy don't).
2. TVP `Type<Entity>Detail` matching detail table columns minus identity/FK.
3. SPs **strict naming**: `SP_<TableName>_<Action>` (Create / Update / GetById / GetPaging / Approve / Delete / GetCandidates …). NEVER mix: `SP_TransportOrder_AddExtraSegment` ❌ → `SP_TransportOrder_ExtraSegments_Add` ✓.
4. `Functions(Id=X, Name=..., ParentId=..., Url=...)` — Id matches enum/route.
5. `ActionInFunctions(FunctionId=X, ActionId=VIEW|CREATE|UPDATE|DELETE|ACCEPT|EXPORT)` — these become permission strings.
6. `Permissions(RoleId, FunctionId, ActionId)` — grant per role.

**DO NOT** auto-write DB. Hand SQL to user for review. Read-only `SELECT` via PowerShell is fine.

## 2) Auth / Permission flow (the part we always forget)

**Claim format in JWT**: `UPPER(FunctionId + '_' + ActionId)` (e.g. `F039_VIEW`, `DRIVERFUELAPPROVAL_CREATE`).

Source: `dbo.SP_sys_Permission_GetByUserId` returns `UPPER(CONCAT(FunctionId,'_',ActionId))` joined from `Permissions` + `ActionInFunctions`. Admin role bypass at SP-level.

**Three places that must match exactly**:

| Layer | Where | Must equal |
|-------|-------|-----------|
| DB | `Functions.Id`, `ActionInFunctions.FunctionId`, `Permissions.FunctionId` | the canonical id |
| BE | `enum FunctionCode.X` — `.ToString()` returns `"X"` | same id |
| FE | `route.data.functionCode` | same id |

**BE filter** ([ClaimRequirementFilter.cs](D:/Delta/DeltaSoft/NewAPI/API/Filters/ClaimRequirementFilter.cs)):
```csharp
var functionArr = _function.ToString().Split("_");
string functionId = string.Join(".", functionArr);
if (!permissions.Contains(functionId + "_" + _action)) ForbidResult;
```

**FE guard** ([auth.guard.ts](src/app/shared/guard/auth.guard.ts#L25)):
```ts
permiss.findIndex(x => x === functionCode + '_VIEW')
```

Two enum styles co-exist in codebase: legacy descriptive (`DRIVERFUELAPPROVAL`) and `F0xx`. Pick whichever matches the existing `Functions.Id` row; if creating a new function, prefer matching DB style. Many `F0xx` already declared in [FunctionCode.cs](D:/Delta/DeltaSoft/NewAPI/API/Filters/FunctionCode.cs) line ~114 — reuse before adding.

`ActionCode`: `ACCEPT, ACCOUNT, CLOSING, COPY, CREATE, DELETE, EXPORT, OPEN, PAYMENT, UPDATE, VIEW`. Use `ACCEPT` for approve (not `APPROVE`).

**Grant SQL template** (hand to user):
```sql
INSERT INTO dbo.ActionInFunctions (FunctionId, ActionId)
SELECT 'F039', x.a FROM (VALUES ('VIEW'),('CREATE'),('UPDATE'),('ACCEPT'),('DELETE')) AS x(a)
WHERE NOT EXISTS (SELECT 1 FROM dbo.ActionInFunctions y WHERE y.FunctionId='F039' AND y.ActionId=x.a);

DECLARE @AdminRoleId NVARCHAR(450) = (SELECT TOP 1 Id FROM dbo.Roles WHERE Name='Admin');
INSERT INTO dbo.Permissions (RoleId, FunctionId, ActionId)
SELECT @AdminRoleId, 'F039', x.a FROM (VALUES ('VIEW'),('CREATE'),('UPDATE'),('ACCEPT'),('DELETE')) AS x(a)
WHERE @AdminRoleId IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.Permissions p WHERE p.RoleId=@AdminRoleId AND p.FunctionId='F039' AND p.ActionId=x.a);
```

## 3) BE Controller template

```csharp
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class XController : ControllerBase
{
    private readonly ILogs _logs;
    private readonly IX _context;
    public XController(ILogs logs, IX context) { _logs = logs; _context = context; }

    private async Task<bool> CheckTokenKey(string tk)
    {
        var ok = await _logs.CheckTokenKey(tk);
        if (ok) await _logs.UpdateToken(tk);
        return ok;
    }

    [HttpPost, Route("Create")]
    [ClaimRequirement(FunctionCode.X, ActionCode.CREATE)]
    public async Task<IActionResult> Create([FromBody] FromBodyBase<X> obj)
    {
        try {
            var rval = new ResponseValue();
            if (!await CheckTokenKey(obj.TokenKey)) { rval.Code="401"; rval.Message="Unauthorized"; return Ok(rval); }
            obj.Item.CreatedBy = User.GetUserId();
            rval.Data = await _context.Create(obj.Item);
            rval.Code = "200"; rval.Message = "OK";
            return Ok(rval);
        } catch (Exception ex) {
            return Ok(new ResponseValue { Code="500", Message=ex.Message+ex.InnerException, Data=ex });
        }
    }
}
```

**FromBodyBase<T>** fields available without re-reading: `Id, TokenKey, BranchId?, EmployeeId?, CustomerId?, KeyWord, PageIndex, PageSize, ListId, UserId, UserName, FromDate, ToDate, GType, BValue, TValue, DValue, Year?, Item`.

**Extensions**: `User.GetUserId()` → `Guid`. `User.GetEmployeeId()` → `int?` (custom, see DraftAPI).

## 4) BE Repository template

```csharp
public class XRepository : IX
{
    private readonly IDapperAdapter _deltaAdapter;
    public XRepository(IDapperAdapter context) { _deltaAdapter = context; }

    public async Task<int> Create(X item)
    {
        try {
            var p = new Parameters();
            p.Add(nameof(X.Field), item.Field);
            // ...
            var tvp = item.detaileds.Select(x => new { x.Source, x.RefNo, ... }).ToList().ToDataTable();
            p.Add("@Detaileds", tvp.AsTableValuedParameter("TypeXDetail"));
            return await _deltaAdapter.ExecuteAsync("SP_X_Create", p, CommandType.StoredProcedure);
        } catch (Exception ex) { throw ex; }
    }

    // Multi-result: header + details
    public async Task<XViewModel> GetById(int id)
    {
        using var _conn = _deltaAdapter.Conn;
        var p = new Parameters();
        p.Add("@Id", id);
        var result = await _conn.QueryMultipleAsync("SP_X_GetById", p, commandType: CommandType.StoredProcedure);
        var h = result.Read<XViewModel>().SingleOrDefault();
        if (h == null) return null;
        h.detaileds = result.Read<XDetailViewModel>().ToList();
        return h;
    }
}
```

Helpers: `ToDataTable()` in `Common.CommonExtensions`. `Parameters` + `IDapperAdapter` in `API.Repositories.DapperAdapter` (also exposes `SqlConnection Conn`).

## 5) FE Service template

```ts
@Injectable({ providedIn: 'root' })
export class XService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super(); this.token = jwtService.getToken();
  }
  add(entity: X) {
    const p: FromBodyBase<X> = { item: entity, tokenKey: this.token };
    return this.http.post(`${environment.apiUrl}/api/X/Create`, p).pipe(
      map((r: any) => { if (r.code == '401') this.authService.logout(); else return r; }),
      catchError(this.handleError));
  }
  getPaging(params: HttpParams) { /* set keyWord/pageIndex/pageSize/branchId/fromDate/toDate, post */ }
  getById(id: number) { /* item:{id}, post */ }
}
```

Every endpoint is POST. Response: `{ code: '200'|'401'|'204'|'500', message, data }`. 401 → logout; 204 → empty list; else error.

## 6) FE List component skeleton

Pattern from `driver-fuel-approval.component.ts`:

```ts
@Component({ selector: 'x', templateUrl: ... })
export class XComponent implements OnInit {
  pageIndex=1; pageSize=50; totalRows=0; keyword=''; list: X[]=[];
  branchId?: number; userLoged?: Profile; busy: Subscription;
  viewModal=false; flagEdit=false; flagDelete=false;
  ngayBatDau: Date; ngayKetThuc: Date; dateOptions: any;
  @ViewChild(ModalXComponent, { static: false }) modalAddEdit: ModalXComponent;

  ngOnInit() {
    this.userLoged = this._authService.getLoggedInUser();
    this.branchId = Number.parseInt(this.userLoged.branchId);
    this.ngayBatDau = new Date(moment().startOf('month').toString());
    this.ngayKetThuc = new Date(moment().endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadData();
  }

  loadData() {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('branchid', this.branchId.toString())
      .set('fromDate', moment(this.ngayBatDau).format('YYYYMMDD'))
      .set('toDate', moment(this.ngayKetThuc).format('YYYYMMDD'))
      .set('keyword', this.keyword);
    this.busy = this.service.getPaging(params).subscribe(...);
  }

  add() { this.viewModal = true; setTimeout(() => this.modalAddEdit.add(), 50); }
  edit(flagXem: boolean) { ... this.modalAddEdit.edit(id, flagXem) ... }
  clickRow(item) { item.checked = !item.checked; this.list.forEach(x => { if (x !== item) x.checked = false; }); this.icheck(); }
}
```

Modal mounting needs `viewModal = true; setTimeout(... add/edit, 50)` (ngx-bootstrap modal must be in DOM before show).

## 7) FE Modal skeleton (with TVP detail)

```ts
@Component({ selector: 'modal-x', templateUrl: ... })
export class ModalXComponent implements OnInit {
  public entity: X = {};
  public flagXem=false; public flagNew=true; public flagSave=false;
  public viewModal=false;
  @Output() SaveSuccess = new EventEmitter(); @Output() CloseModal = new EventEmitter();
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;

  add() { this.flagNew=true; this.entity={...defaults}; this.modalAddEdit?.show(); }
  edit(id: number, flagXem: boolean) {
    this.flagNew=false; this.flagXem=flagXem;
    this.service.getById(id).subscribe(res => { this.entity = res.data; this.modalAddEdit?.show(); });
  }
  saveChange(form: NgForm) {
    if (!form.valid || this.flagSave) return;
    this.flagSave = true;
    const obs = this.flagNew ? this.service.add(this.entity) : this.service.update(this.entity);
    obs.subscribe(res => { this.flagSave=false; if (res.code=='200') { this.modalAddEdit?.hide(); this.SaveSuccess.emit(true); } });
  }
}
```

**Modal module** must import: `CommonModule, FormsModule, ModalModule, AngularDraggableModule, NgSelectModule, Daterangepicker, NgBusyModule, NgxMaskModule.forRoot(UtilityService.maskConfig), PipeSharedModule` (drop unused).

## 8) FE compact UI density (user preference)

Modals/forms: 28px inputs, 6px form-group margin, tight padding. Bootstrap defaults too loose for VN ERP density. See `feedback_compact_ui_density` memory.

## 9) DB / SP conventions

- **SP naming**: `SP_<TableName>_<Action>` — strict. Group actions on related tables under cluster prefix: `SP_TransportOrder_ExtraSegments_Add` (NOT `SP_TransportOrder_AddExtraSegment`).
- **Status convention**: `0=Draft, 1=Approved` (most modules). DispatchOrder uses richer states; `Status=6` = "đã chốt bước 2".
- **Date columns**: `CreatedDate DATETIME NOT NULL DEFAULT GETDATE()`, audit `UpdatedBy/Date`, `ApprovedBy/Date`.
- **TVP**: `dbo.Type<Header>Detail` mirrors detail table (minus Id, FK to header).
- **RefNo gen**: pattern `XXX-YYYYMM-NNN` (e.g. `DFC-202606-001`). Use `FORMAT(@ToDate, 'yyyyMM')` + `MAX(CAST(RIGHT(RefNo,3) AS INT))+1`.
- **Overlap check**: `WHERE FromDate <= @ToDate AND ToDate >= @FromDate`.
- **CASCADE delete**: detail FK to header with `ON DELETE CASCADE` — simplifies Delete SP.

### Schema quirks (typos preserved across the codebase)

| Table | Column | Note |
|-------|--------|------|
| `DispatchOrder` | `VihicleId`, `VihiclelLicensePlates`, `IsSummarized`, `IsSubcontractors` | "Vihicle" typo + double-l "Vihiclel" |
| `DispatchOrderFCL` | `VehicleId` (no typo), `VehiclelLicensePlates` (single typo), `Tongdau` (lowercase), `IsSummarized`, `IsSubcontractors` | Different from DispatchOrder! |
| `DispatchOrderFee` | `RefNo`, `FeeId`, `Quantity` | Fuel = `FeeId IN (666, 667)` |
| `DispatchOrderAdditionalFee` + `Detailed` | `RefNo`, `DispatchOrderRefNo`, `Status>2`=approved | Fuel = `FeeId = 666` (only 666) |
| `DriverFuelApproval` | `VihicleId`, `LicensePlate` (singular), `Quantity`, `QuantityIgas`, `IsFuelClosing`, `Deleted` | "Đổ thực tế" = `QuantityIgas` |
| `DriverFuelApprovalDetailed` | `RefNo`, `DriverFuelApprovalId` | Linker bảng lệnh ↔ phiếu duyệt |

`Functions/ActionInFunctions/Permissions/Roles/UserRoles` — see §2.

## 10) PowerShell read-only DB access

```ps1
$cs = 'Server=115.84.178.66;Database=DELTASOFT;User Id=delta.erp;Password=khsd89#$)?h>24'
$cn = New-Object System.Data.SqlClient.SqlConnection($cs)
$cn.Open()
$cmd = $cn.CreateCommand()
$cmd.CommandText = "SELECT OBJECT_DEFINITION(OBJECT_ID('dbo.SP_Name'))"
Write-Output $cmd.ExecuteScalar()
$cn.Close()
```

`#$)?h>24` chars in password break Bash interpolation — prefer PowerShell with single-quoted connection string. NEVER write/mutate; user must run all DDL/DML.

## 11) Boundaries (HARD rules — verbatim)

- **NEVER auto-run DB writes** (DELETE/UPDATE/ALTER/DROP/INSERT). Only propose SQL for user to run. SELECT OK.
- **NEVER touch FCL legacy lists / TO page**. New list → new component (copy FCL logic, filter `IsLegacy=0`, drop legacy modal). No route-data inheritance.
- **Never commit API keys** — keep in `appsettings.Development.json` / env.
- **Vietmap params contract-locked** — only `vehicle=car`. `avoid`/`weighting`/`truck` ignored. For "avoid highways", use Google Routes / JS SDK client-side instead.
- **Draft API**: tokens with `aud=draft` are default-deny via `DraftAudienceGuardFilter`. Only read (VIEW/EXPORT) + allowlist + draft writes go through. Promote happens in ERP.
- **Address style**: address user as "anh"; refer to self as "em".
- **Every new SP** must be reviewed by user before creation. Show SQL, wait for approval.

## 12) Module structure recap (for context, no need to re-read)

- **Frontend**: Angular 15 SPA at `web-app-update/`. Lazy modules under `src/app/main/<group>/`. Shared: `src/app/shared/{services,models,components,pipes,directives,guards,interceptors}/`.
- **Backend**: ASP.NET Core .NET 9 at `D:\Delta\DeltaSoft\NewAPI\API\`. Repository + Interface pairs (Scrutor auto-DI). `Program.cs` line 83 has commented `DraftAudienceGuardFilter` (debug — re-enable after pool stability verified).
- **DB**: SQL Server, accessed via Dapper. 142+ controllers, mostly POST.
- **Realtime**: SignalR `/signalr` for cache invalidation (`Update:EntityName`).
- **Draft Site**: separate Angular 21 at `D:\Delta\DeltaSoft\draft-web` + DraftAPI process (port 44360, user `draft_app`, schema `draft`).

## 13) Common file paths cheatsheet

| What | Path |
|------|------|
| BE solution | `D:\Delta\DeltaSoft\NewAPI\API\` |
| BE Controllers | `Controllers/<Group>/` |
| BE Repositories | `Repositories/<Group>/` (auto-scanned) |
| BE Interfaces | `Interfaces/<Group>/` |
| BE Models / ViewModels | `Models/<Group>/` and `ViewModels/<Group>/` |
| BE Filters | `Filters/FunctionCode.cs`, `Filters/ActionCode.cs`, `Filters/ClaimRequirementFilter.cs` |
| FE shared | `src/app/shared/` |
| FE main groups | `src/app/main/{home,systems,danhmuc,shipments,transports,cbts,advance-payment,accounting,workflows,sales-marketing,hrm,canon,garage}/` |
| FE auth guard | `src/app/shared/guard/auth.guard.ts` |
| FE base service | `src/app/shared/services/base.service.ts` |
| Migrations | `D:\Delta\DeltaSoft\NewAPI\Migration_*.sql` |
| Context docs | `.claude/context/{modules.md,auth.md,api-map.md,conventions.md,done.md,todo.md}` |
