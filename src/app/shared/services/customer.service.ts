import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Customer, FromBodyBase, Pagination } from '../models';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';
import { SignalRService } from './signalr.service';
import { CacheConstants } from '../constants/cache.constants';

@Injectable({ providedIn: 'root' })
export class CustomerService extends BaseService {
  private token: string;
  constructor(
    private http: HttpClient,
    jwtService: JwtService,
    private authService: AuthService,
    private cacheService: CacheService,
    private signalRService: SignalRService
  ) {
    super();
    this.token = jwtService.getToken();
    this.cacheService.registerEntity(CacheConstants.CUSTOMER, /customers_.*/);
  }

  add(entity: Customer) {
    let p: FromBodyBase<Customer> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/customer/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.CUSTOMER);
          }
        }),
        catchError(this.handleError));
  }

  update(entity: Customer) {
    let p: FromBodyBase<Customer> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/customer/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.CUSTOMER);
          }
        }),
        catchError(this.handleError));
  }

  updateTeamId(entity: Customer) {
    let p: FromBodyBase<Customer> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/customer/updateTeamId`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.CUSTOMER);
          }
        }),
        catchError(this.handleError));
  }

  getDetail(id: string) {
    let p: FromBodyBase<Customer> = {};
    p.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/customer/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getByJobId(id: number, type: number) {
    let p: FromBodyBase<Customer> = { item: {} };
    p.item.id = id;
    p.tokenKey = this.token;
    p.tValue = type;
    return this.http.post(`${environment.apiUrl}/api/customer/getByJobId`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  delete(listId: string) {
    let p: FromBodyBase<Customer> = {};
    p.listId = listId;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/customer/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.CUSTOMER);
          }
        }),
        catchError(this.handleError));
  }

  getAll(params: HttpParams, useCache: boolean = true) {
    let p: FromBodyBase<Customer> = {
      tokenKey: this.token,
      item: {}
    };
    p.keyWord = params.get('keyword');
    p.employeeId = parseInt(params.get('employeeId'));
    p.branchId = parseInt(params.get('branchId'));

    const cacheKey = `customers_all_${p.branchId || ''}_${p.employeeId || ''}_${p.keyWord || ''}`;

    const source = this.http.post(`${environment.apiUrl}/api/customer/getall`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));

    if (useCache) {
      return this.cacheService.get(cacheKey, source);
    }
    return source;
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<Customer> = { item: {} };
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.branchId = Number.parseInt(params.get('branchid'));
    p.item.locked = params.get('locked') == '1';
    return this.http.post(`${environment.apiUrl}/api/customer/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  accept(params: HttpParams) {
    let p: FromBodyBase<Customer> = {
      tokenKey: this.token,
      item: {}
    };
    p.item.reason = params.get('reason');
    p.id = params.get('id');

    return this.http.post(`${environment.apiUrl}/api/customer/accept`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.CUSTOMER);
          }
        }),
        catchError(this.handleError));
  }
  locked(entity: Customer) {
    let p: FromBodyBase<Customer> = {
      tokenKey: this.token,
      item: entity
    };
    return this.http.post(`${environment.apiUrl}/api/customer/locked`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.CUSTOMER);
          }
        }),
        catchError(this.handleError));
  }

  clearCache() {
    this.cacheService.clearByEntity(CacheConstants.CUSTOMER);
  }
}

