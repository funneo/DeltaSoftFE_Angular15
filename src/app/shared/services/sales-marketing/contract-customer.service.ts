import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from '../base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { ContractCustomer, FromBodyBase, Pagination } from '../../models';
import { JwtService } from '../jwt.service';
import { AuthService } from '../auth.service';

@Injectable({ providedIn: 'root' })
export class ContractCustomerService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: ContractCustomer) {
    let p: FromBodyBase<ContractCustomer> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/ContractCustomer/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  update(entity: ContractCustomer) {
    let p: FromBodyBase<ContractCustomer> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/ContractCustomer/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  updateApprove(entity: ContractCustomer) {
    let p: FromBodyBase<ContractCustomer> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/ContractCustomer/updateApprove`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getDetail(id: string) {
    let p: FromBodyBase<ContractCustomer> = {};
    p.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/ContractCustomer/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  delete(listId: string) {
    let p: FromBodyBase<ContractCustomer> = {};
    p.listId = listId;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/ContractCustomer/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getAll(params: HttpParams) {
    let p: FromBodyBase<ContractCustomer> = {
      tokenKey:this.token,
      item:{}
    };
    p.keyWord = params.get('keyword');
    p.branchId = Number.parseInt(params.get('branchId'));
    p.customerId = Number.parseInt(params.get('customerId'));
    return this.http.post(`${environment.apiUrl}/api/ContractCustomer/getall`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  
  getAllExpired(params: HttpParams) {
    let p: FromBodyBase<ContractCustomer> = {
      tokenKey:this.token,
      item:{}
    };
    p.keyWord = params.get('keyword');
    p.branchId = Number.parseInt(params.get('branchId'));
    p.customerId = Number.parseInt(params.get('customerId'));
    return this.http.post(`${environment.apiUrl}/api/ContractCustomer/GetExpired`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<ContractCustomer> = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.customerId = Number.parseInt(params.get('customerId'));
    p.branchId = Number.parseInt(params.get('branchId'));
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    return this.http.post(`${environment.apiUrl}/api/ContractCustomer/getpaging`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  accept(id: string,keyWord:string=null) {
    let p: FromBodyBase<ContractCustomer> = {};
    p.id = id;
    p.keyWord=keyWord;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/ContractCustomer/accept`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  acceptStep(item:ContractCustomer,keyWord:string=null) {
    let p: FromBodyBase<ContractCustomer> = {item:{}};
    p.item = item;
    p.keyWord=keyWord;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/ContractCustomer/acceptStep`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

}

