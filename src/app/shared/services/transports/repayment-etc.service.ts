import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtService } from '../jwt.service';
import { AuthService } from '../auth.service';
import { BaseService } from '../base.service';
import { RepaymentEtc } from '@app/shared/models/transports/repayment-etc.model';
import { FromBodyBase } from '@app/shared/models';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RepaymentEtcService extends BaseService{
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token=jwtService.getToken();
  }

  add(entity:RepaymentEtc){
    let p: FromBodyBase<RepaymentEtc> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/RepaymentEtc/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   update(entity:RepaymentEtc){
    let p: FromBodyBase<RepaymentEtc> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/RepaymentEtc/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   updateState(entity:RepaymentEtc){
    let p: FromBodyBase<RepaymentEtc> = {};
    p.item =entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/RepaymentEtc/updatestate`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   getDetail(id: number) {
    let p: FromBodyBase<RepaymentEtc> = {item:{}};
    p.item.id=id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/RepaymentEtc/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  delete(id: number) {
    let p: FromBodyBase<RepaymentEtc> = {item:{}};
    p.item.id=id;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/RepaymentEtc/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getPaging(params:HttpParams) {
    let p: FromBodyBase<RepaymentEtc> = {item:{}};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate=params.get('fromDate')
    p.toDate=params.get('toDate')
    p.keyWord=params.get('keyword')
    p.branchId =Number.parseInt(params.get('branchid'));
    return this.http.post(`${environment.apiUrl}/api/RepaymentEtc/getpaging`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  exportDetail(params:HttpParams) {
    let p: FromBodyBase<RepaymentEtc> = {item:{}};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate=params.get('fromDate')
    p.toDate=params.get('toDate')
    p.keyWord=params.get('keyword')
    p.branchId =Number.parseInt(params.get('branchid'));
    return this.http.post(`${environment.apiUrl}/api/RepaymentEtc/exportDetail`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
}
