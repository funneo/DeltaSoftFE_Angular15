import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { EmployeeDebit, FromBodyBase, Pagination, ResponseValue } from '../models';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class EmployeeDebitService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  getDetail(params: HttpParams) {
    let p: FromBodyBase<EmployeeDebit> = {
      tokenKey: this.token,
      item: {}
    };
    p.employeeId = Number.parseInt(params.get('employeeId'));
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    if (params.has('isTransfer')) {
      p.item.isTransfer = params.get('isTransfer') === 'true';
    }
    return this.http.post(`${environment.apiUrl}/api/employeedebit/getdetail`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  report01(params: HttpParams) {
    let p: FromBodyBase<EmployeeDebit> = {
      tokenKey: this.token,
      item: {}
    };
    p.keyWord = params.get('keyword');
    p.fromDate = params.get('fromDate');
    p.branchId = Number.parseInt(params.get('branchId'));
    p.item.employeeId = Number.parseInt(params.get('employeeId'));
    if (params.has('isTransfer')) {
      p.item.isTransfer = params.get('isTransfer') === 'true';
    }
    return this.http.post(`${environment.apiUrl}/api/employeedebit/GetReport01`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  report02(params: HttpParams) {
    let p: FromBodyBase<EmployeeDebit> = {
      tokenKey: this.token,
      item: {}
    };
    p.keyWord = params.get('keyword');
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.branchId = Number.parseInt(params.get('branchId'));
    p.item.employeeId = Number.parseInt(params.get('employeeId'));
    if (params.has('isTransfer')) {
      p.item.isTransfer = params.get('isTransfer') === 'true';
    }
    return this.http.post(`${environment.apiUrl}/api/employeedebit/GetReport02`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  reportDetail(params: HttpParams) {
    let p: FromBodyBase<EmployeeDebit> = {
      tokenKey: this.token,
      item: {}
    };
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.item.employeeId = Number.parseInt(params.get('employeeId'));
    return this.http.post(`${environment.apiUrl}/api/employeedebit/GetReportDetail`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  getPaging(params: HttpParams) {
    let p: FromBodyBase<EmployeeDebit> = {
      tokenKey: this.token,
      item: {}
    };
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.branchId = Number.parseInt(params.get('branchId'));
    return this.http.post(`${environment.apiUrl}/api/employeedebit/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  exportExcel(params: HttpParams) {
    let p: FromBodyBase<EmployeeDebit> = {
      tokenKey: this.token,
      item: {}
    };
    p.employeeId = Number.parseInt(params.get('employeeId'));
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    return this.http.post(`${environment.apiUrl}/api/employeedebit/export-excel-detail`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getAll(params: HttpParams) {
    let p: FromBodyBase<EmployeeDebit> = {
      tokenKey: this.token,
      item: {}
    };
    p.employeeId = Number.parseInt(params.get('employeeId'));
    p.toDate = params.get('toDate');
    return this.http.post(`${environment.apiUrl}/api/employeedebit/getall`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
}

