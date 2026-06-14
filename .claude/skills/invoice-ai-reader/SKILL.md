---
name: invoice-ai-reader
description: Self-contained blueprint for the "Đọc hóa đơn AI" feature — upload an image/PDF/ZIP/RAR of Vietnamese invoices, Gemini (Google AI Studio REST) extracts each invoice to structured JSON, with token tracking, multi-invoice-per-file splitting, selective retry without re-upload, duplicate detection, and abandoned-temp cleanup. Invoke when building or porting AI invoice/document extraction (modal upload + Gemini engine + save), or debugging Gemini calls, ZIP handling, token usage, or the retry/discard temp-folder lifecycle. EXCLUDES the PendingInvoice list/2-tab/grouping and Payment picker — this is only the read→save engine.
---

# Invoice AI Reader — full blueprint (read → extract → save)

Drop-in design for: user opens a modal → (picks a category) → uploads **one image/PDF or a ZIP/RAR of many invoices** → Gemini reads every invoice in every file → results render with per-row checkboxes, token usage, and duplicate warnings → user (or auto-mode) saves the picked rows into a staging table, moving the temp files to permanent storage + S3.

Stack here: **Angular 15 + ASP.NET Core .NET 9 + Dapper + SQL Server**, Gemini via **Google AI Studio REST** (`generativelanguage.googleapis.com`) — API key only, no Vertex/GCP SDK.

> Scope: this covers the **AI reading engine + upload modal + save (createBatch)**. It deliberately does NOT cover the PendingInvoice *list* (2-tab "Chờ TT/Bị từ chối", grouping by fee), nor the Payment picker — those are separate. The staging table + `GroupFeeCode` here are the project-specific destination; the **Adaptation checklist** at the end shows what to strip when porting.

## Data flow (the whole loop)

```
Modal upload (1 file: img/PDF/ZIP/RAR)
        │  POST /api/geminiAI/extract-invoices  (multipart, field "file")
        ▼
ExtractInvoicesFromUpload(file)
   • uploadId = Guid("N");  mkdir UploadFiles/InvoiceTemp/<uploadId>/
   • IsArchive? (magic bytes PK / Rar!)
        ├─ no  → save the single file, ExtractInvoicesCore(bytes) → may yield N invoices
        └─ yes → SharpCompress unzip → keep .pdf/.jpg/.jpeg/.png/.webp (≤30 files, ≤100MB)
                  save each "000__name.ext", Gemini in parallel (SemaphoreSlim=5), flatten
   • every result.TempFileName = saved name (key for retry / save)
        ▼
AnnotateDuplicatesAsync(results)   ← controller, after extract AND after retry
   • build InvoiceKey[] (RowKey=index, InvoiceNo/Date/TaxNumber/Pattern)
   • SP_PendingInvoice_CheckDuplicateBatch → mark IsDuplicate + Duplicates[]
        ▼
return { uploadId, results[] }   →   FE renders, default-checks OK rows
        │
        ├─ retry chosen rows:  POST extract-invoices-retry { uploadId, tempFileNames[] }
        │     re-reads ONLY those files from disk (no re-upload). 410 if folder gone.
        ├─ close without save:  POST extract-invoices-discard { uploadId }  → rmdir temp
        └─ save:  POST /api/pendingInvoice/createBatch { uploadId, items[], <category> }
              per item: move temp→UploadFiles/Invoice/yyyy/MM/<rand30>.ext,
                        upload S3 (Invoices/yyyy/MM/...), re-check dup (BE = source of truth),
                        INSERT staging row.  Then rmdir temp.
                        S3 failure does NOT block the DB insert.
Background: InvoiceTempCleanupService rmdir any InvoiceTemp/* older than 24h, every 6h.
```

---

## BACKEND

### 1) Config — `appsettings.json`
```json
"GoogleServices": {
  "Gemini": { "ModelId": "gemini-2.5-flash-lite" }
}
```
The **API key lives in `appsettings.Development.json`** (gitignored) under `GoogleServices:Gemini:ApiKey`. Never commit it. Code falls back to model `gemini-2.5-flash` if `ModelId` missing.

### 2) DI — `Program.cs`
```csharp
builder.Services.AddHttpClient();                                   // for the Gemini REST call
builder.Services.AddHostedService<API.Services.InvoiceTempCleanupService>();
```
`IGeminiAIRepository`→`GeminiAIRepository` is auto-registered by Scrutor (interface+impl naming). NuGet: **SharpCompress** (ZIP/RAR), **Newtonsoft.Json**.

