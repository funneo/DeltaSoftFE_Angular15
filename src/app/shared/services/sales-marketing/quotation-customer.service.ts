import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from '../base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { QuotationCustomer, FromBodyBase, Pagination } from '../../models';
import { JwtService } from '../jwt.service';
import { AuthService } from '../auth.service';

@Injectable({ providedIn: 'root' })
export class QuotationCustomerService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: QuotationCustomer) {
    let p: FromBodyBase<QuotationCustomer> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/QuotationCustomer/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  update(entity: QuotationCustomer) {
    let p: FromBodyBase<QuotationCustomer> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/QuotationCustomer/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  updateApprove(entity: QuotationCustomer) {
    let p: FromBodyBase<QuotationCustomer> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/QuotationCustomer/updateApprove`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getDetail(id: string) {
    let p: FromBodyBase<QuotationCustomer> = {};
    p.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/QuotationCustomer/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  delete(listId: string) {
    let p: FromBodyBase<QuotationCustomer> = {};
    p.listId = listId;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/QuotationCustomer/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getAll(params: HttpParams) {
    let p: FromBodyBase<QuotationCustomer> = {
      tokenKey:this.token,
      item:{}
    };
    p.keyWord = params.get('keyword');
    p.branchId = Number.parseInt(params.get('branchId'));
    p.customerId = Number.parseInt(params.get('customerId'));
    return this.http.post(`${environment.apiUrl}/api/QuotationCustomer/getall`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<QuotationCustomer> = {
      item:{}
    };
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.customerId = Number.parseInt(params.get('customerId'));
    p.branchId = Number.parseInt(params.get('branchId'));
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.item.type=Number.parseInt(params.get('type'));
    return this.http.post(`${environment.apiUrl}/api/QuotationCustomer/getpaging`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  accept(id: string,keyWord:string=null) {
    let p: FromBodyBase<QuotationCustomer> = {};
    p.id = id;
    p.keyWord=keyWord;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/QuotationCustomer/accept`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  acceptStep(item:QuotationCustomer) {
    let p: FromBodyBase<QuotationCustomer> = {item:{}};
    p.item = item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/QuotationCustomer/acceptStep`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

}

