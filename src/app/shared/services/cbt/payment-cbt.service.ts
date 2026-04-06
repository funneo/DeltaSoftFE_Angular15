import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { JwtService } from '../jwt.service';
import { AuthService } from '../auth.service';
import { PaymentCbt } from '@app/shared/models/cbt/payment-cbt.model';
import { FromBodyBase } from '@app/shared/models';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PaymentCbtService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: PaymentCbt) {
    let p: FromBodyBase<PaymentCbt> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/PaymentCbt/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  update(entity: PaymentCbt) {
    let p: FromBodyBase<PaymentCbt> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/PaymentCbt/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getDetail(id: number) {
    let p: FromBodyBase<PaymentCbt> = {};
    p.id = id.toString();
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/PaymentCbt/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getbyRefno(refno: string) {
    let p: FromBodyBase<PaymentCbt> = {item:{}};
    p.item.refNo = refno;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/PaymentCbt/getByRefNo`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  delete(id: number) {
    let p: FromBodyBase<PaymentCbt> = {item:{id:id}};
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/PaymentCbt/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }


  getAll(params: HttpParams) {
    let p: FromBodyBase<PaymentCbt> = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.fromDate=params.get('fromDate');
    p.toDate=params.get('toDate');
    p.employeeId=Number.parseInt(params.get('employeeId'));
    p.branchId=Number.parseInt(params.get('branchId'));
    p.gType = params.get('type');
    return this.http.post(`${environment.apiUrl}/api/PaymentCbt/getall`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }


  acceptStep(entity: PaymentCbt) {
    let p: FromBodyBase<PaymentCbt> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/PaymentCbt/AcceptStep`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getAccept(params: HttpParams) {
    let p: FromBodyBase<PaymentCbt> = {
      tokenKey:this.token,
      item:{step:Number.parseInt(params.get('step'))}
    };
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.branchId = Number.parseInt(params.get('branchId'));
    p.gType = params.get('type');
    return this.http.post(`${environment.apiUrl}/api/PaymentCbt/get-accept`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
}