### 3) Models — `Models/.../DocumentAIModels.cs` (copy verbatim)
```csharp
public class InvoiceExtractionResult
{
    public string VendorName { get; set; }
    public string VendorTaxId { get; set; }
    public string VendorAddress { get; set; }
    public string VendorPhone { get; set; }
    public string CustomerName { get; set; }
    public string CustomerTaxId { get; set; }
    public string CustomerAddress { get; set; }
    public string InvoiceId { get; set; }
    public string InvoiceSymbol { get; set; }
    public string InvoiceDate { get; set; }
    public string PaymentMethod { get; set; }
    public decimal? TotalAmount { get; set; }
    public string Currency { get; set; }
    public decimal? NetAmount { get; set; }
    public decimal? TaxAmount { get; set; }
    public string? WebLink { get; set; }
    public string? WebCode { get; set; }
    public List<InvoiceItem> LineItems { get; set; } = new();
    public string RawJson { get; set; }
    public string FileName { get; set; }      // original name (esp. inside an archive); "name [2/5]" when a file holds many
    public string Error { get; set; }         // null = OK; set = this file failed
    public string TempFileName { get; set; }  // file saved under InvoiceTemp/<uploadId>/ — the retry/save key
    public int? PromptTokens { get; set; }
    public int? CompletionTokens { get; set; }
    public int? TotalTokens { get; set; }     // usage only on the FIRST element of a multi-invoice call (no double count)
    public bool IsDuplicate { get; set; }
    public List<InvoiceDuplicateRef> Duplicates { get; set; } = new();
}
public class InvoiceDuplicateRef { public int PaymentId; public string PaymentRefNo; public string PaymentRefDate; public int? PaymentStatus; }  // (use { get; set; } props in real code)
public class InvoiceItem { public string Description; public decimal? Quantity; public string Unit; public decimal? UnitPrice; public decimal? Amount; }
public class ExtractInvoicesResponse { public string UploadId { get; set; } public List<InvoiceExtractionResult> Results { get; set; } = new(); }
public class RetryInvoicesRequest { public string UploadId { get; set; } public List<string> TempFileNames { get; set; } = new(); }
```

### 4) Interface — `Interfaces/.../IGeminiAIRepository.cs`
```csharp
public interface IGeminiAIRepository
{
    Task<InvoiceExtractionResult> ExtractInvoiceData(IFormFile file);                 // legacy single-file → 1 invoice
    Task<ExtractInvoicesResponse> ExtractInvoicesFromUpload(IFormFile file);          // single OR ZIP/RAR; saves temp; returns uploadId+results
    Task<List<InvoiceExtractionResult>> RetryInvoicesFromTemp(string uploadId, List<string> tempFileNames); // null = expired
    bool DiscardUpload(string uploadId);
    Task<InvoiceExtractionResult> ExtractInvoiceFromBytes(byte[] bytes, string fileName); // re-read a stored file (1 invoice)
}
```

### 5) Repository — the heart, `Repositories/.../GeminiAIRepository.cs`

Constants & helpers:
```csharp
private const int MaxFilesPerArchive = 30;
private const long MaxTotalUncompressedBytes = 100L * 1024 * 1024; // 100 MB
private const int MaxParallel = 5;
private static readonly string[] AllowedExtensions = { ".pdf", ".jpg", ".jpeg", ".png", ".webp" };

ctor: _modelId = config["GoogleServices:Gemini:ModelId"] ?? "gemini-2.5-flash";
      _apiKey  = config["GoogleServices:Gemini:ApiKey"];
```

