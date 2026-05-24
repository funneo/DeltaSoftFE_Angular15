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
  fileName?: string;   // tên file gốc (khi đọc từ ZIP/RAR)
  error?: string;      // có giá trị nếu file đó lỗi
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

  // Nhận 1 file lẻ (ảnh/PDF) hoặc 1 file nén ZIP/RAR -> trả mảng kết quả
  extractInvoices(file: File): Observable<InvoiceExtractionResult[]> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<InvoiceExtractionResult[]>(
      `${environment.apiUrl}/api/geminiAI/extract-invoices`,
      formData
    ).pipe(catchError(this.handleError));
  }
}
