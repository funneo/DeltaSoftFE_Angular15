# Module Inventory

## Frontend Modules (14 lazy-loaded + login)

### `login`
- Route: `/login`
- Single page login form; no auth guard
- Calls `POST /api/account/login`
- On success: saves JWT to `localStorage['TOKEN']`, clears cache, navigates to `/main`

### `home`
- Route: `/main/home`
- Dashboard; charts using ng2-charts/Chart.js

### `systems`
- Route: `/main/systems`
- Sub-pages: users, roles, functions (chucnang), permissions, permission-advance, permission-cs, permission-payment, permission-overtime, permission-training-document
- Controllers: `UserController`, `RoleController`, `FunctionController`, `PermissionController`, `PermissionAdvanceController`, `PermissionCSController`, `PermissionPaymentController`, `Systems/PermissionOvertimeController`

### `danhmuc` (Master Data / Categories)
- Route: `/main/danhmuc`
- Sub-pages: account-list, advance-group, banks, branch, customer, customer-team-permission, district, employee, fee, gas-site, group-fee, handlinggroups, jobgroup, jobgroupoption, location, optionprocedure, other-categories, payment-fee, ports, province, rate-exchange, revenue-fee, route, supplier, tolllocations, tollroute, tollstation, transit-ports, transport-category, vehicle-inspection-job, vihicle (vehicle)
- ~35 backend controllers in `Controllers/Categories/`
- SignalR cache invalidation used heavily here

### `shipments`
- Route: `/main/shipments`
- Sub-pages: dbs-shipments, shipment, shipment-normal, open-shipment, debit-note, open-debit-note, accept-debit-note, locking-debit-note, reports (bc01, bc02, bc04-dt12, cp03, revenue, shipment-not-debit, statement, debit-note-detail)
- Controllers: `ShipmentController`, `DebitNoteController`, `OpenDebitNoteController`, `OpenShipmentController`

### `transports`
- Route: `/main/transports`
- Sub-pages: dispatchorders, dispatch-order-fcl, dispatch-order-additional-fee, driver-fuel-approval, driver-fuel-closing, driver-fuel-debit-credit, driver-fuel-limit, external-oil-purchased, gas-management, import-gas, common-fuel-approval, site-fuel-closing, quotationsubcontractors, repayment-etc, shipping-task-cs, shipping-task-lg, shipping-task-opman, reports (01, 02, 03)
- Controllers: `DispatchOrderController`, `DispatchOrderFCLController`, `DispatchOrderAdditionalFeeController`, `DispatchOrderTicketController`, `ShippingTaskController`, `DriverFuelApprovalController`, `DriverFuelDebitController`, `DriverFuelLimitController`, `ExternalOilPurchasedController`, `FuelClosingController`, `GasManagementController`, `ImportGasController`, `RePaymentEtcController`, `TransportOrderController`, `QuotationSubcontractorsController`

### `cbts` (CBT Customer Module)
- Route: `/main/cbt`
- Sub-pages: dispatch-order-cbt, driver-fuel-approval-cbt, external-oil-purchased-cbt, advance-cbt, payment-cbt, reports (bc01, costs, profit, revenue-cbt)
- Controllers: `AdvanceCBTController`, `DispatchOrderCBTController`, `PaymentCBTController`

### `advance-payment`
- Route: `/main/advance-payment`
- Sub-pages: advance, accounts, additional-invoice-information, advance-transfer, cont-bets, debt-inventory, deposit, employee-debit-closing, employee-debit-transfer-closing, employee-limit, payment, payment-accept, payment-accept-step1, payment-debt-invoice, personal-loan, rebets, repayment, report-payment-detail
- Controllers: `AdvanceController`, `PaymentsController`, `ContBetsController`, `DebtInventoryController`, `DepositController`, `EmployeeDebitClosingController`, `EmployeeLimitController`, `PersonalLoanController`, `ReBetsController`, `RepaymentController`, `AdditionalInvoiceInformationController`

### `accounting`
- Route: `/main/accounting`
- Sub-pages: accounting-debit-credit, debt, debt-report, debt-supplier, employee-debit-credit, export-invoice, fund, fund-reserve, list-employee-debit-credit, on-behalf-payment, phieu-chi, phieu-thu, summary-supplier-cost
- Controllers: `AccountsController`, `TbDebtController`, `EmployeeDebitController`, `ExportInvoiceController`, `FundController`, `OnBehalfPaymentController`, `SummarySupplierCostsController`

### `workflows`
- Route: `/main/workflows`
- Sub-pages: workflow, assigningjob, assignedjob, workflow-report-bc01
- Controllers: `WorkflowController`, `WorkflowJobOptionProcedureController`

### `sales-marketing`
- Route: `/main/sales-marketing`
- Sub-pages: potential-customer, customer-dk05, quotation-customer, quotation-dk04, contract-customer, contract-extension, sales-customer, sublist-category
- Controllers: `PotentialCustomerController`, `QuotationCustomerController`, `ContractCustomerController`, `ContractExtensionController`, `SalesCustomerController`, `SalesMarketingSublistController`

### `hrm`
- Route: `/main/hrm`
- Sub-pages: go-late-back-early, onleave, onleave-management, overtime, time-keeping
- Controllers: `GoLateBackEarlyController`, `OnLeaveController`, `OnLeaveManagementController`, `OverTimeController`, `TimeKeepingController`, `ApproverPermissionsController`, `ApproverPermissionCustomersController`, `TrainingDocumentsController`, `TrainingTemplatesController`

### `canon`
- Route: `/main/canon`
- Sub-pages: job-canon, shipping-canon, workflow-canon, price-canon, road-canon, quotation-sub-canon, debit-canon, list-debit-note, db-chitiet-canon
- Controllers: `CanonPriceController`, `CanonRoadController`, `CanonQuotationSubcontractorsController`

### `garage`
- Route: `/main/garage`
- Sub-pages: vehicle-inspection, vehicle-inspection-checking, vehicle-inspection-permission, request-new-employee
- Controllers: `VehicleInspectionController`, `VehicleInspectionJobController`, `VehicleInspectionPermissionController`, `RequestNewEmployeeController`
- Integrates with external Innvie garage system

### `training-materials-management`
- Route: `/main/trainingmaterialsmanagement`
- Training document library

## Backend-only Modules (no direct frontend module)

- `CustomerCommunicate/` — Dbs EDI, Delta internal API, Firebase tokens, Innvie/Garage, AI services (Gemini, DocumentAI, ClaudeAI), Igas, Vietcombank rate
- `Commons/` — AttachFiles, GoogleMap, S3, UploadFiles, VietmapApi
- `PushNotifications/` — FCM notification sending, notification list
- `Reports/PrintForm` — PDF generation using DinkToPdf
