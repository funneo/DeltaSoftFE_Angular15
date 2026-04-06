import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { ExportInvoice, FromBodyBase, Pagination, ResponseValue } from '../models';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ExportInvoiceService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: ExportInvoice) {
    let p: FromBodyBase<ExportInvoice> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/ExportInvoice/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  update(entity: ExportInvoice) {
    let p: FromBodyBase<ExportInvoice> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/ExportInvoice/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getDetail(id: string) {
    let p: FromBodyBase<ExportInvoice> = {};
    p.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/ExportInvoice/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  set(id: number,flag:boolean) {
      let p: FromBodyBase<ExportInvoice> = {item:{}};
      p.item.id = id;
      p.item.locked=flag;
      p.tokenKey = this.token;
      return this.http.post(`${environment.apiUrl}/api/ExportInvoice/set`, p)
        .pipe(map((response: any) => {
          if (response.code == '401')
            this.authService.logout();
          else return response;
        }), catchError(this.handleError));
    }

  delete(listId: string) {
    let p: FromBodyBase<ExportInvoice> = {};
    p.listId = listId;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/ExportInvoice/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getAll() {
    let p: FromBodyBase<ExportInvoice> = {};
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/ExportInvoice/getall`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<ExportInvoice> = {
      tokenKey: this.token,
      keyWord: params.get('keyword'),
      pageIndex: Number.parseInt(params.get('pageIndex')),
      pageSize: Number.parseInt(params.get('pageSize')),
      fromDate: params.get('fromDate'),
      toDate: params.get('toDate'),
      customerId: Number.parseInt(params.get('customerId')),
      branchId: Number.parseInt(params.get('branchId')),
      gType:params.get('iPayment')
    };

    return this.http.post(`${environment.apiUrl}/api/ExportInvoice/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getExport(params: HttpParams) {
    let p: FromBodyBase<ExportInvoice> = {
      tokenKey: this.token,
      fromDate: params.get('fromDate'),
      toDate: params.get('toDate'),
      customerId: Number.parseInt(params.get('customerId')),
      branchId: Number.parseInt(params.get('branchId')),
      gType:params.get('iPayment')
    };

    return this.http.post(`${environment.apiUrl}/api/ExportInvoice/GetExport`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  // accept(entity: ExportInvoice) {
  //   let p: FromBodyBase<ExportInvoice> = {};
  //   p.item = entity;
  //   p.tokenKey = this.token;
  //   return this.http.post(`${environment.apiUrl}/api/ExportInvoice/accept`, p)
  //     .pipe(map((response: any) => {
  //       if (response.code == '401')
  //         this.authService.logout();
  //       else return response;
  //     }), catchError(this.handleError));
  // }

}

