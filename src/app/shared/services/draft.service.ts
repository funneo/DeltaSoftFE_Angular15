import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { BaseService } from './base.service';
import { JwtService } from './jwt.service';

/**
 * Đọc nháp từ draft.DraftEntries cho list ERP. Chỉ READ.
 * BE: POST /api/draft/getPagingForErp — trả về IEnumerable<DraftEntryViewModel>.
 * Payload là JSON string — FE tự parse.
 */
export interface DraftFilterRequest {
  tokenKey?: string;
  draftType?: string;          // 'Shipment' / 'Payment' / 'Workflow' / 'Debit'
  shipmentType?: number | null; // 1176 = Canon; truyền !=1176 (vd 0) để loại trừ Canon
  keyword?: string;
  fromDate?: string | null;     // ISO 8601 hoặc 'YYYY-MM-DD'
  toDate?: string | null;
  branchId?: number | null;     // lọc theo chi nhánh đang chọn trên màn (NULL=tất cả)
  pageIndex?: number;
  pageSize?: number;
}

/** Input sửa nháp từ ERP — POST /api/draft/updateDraft. Chỉ ghi schema draft, KHÔNG promote. */
export interface DraftUpdateRequest {
  tokenKey?: string;
  id: number;                   // Id nháp (draft.DraftEntries.Id)
  payload: string;              // JSON string entity đã sửa
  customerName?: string | null; // cột phẳng để list (optional)
  totalAmount?: number | null;  // cột phẳng (optional)
  refHint?: string | null;      // cột phẳng (optional)
}

export interface DraftEntryView {
  id: number;
  draftType: string;
  payload: string;              // JSON string
  status: string;
  source: string;
  branchId?: number;
  createdBy?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  promotedRefNo?: string;
  promotedAt?: string;
  customerName?: string;
  totalAmount?: number;
  refHint?: string;
  totalRows?: number;
}

@Injectable({ providedIn: 'root' })
export class DraftService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  getPagingForErp(filter: DraftFilterRequest) {
    const body: DraftFilterRequest = {
      ...filter,
      tokenKey: this.token,
      pageIndex: filter.pageIndex ?? 1,
      pageSize: filter.pageSize ?? 99999,
    };
    return this.http.post(`${environment.apiUrl}/api/draft/getPagingForErp`, body).pipe(
      map((r: any) => { if (r.code == '401') this.authService.logout(); else return r; }),
      catchError(this.handleError));
  }

  /** Sửa Payload 1 nháp còn 'Draft' (người duyệt chỉnh trước khi promote). */
  updateDraft(req: DraftUpdateRequest) {
    const body: DraftUpdateRequest = { ...req, tokenKey: this.token };
    return this.http.post(`${environment.apiUrl}/api/draft/updateDraft`, body).pipe(
      map((r: any) => { if (r.code == '401') this.authService.logout(); else return r; }),
      catchError(this.handleError));
  }
}