**The Gemini call (`ExtractInvoicesCore`)** — the single most important piece. One file (PDF/image) may hold MANY invoices, each spanning MANY pages; the prompt forces a JSON **array**:
```csharp
string prompt = @"Bạn là một chuyên gia OCR hóa đơn thông minh.
Tệp này CÓ THỂ chứa MỘT HOẶC NHIỀU hóa đơn; mỗi hóa đơn có thể trải trên NHIỀU trang. Hãy tự nhận diện ranh giới và TÁCH thành từng hóa đơn riêng biệt.
Nhiệm vụ: Trích xuất thông tin của TỪNG hóa đơn tiếng Việt vào cấu trúc JSON bên dưới.
Yêu cầu quan trọng:
1. Trả về DUY NHẤT một MẢNG JSON (bắt đầu bằng [ kết thúc bằng ]), mỗi phần tử là 1 hóa đơn. Nếu chỉ có 1 hóa đơn, mảng vẫn có đúng 1 phần tử. KHÔNG kèm giải thích hay markdown.
2. KHÔNG gộp nhiều hóa đơn thành một; KHÔNG bịa thêm hóa đơn không tồn tại; gộp đúng các trang của cùng một hóa đơn.
3. Định dạng ngày tháng: dd/MM/yyyy.
4. Các số tiền: decimal (ví dụ: 1560000.50).
5. Nếu thông tin không có, trả về null hoặc chuỗi rỗng.
6. Kiểm tra kỹ tên Nhà cung cấp (vendor) và Khách hàng (customer).
7. Kiểm tra kỹ Website tra cứu (website) và mã tra cứu (code).
Cấu trúc MỖI phần tử trong mảng:
{ ""vendorName"":""string"", ""vendorTaxId"":""string"", ""vendorAddress"":""string"", ""vendorPhone"":""string"",
  ""customerName"":""string"", ""customerTaxId"":""string"", ""customerAddress"":""string"",
  ""invoiceId"":""string"", ""invoiceSymbol"":""string"", ""invoiceDate"":""string (dd/MM/yyyy)"", ""paymentMethod"":""string"",
  ""totalAmount"":0.0, ""taxAmount"":0.0, ""netAmount"":0.0, ""currency"":""VND"", ""weblink"":""string"", ""webcode"":""string"",
  ""lineItems"":[ { ""description"":""string"", ""quantity"":0.0, ""unit"":""string"", ""unitPrice"":0.0, ""amount"":0.0 } ] }";

var requestBody = new {
    contents = new[] { new { role = "user", parts = new object[] {
        new { text = prompt },
        new { inline_data = new { mime_type = mimeType, data = Convert.ToBase64String(byteData) } }
    } } },
    generationConfig = new {
        responseMimeType = "application/json",
        temperature = 0,
        maxOutputTokens = 65536,                 // big, else many-invoice JSON gets truncated → MAX_TOKENS
        mediaResolution = "MEDIA_RESOLUTION_LOW", // ~74% fewer image tokens; bump to MEDIUM only if dense photos misread
        thinkingConfig = new { thinkingBudget = 0 } // turn OFF 2.5 "thinking" → cheaper/faster
    }
};
var url  = $"https://generativelanguage.googleapis.com/v1beta/models/{_modelId}:generateContent?key={_apiKey}";
var resp = await CallGeminiWithRetryAsync(url, JsonConvert.SerializeObject(requestBody));

var jo = JObject.Parse(resp);
var text         = (string)jo.SelectToken("candidates[0].content.parts[0].text");
var finishReason = (string)jo.SelectToken("candidates[0].finishReason");        // "MAX_TOKENS" → tell user to split file
var promptTokens     = (int?)jo.SelectToken("usageMetadata.promptTokenCount");
var completionTokens = (int?)jo.SelectToken("usageMetadata.candidatesTokenCount");
var totalTokens      = (int?)jo.SelectToken("usageMetadata.totalTokenCount");
// blockReason: jo.SelectToken("promptFeedback.blockReason") when text empty
var list = ParseInvoiceArray(text);   // tolerant: array [...] preferred; lone {...} wrapped into 1-element list
// FileName = list.Count>1 ? $"{fileName} [{i+1}/{list.Count}]" : fileName;  usage on list[0] only
```

**Transient retry (`CallGeminiWithRetryAsync`)** — 3 attempts, 1.5s→3s backoff, `HttpClient.Timeout=60s`. Retries on `429/500/502/503/504`, network/timeout, AND `400` whose body contains `API_KEY_INVALID`/`API key expired` (fresh key still propagating). Non-transient 400 throws immediately.

**Upload orchestration (`ExtractInvoicesFromUpload`)**:
- `IsArchive(bytes)`: magic bytes `0x50 0x4B`=ZIP, `Rar!`=RAR.
- Not archive → save single file (`SanitizeFileName`), one `ExtractInvoicesCore`, stamp `TempFileName`.
- Archive → `ExtractArchiveEntries` (SharpCompress `ArchiveFactory.Open`): skip dirs, keep allowed exts, stop at 30 files, throw if uncompressed total >100MB, friendly message if password/encrypted. Save each as `"{i:D3}__"+name`. Gemini in parallel under `SemaphoreSlim(5)`, each entry try/catch → its own error result, flatten preserving order.

