import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FromBodyBase } from '@app/shared/models';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';
import { JwtService } from '../jwt.service';
import { AuthService } from '../auth.service';
import { BaseService } from '../base.service';
import { SalesCustomer } from '@app/shared/models/sales-marketing/sales-customer.model';

@Injectable({
  providedIn: 'root'
})
export class SalesCustomerService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: SalesCustomer) {
    let p: FromBodyBase<SalesCustomer> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/SalesCustomer/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  update(entity: SalesCustomer) {
    let p: FromBodyBase<SalesCustomer> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/SalesCustomer/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getDetail(id: number) {
    let p: FromBodyBase<SalesCustomer> = {item:{}};
    p.item.customerId=id
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/SalesCustomer/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  delete(id:number) {
    let p: FromBodyBase<SalesCustomer> = {item:{}};
    p.item.customerId=id;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/SalesCustomer/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getAll(params: HttpParams) {
    let p: FromBodyBase<SalesCustomer> = {
      tokenKey:this.token,
      item:{}
    };
    p.keyWord = params.get('keyword');
    p.item.customerType= parseInt(params.get('type'));
    p.branchId=parseInt(params.get('branchId'));
    return this.http.post(`${environment.apiUrl}/api/SalesCustomer/getall`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }



  accept(id: number) {
    let p: FromBodyBase<SalesCustomer> = {item:{}};
    p.item.customerId = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/SalesCustomer/accept`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  lock(id: number,lock:boolean) {
    let p: FromBodyBase<SalesCustomer> = {item:{}};
    p.item.customerId = id;
    p.item.lock=lock;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/SalesCustomer/lock`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  exportDk05(id: number) {
    let p: FromBodyBase<SalesCustomer> = {item:{}};
    p.item.customerId = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/SalesCustomer/exportdk05`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
}
