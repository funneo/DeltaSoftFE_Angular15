import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { BaseService } from './base.service';
import { JwtService } from './jwt.service';
import { InvoiceExtractionResult } from './gemini-ai.service';

export interface PendingInvoice {
  id?: number;
  branchId?: number;
  employeeId?: number;
  vendorName?: string;
  taxNumber?: string;
  vendorAddress?: string;
  vendorPhone?: string;
  customerName?: string;
  customerTaxId?: string;
  customerAddress?: string;
  invoiceNo?: string;
  invoicePattern?: string;
  invoiceDate?: string;
  paymentMethod?: string;
  web?: string;
  code?: string;
  totalAmount?: number;
  netAmount?: number;
  taxAmount?: number;
  currency?: string;
  lineItemsJson?: string;
  fileName?: string;
  pathFileLocal?: string;
  pathFileS3?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  isDuplicate?: boolean;
  duplicatesJson?: string;        // JSON array [{ paymentId, paymentRefNo, paymentRefDate, paymentStatus }]
  groupFeeCode?: string;          // nhóm phí cấp 1 (FeeCode Lvl1) — lưu code
  groupFeeName?: string;          // snapshot tên nhóm phí
  subFeeCode?: string;            // phân nhóm cấp 2 (FeeCode Lvl2) — lưu code
  subFeeName?: string;            // snapshot tên phân nhóm cấp 2
  jobId?: string;                 // gán cả lô cho Lô hàng/Công việc (JobId)
  shipmentId?: number;            // ShipmentId tương ứng
  workflowId?: number;            // WorkflowId (chỉ khi gán theo Công việc)
  assignCustomerCode?: string;    // mã KH của Lô/CV đã gán (JOIN từ SP GetPaging)
  assignCustomerName?: string;    // tên KH của Lô/CV đã gán
  usedByPaymentId?: number;       // !=null => đã dùng cho 1 Payment (ẩn khỏi tab Chờ TT)
  status?: number;
  createdBy?: string;
  createdDate?: string;
  createdByName?: string;
  updatedBy?: string;
  updatedDate?: string;
  totalRows?: number;
  checked?: boolean;
}

export interface PendingInvoiceFilter {
  branchId?: number;
  status?: number;
  fromDate?: string;
  toDate?: string;
  keyword?: string;
  pageIndex?: number;
  pageSize?: number;
}

/** Filter cho modal "Chọn từ hóa đơn đã đọc" trong PaymentDetail. */
export interface PendingInvoicePickerFilter {
  branchId?: number;
  keyword?: string;
  fromDate?: string;
  toDate?: string;
  groupFeeCode?: string;       // lọc hóa đơn theo nhóm phí cấp 1 của Payment
  subFeeCode?: string;         // lọc thêm theo phân nhóm cấp 2 (bỏ trống = bỏ qua)
}

/** 1 dòng trả về cho picker — đủ field để fill PaymentDetail. */
export interface PendingInvoicePickerItem {
  id: number;
  branchId?: number;
  vendorName?: string;
  taxNumber?: string;
  invoiceNo?: string;
  invoicePattern?: string;
  invoiceDate?: string;
  totalAmount?: number;
  netAmount?: number;
  taxAmount?: number;
  currency?: string;
  web?: string;
  code?: string;
  fileName?: string;
  pathFileLocal?: string;
  isDuplicate?: boolean;
  duplicatesJson?: string;
  groupFeeCode?: string;
  groupFeeName?: string;
  subFeeCode?: string;
  subFeeName?: string;
  createdDate?: string;
  // UI state — không gửi BE
  checked?: boolean;
}

/** Item gửi lên BE từ modal sau khi user check + có thể đã sửa. */
export interface PendingInvoiceCreateItem extends PendingInvoice {
  tempFileName: string;
}