**Retry (`RetryInvoicesFromTemp`)**: `Directory.Exists` check → **return null if missing (controller → 410)**. Dedup+sanitize names, re-read each from disk, strip `000__` prefix for display, re-extract, parallel under semaphore.

**Temp helpers**: base = `UploadFiles/InvoiceTemp/`; `GetTempDir` keeps only alphanumerics of the guid; `SanitizeFileName` strips path + invalid chars + caps 150 chars (Windows 260 limit); `TryDeleteDir` swallows errors.

### 6) Controller — `Controllers/.../GeminiAIController.cs`
`[ApiController][Authorize]`, route `api/[controller]`, inject `IGeminiAIRepository` + `IPendingInvoice` (for dup check).

| Method | Route | Body | Returns |
|---|---|---|---|
| `ExtractInvoice` | `extract-invoice` | `IFormFile file` | 1 result (legacy) |
| `ExtractInvoices` | `extract-invoices` | `IFormFile file` | `{uploadId, results[]}` then `AnnotateDuplicatesAsync` |
| `ExtractInvoicesRetry` | `extract-invoices-retry` | `RetryInvoicesRequest` | results[]; **410** if `RetryInvoicesFromTemp` returns null |
| `ExtractInvoicesDiscard` | `extract-invoices-discard` | `RetryInvoicesRequest` | `{discarded}` |

`AnnotateDuplicatesAsync(results)` (runs after extract AND retry): collect `InvoiceKey{ RowKey=i, InvoiceNo, InvoiceDate, TaxNumber, InvoicePattern }` for non-error rows that have at least an InvoiceId or TaxNumber → `_pendingInvoice.CheckDuplicateBatch(keys)` → group by `RowKey` → set `IsDuplicate=true` + `Duplicates[]` (PaymentRefDate as `yyyy-MM-dd`). Multipart endpoints take `IFormFile` directly (NOT `FromBodyBase`).

### 7) Save — `pendingInvoice/createBatch` (the read→DB bridge)
Project-specific but essential. Per request `{ uploadId, items[], <category fields> }`:
1. `CheckTokenKey`; resolve `tempBase = UploadFiles/InvoiceTemp/<cleanGuid>`; **410** if gone.
2. `permBase = UploadFiles/Invoice/<yyyy>/<MM>/`, `mkdir`.
3. **BE re-checks duplicates** over all items (source of truth — FE cannot bypass) → set `IsDuplicate/DuplicatesJson` per row.
4. Per item: validate `TempFileName` + src exists → `File.Copy(src, perm/<rand30>.ext)` → `PathFileLocal = "~/UploadFiles/Invoice/yyyy/MM/<name>"` → **try** S3 upload `Invoices/yyyy/MM/<name>` (failure recorded in `errors[]`, does NOT block insert) → set audit/category fields → `_context.Create(it)`.
5. `rmdir` temp. Return `{ createdIds, savedCount, errors }`.

`ReExtract` (one stored row, status must be 0): map `PathFileLocal` `~/…`→absolute, `ExtractInvoiceFromBytes`, overwrite fields, re-check dup by NEW key, `SP_Update` (tokens accumulate in the SP since a re-read genuinely costs more).

### 8) Background cleanup — `Services/InvoiceTempCleanupService.cs`
`BackgroundService`: wait 1 min after start, then loop every **6h**, delete any `InvoiceTemp/*` dir with `LastWriteTime` older than **24h**. Covers tabs closed / crashes that never fired discard.

---

## FRONTEND (Angular 15)

### 1) Service — `shared/services/gemini-ai.service.ts`
Mirror `InvoiceExtractionResult`/`InvoiceItem`/`InvoiceDuplicateRef`/`ExtractInvoicesResponse` interfaces (camelCase). Methods (all `catchError(this.handleError)`):
```ts
extractInvoices(file): POST /api/geminiAI/extract-invoices  (FormData "file")  → {uploadId, results}
retryInvoices(uploadId, tempFileNames[]): POST extract-invoices-retry          → results[]  (410 = re-upload)
discardUpload(uploadId): POST extract-invoices-discard
```
Note: these three are **plain multipart/JSON, NOT the `{tokenKey,branchId,item}` envelope** other DeltaSoft services use. The save (`pendingInvoice/createBatch`) DOES use the envelope.

