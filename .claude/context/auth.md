# Authentication & Permission System

## Login Flow

1. User submits username + password + branchId
2. `POST /api/account/login` (AllowAnonymous)
3. Backend validates password via ASP.NET Identity `SignInManager`
4. Checks: account enabled (`Disable=false`), account activated (`Status=true`), user has permissions on chosen branch
5. Builds JWT claims (24h expiry):
   - `userId`, `userName`, `fullName`, `email`, `avatar`
   - `branchId`, `branchName`
   - `employeeId`
   - `authorisationLevel`, `advanceConfirmLevel`, `paymentConfirmLevel`, `transportConfirmLevel`
   - `listAdvanceGroupId` — comma-separated advance group IDs user can approve
   - `permissions` — JSON array of function codes (e.g. `["DISPATCHORDER_VIEW","DISPATCHORDER_CREATE",...]`)
   - `userHandlingGroups` — JSON array of handling group IDs
   - `roles` — array of role names (e.g. `["Admin"]`)
6. Returns `{ token: "..." }`
7. Frontend stores in `localStorage['TOKEN']`, clears `CacheService`, navigates to `/main`

## External Login (`/api/account/external-login`)
- For Innvie garage system users (`user.IsExternal == true`)
- Branch auto-resolved from employee record (not from login form)
- Password change synced back to Innvie via `POST InnvieUrlPath/api/externals/accounts/change-password` with RSA-encrypted password

## Token Storage & Injection
- `JwtService.saveToken(token)` → `localStorage['TOKEN']`
- `AuthInterceptor` clones every outgoing request with `Authorization: Bearer <token>`
- Token automatically sent to all API calls

## Frontend Permission Check

### Route guard (`AuthGuard`)
```typescript
// checks permissions claim for FUNCTION_CODE + '_VIEW'
permiss.findIndex(x => x === functionCode + '_VIEW') !== -1
```
- Route `data.functionCode` must match the function code registered in backend
- Admins bypass all permission checks
- Redirect to `/login?redirect=<url>` on failure

### UI visibility (`AuthService.hasPermission(functionId)`)
- Used in templates to show/hide buttons
- `functionId` = full permission string e.g. `"DISPATCHORDER_CREATE"`

## Backend Permission Check

### Controller-level attribute
```csharp
[ClaimRequirement(FunctionCode.DISPATCHORDER, ActionCode.CREATE)]
```
- `FunctionCode` constants defined in `Common.Constants`
- `ActionCode`: `VIEW`, `CREATE`, `UPDATE`, `DELETE`, `PRINT`, `ACCEPT`, `CLOSE`

### Permission data
- Stored in DB, loaded on login, embedded in JWT
- `IUserRepository.GetPermissionByUserId(userId, branchId)` — returns list of function codes
- `IUserRepository.GetUserLevel(userId, branchId)` — authorisation levels for multi-step approvals
- `IUserRepository.GetUserHandlingGroup(userId)` — which handling groups user belongs to

## Multi-level Approval
JWT contains integer levels:
- `authorisationLevel` — general approval level
- `advanceConfirmLevel` — level for advance approval
- `paymentConfirmLevel` — level for payment approval
- `transportConfirmLevel` — level for transport order approval

These are checked in repositories to determine if a user can approve a specific record.

## Token Validation (backend anti-replay)
Every mutating request body extends `FromBodyBase<T>` which includes `TokenKey`.
```csharp
if (!await CheckTokenKey(obj.TokenKey)) return BadRequest(...);
```
Backend calls `ILogs.CheckTokenKey(tokenKey)` to check the JWT was logged on login, then `UpdateToken` to mark it used.

## Session End
- `POST /api/account/logout` — calls `SignOutAsync`
- Frontend: `AuthService.logout()` → clears `CacheService`, navigates to `/login`
- Token expires after 24 hours (`ClockSkew = TimeSpan.Zero`)

## Permission Management UIs
- `systems/permission` — assign function permissions to users per branch
- `systems/permission-advance` — advance approval group assignments
- `systems/permission-cs` — CS team permissions
- `systems/permission-payment` — payment approval permissions
- `systems/permission-overtime` — overtime approval chain