export interface CreateBatchRequest {
  uploadId: string;
  groupFeeCode?: string;       // nhóm phí cấp 1 áp cho cả batch
  groupFeeName?: string;
  subFeeCode?: string;         // phân nhóm cấp 2 áp cho cả batch
  subFeeName?: string;
  jobId?: string;              // gán cả lô cho Lô hàng/Công việc
  shipmentId?: number;
  workflowId?: number;
  items: PendingInvoiceCreateItem[];
}

@Injectable({ providedIn: 'root' })
export class PendingInvoiceService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  private wrap(item: any, branchId?: number) {
    return { tokenKey: this.token, branchId, item };
  }

  getPaging(filter: PendingInvoiceFilter, branchId?: number) {
    return this.http.post(`${environment.apiUrl}/api/pendingInvoice/getPaging`, this.wrap(filter, branchId)).pipe(
      map((r: any) => { if (r.code == '401') this.authService.logout(); else return r; }),
      catchError(this.handleError));
  }

  getById(id: number) {
    return this.http.post(`${environment.apiUrl}/api/pendingInvoice/getById`, this.wrap({ id })).pipe(
      map((r: any) => { if (r.code == '401') this.authService.logout(); else return r; }),
      catchError(this.handleError));
  }

  createBatch(req: CreateBatchRequest, branchId?: number) {
    return this.http.post(`${environment.apiUrl}/api/pendingInvoice/createBatch`, this.wrap(req, branchId)).pipe(
      map((r: any) => { if (r.code == '401') this.authService.logout(); else return r; }),
      catchError(this.handleError));
  }

  /** List hóa đơn chưa dùng cho modal picker (mở từ PaymentDetail). */
  getForPicker(filter: PendingInvoicePickerFilter, branchId?: number) {
    return this.http.post(`${environment.apiUrl}/api/pendingInvoice/getForPicker`, this.wrap(filter, branchId)).pipe(
      map((r: any) => { if (r.code == '401') this.authService.logout(); else return r; }),
      catchError(this.handleError));
  }

  reExtract(id: number) {
    return this.http.post(`${environment.apiUrl}/api/pendingInvoice/reExtract`, this.wrap({ id })).pipe(
      map((r: any) => { if (r.code == '401') this.authService.logout(); else return r; }),
      catchError(this.handleError));
  }

  /** Người tạo sửa tay thông tin hóa đơn đã đọc (chỉ khi Status=0). */
  update(entity: PendingInvoice) {
    return this.http.post(`${environment.apiUrl}/api/pendingInvoice/updateInvoice`, this.wrap(entity)).pipe(
      map((r: any) => { if (r.code == '401') this.authService.logout(); else return r; }),
      catchError(this.handleError));
  }

  delete(id: number) {
    return this.http.post(`${environment.apiUrl}/api/pendingInvoice/delete`, this.wrap({ id })).pipe(
      map((r: any) => { if (r.code == '401') this.authService.logout(); else return r; }),
      catchError(this.handleError));
  }

  /** Build PendingInvoiceCreateItem từ InvoiceExtractionResult (modal đọc hóa đơn → save). */
  static fromExtractionResult(r: InvoiceExtractionResult): PendingInvoiceCreateItem {
    return {
      tempFileName: r.tempFileName,
      fileName: r.fileName,
      vendorName: r.vendorName,
      taxNumber: r.vendorTaxId,
      vendorAddress: r.vendorAddress,
      vendorPhone: r.vendorPhone,
      customerName: r.customerName,
      customerTaxId: r.customerTaxId,
      customerAddress: r.customerAddress,
      invoiceNo: r.invoiceId,
      invoicePattern: r.invoiceSymbol,
      invoiceDate: r.invoiceDate,
      paymentMethod: r.paymentMethod,
      web: r.webLink,
      code: r.webCode,
      totalAmount: r.totalAmount,
      netAmount: r.netAmount,
      taxAmount: r.taxAmount,
      currency: r.currency,
      lineItemsJson: JSON.stringify(r.lineItems ?? []),
      promptTokens: r.promptTokens,
      completionTokens: r.completionTokens,
      totalTokens: r.totalTokens,
    };
  }
}
