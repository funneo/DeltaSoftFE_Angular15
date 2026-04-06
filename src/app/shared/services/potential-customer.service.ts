import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { PotentialCustomer, FromBodyBase, Pagination } from '../models';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PotentialCustomerService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: PotentialCustomer) {
    let p: FromBodyBase<PotentialCustomer> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/PotentialCustomer/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  update(entity: PotentialCustomer) {
    let p: FromBodyBase<PotentialCustomer> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/PotentialCustomer/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getDetail(id: string) {
    let p: FromBodyBase<PotentialCustomer> = {};
    p.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/PotentialCustomer/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  delete(listId: string) {
    let p: FromBodyBase<PotentialCustomer> = {};
    p.listId = listId;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/PotentialCustomer/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getAll(params: HttpParams) {
    let p: FromBodyBase<PotentialCustomer> = {
      tokenKey:this.token,
      item:{}
    };
    p.keyWord = params.get('keyword');
    p.employeeId= parseInt(params.get('employeeId'));
    p.branchId=parseInt(params.get('branchId'));
    return this.http.post(`${environment.apiUrl}/api/PotentialCustomer/getall`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<PotentialCustomer> = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.employeeId = Number.parseInt(params.get('employeeId'));
    p.branchId = Number.parseInt(params.get('branchId'));
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    return this.http.post(`${environment.apiUrl}/api/PotentialCustomer/getpaging`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  accept(id: string) {
    let p: FromBodyBase<PotentialCustomer> = {};
    p.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/PotentialCustomer/accept`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

}

