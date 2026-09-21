---
name: docx-catalog-doc
description: Build a .docx analysis file for a DeltaSoft "Danh mục" (catalog) section — the "Dữ liệu định danh" / "Dữ liệu (Thuộc tính) mở rộng" table pattern anh dùng trong tài liệu thiết kế — by reading the real FE model+modal and BE model+repository, then generating the file via Word COM automation (no pandoc/python-docx needed). Invoke whenever the task is "phân tích danh mục X thành file docx để chèn vào tài liệu", or any request to produce a Word file describing a catalog's fields for an external design document.
---

# DeltaSoft — Catalog Analysis → .docx

Recipe for turning "phân tích danh mục X, xuất docx để anh chèn vào tài liệu" into a Word file, built from a generic (topic-agnostic) PowerShell + Word COM pipeline in `scripts/`. First used for Danh mục Phương tiện (2026-08-10).

## Why this approach

- No `pandoc`, no `python-docx` on this machine — checked and confirmed absent.
- **MS Word COM automation is available** (`New-Object -ComObject Word.Application` works) — this is the mechanism.
- `.docx` needs real Word paragraph/table objects, not HTML-pasted-into-Word text, so the user can edit it natively (merge into their existing document, adjust column widths, etc).

## The two-file split (read this before touching the script)

**Never put Vietnamese text inside the `.ps1` file itself.** Windows PowerShell 5.1 reads a `.ps1` without a BOM using the system ANSI codepage; a stray non-ASCII character (even a single "—" em-dash in a comment) silently corrupts the parse and throws misleading cascading "missing terminator / missing closing }" errors far below the real culprit line. Hit this twice already — once building the first one-off script, once in `scripts/build-docx.ps1` itself (a "—" in a `Write-Warning` string). The fix is structural, not "be careful": keep `scripts/build-docx.ps1` **pure ASCII control logic**, and put all Vietnamese content in a separate `.json` data file read explicitly with `-Encoding UTF8`. Verify before running:

```powershell
grep -nP '[^\x00-\x7F]' path\to\script.ps1   # must print nothing (or use: Select-String -Pattern '[^\x00-\x7F]')
```

## Workflow

1. **Research the real fields first — do not invent columns.** For the catalog entity:
   - FE: model interface (`shared/models/**`), the add/edit modal `.html` (field labels, tabs, dropdowns) and `.ts` (what lists feed each dropdown, any `(change)` handlers that derive one field from another).
   - BE: `Models/Categories/<Entity>.cs` (the real column set + types), `Repositories/Categories/<Entity>Repository.cs` (confirms every SP param — this is the ground truth for what actually persists, catches fields that are in the FE model but never sent, or in the DB but not exposed in any modal yet).
   - Cross-module usage: `grep` the field name elsewhere in the repo (other modals, other repositories). This is what caught two real corrections on the vehicle catalog doc: (a) `VihicleTypeBotId` → confirmed wired into `TollStationRepository`/`TicketPricesRepository` (ETC toll pricing), not just a form dropdown; (b) a table row mislabeled "định mức dầu theo loại hình" was actually **"theo tải trọng"** — caught only by grepping `listOilQuota` usage across the FCL/CBT/Transport-Order modals and finding the literal code comment `// định mức dầu theo tải trọng của xe trên lệnh`. **Read the actual code before writing the row description; don't paraphrase from the field name.**
   - Note fields that exist in DB/API but have no UI yet (e.g. `Locked`, `IsSell` had a `SP_Vihicle_Sell` endpoint never called from FE) — call these out explicitly in a closing "Ghi chú" block rather than silently omitting or silently including them as if they were live features.

2. **Classify each field** into the two buckets (this is the recurring "2.x.1 / 2.x.2" structure anh wants):
   - **Dữ liệu định danh**: identifies/classifies what the record IS — set once, rarely changes, is a lookup key other modules join on (code, name, type/category FKs, owning branch).
   - **Dữ liệu (Thuộc tính) mở rộng**: operational values used in calculation, tracked over time, or feeding a workflow (quotas, prices, dates/deadlines, insurance, status flags, attachments, audit trail).
   If a field is ambiguous, decide by asking: "does another module look this up to identify the record, or does it consume this value in a calculation/reminder?" — first → định danh, second → mở rộng.

3. **Write the JSON data file** (see `scripts/example-vehicle-catalog.json` for a filled skeleton) using the block schema below. Save it to the scratchpad dir, not inside this skill folder (the skill folder only holds the reusable script + one example).

4. **Run the script**:
   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File ".claude\skills\docx-catalog-doc\scripts\build-docx.ps1" -JsonPath <path-to-data.json> -OutPath <path-to-output.docx>
   ```

5. **Verify Vietnamese survived the round-trip** — don't just trust "Saved: ..." — actually unzip and check:
   ```powershell
   Add-Type -AssemblyName System.IO.Compression.FileSystem
   $zip = [System.IO.Compression.ZipFile]::OpenRead($outPath)
   $entry = $zip.Entries | Where-Object { $_.FullName -eq "word/document.xml" }
   $reader = New-Object System.IO.StreamReader($entry.Open(), [System.Text.Encoding]::UTF8)
   $content = $reader.ReadToEnd(); $reader.Close(); $zip.Dispose()
   if ($content -match [regex]::Escape("<a known Vietnamese phrase from your data>")) { "OK" } else { "MISSING" }
   ```

6. **If `SaveAs` throws a COMException about the file being open** — the user very likely has the previous version open reviewing it. Do not fight it; save under a new filename (`-v2`, `-v3`, ...) and tell the user which one is current, same as done for the vehicle catalog doc.

## JSON block schema

`{ "blocks": [ ... ] }` — an ordered array, each item one of:

| type | fields | renders as |
|---|---|---|
| `heading` | `level` (2\|3\|4), `text` | Word "Heading N" style. Put the literal document numbering in `text` (e.g. `"2.2.1. Dữ liệu định danh"`) — this house style numbers headings by hand, not via Word's auto-numbering. |
| `paragraph` | `text`, optional `italic`, optional `bold` | Normal paragraph. |
| `bullets` | `items` (string array) | one `-  item` line per entry. |
| `table` | `columns` (string array), `rows` (array of string arrays), optional `widthsCm` (number array, must match column count) | bordered table, bold+shaded header row. Omit `widthsCm` to split the ~16cm body width evenly. |
| `pagebreak` | *(none)* | hard page break. |

Standard column sets used so far (match these unless the user asks for something else):
- **2.x.1 Dữ liệu định danh**: `["STT", "Trường dữ liệu", "Diễn giải / Ý nghĩa nghiệp vụ", "Bắt buộc"]`
- **2.x.2 Dữ liệu mở rộng**: `["STT", "Trường dữ liệu", "Diễn giải / Ý nghĩa nghiệp vụ", "Module / Quy trình sử dụng"]`

## Anti-patterns (don't)

- ❌ Writing Vietnamese text directly inside the `.ps1` — even one em-dash in a comment breaks the parse in a confusing way.
- ❌ Guessing a field's meaning from its name alone — the "loại hình" → "tải trọng" mislabel happened exactly this way; grep the actual usage.
- ❌ Silently dropping DB/API fields that have no current UI — surface them in a "Ghi chú" block so the user can decide if they're a gap or intentionally unused.
- ❌ Overwriting a `.docx` the user might have open — catch the SaveAs failure and use a new filename instead of retrying blindly.
- ❌ Reaching for `python`/`pandoc` first — neither is installed here; Word COM is the confirmed path.
