import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { FromBodyBase } from '../models';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';
import { CanonQuotationsubcontractors } from '../models/transports/canon-quotationsubcontractors.model';

@Injectable({ providedIn: 'root' })
export class CanonQuotationsubcontractorsService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: CanonQuotationsubcontractors) {
    let p: FromBodyBase<CanonQuotationsubcontractors> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/canonquotationsubcontractors/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  update(entity: CanonQuotationsubcontractors) {
    let p: FromBodyBase<CanonQuotationsubcontractors> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/canonquotationsubcontractors/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getDetail(id: number) {
    let p: FromBodyBase<CanonQuotationsubcontractors> = {};
    p.item = { id: id };
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/canonquotationsubcontractors/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  delete(id: number) {
    let p: FromBodyBase<CanonQuotationsubcontractors> = {};
    p.item = { id: id };
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/canonquotationsubcontractors/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getAll(params: HttpParams) {
    let p: FromBodyBase<CanonQuotationsubcontractors> = {
      tokenKey: this.token,
      branchId: Number.parseInt(params.get('branchid')),
      item: { supplierId: Number.parseInt(params.get('supplierId') || '0') }
    };
    return this.http.post(`${environment.apiUrl}/api/canonquotationsubcontractors/getall`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<CanonQuotationsubcontractors> = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.branchId = Number.parseInt(params.get('branchid'));
    p.userId = this.authService.getLoggedInUser().id;
    p.item = { supplierId: Number.parseInt(params.get('supplierId') || '0') };

    return this.http.post(`${environment.apiUrl}/api/canonquotationsubcontractors/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  setApproved(entity: CanonQuotationsubcontractors, type: number) {
    let p: FromBodyBase<CanonQuotationsubcontractors> = {};
    p.item = entity;
    p.tokenKey = this.token;
    p.gType = type.toString();
    return this.http.post(`${environment.apiUrl}/api/canonquotationsubcontractors/SetApproved`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  setLocked(id: number, isLocked: boolean) {
    let p: FromBodyBase<CanonQuotationsubcontractors> = {};
    p.item = { id: id, isLocked: isLocked };
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/canonquotationsubcontractors/setLocked`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  extend(id: number, validUntil: string) {
    let p: FromBodyBase<CanonQuotationsubcontractors> = {};
    p.item = { id: id, validUntil: validUntil };
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/canonquotationsubcontractors/extend`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
}
