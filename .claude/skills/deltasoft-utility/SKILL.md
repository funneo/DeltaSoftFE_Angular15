---
name: deltasoft-utility
description: Catalog of UtilityService helpers, shared pipes, constants, and BaseService in the DeltaSoft FE (Angular 15). Invoke when reaching for "đã có helper nào để format tiền / parse ngày / đọc số bằng chữ chưa?" — avoids re-reading utility.service.ts (1132 lines), pipes folder, and constants. Pairs with `deltasoft-stack`.
---

# DeltaSoft Utility Reference

File: `src/app/shared/services/utility.service.ts` (~1132 lines). Inject as `_utilityService: UtilityService`.

All instance methods are public unless noted. Static methods called via `UtilityService.xxx()`.

## 1) Number → words (Vietnamese / English)

| Method | Returns | Use case |
|--------|---------|----------|
| `docso(n: number)` | `"hai trăm năm mươi nghìn"` (no đồng) | core VN integer-to-words; pair with `capitalizeFirstLetter` + `" đồng"` |
| `ReadNumber(n: number)` | `"Hai trăm năm mươi nghìn đồng"` (already capitalized + suffix) | one-shot VN money words — preferred for phiếu thu/chi |
| `capitalizeFirstLetter(s: string)` | First letter upper | wrap `docso()` output |
| `convertToWords(n: number)` | `"two hundred fifty USD"` | English (USD with optional cents) |
| `convertToRoman(n: number)` | `"IV"`, `"XII"` | Roman numerals |

**Bằng chữ idiom** (used in modal-vehicle-fuel-closing, phiếu chi/thu, debit note):
```ts
const amount = Math.round(Math.abs(net));
const words = this._utilityService.capitalizeFirstLetter(
  this._utilityService.docso(amount).trim()
) + ' đồng';
```

USD with cents (debit note pattern, ~line 844):
```ts
const intP = Math.floor(usd); const decP = Math.round((usd-intP)*100);
const w = capitalizeFirstLetter(docso(intP).trim()) + ' USD' + (decP>0 ? docso(decP)+' cents' : '');
```

Internal helpers `dochangchuc / docblock / dochangtrieu` — do NOT call directly.

## 2) Money / mask formatters

| Method | Notes |
|--------|-------|
| `VND(n, sign='', dec=2, ...)` | Returns formatted string; **strips `.00`**. Empty string if 0/null. Used in print templates. |
| `USD(n, sign='', dec=2, ...)` | Same as VND but keeps `.00`. |
| `MaskTienTe(n)` | Replace `.` → `.` (idempotent; legacy). |
| `UnMaskTienTe(s)` | Convert masked `"1,234.56"` → `1234.56` number. |

**ngx-mask presets (static)**:
- `UtilityService.mask0` = `"separator.0"` (integer)
- `UtilityService.maskNumber` = `"separator.2"` (2 decimals)
- `UtilityService.mask3Number` = `"separator.3"` (3 decimals — fuel/liter)
- `UtilityService.maskThapPhan` = `"."` (decimal separator)
- `UtilityService.maskConfig: Partial<IConfig>` — pass to `NgxMaskModule.forRoot(UtilityService.maskConfig)` in feature modules.

**Pipe alternative**: `| VND` (no decimals), `| VND:'':2` (2 decimals). Pipe at `src/app/shared/pipes/vnd.pipe.ts` — exported by `PipeSharedModule`. Other pipes: `status`, `finish-status`, `accept`, `file`, `list`.

## 3) Date pickers / range options

Constants on instance: `ngayBanDau` (00:00 today), `ngayKetThuc` (23:59 today).

| Method | Returns config for | Notes |
|--------|---------------------|-------|
| `dateTimeOptionDays(date, hasTime=false)` | single-date picker (`daterangepicker [options]`) | locale VN, 5-min step |
| `dateTimeOptionDaysUp(date, hasTime=false)` | same but `drops:'up'` | use near bottom of viewport |
| `dateOptionMultis(start, end)` | range picker with timePicker | preset ranges: Hôm nay/Hôm qua/7N/30N/Tháng HT/Tháng trước/Năm nay/Năm ngoái/Tất cả |
| `calendarOptionMultis(start, end)` | range picker for scheduling | future-leaning presets (Ngày mai/Tuần sau) |
| `datepickerOpts` (property) | old bootstrap-datepicker config | `format: dd/mm/yyyy`, lang `vi` |

