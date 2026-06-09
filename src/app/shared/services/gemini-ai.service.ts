import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

export interface InvoiceExtractionResult {
  vendorName: string;
  vendorTaxId: string;
  vendorAddress: string;
  vendorPhone: string;
  customerName: string;
  customerTaxId: string;
  customerAddress: string;
  invoiceId: string;
  invoiceSymbol: string;
  invoiceDate: string;
  paymentMethod: string;
  totalAmount: number;
  taxAmount: number;
  netAmount: number;
  currency: string;
  webLink: string;
  webCode: string;
  lineItems: InvoiceItem[];
  rawJson: string;
  fileName?: string;        // tên file gốc (khi đọc từ ZIP/RAR)
  error?: string;           // có giá trị nếu file đó lỗi
  tempFileName?: string;    // tên file lưu local trong folder uploadId — dùng để retry
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  isDuplicate?: boolean;
  duplicates?: InvoiceDuplicateRef[];
}

export interface InvoiceDuplicateRef {
  paymentId: number;
  paymentRefNo: string;
  paymentRefDate?: string;
  paymentStatus?: number;
}

export interface ExtractInvoicesResponse {
  uploadId: string;
  results: InvoiceExtractionResult[];
}

@Injectable({
  providedIn: 'root'
})
export class GeminiAiService extends BaseService {
  constructor(private http: HttpClient) {
    super();
  }

  extractInvoice(file: File): Observable<InvoiceExtractionResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<InvoiceExtractionResult>(
      `${environment.apiUrl}/api/geminiAI/extract-invoice`,
      formData
    ).pipe(catchError(this.handleError));
  }

  // Nhận 1 file lẻ (ảnh/PDF) hoặc 1 file nén ZIP/RAR.
  // BE lưu mỗi entry vào UploadFiles/InvoiceTemp/<uploadId>/ + trả { uploadId, results }.
  // FE giữ uploadId để retry chỉ file lỗi sau này (không upload lại).
  extractInvoices(file: File): Observable<ExtractInvoicesResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ExtractInvoicesResponse>(
      `${environment.apiUrl}/api/geminiAI/extract-invoices`,
      formData
    ).pipe(catchError(this.handleError));
  }

  // Đọc lại Gemini chỉ những TempFileName chỉ định. 410 = phiên hết hạn -> upload lại.
  retryInvoices(uploadId: string, tempFileNames: string[]): Observable<InvoiceExtractionResult[]> {
    return this.http.post<InvoiceExtractionResult[]>(
      `${environment.apiUrl}/api/geminiAI/extract-invoices-retry`,
      { uploadId, tempFileNames }
    ).pipe(catchError(this.handleError));
  }

  // Xóa folder temp (gọi khi đóng modal mà không lưu).
  discardUpload(uploadId: string): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/api/geminiAI/extract-invoices-discard`,
      { uploadId }
    ).pipe(catchError(this.handleError));
  }
}
