# API Map — Frontend Service ↔ Backend Controller

All API calls use `POST`. Base URL from `environment.apiUrl` (dev: `https://localhost:44352`).

## Auth
| Frontend service | Backend controller | Route prefix |
|---|---|---|
| `auth.service.ts` | `AccountController` | `/api/account` |
| `user-auth.service.ts` | `AccountController` | `/api/account` |
| `user.service.ts` | `UserController` | `/api/user` |
| `roles.service.ts` | `RoleController` | `/api/role` |
| `function.service.ts` | `FunctionController` | `/api/function` |
| `permission.service.ts` | `PermissionController` | `/api/permission` |
| `permission-advance.service.ts` | `PermissionAdvanceController` | `/api/permissionadvance` |
| `permission-cs.service.ts` | `PermissionCSController` | `/api/permissioncs` |
| `permission-payment.service.ts` | `PermissionPaymentController` | `/api/permissionpayment` |
| `permission-overtime.service.ts` | `Systems/PermissionOvertimeController` | `/api/permissionovertime` |

## Master Data (danhmuc)
| Frontend service | Backend controller | Route prefix |
|---|---|---|
| `customer.service.ts` | `CustomerController` | `/api/customer` |
| `supplier.service.ts` | `SupplierController` | `/api/supplier` |
| `employee.service.ts` | `EmployeeController` | `/api/employee` |
| `vihicle.service.ts` | `VihicleController` | `/api/vihicle` |
| `route.service.ts` | `RouteController` | `/api/route` |
| `fee.service.ts` | `FeeController` | `/api/fee` |
| `fee-code.service.ts` | `FeeCodeController` | `/api/feecode` |
| `group-fee.service.ts` | `GroupFeeController` | `/api/groupfee` |
| `payment-fee-group.service.ts` | `PaymentFeeGroupController` | `/api/paymentfeegroup` |
| `revenue-fee-group.service.ts` | `RevenueFeeGroupController` | `/api/revenuefeegroup` |
| `bank.service.ts` | `BankController` | `/api/bank` |
| `branch.service.ts` | `BranchController` | `/api/branch` |
| `province.service.ts` | `ProvinceController` | `/api/province` |
| `district.service.ts` | `DistrictController` | `/api/district` |
| `location.service.ts` | `LocationController` | `/api/location` |
| `gas-site.service.ts` | `GasSiteController` | `/api/gassite` |
| `handlinggroup.service.ts` | `HandlingGroupController` | `/api/handlinggroup` |
| `jobgroup.service.ts` | `JobGroupController` | `/api/jobgroup` |
| `jobgroupoption.service.ts` | `JobGroupOptionController` | `/api/jobgroupoption` |
| `optionprocedure.service.ts` | `OptionProcedureController` | `/api/optionprocedure` |
| `other-categories.service.ts` | `OtherCategoriesController` | `/api/othercategories` |
| `toll-locations.service.ts` | `TollLocationsController` | `/api/tolllocations` |
| `tollroute.service.ts` | `TollRouteController` | `/api/tollroute` |
| `toll-station.service.ts` | `TollStationController` | `/api/tollstation` |
| `advance-group.service.ts` | `AdvanceGroupController` | `/api/advancegroup` |
| `country.service.ts` | `CountryController` | `/api/country` |

## Shipments
| Frontend service | Backend controller | Route prefix |
|---|---|---|
| `shipment.service.ts` | `ShipmentController` | `/api/shipment` |
| `debit-notes.service.ts` | `DebitNoteController` | `/api/debitnote` |
| `open-debitnote.service.ts` | `OpenDebitNoteController` | `/api/opendebitnote` |
| `open-shipment.service.ts` | `OpenShipmentController` | `/api/openshipment` |
| `dbs-shipment.service.ts` | `CustomerCommunicate/Dbs/DbsEdiController` | `/api/dbsedi` |
| `canon-price.service.ts` | `CanonPriceController` | `/api/canonprice` |
| `canon-road.service.ts` | `CanonRoadController` | `/api/canonroad` |
| `canon-quotationsubcontractors.service.ts` | `CanonQuotationSubcontractorsController` | `/api/canonquotationsubcontractors` |

## Transports & Dispatch
| Frontend service | Backend controller | Route prefix |
|---|---|---|
| `transports/` services | `DispatchOrderController` | `/api/dispatchorder` |
| — | `DispatchOrderFCLController` | `/api/dispatchorderfcl` |
| — | `DispatchOrderAdditionalFeeController` | `/api/dispatchorderadditionalfee` |
| — | `DispatchOrderTicketController` | `/api/dispatchorderticket` |
| — | `DispatchOrderAttachFilesController` | `/api/dispatchorderattachfiles` |
| — | `TransportOrderController` | `/api/transportorder` |
| — | `ShippingTaskController` | `/api/shippingtask` |
| — | `QuotationSubcontractorsController` | `/api/quotationsubcontractors` |
| `igas.service.ts` | `DriverFuelApprovalController` | `/api/driverfuelapproval` |
| — | `DriverFuelDebitController` | `/api/driverfueldebit` |
| — | `DriverFuelLimitController` | `/api/driverfuellimit` |
| — | `ExternalOilPurchasedController` | `/api/externaloilpurchased` |
| — | `FuelClosingController` | `/api/fuelclosing` |
| — | `GasManagementController` | `/api/gasmanagement` |
| — | `ImportGasController` | `/api/importgas` |
| — | `RePaymentEtcController` | `/api/repaymentetc` |