**Idiom in list components**:
```ts
this.ngayBatDau = new Date(moment().startOf('month').toString());
this.ngayKetThuc = new Date(moment().endOf('month').toString());
this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
```

```html
<input type="text" class="form-control" daterangepicker
  [options]="dateOptions" (selected)="selectedDate($event)"
  [ngModel]="(ngayBatDau | date:'dd/MM/yyyy') + ' - ' + (ngayKetThuc | date:'dd/MM/yyyy')" />
```

## 4) Date helpers

| Method | Behavior |
|--------|----------|
| `toDate(obj)` | Accepts `D/M/YYYY` string or Excel serial number → `"DD/MM/YYYY"` string. Returns `"Invalid date"` on fail. |
| `toDateMonthYear(obj)` | Same but `M/YYYY` / `MM/YYYY` output. |
| `dateStringtoString(obj: string)` | Swap dd/MM ↔ MM/dd from positions 0-5 (legacy reformat). |
| `convertDateStringToYMD(s)` | `dd/MM/yyyy` → `yyyyMMdd` (for `loadData()` `set('fromDate', ...)`). |
| `formatDate(date)` | Plain `Date` → `"DD/MM/YYYY"`. |
| `formatAndSetDateTime(entity, field, optionField)` | Format `entity[field]` in-place + assign new `dateTimeOptionDays` config to `this[optionField]`. |
| `checkWorkingDaysExceeded(inputDate, n)` | true if elapsed working days (Mon-Sat) > n. |
| `validateDebitNoteDate(s)` | Allows current month if day ≤ 13; else only current month. |
| `validateNgayHachtoanVsDoanhthu(hach, doanh)` | hạch toán ≥ doanh thu (year/month). |

## 5) Number / string helpers

| Method | Use |
|--------|-----|
| `stringToNumber(obj, allowNull=false)` | safe `+obj`, returns 0 on NaN (or null if allowNull). |
| `stringIsNumber(obj)` | true if empty/numeric — quirky: empty string returns true. |
| `valueIsNull(obj)` | undefined/null check (NOT empty string). |
| `round2(n)` | round to 2 decimals; returns `undefined` if n is 0. |
| `roundNumber0(v)` | `Math.round(Number(v))`, 0 fallback. |
| `converTienTe(value, oldCur, newCur)` | toggles VND/Trieu (`'Dong'` vs `'Trieu'`). |

## 6) Static dropdown lists

Call as `UtilityService.xxx()` — all return `[{id, text}]`:

- `ListGioiTinh()` — Nam/Nữ
- `listKhoGiay()` / `listKhoGiayHienThi()` — paper sizes
- `ListLoaiMauPhieu()` — voucher template types
- `ListNam()` — years 2012..now+10
- `ListNamSinh()` — birth years (now-70..now)
- `ListThang()` / `ListMonthName()` — months
- `ListNgay()` — days 1..31
- `listTrangThaiDuyets()` — approval status labels (incl Locked/Entity/Completed/Paymented/Chitien/Thutien)
- `listLableTrangThaiDuyets()` — Bootstrap label CSS class per status id
- `listCurrencys()` — VND/USD/EUR/JPY/CNY/THB
- `listTypeTransportCategory()`, `listTypePayment()`, `listLanguages()`, `listQuotationSublist()`

## 7) LocalStorage params (key 'DELTACC' default)

- `UtilityService.setLocalParams(item, type='DELTACC')` — overwrite
- `UtilityService.getLocalParams(type='DELTACC')` — null-safe JSON.parse

## 8) Print template renderers

Token-replace `{Field}` in HTML print templates:

