---
name: deltasoft-picker
description: Build a picker modal for DeltaSoft ERP (Angular 15) — a read-only popup that lets the user search/filter a list (by customer + date range + keyword + per-column), browse rows grouped by an entity (usually customer), and pick ONE row which is emitted back to the parent via @Output. Invoke when creating a `modal-pick-*` / `modal-*-picker` component, a "choose a job/shipment/invoice/employee" dialog, a selector that feeds a field on another form, or when one picker must serve multiple data sources via an @Input mode. The canonical example is modal-pick-job. Distinct from deltasoft-modals (modal skeleton/drag/lazy-mount) and deltasoft-list (full CRUD list); a picker is selection-only and emits a result instead of mutating.
---

# DeltaSoft — Picker Modal

A picker is a **read-only selection dialog**: search → group → click one row → emit it to the parent. It does NOT create/edit/delete. Canonical: `shared/components/advance-payment/modal-pick-job/`. It reuses the modal shell (deltasoft-modals) and a list-style filter bar (deltasoft-list), but its contract is selection.

## The contract

```ts
/** Result emitted to the parent on pick. Export it so the parent can type its handler. */
export interface PickXResult { id: number; code: string; name: string; /* the fields the parent needs */ }

@Component({ selector: 'modal-pick-x', templateUrl: './modal-pick-x.component.html' })
export class ModalPickXComponent implements OnInit {
  @Input() mode: 'a' | 'b' = 'a';                 // optional: one picker, multiple sources
  @Output() SelectItem = new EventEmitter<PickXResult>();
  @Output() CloseModal = new EventEmitter<any>();
  @ViewChild('modalPickX', { static: false }) modal: ModalDirective;
  ...
}
```

- **`SelectItem`** carries the chosen row (a typed interface, not the raw model — only what the parent needs).
- **`CloseModal`** fires from the modal's `(onHidden)` so the parent can unmount it.
- The parent mounts it lazily and calls `show(...)` — same lazy-mount discipline as any modal (deltasoft-modals).

## show() — open with fresh filters

The parent calls `show()` (optionally with a mode). Reset every filter, set the default date window, load lookups once, load data, then `modal.show()`:

```ts
show(mode?: 'a' | 'b') {
  this.mode = mode || 'a';
  this.keyword = ''; this.customerId = null;
  this.colFilters = { ... };                       // clear per-column filters
  this.ngayBatDau = new Date(moment().subtract(30, 'd').toString());   // picker default = last 30d → end of month
  this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
  this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  if (!this.listCustomer?.length) this.loadCustomer();   // load lookup once, cache on the instance
  this.loadData();
  this.modal.show();
}
```
Resetting on every `show()` matters — a picker is reopened many times and must not show stale filters from the last pick.

## Filter bar

Same controls as a list (deltasoft-list): **customer ng-select** + **date range** + **keyword**. Each change calls `loadData()`:
```ts
selectedDate(e)   { this.ngayBatDau = new Date(e.start); this.ngayKetThuc = new Date(e.end); this.loadData(); }
changedCustomer(e){ this.customerId = e?.id; this.loadData(); }
search()          { this.loadData(); }
```

## Multi-source via `mode`

When one picker serves two backends (e.g. job vs workflow), branch inside `loadData()`. Each source loads with `pageSize 99999` (pickers load-all then group client-side), then maps to a **unified row shape** so the template is source-agnostic:

```ts
loadData() {
  this.loading = true;
  if (this.mode === 'b') {
    this.busy = this.serviceB.getForPicker(params).subscribe(res => {
      this.rows = ok(res) ? res.data.map(x => this.toRowFromB(x)) : [];
      this.loading = false; this.buildGroups();
    }, () => { this.loading = false; this.rows = []; this.buildGroups(); });
  } else {
    this.busy = this.serviceA.getPagingNormal(params).subscribe(res => {
      this.rows = ok(res) ? res.data.items.filter(s => !s.isFinish).map(x => this.toRowFromA(x)) : [];
      this.loading = false; this.buildGroups();
    }, () => { this.loading = false; this.rows = []; this.buildGroups(); });
  }
}
```
Apply business filters in the mapper step (e.g. `.filter(s => !s.isFinish)` to hide locked rows). Prefer a dedicated lean `*_GetForPicker` SP over reusing a heavy `GetPaging` (see the F043 picker work — a slim SP keeps the popup fast). Use a `PickRow` interface with the union of fields both sources need; leave the irrelevant ones `undefined`.