### 2) Modal component — key logic (`modal-doc-hoa-don.component.ts`)
State: `results[]`, `checkedSet:Set<number>`, `selectedIndex`, `uploadId`, `loading/retrying/saving`, `previewUrl/isImage`, plus an optional pre-upload **category** (`selectedGroupFeeCode`) and `showReview` toggle.

- **Gate upload on category** (project rule): `get canUpload() { return !!selectedGroupFeeCode }`; `processFile` returns early with an error toast if no category. Drop `selectedGroupFeeCode` entirely when porting if you have no category requirement.
- **`processFile(file)`**: validate ext (`image/*`, `application/pdf`, `.zip/.rar`), set `loading`, read DataURL preview if a single image, call `extractInvoices(file)` → store `uploadId`+`results`, `selectNonErrorOnly()` (default-check OK rows).
- **Auto-save vs review**: after extract, `if (!showReview && checkedCount>0) saveSelected();` — `showReview=false` (default) = silently persist all OK rows; `showReview=true` = keep the review UI and a manual **Save** button.
- **`retrySelected()`**: map checked rows → distinct `tempFileName[]` → `retryInvoices`; on success splice old rows out and append new (re-checking OK ones); on `410` clear `uploadId` and tell the user to re-upload.
- **`saveSelected()`**: build items via `PendingInvoiceService.fromExtractionResult(r)` for checked, non-error, has-`tempFileName` rows → `createBatch({uploadId, items, <category>}, branchId)`; on success clear `uploadId` (BE deleted temp), emit `SaveSuccess`, close if no errors.
- **`close()`/`reset()`**: if `uploadId` set, fire `discardUpload(uploadId)` (best-effort) so the temp folder dies immediately.
- **Token getters**: sum `promptTokens/completionTokens/totalTokens` across results for the footer.
- Selection helpers: `selectAll/clearAll/selectErrorsOnly/selectNonErrorOnly`, `toggleCheck(i, ev)` with `ev.stopPropagation()`.

`fromExtractionResult` mapping (note the **field renames**): `vendorTaxId→taxNumber`, `invoiceId→invoiceNo`, `invoiceSymbol→invoicePattern`, `webLink→web`, `webCode→code`, `lineItems→JSON.stringify(lineItemsJson)`, carry `tempFileName` + tokens.

### 3) Modal HTML/CSS/module
- Module imports: `CommonModule, ModalModule, FormsModule, NgSelectModule, AngularDraggableModule`.
- ngx-bootstrap modal, draggable by header (`ngDraggable [handle]="hdl"` on `.modal`, `#hdl` on `.modal-header`), `[config]="{backdrop:'static'}"`, width `90vw/max 1400px`.
- Three body states by `*ngIf`: **upload-area** (drag/drop + hidden file input, `accept="image/*,.pdf,.zip,.rar"`, disabled until `canUpload`), **loading** spinner, **results** (left list of files when `isMulti` with per-row checkbox + TRÙNG badge + error/dup sublines; right detail card: vendor/customer/invoice tables, line-items table, lookup web/code).
- Footer: token usage (`{in} in / {out} out = {total} tokens`), **Đọc lại đã chọn (n)**, **Lưu (n)**, **Xuất Excel**, **Đọc file khác** (reset+reopen picker), **Đóng**.

---

## Key decisions & gotchas (don't relearn the hard way)

- **Google AI Studio REST, not Vertex.** Just an API key + `AddHttpClient`. No `Google.Cloud.AIPlatform` package, no service-account JSON for this path.
- **One file → many invoices.** The prompt + `responseMimeType:application/json` returns an array; `ParseInvoiceArray` is tolerant of a single object too. `maxOutputTokens` must be large (65536) or many-invoice JSON truncates → `finishReason=MAX_TOKENS` (surface "split the file").
- **Cost knobs:** `thinkingBudget=0`, `mediaResolution=LOW`, `temperature=0`. ~$0.001–0.002/invoice on `gemini-2.5-flash-lite`. Bump `mediaResolution` to `MEDIUM` only if dense phone photos misread.
- **Token usage on `list[0]` only** per Gemini call, so FE summing doesn't double-count multi-invoice files.
- **Temp-folder lifecycle is the trick that avoids re-uploading.** Files persist under `InvoiceTemp/<uploadId>/` so retry re-reads from disk. Three ways the folder dies: save (BE rmdir), discard (FE on close/reset), cron (>24h). `RetryInvoicesFromTemp` returns null when the folder's gone → controller 410 → FE forces re-upload.
- **Path-traversal safety:** `SanitizeFileName` (strip path + invalid chars) on every temp name, both write and read.
- **ZIP-bomb guard:** ≤30 files, ≤100MB uncompressed, friendly password/encrypted message.
- **S3 best-effort:** upload failure is logged into `errors[]` but never blocks the DB insert.
- **Duplicate check = BE source of truth.** Runs after extract, after retry, AND again inside save — FE display can't be trusted. The match is 4 string fields (InvoiceNo + InvoiceDate + TaxNumber + InvoicePattern) against existing payment detail; **the column names in the staging table are chosen to mirror the payment-detail table** so the dup SP is a simple join.