- `PrintPhieuThu(value, entity)` — phiếu thu/chi
- `printDebitNote(value, entity)` — debit note (loops `DebitChiTiets`, supports VND/USD, auto `{Bang_Chu}` from sumVND or sumUSD)
- `printPhieudau(value, entity)` — phiếu cấp dầu
- `ReplaceNgayThang(value)` — fills `{Hien_Tai_Ngay/Thang/Nam/Gio/Phut}`
- `GetVongLap(value, token)` — extracts repeating `<tr>` block around a token

Templates fetched from `localStorage` key `SystemContstants.LISTMAUIN`; pick by `type` (1=phiếu thu, 2=phiếu chi, etc.).

## 9) Format constants

`FormatContstants` (note typo) at `src/app/shared/constants/format.constants.ts`:

| Const | Value |
|-------|-------|
| `DATEUTC` | `YYYY-MM-DDTHH:mm:ss` |
| `DATEEN` | `MM/DD/YYYY` |
| `DATEVN` | `DD/MM/YYYY` |
| `DATETIMEEN` | `MM/DD/YYYY HH:mm:ss` |
| `DATETIMEVN` | `DD/MM/YYYY HH:mm:ss` |
| `CLIENTDATE` | `YYYYMMDD` (for HttpParams `fromDate/toDate`) |
| `CLIENTDATETIME` | `YYYYMMDDHHmmss` |

## 10) Message constants

`MessageContstants` at `src/app/shared/constants/message.constants.ts` — toast/confirm text. Common ones:

- `SYSTEM_ERROR_MSG`, `GETDATA_ERR_MSG`, `GETDATA_OK_MSG`, `EMPTY_VALUE`
- `CREATED_OK_MSG`, `UPDATED_OK_MSG`, `DELETED_OK_MSG`
- `CREATED_ERR_MSG`, `UPDATED_ERR_MSG`, `DELETE_ERR_MSG`
- `CONFIRM_DELETE_MSG`, `CONFIRM_ACCEPTING_MSG`, `CONFIRM_LOCKING_MSG`
- `LOGIN_AGAIN_MSG`, `FORBIDDEN`, `WARNING`, `NOALLOW`
- Domain-specific: `FUEL_CLOSING_OK_MSG`, `FUEL_CLOSING_REQUIED_ERROR` (typo preserved), `IGAS_GET_CODE`, `IGAS_TOKEN_EROR`, `CHANGE_DRIVER`, `CLOSE_JOB`, `APPROVE_LENHVC_FCL`, `APPROVED_SUCCESS`, `DENY_SUCCESS`

Always reuse — don't hand-type Vietnamese strings inline (typos and casing already locked across codebase).

## 11) BaseService

`src/app/shared/services/base.service.ts` — abstract. All entity services `extends BaseService`. Single helper `handleError(err)` returns `throwError(message)` parsed from `err.error.message` / `err.error.errors[]`.

Service constructor idiom:
```ts
constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
  super();
  this.token = jwtService.getToken();
}
```

Every endpoint:
```ts
return this.http.post(`${environment.apiUrl}/api/X/Y`, payload).pipe(
  map((r: any) => { if (r.code == '401') this.authService.logout(); else return r; }),
  catchError(this.handleError));
```

## 12) Anti-duplication

When tempted to write a helper, check this list first:

| Need | Use |
|------|-----|
| "format tiền VN" | `VND()` method or `| VND` pipe |
| "đọc số ra chữ" | `docso() + capitalizeFirstLetter() + ' đồng'` OR `ReadNumber()` |
| "parse ngày dd/MM/yyyy" | `moment(s, 'DD/MM/YYYY')` or `validateDebitNoteDate()` |
| "convert FE → BE date" | `moment(d).format('YYYYMMDD')` (== `FormatContstants.CLIENTDATE`) |
| "round" | `round2()` or `roundNumber0()` |
| "current month range" | `moment().startOf('month')..endOf('month')` + `dateOptionMultis()` |
| "toast 'thêm thành công'" | `MessageContstants.CREATED_OK_MSG` |
| "confirm 'xóa?'" | `confirm(MessageContstants.CONFIRM_DELETE_MSG)` |
