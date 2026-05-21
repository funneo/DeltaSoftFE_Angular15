import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Advance, FromBodyBase, Pagination, ResponseValue } from '../models';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AdvanceService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: Advance) {
    let p: FromBodyBase<Advance> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/advance/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  update(entity: Advance) {
    let p: FromBodyBase<Advance> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/advance/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getDetail(id: string) {
    let p: FromBodyBase<Advance> = {};
    p.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/advance/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  delete(listId: string) {
    let p: FromBodyBase<Advance> = {};
    p.listId = listId;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/advance/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getAll(params: HttpParams) {
    let p: FromBodyBase<Advance> = {};
    p.tokenKey = this.token;
    p.employeeId = Number.parseInt(params.get('employeeId'));
    p.id = params.get('id');
    return this.http.post(`${environment.apiUrl}/api/advance/getall`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<Advance> = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.employeeId = Number.parseInt(params.get('employeeId'));
    p.branchId = Number.parseInt(params.get('branchId'));
    let isTransfer = params.get('isTransfer');
    let supplierId = params.get('supplierId');
    p.item = {
      acceptStep: Number.parseInt(params.get('step')),
      isTransfer: isTransfer ? Boolean(JSON.parse(isTransfer)) : null,
      supplierId: supplierId ? Number.parseInt(supplierId) : null
    }
    return this.http.post(`${environment.apiUrl}/api/advance/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  accept(entity: Advance) {
    let p: FromBodyBase<Advance> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/advance/accept`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
}