---

## Staging table (minimal, the read destination)
`Tbl_PendingInvoice` columns the engine writes: vendor/customer block, `InvoiceNo / InvoicePattern / InvoiceDate(string) / PaymentMethod / Web / Code`, `TotalAmount / NetAmount / TaxAmount / Currency`, `LineItemsJson`, `FileName / PathFileLocal / PathFileS3`, `PromptTokens / CompletionTokens / TotalTokens`, `IsDuplicate / DuplicatesJson`, audit + `Status` (0=pending). Plus SP `SP_PendingInvoice_CheckDuplicateBatch` (TVP of keys → matching payments) and `SP_PendingInvoice_Create/Update/GetById/Delete`. **Match invoice-field column names to your payment-detail table** so the dup join stays trivial.

---

## Adaptation checklist — porting to another project/codebase
1. **Gemini engine is generic** — copy `DocumentAIModels.cs`, `IGeminiAIRepository.cs`, `GeminiAIRepository.cs`, `GeminiAIController.cs`, `InvoiceTempCleanupService.cs`, `gemini-ai.service.ts` almost verbatim. Set `GoogleServices:Gemini:ApiKey` + `ModelId`, `AddHttpClient()`, `AddHostedService<...>()`.
2. **Reword the prompt** if your documents aren't Vietnamese invoices (it's the only domain-specific string) and adjust the JSON schema + `InvoiceExtractionResult` fields together.
3. **Strip the category gate** (`selectedGroupFeeCode`, `canUpload`, the `GroupFee*` fields in createBatch) if you don't classify before upload.
4. **Replace the save target**: keep `createBatch`'s temp→permanent move + (optional) S3 + duplicate-check pattern, but point `_context.Create` at your own table. If you don't need a staging table, the modal can stop at "results in memory" and hand them to whatever consumes them.
5. **Duplicate check is optional** — if you don't dedupe, delete `AnnotateDuplicatesAsync` + the `IPendingInvoice` injection and the `IsDuplicate/Duplicates` fields.
6. **Storage paths**: `UploadFiles/InvoiceTemp/` (temp) and `UploadFiles/Invoice/yyyy/MM/` (permanent) are conventions — change freely; the cleanup service only needs to point at the temp base.
7. **Auth**: endpoints are `[Authorize]`; multipart extract endpoints take `IFormFile` (no token-envelope). The save uses the project's `FromBodyBase<T>` + `CheckTokenKey` — swap for your own auth.

## File map (this repo)
- BE engine: `NewAPI/API/Repositories/CustomerCommunicate/GoogleServices/GeminiAIRepository.cs`, `.../Controllers/.../GeminiAIController.cs`, `.../Interfaces/.../IGeminiAIRepository.cs`, `.../Models/.../DocumentAIModels.cs`, `.../Services/InvoiceTempCleanupService.cs`
- BE save: `.../Controllers/.../PendingInvoiceController.cs` (CreateBatch/ReExtract), `.../Repositories/.../PendingInvoiceRepository.cs`
- FE: `web-app-update/src/app/shared/services/gemini-ai.service.ts`, `.../shared/services/pending-invoice.service.ts` (`fromExtractionResult`), `.../shared/components/advance-payment/modal-doc-hoa-don/*`
- Config: `appsettings.json` `GoogleServices:Gemini:ModelId`; key in `appsettings.Development.json`. DI in `Program.cs`.

Related: [[reference_deltasoft_stack_skill]], [[reference_deltasoft_modals_skill]], [[project_pending_invoice_groupfee]].
