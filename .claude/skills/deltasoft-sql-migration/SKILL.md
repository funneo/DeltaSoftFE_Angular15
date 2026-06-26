---
name: deltasoft-sql-migration
description: How to author a SQL Server migration .sql file for DeltaSoft ERP — additive, idempotent, hand to user to run (NEVER auto-execute). Invoke whenever a task needs a schema/SP change: adding a column, altering or recreating a stored procedure, adding a new SP, seeding master data (OtherCategories/FeeCodes), or granting a Function/permission. Use this BEFORE writing any ALTER/CREATE/DROP/INSERT — even a "tiny one-column add" — so the file matches the house pattern (header block, IF NOT EXISTS guards, default-NULL params, run-order notes) and never violates the no-auto-DB-writes rule. Pairs with deltasoft-stack (which holds SP-naming, read-only DB access, and the hard boundaries).
---

# DeltaSoft — Authoring a SQL Migration File

Every schema/SP change in this project ships as a **hand-written `.sql` file the user runs themselves** — there are 50+ of them under `D:\Delta\DeltaSoft\NewAPI\Migration_*.sql`. This skill is the recipe for writing one that fits the house style and is safe to apply to a **live production DB**.

## The one rule that overrides everything

**You NEVER execute DDL/DML. You only compose a `.sql` file and hand it to the user.** ALTER / DROP / UPDATE / DELETE / INSERT / CREATE — all of it is for the user to run after reviewing. Existing SPs/tables are treated as sacred: read-only. The only DB access you take yourself is `SELECT` / `OBJECT_DEFINITION` to *understand* what's there (see deltasoft-stack §10 for the PowerShell read-only snippet). Show the SQL, wait for approval. This is non-negotiable — it's why the whole project works this way.

Two more hard rules from deltasoft-stack §11 that bite migrations specifically:
- **Don't touch FCL legacy / TO-page SPs.** New behavior → new SP in parallel, never edit the legacy one.
- **New SP = new behavior shift?** Build `*WithTO` / `*V2` style siblings; don't mutate the in-use SP.

## Workflow (do these in order)

1. **Read the current object first.** Before altering an SP, dump its real definition so you reproduce the body exactly:
   ```sql
   SELECT OBJECT_DEFINITION(OBJECT_ID('dbo.SP_PendingInvoice_Create'));
   ```
   Run it read-only (PowerShell snippet in deltasoft-stack §10). For a table column add, check `sys.columns`. **Reproducing the body verbatim and only adding the new bits is the whole game** — a paraphrased SP silently drops logic.
2. **Decide additive vs recreate** (see next section).
3. **Write the file** to `D:\Delta\DeltaSoft\NewAPI\` with the naming + header below.
4. **Make every statement idempotent** so re-running is harmless.
5. **Write the run-order + "Anh cần" note** (what to run, in what order, before/after deploy).
6. **Hand it over.** Update `.claude/context/done.md` + `todo.md` per project habit. Do not run it.

## File naming

`Migration_<Area>_<WhatChanged>_<yyyyMMdd>.sql` — PascalCase area, underscores between tokens, date suffix `yyyyMMdd`.

Examples that exist: `Migration_PendingInvoice_GroupFeeCode_20260613.sql`, `Migration_FeeCodes_CreateUpdate_IsInvoiceInput_20260615.sql`, `Migration_HR_F045_F046_Grant_20260616.sql`. Grant-only files end in `_Grant_`. If a change spans phases, suffix `_Phase1A` / `_Part8` etc.

## Header block (always)

Open every file with this comment so the user knows context, decisions, and login without reading the body:

```sql
/* ============================================================
   <Area> — <one-line what + why>   (yyyy-MM-dd)
   ----------------------------------------------------------------
   Bối cảnh:   <why this change exists, 2-4 lines>
   QUY ƯỚC:    <decisions locked with user — e.g. "lưu CODE không lưu Id">
   Thay đổi trong file này:
     1) ALTER TABLE ... ADD ...
     2) SP_X_Create  + 2 param @A/@B
     3) SP_X_GetForPicker + filter @A
   KHÔNG đụng: <SPs/tables deliberately left alone + why they still work>
   Login: delta.erp (db_owner).
   ============================================================ */
