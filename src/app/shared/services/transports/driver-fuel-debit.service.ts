import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FromBodyBase } from '@app/shared/models';
import { DriverFuelDebit } from '@app/shared/models/transports/driver-fuel-debit.model';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { BaseService } from '../base.service';
import { JwtService } from '../jwt.service';

@Injectable({
  providedIn: 'root'
})
export class DriverFuelDebitService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  getDetail(params: HttpParams) {
    let p: FromBodyBase<DriverFuelDebit> = {
      tokenKey:this.token,
      item:{}
    };
    p.employeeId=Number.parseInt(params.get('employeeId'));
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate=params.get('fromDate');
    p.toDate=params.get('toDate');
    return this.http.post(`${environment.apiUrl}/api/driverfueldebit/getdetail`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<DriverFuelDebit> = {
      tokenKey:this.token,
      item:{}
    };
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate=params.get('fromDate');
    p.toDate=params.get('toDate');
    p.branchId=Number.parseInt(params.get('branchId'));
    return this.http.post(`${environment.apiUrl}/api/driverfueldebit/getpaging`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  exportExcel(params: HttpParams) {
    let p: FromBodyBase<DriverFuelDebit> = {
      tokenKey:this.token,
      item:{}
    };
    p.employeeId=Number.parseInt(params.get('driverId'));
    p.item.driverId=Number.parseInt(params.get('driverId'));
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate=params.get('fromDate');
    p.toDate=params.get('toDate');
    return this.http.post(`${environment.apiUrl}/api/employeedebit/export-excel-detail`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getAll(params: HttpParams) {
    let p: FromBodyBase<DriverFuelDebit> = {
      tokenKey:this.token,
      item:{}
    };
    p.item.driverId=Number.parseInt(params.get('driverId'));
    p.employeeId=Number.parseInt(params.get('driverId'));
    p.toDate=params.get('toDate');
    return this.http.post(`${environment.apiUrl}/api/driverfuledebit/getall`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
}
