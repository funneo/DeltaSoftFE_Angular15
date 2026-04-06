import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Debt, FromBodyBase, Pagination, ResponseValue } from '../models';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';
import { type } from 'os';

@Injectable({ providedIn: 'root' })
export class DebtService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: Debt) {
    let p: FromBodyBase<Debt> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Debt/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  addfromDebitnotes(entity: Debt) {
    let p: FromBodyBase<Debt> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Debt/CreateFromDebitNotes`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  update(entity: Debt) {
    let p: FromBodyBase<Debt> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Debt/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getDetail(id: string) {
    let p: FromBodyBase<Debt> = {};
    p.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Debt/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  delete(listId: string) {
    let p: FromBodyBase<Debt> = {};
    p.listId = listId;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/Debt/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  set(id: number,type:number) {
    let p: FromBodyBase<Debt> = {item:{}};
    p.item.id = id;
    p.tValue=type;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/Debt/set`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getAll() {
    let p: FromBodyBase<Debt> = {};
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Debt/getall`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<Debt> = {
      tokenKey: this.token,
      keyWord: params.get('keyword'),
      pageIndex: Number.parseInt(params.get('pageIndex')),
      pageSize: Number.parseInt(params.get('pageSize')),
      fromDate: params.get('fromDate'),
      toDate: params.get('toDate'),
      customerId: Number.parseInt(params.get('customerId')),
      branchId: Number.parseInt(params.get('branchId')),
      item:{
        refType:params.get('refType'),
        type:parseInt(params.get('type'))
      }
    };
    return this.http.post(`${environment.apiUrl}/api/Debt/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getReport(params: HttpParams) {
    let p: FromBodyBase<Debt> = {
      tokenKey: this.token,
      keyWord: params.get('keyword'),
      pageIndex: Number.parseInt(params.get('pageIndex')),
      pageSize: Number.parseInt(params.get('pageSize')),
      fromDate: params.get('fromDate'),
      toDate: params.get('toDate'),
      customerId: Number.parseInt(params.get('customerId')),
      branchId: Number.parseInt(params.get('branchId')),
      item:{
        refType:params.get('refType'),
        type:parseInt(params.get('type'))
      }
    };
    return this.http.post(`${environment.apiUrl}/api/Debt/getreport`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }


  // accept(entity: Debt) {
  //   let p: FromBodyBase<Debt> = {};
  //   p.item = entity;
  //   p.tokenKey = this.token;
  //   return this.http.post(`${environment.apiUrl}/api/Debt/accept`, p)
  //     .pipe(map((response: any) => {
  //       if (response.code == '401')
  //         this.authService.logout();
  //       else return response;
  //     }), catchError(this.handleError));
  // }
}

