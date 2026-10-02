import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { JwtService } from '../jwt.service';
import { FromBodyBase } from '@app/shared/models';
import { GaragePaymentRequest } from '@app/shared/models/accounting/garage-payment-request.model';
import { environment } from '@environments/environment';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../auth.service';

// F051 — Thu chi yêu cầu Xưởng (chỉ đọc; viết phiếu đi qua AccountsService.add với typeAccount=8)
@Injectable({
  providedIn: 'root'
})
export class GaragePaymentRequestService extends BaseService {
  private token: string;
  constructor(
    private http: HttpClient,
    jwtService: JwtService,
    private authService: AuthService
  ) {
    super();
    this.token = jwtService.getToken();
  }

  // params: keyword, branchId (0/rỗng = tất cả), direction (1 Chi | 0 Thu), status (rỗng = tất cả),
  //         fromDate/toDate (YYYYMMDD, rỗng = không lọc ngày), pageIndex, pageSize (0 = lấy hết)
  getPaging(params: HttpParams) {
    const num = (key: string) => {
      const v = params.get(key);
      return v == null || v === '' ? undefined : Number.parseInt(v);
    };
    let p: FromBodyBase<GaragePaymentRequest> = {
      tokenKey: this.token,
      keyWord: params.get('keyword') ?? '',
      branchId: num('branchId'),
      fromDate: params.get('fromDate') || undefined,
      toDate: params.get('toDate') || undefined,
      pageIndex: num('pageIndex') ?? 1,
      pageSize: num('pageSize') ?? 0,
      item: { direction: num('direction'), status: num('status') }
    };
    return this.http.post(`${environment.apiUrl}/api/GaragePaymentRequest/GetPaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401') this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getById(id: number) {
    let p: FromBodyBase<GaragePaymentRequest> = { id: id.toString(), tokenKey: this.token };
    return this.http.post(`${environment.apiUrl}/api/GaragePaymentRequest/GetById`, p)
      .pipe(map((response: any) => {
        if (response.code == '401') this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
}
