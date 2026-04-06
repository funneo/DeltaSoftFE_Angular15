import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Fee, FromBodyBase, Pagination } from '../models';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';
import { SignalRService } from './signalr.service';
import { CacheConstants } from '../constants/cache.constants';

@Injectable({ providedIn: 'root' })
export class FeeService extends BaseService {
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
    this.cacheService.registerEntity(CacheConstants.FEE, /fees_.*/);
  }

  add(entity: Fee) {
    let p: FromBodyBase<Fee> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/fee/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.FEE);
          }
        }),
        catchError(this.handleError));
  }

  update(entity: Fee) {
    let p: FromBodyBase<Fee> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/fee/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.FEE);
          }
        }),
        catchError(this.handleError));
  }

  getDetail(id: string) {
    let p: FromBodyBase<Fee> = {};
    p.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/fee/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  delete(listId: string) {
    let p: FromBodyBase<Fee> = {};
    p.listId = listId;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/fee/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.FEE);
          }
        }),
        catchError(this.handleError));
  }

  getAll(params: HttpParams, useCache: boolean = true) {
    let p: FromBodyBase<Fee> = {
      tokenKey: this.token,
      item: {}
    };
    p.item.groupFeeId = Number.parseInt(params?.get('groupFeeId'));
    p.item.paymentFeeGroupId = Number.parseInt(params?.get('paymentFeeGroupId'));
    p.item.revenueFeeGroupId = Number.parseInt(params?.get('revenueFeeGroupId'));

    // Create a unique cache key based on parameters
    const cacheKey = `fees_all_${p.item.groupFeeId || '0'}_${p.item.paymentFeeGroupId || '0'}_${p.item.revenueFeeGroupId || '0'}`;

    const request = this.http.post(`${environment.apiUrl}/api/fee/getall`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));

    return useCache ? this.cacheService.get(cacheKey, request) : request;
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<Fee> = {
      tokenKey: this.token,
      item: {}
    };
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.item.groupFeeId = Number.parseInt(params.get('groupFeeId'));
    return this.http.post(`${environment.apiUrl}/api/fee/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  accept(id: string) {
    let p: FromBodyBase<Fee> = {};
    p.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/fee/accept`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.FEE);
          }
        }),
        catchError(this.handleError));
  }

  clearCache() {
    this.cacheService.clearByEntity(CacheConstants.FEE);
  }
}