```

The `KHÔNG đụng` line matters: it's where you state e.g. "SP_..._GetPaging giữ nguyên vì `SELECT *` tự trả cột mới" so the reviewer trusts you didn't forget it.

## Additive column — idempotent pattern

```sql
IF NOT EXISTS (SELECT 1 FROM sys.columns
               WHERE object_id = OBJECT_ID('dbo.Tbl_PendingInvoice') AND name = 'GroupFeeCode')
BEGIN
    ALTER TABLE dbo.Tbl_PendingInvoice ADD GroupFeeCode NVARCHAR(50) NULL;
    PRINT N'  [1a] ADD GroupFeeCode NVARCHAR(50)';
END
ELSE PRINT N'  [1a] GroupFeeCode ĐÃ TỒN TẠI — skip';
GO
```

- **New columns are `NULL`** (or have a default) — never `NOT NULL` without a default on a populated table; it fails on existing rows.
- One `IF NOT EXISTS` block per column, each followed by `GO`.
- Index add guards on `sys.indexes`; check object existence with `OBJECT_ID('...', 'P')` for procs, `'U'` for tables, `'IF'/'TF'/'FN'` for functions.

## Recreating / altering a stored procedure — two styles, pick deliberately

**Style A — `DROP` + `CREATE`** (most common here). Use when the SP's GRANTs don't matter (db_owner login) and you want a clean full-body rewrite:
```sql
IF OBJECT_ID('dbo.SP_PendingInvoice_Create', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_PendingInvoice_Create;
GO
CREATE PROCEDURE dbo.SP_PendingInvoice_Create
    @Existing NVARCHAR(50) = NULL,
    ...
    @GroupFeeCode NVARCHAR(50) = NULL,   -- MỚI: appended at the END
    @CreatedBy UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;
    -- body reproduced VERBATIM + the new column threaded through INSERT/SELECT
END
GO
PRINT N'  [2] SP_PendingInvoice_Create — recreated (+GroupFeeCode)';
GO
```

**Style B — `ALTER PROCEDURE`** (use when GRANTs must survive, or you only touch the signature). `ALTER` keeps existing permissions; `DROP`+`CREATE` resets them. The FeeCodes Create/Update file uses `ALTER` precisely because that SP is granted to specific logins:
```sql
ALTER PROCEDURE [dbo].[SP_FeeCodes_Update]
    @Id INT,
    ... existing params ...,
    @IsInvoiceInput BIT = NULL,   -- MỚI: NULL = giữ giá trị cũ
    @UpdatedBy UNIQUEIDENTIFIER = NULL
AS
BEGIN
    UPDATE [dbo].[FeeCodes]
    SET ...,
        [IsInvoiceInput] = ISNULL(@IsInvoiceInput, [IsInvoiceInput]),  -- preserve on Update
        ...
    WHERE [Id] = @Id AND [Deleted] = 0
END
GO
```
> **⚠ This DB is SQL Server 2014 — `CREATE OR ALTER` does NOT exist** (it arrived in 2016 SP1). Never emit it. Use **Style A** (`IF OBJECT_ID(...,'P') IS NOT NULL DROP PROCEDURE` then `CREATE`) or **Style B** (bare `ALTER PROCEDURE`). Same goes for other 2016+ sugar: no `DROP PROCEDURE IF EXISTS`, no `STRING_SPLIT`, no `STRING_AGG`, no `JSON_*` value functions — use the 2014-safe forms (`IF OBJECT_ID ... DROP`, XML/CSV split, `FOR XML PATH`).

### The "too many arguments" trap — read this twice

Backend (Dapper) passes parameters positionally/by-name. If you **deploy BE that sends a new `@Param` before the SP has the param**, every call fails at runtime with *"Procedure ... has too many arguments specified"* — and it can take down an unrelated shared list (e.g. adding `@IsSubcontractors` to `SP_DispatchOrderFCL_GetAll` would break the company FCL list too). Therefore:

- **New params go at the END of the signature, each `= NULL` (or a safe default).** Old callers that don't pass them keep working.
- **On Update SPs, `ISNULL(@New, [Col])`** so a missing param preserves the stored value instead of nulling it.
- **State run-order explicitly:** "⚠ Chạy SQL TRƯỚC khi deploy BE" whenever BE will send a new param. The SP must exist with the param before the new code calls it.
- **Param name must match exactly** what BE sends — a typo'd `@SupplierId` vs `@SupplierID` is the same "too many arguments" failure.

## Seeding master data (OtherCategories / FeeCodes / Functions)

Guard with `NOT EXISTS` / `MERGE` so re-runs don't duplicate. Master-data inserts are the one place edits are low-risk, but still hand them over. Snapshot-name columns (names copied onto invoices/vouchers) are safe to rename in the catalog — the snapshot already captured the old text.

## Grant a Function (menu + permission) — idempotent template

VIEW grant makes the menu appear + lets `AuthGuard` in; CUD is gated separately by the controller's `[ClaimRequirement]`. Function `Id` must equal the BE `enum FunctionCode` name and the FE `route.data.functionCode` (deltasoft-stack §2).

```sql
SET NOCOUNT ON;
-- 1) Functions (menu row)
IF NOT EXISTS (SELECT 1 FROM dbo.Functions WHERE Id='F045')
    INSERT INTO dbo.Functions (Id, Name, NameClass, ParentId, Url, SortOrder, CssClass, IsMenu, Status)
    VALUES ('F045', N'Hồ sơ nhân viên', NULL, 'HRM', '/main/hrm/employee-hr', 7, NULL, 1, 1);

