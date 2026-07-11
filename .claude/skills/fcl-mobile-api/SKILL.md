---
name: fcl-mobile-api
description: >
  Self-contained blueprint for building the NEW FCL dispatch order ("lệnh FCL mới") module
  on a separate mobile app against the DeltaSoft ERP API. Covers auth/JWT, the request/response
  envelope, the TO↔FCL data model, every FCL endpoint (CreateWithTO / UpdateWithTO /
  GetByRefNoWithTO / getPaging / getByDriver / ChangeStatus / GetStatusLog / driverUpdate), the full create
  recipe, fuel formula, ETC toll rules, status workflow + locking, extra segments, Vietmap
  routing, and the lookup endpoints needed to fill the form. Invoke when implementing or
  debugging FCL order create/edit/view/execute on mobile, or wiring the ERP API client.
  This is a CONTRACT doc — every field name, route, and rule here was verified against the
  ERP source (Angular 15 FE + ASP.NET Core .NET 9 BE). The mobile app does NOT need access
  to the ERP repo; everything required is in this file.
---

# FCL Dispatch Order — Mobile API Blueprint

> Goal: a mobile dev (or bot) reads this file and implements the "lệnh FCL mới" module
> end-to-end without touching the ERP source. Base API = the ERP API (`environment.apiUrl`,
> dev `https://localhost:44352`, prod = the company's API host). All routes below are relative
> to that base.

---

## 0. The "new FCL" in one paragraph

A 2026-05 refactor split the old monolithic FCL order into two linked records:
- **TransportOrder (TO)** = the *route* (segments, km, toll stations). Table `Tbl_TransportOrders`.
- **DispatchOrderFCL (FCL)** = the *operational* order (vehicle, driver, fuel, fees, shipping
  tasks, approval workflow). Table `DispatchOrderFCL`.
- They are linked **1-1** by `Tbl_TransportOrders.FclRefNo = DispatchOrderFCL.RefNo`
  (UNIQUE filtered index on the TO side).
- A **new** order is always created with BOTH at once, transactionally, via `CreateWithTO`.
  Never create them separately. `DispatchOrderFCL.IsLegacy = 0` marks new orders; `= 1` marks
  pre-refactor legacy ones (the mobile app should filter to / only handle **IsLegacy = 0**).

The mobile client talks ONLY to the FCL endpoints (`/api/DispatchOrderFcl/*WithTO`) plus a few
TransportOrder helper endpoints for extra segments and locations. The server owns the TO side.

---

## 1. Transport / serialization conventions (read first — applies to EVERY call)

1. **Everything is HTTP POST**, even reads. No GET, no query strings in the body sense — params
   go in the JSON body.
2. **Request body = `FromBodyBase<T>` envelope** (camelCase JSON):
   ```jsonc
   {
     "item":   { /* the actual entity T */ },
     "tokenKey": "<JWT>",      // REQUIRED on all mutating calls (server calls CheckTokenKey)
     "branchId": 1,             // optional filter override
     "employeeId": 123,
     "keyWord": "",             // search
     "fromDate": "20260601",    // string yyyyMMdd for list/report
     "toDate":   "20260630",
     "pageIndex": 1,
     "pageSize": 50,
     "id": "",                  // generic single id (string)
     "bValue": false,           // generic bool (used by updatestate = isDeny)
     "tValue": 0,               // generic int  (used by updatestate = typeDeny)
     "gType": "",               // generic string (report/export type)
     "year": null
   }
   ```
   Only `item` + `tokenKey` are needed for most create/update/get-by-id calls.
3. **Response body = `ResponseValue` envelope** (camelCase, `code` is a STRING):
   ```jsonc
   { "code": "200", "message": "OK", "data": { /* payload */ }, "listData": null }
   ```
   - `code` values: `"200"` OK · `"201"` created · `"204"` empty list · `"400"` bad input ·
     `"401"` token invalid → **force logout / re-login** · `"500"` server error (message has detail).
   - `data` holds the payload (object or array). `listData` is rarely used — ignore if null.
4. **Auth on every request**: send header `Authorization: Bearer <JWT>` (endpoints are
   `[Authorize]`). For **mutating** endpoints ALSO put the same JWT in `item`-envelope's
   `tokenKey` (a sliding server-side token check). Read endpoints still need the Bearer header;
   they also accept `tokenKey` and some require it.
5. **Strip nulls** before sending the create body (the ERP FE deletes null keys from `item`
   before `create`). Not strictly required but avoids overwriting with nulls on update.
6. **Route casing**: the controller route is case-insensitive in ASP.NET, but match what the ERP
   uses to be safe: `CreateWithTO`, `UpdateWithTO`, `GetByRefNoWithTO` (capitalised); the older
   ones are lowercase: `getPaging`, `getbyrefno`, `updatestate`, `driverUpdate`, `delete`,
   `getByDriver`.

---

## 2. Authentication

### 2.1 Login
`POST /api/account/login` — **no envelope, raw body**:
```jsonc
{ "userName": "user01", "passWord": "secret", "branchId": 1 }
```
Response:
```jsonc
{ "token": "<JWT>" }
```
- JWT is valid **24 hours**. Store it; attach as `Authorization: Bearer <token>` to every
  subsequent request and as `tokenKey` in mutating bodies.
- On `code == "401"` from any later call → token expired/invalid → re-login.

### 2.2 JWT claims (decode the token client-side)
The token payload carries (claim names):
`id` (userId GUID), `userName`, `fullName`, `email`, `avatar`, `branchId`, `branchName`,
`employeeId`, `roles` (array or `"Admin"` string), `permissions` (a **JSON-stringified array**
of permission codes — parse it), plus approval levels (`authorisationLevel`,
`transportConfirmLevel`, etc.).

### 2.3 Permissions (what gates each endpoint)
Permission strings look like `FUNCTIONID_ACTION`, e.g. `DISPATCHORDER_CREATE`. Check membership
in the parsed `permissions` array (Admin role bypasses everything). The codes used by FCL:

| Capability | Permission code needed |
|---|---|
| View / list FCL orders | `DISPATCHORDER_VIEW` |
| Create new FCL order | `DISPATCHORDER_CREATE` |
| Edit FCL order | `DISPATCHORDER_UPDATE` |
| Delete FCL order | `DISPATCHORDER_DELETE` |
| Export | `FCL_EXPORT` |
| Reports | `FCL_VIEW` |

`GetByRefNoWithTO`, `updatestate`, `driverUpdate`, `updateEtcFee` have **no** permission
attribute (any authenticated user with a valid `tokenKey` can call them) — handy for a
driver-facing mobile app.

---

## 3. Data model (the shapes you send/receive)

> These are the EXACT field names (camelCase in JSON). Types are the logical type.
> `?` = optional/nullable.

### 3.1 `DispatchOrderFcl` (the FCL header — the `item` for CreateWithTO/UpdateWithTO)
Only the fields relevant to **new** orders are listed. (The model also carries ~80 legacy
`chang*/luonghang*/cang*/nhamay*/...Luotdi/...Luotve` fields — **ignore all of them for new
orders**; they belong to the old modal and stay null/0.)

| Field | Type | Notes |
|---|---|---|
| `id` | number? | server-set |
| `refNo` | string? | server-generated on create; **identifies** the order on update/get |
| `branchId` | number | required |
| `shortWay` | boolean? | "cung đường ngắn" — affects which fuel-norm column is used |
| `isSubcontractors` | boolean | false = company vehicle (xe nhà); true = hired (xe thuê ngoài) |
| `vehicleId` | number? | from Vihicle lookup |
| `vehiclelLicensePlates` | string? | snapshot (note the double-l typo, keep it) |
| `vehicleType` | number? | vehicle type id |
| `moocId` / `moocLicensePlates` | number?/string? | trailer (rơ-moóc) |
| `driverId` / `driverName` / `driverTel` | number?/string?/string? | main driver |
| `secondDriverId` / `secondDriverName` / `secondDriverTel` | … | optional 2nd driver |
| `fuelDriverId` | number? | who is charged fuel (defaults to driver1) |
| `weight` / `volume` | number? | cargo totals |
| `contType` | string? | container type |
| `fullRoute` | string? | human route description |
| `oilPrice` | number | fuel unit price (đồng/lít); prefill from GasManagement (§9) |
| `oilCompensation` | number? | manual fuel adjustment (bù dầu), added to total |
| `reasonOilCompensation` | string? | **required if** `oilCompensation > 0` |
| `dispatchSummarize` | string? | per-segment notes joined (`Chặng 1: …\nChặng 2: …`) |
| `note` | string? | free note |
| `status` | number | workflow state, see §6. New = `0` |
| `isDeny` / `feedback` | boolean?/string? | rejection flag + reason |
| `startVehicleOdor` / `finishVehicleOdor` | number? | odometer start/finish (driver) |
| `startEupOdor` / `finishEupOdor` | number? | trailer odometer |
| `finished` / `noteFinished` / `finishedDate` | boolean?/string?/Date? | completion |
| `startedDate` | Date? | trip start |
| `isLegacy` | boolean? | **set 0 for new orders**; read on GetByRefNoWithTO to branch UI |
| `toRefNo` | string? | linked TO RefNo — **output only** (server-set) |
| `toId` | number? | linked TO id — **output only**; needed for extra-segment calls |
| `tongKm` | number? | total km (server-authoritative; FE shows preview) |
| `tongdau` | number? | total fuel liters (server-authoritative; FE preview) |
| `chiphidau` | number? | total fuel cost = tongdau × oilPrice (server-rounded) |
| **`segments`** | TransportOrderSegment[] | **the route** — see §3.2. Send on create/update |
| **`listEtc`** | DispatchOrderEtc[] | toll stations — see §3.4 |
| **`listFee`** | DispatchOrderFee[] | extra fees — see §3.5 |
| **`listDetailed`** | DispatchOrderFclDetail[] | attached shipping tasks — see §3.6 |
| `extraSegments` | TransportOrderExtraSegment[] | **output only** on get; managed separately (§7) |

### 3.2 `TransportOrderSegment` (one leg of the route)
| Field | Type | Notes |
|---|---|---|
| `id` | number? | server-set |
| `orderIndex` | number? | 0-based sequence of the leg in the route |
| `startLocationId` | number? | id of the start location |
| `startLocationType` | number? | **1 = CustomerLocation, 2 = Port** |
| `startLocationName` | string? | snapshot |
| `startLat` / `startLng` | number? | coordinates (drive the Vietmap call) |
| `endLocationId` / `endLocationType` / `endLocationName` / `endLat` / `endLng` | … | end point |
| `distanceKm` | number? | from Vietmap routing |
| `payloadWeight` | number? | **the chosen oil-quota tier id** (NOT raw kg — see §5) |
| `fuelNorm` | number? | liters/100km resolved from the oil quota tier |
| `fuelAmountCalculated` | number? | `fuelNorm × distanceKm / 100` (liters) |
| `etcCost` | number? | toll subtotal for the leg |
| `routePolyline` | string? | GeoJSON `[[lng,lat],…]` for map drawing |
| `listStations` | SegmentStation[] | toll stations on this leg (from Vietmap) — see §3.3 |
| `listWaypoints` | Waypoint[] | turn-by-turn steps |
| `note` | string? | per-leg note (rolled up into `dispatchSummarize`) |
| `isDefault` | boolean? | true if filled from a saved route default |

### 3.3 `SegmentStation` (toll station inside a segment)
| Field | Type | Notes |
|---|---|---|
| `vietmapId` | number? | toll station id from Vietmap |
| `stationName` | string? | display name |
| `price` | number? | price applied **for this order's vehicle type** |
| `allPrices` | string (JSON) | `{"1":216000,"2":309000,"3":412000,"4":659000,"5":849000}` — price per vehicle class 1-5 |
| `isAvoided` | boolean? | route avoids this station |

`Waypoint` = `{ id?, segmentId?, orderIndex?, lat, lng, name?, distanceM? }`.

### 3.4 `DispatchOrderEtc` (toll line on the FCL — `listEtc`)
| Field | Type | Notes |
|---|---|---|
| `id` | number? | |
| `refNo` | string? | FCL RefNo (server links) |
| `feeId` / `feeCode` / `feeName` | …? | fee category (optional) |
| `tollStationId` | number? | legacy id (optional) |
| **`tollStationName`** | string? | **the canonical field now** — name string, not FK |
| `cost` | number? | base toll amount (must be ≥ 1 if `tollStationName` is set — see §8) |
| `vat` | number? | |
| `totalCost` | number? | cost + vat |
| `note` | string? | |
| `isPassed` | boolean? | driver marks toll skipped/passed (editable post-create) |

> FE-only helper fields `_auto / _segIndex / _allPrices / _vietmapId` are used to recompute
> prices when the vehicle type changes; **do NOT send them to the server** (server ignores them,
> but keep your payload clean).

### 3.5 `DispatchOrderFee` (`listFee`)
`{ id?, refNo?, feeId?, feeCode?, feeName?, contentsId?, contents?, quantity?, cost?, vat?, totalCost?, note? }`

### 3.6 `DispatchOrderFclDetail` (`listDetailed` — attached shipping tasks)
`{ id?, refNo?, shippingTaskId, shippingTaskItem? }`
- On create you only need `shippingTaskId` per row.
- On `GetByRefNoWithTO` each row is hydrated with a full `shippingTaskItem` (customer, pickup/
  delivery, ports, container, dates) for display.

### 3.7 `TransportOrderExtraSegment` (cung đường phát sinh — §7)
Same geo fields as a segment, plus `seqNo`, **`note` (REQUIRED)**, and `stationsJson` /
`waypointsJson` (inline JSON instead of child rows). `listStations`/`listWaypoints` are FE-only
(deserialize from the JSON on load, serialize back on save).

---

## 4. FCL endpoints

Base path `/api/DispatchOrderFcl`. All POST. All wrapped in `FromBodyBase<DispatchOrderFcl>`
unless noted.

| Endpoint | Permission | Purpose | `data` returned |
|---|---|---|---|
| `CreateWithTO` | DISPATCHORDER_CREATE | Create FCL+TO atomically | `{ newToId, newToRefNo, newFclRefNo }` |
| `UpdateWithTO` | DISPATCHORDER_UPDATE | Update FCL+TO | int (rows affected) |
| `GetByRefNoWithTO` | none | Full detail (header+segments+etc+fee+tasks+extra+history) | `DispatchOrderFcl` (full) |
| `getPaging` | DISPATCHORDER_VIEW | List orders | `DispatchOrderFcl[]` |
| `getByDriver` | none | Orders for current/given driver (mobile driver view) | `DispatchOrderFcl[]` |
| `getPerformance` | none | Driver performance stats | `DispatchOrderFcl[]` |
| `GetByJobId` | DISPATCHORDER_VIEW | Orders by shipment JobId | `DispatchOrderFcl[]` |
| `updatestate` | none | Status transition / reject | echo item |
| `driverUpdate` | none | Driver: odometer + notes + listFee + listEtc.isPassed (batch, §4.7) | echo item |
| `updateEtcFee` | none | Update toll fees post-create | echo item |
| `delete` | DISPATCHORDER_DELETE | Delete order (by `item.refNo`) | echo item |
| `getExport` | FCL_EXPORT | Excel export rows | rows |
| `report03` | FCL_VIEW | Report | rows |

### 4.1 CreateWithTO
```jsonc
POST /api/DispatchOrderFcl/CreateWithTO
{
  "tokenKey": "<JWT>",
  "item": { /* DispatchOrderFcl with segments[], listEtc[], listFee[], listDetailed[], isLegacy:0, status:0 */ }
}
→ { "code":"200", "data": { "newToId": 1234, "newToRefNo": "TO-...", "newFclRefNo": "FCL-..." } }
```
Server: inserts the FCL header, the TO, all TO segments + segment stations + waypoints, the ETC
rows, fees, and shipping-task links — all in one transaction. Computes `tongKm / tongdau /
chiphidau` itself (see §5). Sets `IsLegacy = 0`.

### 4.2 UpdateWithTO — **important locking rules**
```jsonc
POST /api/DispatchOrderFcl/UpdateWithTO
{ "tokenKey":"<JWT>", "item": { "refNo":"FCL-...", /* changed fields */ } }
```
For **non-legacy** orders, after creation the server **locks the route & vehicle**. On update it
**restores from DB** and only accepts these fields:
`oilCompensation`, `reasonOilCompensation`, `dispatchSummarize`, `note`, `listFee`, and
`listDetailed` (**only while `status < 3`**). Any changes you send to segments / ETC / vehicle /
driver are **silently ignored**. To change the route after creation, use **extra segments** (§7).

### 4.3 GetByRefNoWithTO
```jsonc
POST /api/DispatchOrderFcl/GetByRefNoWithTO
{ "tokenKey":"<JWT>", "item": { "refNo":"FCL-..." } }
→ { "code":"200", "data": { ...header, "isLegacy":false, "toId":1234, "toRefNo":"TO-...",
      "segments":[...], "listEtc":[...], "listFee":[...],
      "listDetailed":[{ "shippingTaskId":1, "shippingTaskItem":{...} }],
      "extraSegments":[...] } }
```
Always check `data.isLegacy` first: if `true`, this order predates the refactor — show it
read-only / route the user to the legacy flow (mobile app generally only handles `isLegacy=false`).

### 4.4 getPaging (list)
```jsonc
POST /api/DispatchOrderFcl/getPaging
{ "tokenKey":"<JWT>", "branchId":1, "fromDate":"20260601", "toDate":"20260630",
  "keyWord":"", "item": { "branchId":1, "isLegacy":false } }
→ { "code":"200", "data": [ DispatchOrderFcl... ] }
```
`item.isLegacy`: `false`/omit → new orders; `true` → legacy. (FE sends the `isLegacy` query as
`'0'/'1'`.) Paginate client-side or via pageIndex/pageSize.

### 4.5 getByDriver (driver-facing list)
Same envelope as getPaging; returns orders assigned to the driver in range. Use for the mobile
driver's "my trips" screen.

### 4.6 ChangeStatus (workflow transition / reject) — **v2 orders (isLegacy=0), USE THIS**
```jsonc
POST /api/DispatchOrderFcl/ChangeStatus
{ "tokenKey":"<JWT>",
  "item": { "refNo":"FCL-...", "actionType": 1, "reason": null } }
```
- `actionType` (1..7 — table below). **Server derives the target status from actionType — do NOT send `status`.**
- `reason` is **REQUIRED** for reject actions (5/6/7); the SP rejects (RAISERROR → HTTP 400) if empty.
- Response: `{ code:"200", data:{ fromStatus, toStatus, isReject } }`. On any rule violation the SP RAISERRORs → the controller returns **code `"400"` with the raw message** (show it to the user).

| actionType | Name | From→To | Who (server-enforced) |
|---|---|---|---|
| 1 | Nhận lệnh | 1→2 | driver of the order (SP checks `@EmployeeId==DriverId`) |
| 2 | Hoàn thành lệnh | 2→3 | driver of the order (SP) |
| 3 | Duyệt B1 | 3→5 | `FCL_ACCEPT` (BE) |
| 4 | Chốt lệnh | 5→6 | `FCL_CLOSING` (BE) — SP auto-closes fuel |
| 5 | Từ chối nhận | 1→1 (IsDeny) | driver (SP) |
| 6 | Từ chối B1 | 3→2 | `FCL_ACCEPT` (BE) |
| 7 | Từ chối CHỐT | 5→3 | `FCL_CLOSING` (BE) |

- The SP **blocks `IsLegacy=1`** (RAISERROR). v2 (new) orders MUST use `ChangeStatus`, never `updatestate`.
- **Driver mobile app uses only actionType 1, 2, 5** (Nhận / Hoàn thành / Từ chối nhận). 3/4/6/7 are web (dispatcher/closer) roles.
- Completion km/fees are saved with `driverUpdate` (§4.7) BEFORE sending actionType 2.

**GetStatusLog** (timeline for the "Lịch sử lệnh" screen):
```jsonc
POST /api/DispatchOrderFcl/GetStatusLog
{ "tokenKey":"<JWT>", "item": { "refNo":"FCL-..." } }
```
→ rows `{ actionType, fromStatus, toStatus, isReject, reason, actionByName, createdDate }` (append-only, oldest→newest).

### 4.6-legacy updatestate — **ONLY for isLegacy=1 orders; do NOT use for v2**
```jsonc
POST /api/DispatchOrderFcl/updatestate
{ "tokenKey":"<JWT>",
  "item": { "refNo":"FCL-...", "status": 1, "feedback":"" },
  "bValue": false,   // isDeny: true when rejecting
  "tValue": 0 }      // typeDeny: rejection type code
```

### 4.7 driverUpdate (driver completion) — saves km/notes **+ listFee + listEtc.isPassed** (updated 2026-07-11)
Batch save (one call on "Lưu"/"Hoàn thành", **not** per-row). Send the whole item incl. the full `listFee` + `listEtc`.
```jsonc
POST /api/DispatchOrderFcl/driverUpdate
{ "tokenKey":"<JWT>",
  "item": { "refNo":"FCL-...", "startVehicleOdor":120350, "finishVehicleOdor":120612,
            "finished":true, "noteFinished":"Giao xong",
            "listFee":[ { "id":123, "feeId":45, "contents":"...", "cost":100000, "vat":8000, "totalCost":108000 } ],
            "listEtc":[ { "id":77, "isPassed":true /* + other etc fields as returned */ } ] } }
```
Each `listFee` row also carries a **document classification** `invoiceType` (2026-07-11):
- `invoiceType`: **0** = no invoice · **1** = receipt (phiếu thu; nothing extra, put receipt no. in `contents`) · **2** = has VAT invoice → **6 fields REQUIRED**: `invoiceNo`, `invoiceDate` (dd/MM/yyyy), `invoicePattern`, `taxNumber` (seller tax code), `web` (lookup site), `code` (lookup code). App must validate all 6 before sending; clear them when `invoiceType` changes to 0/1.
- These persist via the extended TVP `TypeDispatchOrderFCLFeeV2` (only `DriverUpdate` uses it; Create/UpdateWithTO keep the old type — dispatcher-created fees leave invoice fields null).

Server rules (SP `SP_DispatchOrderFCL_DriverUpdate`, applied **only when `isLegacy=0`**; legacy orders update just the 4 km/note cols):
- `listFee` → **MERGE by `id`**: existing `id` = update, new (no `id`/0) = insert, omitted-from-array = **delete**. Send the *entire* current fee list, preserving each row's `id`. `invoiceType` + 6 invoice fields saved per row.
- `listEtc` → only `isPassed` is updated **by `id`** (no add/remove of toll stations; other etc fields untouched server-side).
- `startedDate` / `finishedDate` (order start/finish time, ISO 8601) → `ISNULL(@x, col)`: only written when a value is sent. **App sets device time**: `startedDate=now` after tapping Nhận (ActionType 1), `finishedDate=now` in the driverUpdate before Hoàn thành (ActionType 2). `ChangeStatus` does NOT auto-set these; ERP web enters them manually.
- `startVehicleOdor`/`finishVehicleOdor` stored as **int** (decimals truncated).

---

## 5. Fuel calculation (must match the server)

Per segment (client preview, `calulateOilSegments`):
```
segment.fuelAmountCalculated = round( fuelNorm × distanceKm / 100 , 2 )   // liters
```
Order totals — **the server is authoritative** (computed in the SP on Create/Update; the mobile
client may show a preview using the same formula):
```
TongKm    = Σ segment.distanceKm   (+ Σ extraSegment.distanceKm)
Tongdau   = Σ segment.fuelAmountCalculated (+ Σ extra.fuelAmountCalculated) + oilCompensation
Chiphidau = round( Tongdau × oilPrice , 0 )            // VND, rounded to integer
```
- `fuelNorm` comes from the **vehicle's oil-quota tier** the user picks per segment
  (§5.1). `payloadWeight` on the segment stores the **chosen quota tier id**, and `fuelNorm` is
  that tier's `value` (or `shortWayValue` when `shortWay = true`).
- `oilPrice` is prefilled from the latest gas price (§9) but is editable per order.
- `oilCompensation` is a manual ± liters adjustment; if `> 0` you must supply
  `reasonOilCompensation`.

### 5.1 Oil-quota tiers (định mức dầu)
`POST /api/VehicleOilQuota/getpaging` (envelope; filter by the vehicle). Each tier:
`{ id, value (L/100km normal), shortWayValue (L/100km for short routes), ... }` plus a payload
weight tier. Pick the tier matching the cargo weight; set `segment.payloadWeight = tier.id` and
`segment.fuelNorm = shortWay ? tier.shortWayValue : tier.value`.

### 5.2 Generator fuel (dầu máy phát) — separate from định mức
Reefer/genset fuel, tracked **independently** of `tongdau` (route fuel). 6 fields on the FCL entity:

| field | type | meaning |
|---|---|---|
| `generatorRunningHours` | number? | genset run hours (user input) |
| `generatorTemperature` | number? | recorded °C (informational; not used in the formula) |
| `generatorFuelNorm` | number? | liters/hour (user input) |
| `generatorFuelAmount` | number? | **server-computed** = `round(hours × norm, 2)` liters |
| `generatorFuelCost` | number? | **server-computed** = `round(amount × oilPrice, 0)` VND |
| `generatorNote` | string? | optional note |

- **Saved via a dedicated endpoint, NOT in Create/Update** — `POST /api/DispatchOrderFcl/UpdateGenerator`
  with envelope `item` = the FCL carrying `refNo` + `generatorRunningHours/Temperature/FuelNorm/Note` +
  `oilPrice`. Server computes & returns `{ generatorFuelAmount, generatorFuelCost }`. **Requires the
  order to already have a `refNo`** (save the order first).
- **Read**: `GetByRefNoWithTO` returns the 6 fields (loaded server-side via a separate SP) for **both
  new and legacy** orders.
- `tongdau` stays = route fuel only (the closing process depends on this split — do NOT merge).
- **Order total fuel (display only, client-side sum):** `Tổng dầu lệnh = tongdau + generatorFuelAmount`.
  Not a stored column — compute it for display.

---

## 6. Status workflow & locking (v2 orders, isLegacy=0)

Order is **created at status 1** (no status 0 or 4 in v2). Transitions via **`ChangeStatus`** (§4.6).

| status | Meaning | Who acts | Action (actionType → next) |
|---|---|---|---|
| 1 | Đã giao lái xe | **driver** | Nhận lệnh (1 → 2) · Từ chối nhận (5 → 1, IsDeny) |
| 2 | Lái xe đã nhận | **driver** | nhập km/chi phí (`driverUpdate`) · Hoàn thành lệnh (2 → 3) |
| 3 | Chờ duyệt | dispatcher `FCL_ACCEPT` | Duyệt B1 (3 → 5) · Từ chối B1 (6 → 2) |
| 5 | Chờ chốt | closer `FCL_CLOSING` | Chốt (4 → 6) · Từ chối chốt (7 → 3) |
| 6 | Đã chốt (closed) | — | immutable |

Rejections go **back** a step (6: 3→2 to the driver; 7: 5→3 to the dispatcher) and are recorded in the status log with a mandatory reason.

Lock thresholds (mobile UI):
- **Once `refNo` exists**: route segments, vehicle, driver, ETC station list are locked. You can
  still edit fees, toll `isPassed`, notes, oilCompensation. Extend the route via an **extra segment** (§7).
- **Driver edits km/fees at status 2 only.** From **status ≥ 5** everything is locked.

Driver completion km/fields via `driverUpdate` (§4.7), then send `ChangeStatus` actionType 2 (Hoàn thành).

---

## 7. Extra segments (cung đường phát sinh — added AFTER creation)

These live on the **TransportOrder** controller and operate by `transportOrderId` (= the FCL's
`toId` returned by CreateWithTO / present in GetByRefNoWithTO).

| Endpoint | Body `item` highlights | Returns |
|---|---|---|
| `POST /api/TransportOrder/AddExtraSegment` | full geo + `payloadWeight`,`fuelNorm`, **`note` (required)**, `stationsJson`,`waypointsJson`, `transportOrderId` | `{ newExtraSegmentId, newSeqNo, totals:{tongKm,tongdau,chiphidau} }` |
| `POST /api/TransportOrder/UpdateExtraSegment` | `id` + changed fields | recomputed `totals` |
| `POST /api/TransportOrder/DeleteExtraSegment` | `id` | recomputed `totals` (seqNo renumbered) |

Rules:
- **`note` is mandatory** (server rejects empty) — it documents *why* the detour was added.
- Adding/updating/deleting an extra segment **recomputes the order totals** server-side; apply
  the returned `totals` to your displayed `tongKm/tongdau/chiphidau`.
- Stations & waypoints are stored inline as JSON (`stationsJson`/`waypointsJson`), not child rows.

---

## 8. ETC / toll rules

- On create, toll stations come from the Vietmap route (§10): for each `segment.listStations`
  entry, create a `listEtc` row with `tollStationName = stationName`, `cost = price` (the price
  for the order's vehicle class resolved from `allPrices`), `totalCost = cost + vat`,
  `isPassed = false`.
- **Vehicle-class price resolution**: Vietmap returns prices for classes 1-5. Map the vehicle's
  Vietmap class id with `{1132:1, 1133:2, 1134:3, 1135:4, 1136:5}` then pick
  `allPrices[classKey]`. When the vehicle type changes, recompute every auto station's `cost`.
- **Validation**: if a toll row has a non-empty `tollStationName`, its `cost` must be **≥ 1**
  (empty-name rows are ignored). Reject save otherwise.
- After `refNo` exists the station list is locked; the driver may still toggle `isPassed` and
  edit notes/fees (use `updateEtcFee`).

---

## 9. Oil price (prefill)
`POST /api/GasManagement/getOldValue` (envelope) → latest gas/oil unit price. Use it to prefill
`item.oilPrice` when creating a new order. The user can override.

---

## 10. Vietmap routing
`POST /api/VietmapApi/GetRouteAndToll` — **raw body, no envelope** (but keep the Bearer header):
```jsonc
{ "points": [ { "lat": 20.97, "lng": 106.78 }, { "lat": 21.02, "lng": 105.85 } ] }
```
Send ≥ 2 points (start, end; intermediate waypoints allowed). The response contains:
- the route geometry (distance, polyline) — use it for `segment.distanceKm` and
  `segment.routePolyline`; and
- a **`toll`** array, one entry per vehicle class:
  ```jsonc
  "toll": [ { "vehicle": 1, "data": { "tolls": [ { "id": 77, "name": "Trạm ...", "price": 216000 } ] } },
            { "vehicle": 2, "data": { "tolls": [ { "id": 77, "price": 309000 } ] } }, … ]
  ```
  Build each `SegmentStation` by keying on `tolls[].id`, taking `name` from any class and the
  per-class `price` into `allPrices = {"1":…,"2":…,…}`; then set `price` for the order's class.

> Vietmap params are **contract-locked to `vehicle=car`** on the ERP side (avoid/weighting/truck
> are ignored). For "avoid highways" the ERP uses Google Routes separately — out of scope here.
> If you need the exact route-geometry field names, inspect a live response from
> `GetRouteAndToll`; the toll structure above is verified from ERP consumption.

---

## 11. Lookups to fill the form (all POST, envelope unless noted)

| Need | Endpoint | Key response fields |
|---|---|---|
| Vehicles (xe) | `/api/Vihicle/getall` | `id`, `licensePlates`, `vehicleType`, payload, fuel info |
| Trailers (mooc) | `/api/Vihicle/getallmooc` | `id`, `licensePlates` |
| Drivers / employees | `/api/employee/getall` (or `/GetbyBranchId`) | `id`, `employeeFullName`, `tel` |
| Customers | `/api/customer/getall` | `id`, `code`, `name` |
| Customer locations (điểm KH, có lat/lng) | `/api/CustomerLocations/getAll` (or `/GetMultiCustomer`) | `id`, `name`, `address`, `latitude`, `longtitude` |
| Ports (cảng, có lat/lng) | `/api/Ports/getall` | `id`, `code`, `name`, `latitude`, `longtitude` |
| **Unified locations** (KH + cảng, normalized) | `/api/TransportOrder/GetAllLocations` | `{ id, locationType (1=KH,2=Cảng), address, latitude, longtitude }` — **use this to populate the route point picker** |
| Oil quota tiers | `/api/VehicleOilQuota/getpaging` | `id`, `value`, `shortWayValue` (see §5.1) |
| Latest oil price | `/api/GasManagement/getOldValue` | unit price |
| Fees (full catalog) | `/api/fee/getall` | `id`, `code`, `name` |
| **Driver cost fees (phụ lục tab Chi phí)** | `/api/fee/GetForDriver` | `id`, `feeCode`, `feeName`, `displayOrder` — **9 phí fix cứng** trong SP, đã sắp thứ tự. Dùng cho dropdown Chi phí lái xe khi §4.7 driverUpdate. No permission (token only). |
| Shipping tasks to attach | `/api/ShippingTask/getAllByOpMan` / `/getAllByCs` | task list to pick from (filter unassigned) |
| Segment history (reuse past route) | `/api/TransportOrder/GetSegmentHistory` | prior `distanceKm/routePolyline/listStations/fuelNorm` between two points |

> Note the spelling quirk: location/port longitude is `longtitude` (extra "t") in the API — map
> it carefully. `GetAllLocations` is the cleanest source for the route picker (already merges
> customer locations + ports with lat/lng + a `locationType` discriminator).

---

## 12. The CREATE recipe (step by step)

1. **Login** → store JWT; parse permissions; confirm `DISPATCHORDER_CREATE`.
2. **Pick shipping task(s)** to fulfil (from `getAllByOpMan`) → build `listDetailed` =
   `[{ shippingTaskId }]`. Their pickup/delivery points seed the location pool.
3. **General info**: choose `isSubcontractors` (xe nhà / thuê ngoài), `vehicleId` (+ plates,
   `vehicleType`, mooc), `driverId` (+name/tel), optional 2nd driver, `fuelDriverId`.
   Prefill `oilPrice` from `GasManagement/getOldValue`.
4. **Build the route** = ordered list of points (from `GetAllLocations` + the task pickups/
   deliveries). Consecutive points form segments: point[i] → point[i+1].
   - For each segment call `GetRouteAndToll` with its 2 endpoints → set `distanceKm`,
     `routePolyline`, `listWaypoints`, and `listStations` (with `allPrices`).
   - Optionally call `GetSegmentHistory` first to reuse a previously saved route between the
     same two points.
   - Pick a **payload weight tier** per segment → set `payloadWeight = tier.id`,
     `fuelNorm = shortWay ? tier.shortWayValue : tier.value`, then
     `fuelAmountCalculated = fuelNorm × distanceKm / 100`.
   - Resolve each station's `price` for the vehicle class and mirror into `listEtc`.
   - Route must have **≥ 2 segments** (start + end). Mark the last leg as final ("chặng cuối").
5. **Validate** (§8 and §13).
6. **Submit** `CreateWithTO` → store `newFclRefNo` / `newToId` (you need `toId` for extra segments).
7. **Reload** with `GetByRefNoWithTO` to render the saved, server-computed totals.

---

## 13. Validation checklist before CreateWithTO
- `oilPrice ≥ 1` (company vehicle, i.e. `!isSubcontractors`).
- `segments.length ≥ 2` for a new company order.
- Every segment has a `payloadWeight` and `fuelNorm > 0`.
- Every `listEtc` row with a non-empty `tollStationName` has `cost ≥ 1`.
- If `oilCompensation > 0` then `reasonOilCompensation` is non-empty.

---

## 14. Hard rules / gotchas (don't get burned)
- **Never** create FCL and TO separately for a new order — only `CreateWithTO`.
- **Never** modify the legacy lists/flows; handle only `isLegacy = false`.
- After creation, **route/vehicle/ETC are immutable** via UpdateWithTO — those edits are dropped
  silently. Use extra segments for route changes; `updateEtcFee` for toll edits.
- Field name typos are part of the contract — keep them: `vehiclelLicensePlates` (double-l),
  `longtitude` (locations/ports), `tongdau`/`chiphidau` (lowercase).
- `code` in responses is a **string** (`"200"`), not a number.
- Send the JWT in **both** the `Authorization` header and (for mutations) `tokenKey`.
- Segment location types: **1 = CustomerLocation, 2 = Port**. Get them right or the join breaks.
- ETC `tollStationName` (string) is the source of truth now — `tollStationId` is legacy/optional.

---

## 15. To verify against the live API (not 100% pinned from FE source)
These are used by the ERP but their exact request filters / response field names should be
confirmed by hitting the endpoint once (the routes themselves are correct):
- `GetRouteAndToll` route-geometry field names (distance unit, polyline encoding). Toll array is verified.
- `VehicleOilQuota/getpaging` filter params for a single vehicle, and the payload-weight field name.
- `ShippingTask/getAllByOpMan` vs `/getAllByCs` filter for "tasks not yet on an order".
- `employee/getall` vs `/GetbyBranchId` for the driver dropdown (both exist).
- `Vihicle/getall` exact fuel-related field names.

Everything in §1–§8, §10 (toll), §12–§14 is verified from the ERP source and safe to build against.
