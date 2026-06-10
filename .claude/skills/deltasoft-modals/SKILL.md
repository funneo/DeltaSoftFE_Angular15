---
name: deltasoft-modals
description: Conventions for building ngx-bootstrap modals in DeltaSoft ERP (Angular 15). Invoke before creating/editing any modal-* component or debugging intermittent click/drag behavior. Covers the ngDraggable+[handle] skeleton, [config], show/hide ViewChild wiring, @Output SaveSuccess/CloseModal contract, row-toggle + custom-checkbox gotcha, sizes, and the *ngIf lazy-mount pattern. 163 modals in the repo follow this; match them exactly.
---

# DeltaSoft Modals — Quick Reference

Repo has **163 modals** under `src/app/shared/components/<group>/modal-<name>/`, all built on
`ngx-bootstrap` `bsModal` + `ngDraggable`. They share one skeleton. Copy it; don't invent.

## 1) HTML skeleton (canonical — matches ~146 modals)

```html
<div ngDraggable [handle]="myHandle" class="modal fade" bsModal #modalConfirm="bs-modal"
     [config]="{backdrop: 'static'}" tabindex="-1" role="dialog" aria-labelledby="dialog-static-name"
     (onHidden)="OnHidden()">
  <div class="modal-dialog modal-lg">         <!-- size: modal-md (54×) | modal-lg (109×) | modal-xl -->
    <div class="modal-content" [ngBusy]="busy">
      <div #myHandle class="modal-header">    <!-- HANDLE goes on the header, NOT the dialog -->
        <h4 class="modal-title pull-left">Tiêu đề</h4>
        <button type="button" class="close pull-right" aria-label="Close" (click)="modalConfirm.hide()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body"> ... </div>
      <div class="modal-footer text-right"> <!-- or .box-footer inside the form -->
        <button type="button" class="btn btn-success btn-sm" (click)="click()" [disabled]="...">
          <i class="fa fa-check"></i> Lưu</button>
        <button type="button" class="btn btn-danger btn-sm" (click)="modalConfirm.hide()">
          <i class="fa fa-close"></i> Hủy</button>
      </div>
    </div>
  </div>
</div>
```

### ⚠️ The #1 modal bug — drag swallows clicks ("lúc được lúc không")
`ngDraggable` **must** sit on the outer `.modal` div **with `[handle]="myHandle"`**, and `#myHandle`
**must** be on the `.modal-header`. If `ngDraggable` is on `.modal-dialog` (or has no `[handle]`),
the whole dialog captures mousedown→drag and **intermittently swallows clicks** on rows/buttons.
Never put `draggable`/`ngDraggable` on `.modal-dialog`. CSS hint: `#myHandle,.modal-header{cursor:move}`.

## 2) [config] values
- Default everywhere: `[config]="{backdrop: 'static'}"` (169×) — click-outside won't close, X/Hủy does.
- Picker/long-form that must not close accidentally: `{ backdrop: 'static', ignoreBackdropClick: true, keyboard: false }`.

## 3) TS wiring (every modal)

```ts
@ViewChild('modalConfirm', { static: false }) modalConfirm: ModalDirective;  // name = template #ref
@Output() SaveSuccess = new EventEmitter<T>();      // emit AFTER hide() on success
@Output() CloseModal  = new EventEmitter<any>();    // emit from OnHidden()

show(arg?) { /* load/reset state */ this.modalConfirm?.show(); }   // parent calls .show()
click()    { /* validate → save → */ this.modalConfirm?.hide(); this.SaveSuccess.emit(data); }
OnHidden() { this.CloseModal.emit(); }              // bound to (onHidden); 141× named OnHidden, 14× onHidden
```

Parent host:
```html
<modal-xxx *ngIf="viewModal" #modalXxx (SaveSuccess)="onSaved($event)" (CloseModal)="viewModal=false">
</modal-xxx>
```
- **Lazy-mount with `*ngIf`** (e.g. `viewInvoicePicker`/`viewModal`): set flag `true`, then in `setTimeout`/next tick call `@ViewChild` child `.show()`. Destroys child state on close — cleaner than reusing.
- Parent gets the child instance via its own `@ViewChild('modalXxx')`.

## 4) Row select / checkbox lists (gotcha)

Pattern: one-way `[checked]` + a **single** `(click)="onRowClick($event,item)"` on the `<tr>` as the
sole source of truth. Display-only checkbox:

```html
<tr class="row-pointer" [class.row-checked]="item.checked" (click)="onRowClick($event,item)">
  <td class="text-center table-checkbox">
    <label class="custom-checkbox"><input type="checkbox" [checked]="item.checked" disabled /><span class="helping-el"></span></label>
  </td>
  <td class="col-file"><a [href]="url" target="_blank" (click)="$event.stopPropagation()">file</a></td>
```
```ts
onRowClick(e: MouseEvent, item) {
  if ((e.target as HTMLElement).closest('a')) return;  // let links work without toggling
  item.checked = !item.checked;
}
toggleAll(v: boolean){ this.filtered.forEach(x=>x.checked=v); }
get selectedCount(){ return this.filtered.filter(x=>x.checked).length; }
```

### ⚠️ The #2 modal bug — disabled checkbox swallows the click
`<input type="checkbox" disabled>` does **not** dispatch/bubble `click`, so clicking exactly on the box
never reaches the row handler → "sometimes toggles, sometimes not". Fix in component CSS:
```css
.table-checkbox .custom-checkbox { pointer-events: none; }  /* click passes through to <tr> */
```
(`custom-checkbox`/`helping-el` styles come from `src/assets/css/checkbox.css`.)

## 5) Module
Each modal has its own `modal-<name>.module.ts` (declares + exports the component, imports
`FormsModule`, `ModalModule`, `AngularDraggableModule`, `NgBusyModule`, daterangepicker, pipes).
Host feature module imports that modal module. See `deltasoft-stack` skill for the feature checklist.

## 6) Density
Compact: `btn-sm`, `input-sm/xs`, `table-condensed`, tight padding. See memory
`feedback_compact_ui_density` (28px inputs, 6px form-group margin).

## Hard rules recap
- Handle on header, `ngDraggable` on outer `.modal`. - `[config]="{backdrop:'static'}"` default.
- `#ref` name == `@ViewChild` name. - Emit `SaveSuccess` after `hide()`; `CloseModal` from `OnHidden`.
- Row click is single source of truth; make display-only checkboxes `pointer-events:none`.
