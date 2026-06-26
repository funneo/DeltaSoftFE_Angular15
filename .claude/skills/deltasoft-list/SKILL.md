---
name: deltasoft-list
description: Build a list/grid page for DeltaSoft ERP (Angular 15) — the standard module screen with a filter bar (date-range + branch + ng-select + keyword), a bordered table with per-column filter row, permission-gated action buttons, row checkbox selection, pagination or load-all, Excel export, and lazy-mounted add/edit/view modals. Invoke whenever creating or editing a `*.component` list under `src/app/main/<group>/`, wiring its filter bar, adding column filters, gating toolbar buttons by permission, or deciding server-paging vs load-all. Goes deeper than deltasoft-stack §6 (which only has the bare skeleton). Pairs with deltasoft-modals (the modals this list mounts) and deltasoft-sql-migration (the GetPaging SP behind it).
---

# DeltaSoft — List / Grid Page

The most repeated screen in the ERP: a toolbar with filters + actions, a bordered table, footer with count/pagination, and lazy-mounted modals. The canonical reference is `main/transports/driver-fuel-approval/`. Clone its shape; don't reinvent.

## Page skeleton — the four parts

```
box box-primary box-chieu-cao
├── box-header with-border   → title + filter bar (left) + action buttons (right, text-right)
├── box-body  table_wrapper  → <table table-bordered table-hover> (header row + per-column filter row + tbody)
└── box-footer no-padding    → "Tổng số bản ghi: N" + optional <pagination>
+ lazy modals:  <modal-x *ngIf="viewModal" (SaveSuccess)=... (CloseModal)=...>
```

`box-chieu-cao` gives the fixed-height scroll frame; `box-body` must be a direct child so it clips/scrolls. If you put the table in a `<tabset>`, wrap each tab's content in its own `box box-chieu-cao` so the body is still a direct child (see the subcontractor FCL tab work).

## Component .ts — required state + lifecycle

```ts
export class XComponent implements OnInit {
  pageIndex = 1; pageSize = 50; totalRows = 0; keyword = "";
  list: X[] = []; listFilter: X[] = [];          // listFilter = what the template renders
  listBranch: Branch[] = [];
  branchId?: number; userLoged?: Profile; adminPermission = false;
  busy: Subscription;
  flagEdit = false; flagDelete = false;
  viewModal = false;                              // controls lazy-mount of the modal
  loading = false;                                // optional: drives spinner overlay
  public ngayBatDau: Date = this._utilityService.ngayBanDau;   // start of month
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;  // end of month
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  @ViewChild(ModalXComponent, { static: false }) modalAddEdit: ModalXComponent;

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.branchId = Number.parseInt(this.userLoged.branchId);
    this.adminPermission = this.userLoged.isAdmin;     // gates branch-switch + admin-only UI
    this.loadData();
    this.loadBranch();
  }
}
```

`ngayBanDau`/`ngayKetThuc` (start/end of current month) and `dateOptionMultis(...)` come from `UtilityService` — see deltasoft-utility. Don't hand-roll moment ranges.

## The filter bar (left of the header)

Three standard controls, in this order:

```html
<!-- 1) date range -->
<input type="text" daterangepicker [options]="dateOptions" (selected)="selectedDate($event)" class="form-control">
<!-- 2) branch (admin-only switch) -->
<ng-select [items]="listBranch" bindLabel="branchCode" bindValue="id" [(ngModel)]="branchId"
           (change)="changedBranch($event)" placeholder="Chọn chi nhánh ..." [disabled]="!adminPermission"></ng-select>
<!-- 3) keyword (server-side, fires on Enter / button) -->
<div class="input-group">
  <input class="form-control" [(ngModel)]="keyword" (keyup.enter)="timKiem()" placeholder="Từ khóa" />
  <span class="input-group-btn"><button class="btn btn-info btn-flat btn-sm" (click)="timKiem()"><i class="fa fa-search"></i></button></span>
</div>
```

```ts
selectedDate(e) { this.ngayBatDau = new Date(e.start); this.ngayKetThuc = new Date(e.end); this.loadData(); }
changedBranch(e: Branch) { this.branchId = e?.id; this.loadData(); }
timKiem() { this.pageIndex = 1; this.loadData(); }   // keyword search resets to page 1
```

For an **entity filter** (supplier/customer/driver), add another `<ng-select [items]="listSupplier" bindLabel="name" bindValue="id" (change)="loadData()">` and pass its id into the params. Load its list in `ngOnInit` via the relevant service.

## loadData — the params contract

Every list calls `service.getPaging(params)` with an `HttpParams` carrying the same keys. Dates are `YYYYMMDD` strings:

