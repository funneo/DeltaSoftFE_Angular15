---
name: deltasoft-detail-form
description: Build a create/edit/view form with a child detail (line-items) table for DeltaSoft ERP (Angular 15) — a header form plus a repeating rows table where the user adds/removes rows and per-row amounts auto-compute (qty × price), a header total getter, clone-on-open so Cancel doesn't mutate the source, view/edit gating by creator+status, and a save flow that emits SaveSuccess. Invoke when building a modal/form that has an editable detail grid (invoice line items, fee details, fuel-closing rows, dispatch additional fees), wiring add-row/remove-row, auto-calculating line/total amounts, or deciding TVP `detaileds` vs JSON `lineItemsJson` storage. Pairs with deltasoft-modals (the shell) and deltasoft-stack §4/§7 (the TVP repo+SP side).

---

# DeltaSoft — Detail / Line-Items Form

A header form with a repeating child table: add/remove rows, auto-compute amounts, sum a total, save the lot. Canonical FE example: `modal-pending-invoice-detail`. This skill is the **form mechanics**; the modal shell is deltasoft-modals, and the TVP/SP persistence is deltasoft-stack §4 & §7.

## Two storage shapes — pick one

| Shape | When | Persistence |
|---|---|---|
| **TVP `entity.detaileds[]`** | Detail rows are first-class (queried, reported, FK'd) | Sent as `AsTableValuedParameter("TypeXDetail")`; SP `INSERT ... SELECT FROM @Detaileds`. See deltasoft-stack §4. |
| **JSON `entity.lineItemsJson`** | Rows are a snapshot/blob (display, light edit) | `JSON.stringify(rows)` into one NVARCHAR(MAX) column; parse on read. Used by PendingInvoice. |

The **FE editing mechanics below are identical** for both — only `save()`/`show()` (serialize) and the model field differ.

## State + open (clone to protect the source)

```ts
export class ModalXComponent {
  @ViewChild('modalX', { static: false }) modal: ModalDirective;
  @Output() SaveSuccess = new EventEmitter<any>();
  @Output() CloseModal  = new EventEmitter<any>();

  entity: X = {};
  rows: XLine[] = [];            // detaileds OR lineItems
  editing = false;               // view ↔ edit toggle (for view-then-edit screens)
  saving  = false;               // guards double-submit (a.k.a. flagSave)
  canEdit = false;

  show(item: X) {
    this.entity = JSON.parse(JSON.stringify(item || {}));   // deep clone — Cancel must not mutate the list row
    this.rows = this.parseRows(this.entity);                // detaileds || parse(lineItemsJson)
    this.editing = false; this.saving = false;
    this.canEdit = this.computeCanEdit(item);
    this.modal.show();
  }
}
```
**Clone on open.** The list passes a live row object; editing it directly would change the table behind the modal even if the user cancels. Deep-clone, edit the clone, only the list reloads on save.

## Add / remove rows + auto-compute

```ts
addRow()        { this.rows.push({ description: '', quantity: null, unit: '', unitPrice: null, amount: null }); }
removeRow(i)    { this.rows.splice(i, 1); }

/** thành tiền = SL × đơn giá, only when both are real numbers. */
recalcLine(it: XLine) {
  const q = Number(it.quantity), p = Number(it.unitPrice);
  if (!isNaN(q) && !isNaN(p)) it.amount = q * p;
}
get totalAmount() { return this.rows.reduce((s, i) => s + (Number(i.amount) || 0), 0); }
```
```html
<tr *ngFor="let it of rows; let i = index">
  <td><input class="form-control" [(ngModel)]="it.description" [readonly]="!editing" name="desc{{i}}"></td>
  <td><input class="form-control text-right" [(ngModel)]="it.quantity"  (input)="recalcLine(it)" [readonly]="!editing" name="qty{{i}}"></td>
  <td><input class="form-control text-right" [(ngModel)]="it.unitPrice" (input)="recalcLine(it)" [readonly]="!editing" name="price{{i}}"></td>
  <td class="text-right">{{ it.amount | number:'1.0-0' }}</td>
  <td *ngIf="editing"><button class="btn btn-danger btn-xs" (click)="removeRow(i)"><i class="fa fa-trash"></i></button></td>
</tr>
<tr><td colspan="2"><b>Tổng</b></td><td class="text-right"><b>{{ totalAmount | number:'1.0-0' }}</b></td><td></td></tr>
```
- `(input)="recalcLine(it)"` keeps the line amount live as the user types.
- Total is a **getter**, never a stored field you update by hand — it can't drift.
- `name="qty{{i}}"` keeps each input uniquely named for template-driven validation.
- For money use the number pipe / `UtilityService` formatting (deltasoft-utility); for "đọc số bằng chữ" use the utility helper, don't reinvent.

## View ↔ edit gating (creator + status)

Many screens open read-only and only let the **creator (or admin)** edit while the record is still pending:
```ts
private computeCanEdit(item: X): boolean {
  if (!item || item.status !== 0 || item.usedByPaymentId) return false;   // business lock
  const user = this.authService.getLoggedInUser();
  if (!user) return false;
  if (user.isAdmin) return true;
  return !!item.createdBy && item.createdBy.toLowerCase() === (user.id || '').toLowerCase();
}
startEdit()  { if (this.canEdit) this.editing = true; }
cancelEdit() { this.rows = this.parseRows(this.entity); this.editing = false; }   // reparse from the clone = discard edits
```
`cancelEdit()` discards by re-reading from `entity` (still the un-mutated clone) — no second snapshot needed. The BE must re-check the same permission; FE gating is UX only (see the `403` branch below).

## Save flow

```ts
save() {
  if (this.saving) return;                       // double-submit guard
  this.saving = true;
  // TVP shape: this.entity.detaileds = this.rows;
  // JSON shape:
  this.entity.lineItemsJson = JSON.stringify(this.rows || []);
  this.service.update(this.entity).subscribe(res => {
    this.saving = false;
    if (res?.code == '200' || res?.code == '201') {
      this.notificationService.printSuccessMessage('Đã lưu.');
      const row = res.data?.row;                 // BE returns the fresh row → refresh local state
      if (row) { this.entity = row; this.rows = this.parseRows(row); }
      this.editing = false;
      this.SaveSuccess.emit(res.data);           // parent reloads its list
    } else if (res?.code == '403') {
      this.notificationService.printErrorMessage(res.message || 'Không có quyền sửa.');
    } else {
      this.notificationService.printErrorMessage('Lưu thất bại: ' + (res?.message ?? ''));
    }
  }, err => { this.saving = false; this.notificationService.printErrorMessage('Lưu lỗi: ' + (err?.message ?? err)); });
}
close() { this.modal.hide(); this.CloseModal.emit(); }
```
For a create/edit form driven by an `NgForm`, gate on `form.valid` too (deltasoft-stack §7): `if (!form.valid || this.saving) return;` and branch `flagNew ? add : update`.

## Validation

- Required header fields: template-driven `required` + `if (!form.valid) return` before save (toast the user — don't fail silently; that was a real bug in modal-dispatchorder).
- Reject empty/zero detail rows before serializing when the SP needs ≥1 row.
- Numbers: coerce with `Number(...)` and guard `isNaN` (inputs arrive as strings); the schema columns are `DECIMAL`.

## Contract with parent + module

Same as any modal (deltasoft-modals): lazy `*ngIf` mount, `setTimeout(() => modal.show()/showItem(), 50)`, `(SaveSuccess)` → parent `loadData()`, `(CloseModal)` → unmount. Module imports the modal set + `FormsModule` + `NgxMaskModule.forRoot(UtilityService.maskConfig)` if masking money, + `PipeSharedModule` for the number pipe.

## Checklist

- [ ] deep-clone `entity` in `show()` so Cancel can't mutate the list row
- [ ] `rows` parsed from `detaileds` or `lineItemsJson`
- [ ] `addRow()/removeRow(i)` + `recalcLine()` on `(input)` + `totalAmount` getter (not stored)
- [ ] view↔edit: `canEdit` (creator/admin + status lock); `cancelEdit()` reparses from clone
- [ ] `save()`: `saving` guard, serialize rows, refresh from returned row, emit `SaveSuccess`, handle `403`/else
- [ ] header `form.valid` gate + numeric coercion; toast on invalid
- [ ] lazy mount + `setTimeout` + `SaveSuccess→loadData` + `CloseModal→unmount`

## Anti-patterns

- ❌ Editing the row object the list passed in (no clone) → table changes even on Cancel.
- ❌ A stored `total` field updated in handlers → drifts out of sync; use a getter.
- ❌ Recomputing the line amount only on save → the user can't see the running figure.
- ❌ Trusting FE `canEdit` for security → BE must re-check; handle the `403` it returns.
- ❌ Silent `return` when the form is invalid → tell the user what's missing.
- ❌ Sending `quantity`/`unitPrice` as strings → `Number()`-coerce; DB columns are decimal.
