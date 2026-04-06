import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { PaymentFeeGroup, FromBodyBase, Pagination } from '../models';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';
import { SignalRService } from './signalr.service';
import { CacheConstants } from '../constants/cache.constants';

@Injectable({ providedIn: 'root' })
export class PaymentFeeGroupService extends BaseService {
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
    this.cacheService.registerEntity(CacheConstants.PAYMENT_FEE_GROUP, /payment_fee_groups_.*/);
  }

  add(entity: PaymentFeeGroup) {
    let p: FromBodyBase<PaymentFeeGroup> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/paymentfeegroup/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.PAYMENT_FEE_GROUP);
          }
        }),
        catchError(this.handleError));
  }

  update(entity: PaymentFeeGroup) {
    let p: FromBodyBase<PaymentFeeGroup> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/paymentfeegroup/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.PAYMENT_FEE_GROUP);
          }
        }),
        catchError(this.handleError));
  }

  getDetail(id: string) {
    let p: FromBodyBase<PaymentFeeGroup> = {};
    p.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/paymentfeegroup/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  delete(listId: string) {
    let p: FromBodyBase<PaymentFeeGroup> = {};
    p.listId = listId;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/paymentfeegroup/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.PAYMENT_FEE_GROUP);
          }
        }),
        catchError(this.handleError));
  }

  getAll(useCache: boolean = true) {
    let p: FromBodyBase<PaymentFeeGroup> = {};
    p.tokenKey = this.token;

    const cacheKey = `payment_fee_groups_all`;
    const request = this.http.post(`${environment.apiUrl}/api/paymentfeegroup/getall`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));

    return useCache ? this.cacheService.get(cacheKey, request) : request;
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<PaymentFeeGroup> = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    return this.http.post(`${environment.apiUrl}/api/paymentfeegroup/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  clearCache() {
    this.cacheService.clearByEntity(CacheConstants.PAYMENT_FEE_GROUP);
    // Also clear Fee cache since Fee depends on PaymentFeeGroup
    this.cacheService.clearByEntity(CacheConstants.FEE);
  }
}