## Group by entity (collapsible)

Pickers group rows under a heading (almost always **customer name**) and let each group collapse:

```ts
private buildGroups() {
  const map = new Map<string, PickGroup>();
  for (const r of this.rows) {
    if (!this.matchColFilters(r)) continue;        // per-column filters fold in here
    const key = r.customerName || 'Khác';
    if (!map.has(key)) map.set(key, { key, items: [], isExpanded: true });
    map.get(key).items.push(r);
  }
  this.groups = Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
}
toggleGroup(g: PickGroup) { g.isExpanded = !g.isExpanded; }
get totalRows() { return this.groups.reduce((s, g) => s + g.items.length, 0); }
```
Rows with no group key fall under `'Khác'`. `buildGroups()` is the single place that both the data load and the column filters funnel into — call it after either changes.

## Per-column filters (client-side)

Optional header-row inputs that narrow within the loaded set (no server round-trip). They live in a small object and re-run grouping:
```ts
colFilters = { code: '', name: '', ref: '' };
applyColFilters() { this.buildGroups(); }
private matchColFilters(r: PickRow): boolean {
  const f = this.colFilters, has = (v: string, kw: string) => !kw || (v||'').toLowerCase().includes(kw.toLowerCase().trim());
  return has(r.code, f.code) && has(r.name, f.name) && has(r.ref, f.ref);
}
```
Gate column filters to the mode that needs them if they only make sense there.

## Pick + close

```ts
pick(r: PickRow) {
  this.SelectItem.emit({ id: r.id, code: r.code, name: r.name /* ...only what parent needs */ });
  this.modal.hide();        // hiding triggers (onHidden) → OnHidden() → CloseModal
}
close()   { this.modal.hide(); }
OnHidden(){ this.CloseModal.emit(); }
```

## Parent wiring

```html
<modal-pick-x *ngIf="showPicker" [mode]="pickMode" (SelectItem)="onPicked($event)" (CloseModal)="showPicker=false"></modal-pick-x>
```
```ts
openPicker(mode) { this.showPicker = true; setTimeout(() => this.pickX.show(mode), 50); }
onPicked(e: PickXResult) { this.entity.xId = e.id; this.entity.xName = e.name; /* fill the field(s) */ }
```
The picker fills a **read-only field + a 🔍 button** on the parent form; the user never types the id directly.

## Module imports

Same as a modal that also filters: `CommonModule, FormsModule, ModalModule, AngularDraggableModule, NgSelectModule, Daterangepicker, NgBusyModule` (+ `NgxSpinnerModule` if you show a loading overlay). See deltasoft-modals for the draggable/header wiring.

## Checklist

- [ ] `@Output SelectItem` (typed result interface, exported) + `@Output CloseModal`
- [ ] `show(mode?)` resets all filters + sets default date window + loads lookups once + `modal.show()`
- [ ] filter bar: customer ng-select + date range + keyword, each → `loadData()`
- [ ] `loadData()` branches by `mode`; maps each source → unified `PickRow`; business filter in mapper
- [ ] `buildGroups()` group-by-customer, collapsible, `'Khác'` fallback, sorted
- [ ] optional per-column filters → `applyColFilters()` → `buildGroups()`
- [ ] `pick()` emits result + `modal.hide()`; `OnHidden()` emits `CloseModal`
- [ ] parent: lazy `*ngIf` mount + `setTimeout show()`; fills read-only field via `onPicked`

## Anti-patterns

- ❌ Emitting the raw backend model — emit a lean typed result the parent actually needs.
- ❌ Not resetting filters in `show()` → stale filters on reopen.
- ❌ Letting the parent set the picked id by hand — picker owns selection; parent field is read-only.
- ❌ Reusing a heavy `GetPaging` SP when a slim `GetForPicker` keeps the popup snappy.
- ❌ Grouping/filtering in the template — do it in `buildGroups()`/`matchColFilters()` so there's one source of truth.
- ❌ Forgetting `(onHidden)→CloseModal` → parent never unmounts the picker.
