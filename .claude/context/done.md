# Completed Features

## Core Infrastructure
- JWT authentication with multi-branch login (user selects branch on login)
- Role-based + function-code permission system embedded in JWT claims
- Multi-level approval workflows (authorisationLevel, advanceConfirmLevel, paymentConfirmLevel, transportConfirmLevel)
- SignalR real-time cache invalidation for master data
- Firebase FCM push notifications (web)
- CacheService with 60-minute TTL and entity-based invalidation
- AWS S3 file storage
- File upload/download (local UploadFiles folder + S3)
- PDF generation via DinkToPdf
- Excel export via EPPlus / xlsx
- External user (IsExternal) login flow with Innvie password sync via RSA encryption
- Login history logging
- Token-key anti-replay validation on all mutating endpoints

## Master Data (danhmuc)
- Customer management (with locations, routes, toll routes, normal routes)
- Supplier management (with drivers, vehicles)
- Employee management
- Vehicle management
- Route management
- Fee / fee group / payment fee group / revenue fee group
- Toll: locations, stations, routes
- Bank, branch, province, district, location (GPS points)
- Handling groups, job groups, job group options
- Option procedures
- Rate exchange
- Gas sites, vehicle oil quotas
- Transit ports, ports
- Transport categories
- Other categories
- Account list

## Shipments
- Shipment create/update/delete/copy/finish
- Shipment normal (non-container)
- Open shipment management
- Debit note CRUD + open/accept/lock workflow
- DBS EDI shipment import
- Canon shipment flow (separate pricing model)
- Reports: BC01, BC02, BC04-DT12, CP03, revenue, debit note detail, statement

## Transports
- Dispatch order full lifecycle (create, update, changed driver, set finish, set done procedure, cancel)
- FCL dispatch orders
- Dispatch order additional fees
- Dispatch order parking tickets
- Transport order (lệnh vận chuyển) — new module using Vietmap + Google Maps API
- Transport order modal: tab "Chi tiết công việc" với 4 action buttons (xoá, đính kèm, tải file lái xe, nhân bản), tab "Chi phí" (listFee), tab "Hình ảnh hiện trường" (khi status > 1)
- Quotation subcontractors
- Shipping tasks: CS, LG, OpMan views
- Fuel/gas management: driver fuel approval, debit, limit
- External oil purchased tracking
- Fuel closing (driver-level and site-level)
- Gas import management
- ETC repayment (toll fee reimbursement)
- Dispatch order reports: BC01, BC02, BC03
- Vietmap route + toll calculation integration

## CBT (customer-specific module)
- CBT dispatch orders
- Driver fuel approval CBT
- External oil purchased CBT
- Advance CBT
- Payment CBT
- Reports: BC01, costs, profit, revenue

## Advance & Payments
- Advance CRUD + approval workflow
- Payment CRUD + approval workflow
- Additional invoice information
- Cont bets (container bets)
- Debt inventory
- Deposits
- Employee debit closing
- Employee limits
- Personal loans
- Rebets
- Repayments
- Payment detail reports

## Accounting
- Fund management (phiếu chi, phiếu thu)
- Fund reserve
- Debt management (customer debt, supplier debt)
- Employee debit/credit
- Export invoices
- On-behalf payments
- Summary supplier costs
- Debit/credit reports

## Workflows
- Job workflow creation and management
- Assigning jobs to employees
- Assigned job tracking
- Workflow BC01 report

## Sales & Marketing
- Potential customer tracking
- Quotation management (DK04, customer quotations)
- Contract management (new + extensions)
- Sales customer tracking
- Sublist category management
- Customer DK05

## HRM
- Leave management (onleave + onleave management)
- Overtime management
- Go late / back early tracking
- Timekeeping
- Approver permission setup (general + customer-specific)
- Training documents
- Training templates

## Canon
- Canon job management
- Canon shipping
- Canon workflow
- Canon pricing
- Canon road management
- Canon quotation subcontractors
- Canon debit notes
- Canon DB detail view

## Garage / Vehicle Inspection
- Vehicle inspection (integrated with Innvie external system)
- Vehicle inspection job definition
- Vehicle inspection permissions
- Request new employee

## Systems
- User management (create, update, disable)
- Role management
- Function/menu management
- All permission management screens

## AI / External
- Google Gemini 2.5 Flash: invoice data extraction (`POST /api/geminiAI/extract-invoice`)
- Google Document AI: document processing
- Claude AI controller (endpoint exists)
- Vietmap API: route planning + toll calculation
- Vietcombank exchange rate fetch
- Igas integration
- DBS EDI integration