```ts
loadData(): void {
  const params = new HttpParams()
    .set("pageIndex", this.pageIndex.toString())
    .set("pageSize", this.pageSize.toString())
    .set("branchid", this.branchId?.toString() ?? "")
    .set("fromDate", moment(this.ngayBatDau).format("YYYYMMDD"))
    .set("toDate", moment(this.ngayKetThuc).format("YYYYMMDD"))
    .set("keyword", this.keyword);
  this.loading = true;
  this.busy = this.service.getPaging(params).subscribe((res: ResponseValue<Pagination<X>>) => {
    this.loading = false;
    if (res.code == "200" || res.code == "201") {
      this.list = res.data?.items; this.totalRows = res.data?.totalRows;
      this.listFilter = this.list;                 // seed the client-filtered view
    } else if (res.code == "204") { this.list = []; this.listFilter = []; this.totalRows = 0; }
    else this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + "\n" + res.code);
  }, _ => this.loading = false);
}
```

Always handle three branches: `200/201` ok, `204` empty (not an error — set empty arrays), else toast `MessageContstants.GETDATA_ERR_MSG`. `code=='401'` is handled inside the service (logout).

### Two load modes — choose deliberately

- **Server paging** (default for big tables): `pageSize = 50`, real `<pagination (pageChanged)="pageChanged($event)">`, `totalRows` from server. Keyword/filters go to the SP.
- **Load-all + client filter** (`pageSize = 9999`): pull everything once, then filter/group in the browser. Used by `driver-fuel-approval` and `pending-invoice` (which also groups). It's simpler but **slower to first paint** — add the `loading` overlay and say in a comment why it's load-all. Only pick this when the row count is bounded and you need client-side grouping/tabs.

## Per-column filter row (client-side)

Below the header row, a second `<tr>` of inputs. Each `(input)="filter()"`; `filter()` rebuilds `listFilter` from `list` with `includes()` per non-empty box. This is independent of the server keyword.

```html
<tr>
  <th></th>
  <th><input class="form-control" [(ngModel)]="refSearch" (input)="filter()" name="refSearch"/></th>
  <th><ng-select [(ngModel)]="statusFilter" (change)="filter()" [items]="statusArray" bindLabel="text" bindValue="value" [clearable]="false"></ng-select></th>
  ...
</tr>
```
```ts
filter() {
  this.listFilter = Object.assign([], this.list);
  if (this.refSearch?.length) this.listFilter = this.listFilter.filter(d =>
    d.refNo?.toString().toLowerCase().includes(this.refSearch.trim().toLowerCase()));
  // ...one block per column; dates via this.datepipe.transform(d.date,'dd/MM/yyyy')
}
```
Inject `DatePipe` (also add it to the module `providers`) when filtering date columns by their displayed text.

## Action buttons — gate by permission with `appPermission`

Toolbar buttons live in `col-md-* text-right`. **Permission gating uses the `appPermission` structural directive**, not `*ngIf hasPermission`:

```html
<button class="btn btn-success btn-sm" (click)="add()"          appPermission appFunction="DRIVERFUELAPPROVAL" appAction="CREATE"><i class="fa fa-plus"></i> Thêm</button>
<button class="btn btn-primary btn-sm" (click)="edit(false)" [disabled]="!flagEdit" appPermission appFunction="DRIVERFUELAPPROVAL" appAction="UPDATE"><i class="fa fa-edit"></i> Sửa</button>
<button class="btn btn-danger  btn-sm" (click)="deleteConfirm()" [disabled]="!flagDelete" appPermission appFunction="DRIVERFUELAPPROVAL" appAction="DELETE"><i class="fa fa-trash"></i> Xóa</button>
<button class="btn btn-info    btn-sm" (click)="edit(true)" [disabled]="!flagEdit"><i class="fa fa-eye"></i> Xem</button>
<button class="btn btn-success btn-sm" (click)="export()"       appPermission appFunction="DRIVERFUELAPPROVAL" appAction="EXPORT"><i class="fa fa-file-excel-o"></i> Export</button>
```

- `appFunction` = the FunctionCode id (same string used in `route.data.functionCode`, the BE enum, and DB — see deltasoft-stack §2). `appAction` = `VIEW|CREATE|UPDATE|DELETE|EXPORT|ACCEPT`.
- The **View** button is intentionally NOT gated (everyone with VIEW reached the page already).
- `Sửa/Xóa/Xem` use `[disabled]="!flagEdit"` / `[disabled]="!flagDelete"` driven by row selection.

`appPermission` comes from `SharedDirectivesModule` — import it in the list's module.

## Row selection — single-select checkbox

Clicking a row toggles its checkbox and clears the others; `icheck()` enables Edit/Delete only when exactly one is selected:

```ts
clickRow(item: X) { item.checked = !item.checked; this.list.forEach(x => { if (x !== item) x.checked = false; }); this.icheck(); }
icheck() { const n = this.list.filter(x => x.checked).length; this.flagEdit = n === 1; this.flagDelete = n === 1; }
```
```html
<tr *ngFor="let item of listFilter" (click)="clickRow(item)">
  <td class="table-checkbox">
    <label class="custom-checkbox">
      <input type="checkbox" [checked]="item.checked" disabled />   <!-- disabled on purpose; row click drives it -->
      <span class="helping-el"></span>
    </label>
  </td>
  ...
</tr>
<tr *ngIf="listFilter.length == 0"><td colspan="100%">Không có bản ghi nào được tìm thấy!</td></tr>
```
⚠ The checkbox is `disabled` so the **row click** owns the toggle — if you make it enabled, clicks register twice (the "lúc được lúc không" bug; see deltasoft-modals). `item.checked` requires `checked?: boolean` on the model.

## Mounting modals — lazy + setTimeout

ngx-bootstrap modals must be in the DOM before `.show()`. Mount with `*ngIf="viewModal"` and open after a tick:

```ts
add()  { this.viewModal = true; setTimeout(() => this.modalAddEdit.add(), 50); }
edit(flagXem: boolean) {
  const row = this.list.find(x => x.checked);
  const canEdit = row.createdBy == this.userLoged.id;   // creator-or-admin gate, if the module needs it
  this.viewModal = true; setTimeout(() => this.modalAddEdit.edit(row.id, flagXem, canEdit), 50);
}
saveSuccess() { this.loadData(); }     // (SaveSuccess) from modal → reload
closeModal()  { this.viewModal = false; }
```
```html
<modal-x *ngIf="viewModal" (SaveSuccess)="saveSuccess()" (CloseModal)="closeModal()"></modal-x>
```
See deltasoft-modals for the modal side of the `SaveSuccess`/`CloseModal` contract.

## Delete — confirm dialog

```ts
deleteConfirm() {
  const checks = this.list.filter(x => x.checked);
  if (checks[0].status > 1) return;            // business guard: don't delete approved rows
  this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks[0].id));
}
```
Use `NotificationService.printConfirmationDialog` / `printErrorMessage` with `MessageContstants` strings — never `window.confirm`.

## Export to Excel

Inject `ExportService`. Re-query with `pageSize=99999`, strip internal/id columns via destructuring, then `exportExcel`:
```ts
const { createdBy, id, totalRows, branchId, status, ...row } = item;   // drop columns you don't want in the sheet
this._export.exportExcel(rows.map(stripFn), "ten-file-xuat");
```

## Module imports (list module)

```ts
imports: [ CommonModule, FormsModule, PaginationModule, NgBusyModule, NgSelectModule,
           Daterangepicker, PipeSharedModule, SharedDirectivesModule /* appPermission */,
           NgxSpinnerModule /* if loading overlay */, XRoutingModule, ModalXModule ],
providers: [ DatePipe ]   // if any column filter formats dates
```
Routing: the child route is just `{ path: '', component: XComponent }`. The `data: { functionCode: 'XXX' }` + `canActivate: [AuthGuard]` live on the **parent** lazy-load route in `<group>-routing.module.ts` (deltasoft-stack §1).

## SignalR refresh (optional)

Lists that must reflect other users' changes subscribe to `Update:<Entity>` and call `loadData()`. CacheService clears on `sendToAll`. Only wire this if the module already broadcasts; don't add it speculatively.

## Checklist for a new list

- [ ] `box box-primary box-chieu-cao` shell, body a direct child
- [ ] filter bar: date range + branch (`[disabled]="!adminPermission"`) + keyword (Enter + button) [+ entity ng-select if needed]
- [ ] `loadData()` with the params contract + 200/204/else handling
- [ ] decide server-paging vs load-all; add `loading` overlay if load-all
- [ ] per-column filter row → `filter()` (if the screen wants it)
- [ ] toolbar buttons gated by `appPermission appFunction/appAction`; View ungated
- [ ] `clickRow`/`icheck` single-select; checkbox `disabled`; model has `checked?`
- [ ] lazy modal mount + `setTimeout(...,50)` + `SaveSuccess→loadData`
- [ ] delete via `printConfirmationDialog`; export via `ExportService`
- [ ] module imports incl. `SharedDirectivesModule`; parent route has `functionCode`

## Anti-patterns

- ❌ Rendering `list` directly — render `listFilter` so client column-filters work.
- ❌ `*ngIf="authService.hasPermission(...)"` on buttons — use `appPermission` directive (the house standard).
- ❌ Enabled checkbox + row click → double toggle.
- ❌ Mounting the modal without `*ngIf` + `setTimeout` → `.show()` on a not-yet-rendered modal.
- ❌ Treating `204` as an error toast — it just means empty.
- ❌ Hand-rolling month date ranges instead of `UtilityService.ngayBanDau/ngayKetThuc/dateOptionMultis`.
