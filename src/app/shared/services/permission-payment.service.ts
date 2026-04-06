import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { PermissionPayment, FromBodyBase, Pagination } from '../models';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PermissionPaymentService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: PermissionPayment) {
    let p: FromBodyBase<PermissionPayment> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/PermissionPayment/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  update(entity: PermissionPayment) {
    let p: FromBodyBase<PermissionPayment> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/PermissionPayment/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getDetail(id: string) {
    let p: FromBodyBase<PermissionPayment> = {};
    p.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/PermissionPayment/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  delete(listId: string) {
    let p: FromBodyBase<PermissionPayment> = {};
    p.listId = listId;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/PermissionPayment/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getAll(params: HttpParams) {
    let p: FromBodyBase<PermissionPayment> = {
      tokenKey:this.token,
      item:{}
    };
    p.userName = params.get('userName');
    p.branchId=Number.parseInt(params.get('branchId'));
    return this.http.post(`${environment.apiUrl}/api/PermissionPayment/getall`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<PermissionPayment> = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.branchId=Number.parseInt(params.get('branchId'));
    return this.http.post(`${environment.apiUrl}/api/PermissionPayment/getpaging`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  setPermissionPM(list: PermissionPayment[]): void {
    localStorage.removeItem('PM');
    localStorage.setItem('PM', JSON.stringify(list));
  }

  getPermissionPM(): PermissionPayment[] {
      const cs = localStorage.getItem('PM');
      if (cs != null) {
        return JSON.parse(cs);
      }
      return [];
    }
}