## Advance & Payments
| Frontend service | Backend controller | Route prefix |
|---|---|---|
| `advance.service.ts` | `AdvanceController` | `/api/advance` |
| — | `PaymentsController` | `/api/payments` |
| — | `ContBetsController` | `/api/contbets` |
| — | `DebtInventoryController` | `/api/debtinventory` |
| `deposit.service.ts` | `DepositController` | `/api/deposit` |
| — | `EmployeeDebitClosingController` | `/api/employeedebitclosing` |
| — | `EmployeeLimitController` | `/api/employeelimit` |
| `personal-loan.service.ts` | `PersonalLoanController` | `/api/personalloan` |
| `rebets.service.ts` | `ReBetsController` | `/api/rebets` |
| `repayment.service.ts` | `RepaymentController` | `/api/repayment` |

## Accounting
| Frontend service | Backend controller | Route prefix |
|---|---|---|
| `accounting/` services | `AccountsController` | `/api/accounts` |
| `debt.service.ts` | `TbDebtController` | `/api/tbdebt` |
| `employee-debit.service.ts` | `EmployeeDebitController` | `/api/employeedebit` |
| `export-invoice.service.ts` | `ExportInvoiceController` | `/api/exportinvoice` |
| `fund.service.ts` | `FundController` | `/api/fund` |
| `on-behalf-payment.service.ts` | `OnBehalfPaymentController` | `/api/onbehalfpayment` |
| — | `SummarySupplierCostsController` | `/api/summarysuppliercosts` |

## Workflows
| Frontend service | Backend controller | Route prefix |
|---|---|---|
| `workflows.service.ts` | `WorkflowController` | `/api/workflow` |
| — | `WorkflowJobOptionProcedureController` | `/api/workflowjoboptionprocedure` |

## Sales & Marketing
| Frontend service | Backend controller | Route prefix |
|---|---|---|
| `potential-customer.service.ts` | `PotentialCustomerController` | `/api/potentialcustomer` |
| — | `QuotationCustomerController` | `/api/quotationcustomer` |
| — | `ContractCustomerController` | `/api/contractcustomer` |
| — | `ContractExtensionController` | `/api/contractextension` |
| — | `SalesCustomerController` | `/api/salescustomer` |
| — | `SalesMarketingSublistController` | `/api/salesmarketingsublist` |

## HRM
| Frontend service | Backend controller | Route prefix |
|---|---|---|
| `hrm/` services | `OnLeaveController` | `/api/onleave` |
| — | `OnLeaveManagementController` | `/api/onleavemanagement` |
| — | `OverTimeController` | `/api/overtime` |
| — | `TimeKeepingController` | `/api/timekeeping` |
| — | `GoLateBackEarlyController` | `/api/golatebackearly` |
| — | `ApproverPermissionsController` | `/api/approverpermissions` |
| — | `ApproverPermissionCustomersController` | `/api/approverpermissioncustomers` |
| — | `TrainingDocumentsController` | `/api/trainingdocuments` |
| — | `TrainingTemplatesController` | `/api/trainingtemplates` |

## Garage / Vehicle Inspection
| Frontend service | Backend controller | Route prefix |
|---|---|---|
| `garage/` services | `VehicleInspectionController` | `/api/vehicleinspection` |
| — | `VehicleInspectionJobController` | `/api/vehicleinspectionjob` |
| — | `VehicleInspectionPermissionController` | `/api/vehicleinspectionpermission` |
| — | `RequestNewEmployeeController` | `/api/requestnewemployee` |
| — | `GaragesController` (Innvie) | `/api/garages` |

## CBT
| Frontend service | Backend controller | Route prefix |
|---|---|---|
| `cbt/` services | `AdvanceCBTController` | `/api/advancecbt` |
| — | `DispatchOrderCBTController` | `/api/dispatchordercbt` |
| — | `PaymentCBTController` | `/api/paymentcbt` |

## Commons & Infrastructure
| Frontend service | Backend controller | Route prefix |
|---|---|---|
| `attachfiles.service.ts` | `AttachFilesController` | `/api/attachfiles` |
| `tap-tin.service.ts` | `UploadFilesController` | `/api/uploadfiles` |
| — | `S3Controller` | `/api/s3` |
| `map/` services | `Commons/GoogleMapController` | `/api/googlemap` |
| — | `VietmapApiController` | `/api/vietmapapi` |
| `notification.service.ts` | `NotificationsController` | `/api/notifications` |
| — | `PushNotificationController` | `/api/pushnotification` |
| `print-form.service.ts` | `PrintFormController` | `/api/printform` |
| `reports.service.ts` | `ReportsController` | `/api/reports` |
| `home.service.ts` | `TaskPaneController` | `/api/taskpane` |
| — | `MenuBarController` | `/api/menubar` |
| `signalr.service.ts` | `SignalR/RefreshHub` | `/signalr` |

## AI / External Services
| Service | Backend controller | Route prefix |
|---|---|---|
| — | `GeminiAIController` | `/api/geminiAI` |
| — | `DocumentAIController` | `/api/documentAI` |
| — | `ClaudeAIController` | `/api/claudeAI` |
| — | `CustomerCommunicate/GoogleServices/GoogleMapController` | `/api/googlemap` |
| — | `OpenSourceMapController` | `/api/opensourcemap` |
| — | `IgasController` | `/api/igas` |
| — | `FirebaseTokensController` | `/api/firebasetokens` |
| — | `RateController` (Vietcombank) | `/api/rate` |
| — | `DeltaGetController` | `/api/deltaget` |
