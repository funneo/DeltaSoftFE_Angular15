import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from '../base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Payments, FromBodyBase, Pagination, ResponseValue, PaymentDetail } from '../../models';
import { JwtService } from '../jwt.service';
import { AuthService } from '../auth.service';


@Injectable({ providedIn: 'root' })
export class PaymentsService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: Payments) {
    let p: FromBodyBase<Payments> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/payments/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  /**
   * Duyệt nháp (draft.DraftEntries) thành Thanh toán thật — Phase 4 Draft Site.
   * Gửi id = draftId + item = entity đã map; BE tạo phiếu xong tự ghi ngược draft
   * (Status='Promoted' + refNo + paymentId). Trả { paymentId, refNo, alreadyPromoted }.
   */
  addFromDraft(entity: Payments, draftId: number) {
    let p: FromBodyBase<Payments> = {};
    p.item = entity;
    p.id = '' + draftId;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/payments/addFromDraft`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  update(entity: Payments) {
    let p: FromBodyBase<Payments> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/payments/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }


  updateDetail(entity: PaymentDetail) {
    let p: FromBodyBase<PaymentDetail> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/payments/updateDetail`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getDetail(id: number) {
    let p: FromBodyBase<Payments> = {};
    p.id = id.toString();
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/payments/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getUserAccept(id: number) {
    let p: FromBodyBase<Payments> = {};
    p.id = id.toString();
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/payments/GetUserAccept`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getByRefNo(ref: string) {
    debugger;
    let p: FromBodyBase<Payments> = { item: {} };
    p.item.refNo = ref;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/payments/getbyrefno`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  getApprovedLogById(id: number) {
    let p: FromBodyBase<Payments> = { item: {} };
    p.item.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/payments/getApprovedLogById`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  getApprovedLogByType(id: number, refCode: string) {
    let p: FromBodyBase<Payments> = { item: {} };
    p.item.id = id;
    p.gType = refCode;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/payments/getApprovedLogByType`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  getNonPaymented(id: number) {
    let p: FromBodyBase<PaymentDetail> = { item: {} };
    p.item.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/payments/GetDetailNonPaymented`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getDebtInvoice(params: HttpParams) {
    let p: FromBodyBase<PaymentDetail> = {
      tokenKey: this.token,
    };
    p.keyWord = params.get('keyword');
    p.branchId = Number.parseInt(params.get('branchId'));
    return this.http.post(`${environment.apiUrl}/api/payments/getdebtinvoice`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  delete(listId: string) {
    let p: FromBodyBase<Payments> = {};
    p.listId = listId;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/payments/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getAll(params: HttpParams) {
    let p: FromBodyBase<Payments> = {};
    p.tokenKey = this.token;
    p.employeeId = Number.parseInt(params.get('employeeId'));
    p.id = params.get('id');
    return this.http.post(`${environment.apiUrl}/api/payments/getall`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<Payments> = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.employeeId = Number.parseInt(params.get('employeeId'));
    p.branchId = Number.parseInt(params.get('branchId'));
    p.gType = params.get('type');
    p.tValue = Number.parseInt(params.get('isDirectPayment'));
    return this.http.post(`${environment.apiUrl}/api/payments/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  accept(entity: Payments) {
    let p: FromBodyBase<Payments> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/payments/accept`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  acceptStep(entity: PaymentDetail) {
    let p: FromBodyBase<PaymentDetail> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/payments/acceptStep`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getPaymentByJob(params: HttpParams) {
    let p: FromBodyBase<PaymentDetail> = {
      tokenKey: this.token,
      item: {}
    };
    p.item.branchId = Number.parseInt(params.get('branchId'));
    p.item.shipmentId = Number.parseInt(params.get('shipmentId'));
    p.item.jobId = params.get('jobId');
    return this.http.post(`${environment.apiUrl}/api/payments/getpaymentbyJob`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getAccept(params: HttpParams) {
    let p: FromBodyBase<PaymentDetail> = {
      tokenKey: this.token,
      item: { step: Number.parseInt(params.get('step')) }
    };
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.branchId = Number.parseInt(params.get('branchId'));
    p.gType = params.get('type');
    return this.http.post(`${environment.apiUrl}/api/payments/get-accept`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getAcceptStep2(params: HttpParams) {
    let p: FromBodyBase<PaymentDetail> = {
      tokenKey: this.token,
      item: { step: Number.parseInt(params.get('step')) }
    };
    p.keyWord = params.get('keyword');
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.branchId = Number.parseInt(params.get('branchId'));
    p.gType = params.get('type');
    return this.http.post(`${environment.apiUrl}/api/payments/get-accept-step2`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }


  getAcceptStep1(params: HttpParams) {
    let p: FromBodyBase<PaymentDetail> = {
      tokenKey: this.token,
    };
    p.branchId = Number.parseInt(params.get('branchId'));
    return this.http.post(`${environment.apiUrl}/api/payments/get-accept-step1`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getDetailNonPaymented(params: HttpParams) {
    let p: FromBodyBase<Payments> = { item: {} };
    p.tokenKey = this.token;
    p.item.id = Number.parseInt(params.get('id'));
    return this.http.post(`${environment.apiUrl}/api/payments/getDetailNonPaymented`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
}