-- 2) ActionInFunctions (these strings become the permission codes)
INSERT INTO dbo.ActionInFunctions (FunctionId, ActionId)
SELECT f.id, 'VIEW' FROM (VALUES ('F045'),('F046')) AS f(id)
WHERE NOT EXISTS (SELECT 1 FROM dbo.ActionInFunctions y WHERE y.FunctionId=f.id AND y.ActionId='VIEW');

-- 3) Permissions for Admin role
DECLARE @AdminRoleId NVARCHAR(450) = (SELECT TOP 1 Id FROM dbo.Roles WHERE Name='Admin');
INSERT INTO dbo.Permissions (RoleId, FunctionId, ActionId)
SELECT @AdminRoleId, f.id, 'VIEW' FROM (VALUES ('F045'),('F046')) AS f(id)
WHERE @AdminRoleId IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.Permissions p WHERE p.RoleId=@AdminRoleId AND p.FunctionId=f.id AND p.ActionId='VIEW');
PRINT '=== DONE: Grant F045/F046 — VIEW ===';
```
Users must **relogin** after a grant — the JWT claims are stamped at login. Say so in the handover note.

## Idempotency checklist (so a re-run is always safe)

- Column add → `IF NOT EXISTS (sys.columns ...)` ... `ELSE PRINT 'skip'`
- Index add → `IF NOT EXISTS (sys.indexes ...)`
- Proc → `IF OBJECT_ID(...,'P') IS NOT NULL DROP` then `CREATE` (or bare `ALTER`)
- Seed row → `IF NOT EXISTS` / `MERGE`
- Batch separators: `GO` after each DDL block and after each proc.
- Progress: `PRINT N'  [n] ...'` per step + a final `PRINT N'====== HOAN TAT (<Area>) ======';`. Use ASCII in the final banner (some consoles mangle Vietnamese diacritics in `PRINT`).

## Handover note (put in chat + done/todo)

End with a crisp **"Anh cần"** list, e.g.:
1. ⬜ Chạy `Migration_<...>.sql` (login delta.erp) — ⚠ TRƯỚC khi deploy BE (BE truyền param mới).
2. ⬜ Deploy API + `ng build` FE.
3. ⬜ Relogin (nếu có grant) → test E2E: <the concrete thing to click>.
Flag anything left open (a param you defaulted, a list whose scope you narrowed) so the user can veto.

## Anti-patterns (don't)

- ❌ Running the SQL yourself "to verify it works." Verify by reading; the user runs it.
- ❌ `NOT NULL` column without default on a populated table.
- ❌ New SP param inserted in the middle of the signature, or without `= NULL`.
- ❌ Paraphrasing an existing SP body instead of reproducing it verbatim + delta.
- ❌ Editing a legacy FCL / TO SP in place — clone instead.
- ❌ `DROP`+`CREATE` on a grant-sensitive SP (resets permissions) — use `ALTER`.
- ❌ Forgetting the run-order note when BE will send a new param → "too many arguments" in prod.
