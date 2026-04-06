import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { FromBodyBase, Province } from '../models';
import { BaseService } from './base.service';
import { JwtService } from './jwt.service';
import { CacheService } from './cache.service';
import { SignalRService } from './signalr.service';
import { CacheConstants } from '../constants/cache.constants';

@Injectable({
  providedIn: 'root'
})
export class ProvinceService extends BaseService {
  private token: string;
  constructor(
    private http: HttpClient,
    jwtServices: JwtService,
    private authenService: AuthService,
    private cacheService: CacheService,
    private signalRService: SignalRService
  ) {
    super();
    this.token = jwtServices.getToken();
    this.cacheService.registerEntity(CacheConstants.PROVINCE, /provinces_.*/);
  }

  add(entity: Province) {
    let p: FromBodyBase<Province> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Province/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.PROVINCE);
          }
        }),
        catchError(this.handleError));
  }

  update(entity: Province) {
    let p: FromBodyBase<Province> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Province/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.PROVINCE);
          }
        }),
        catchError(this.handleError));
  }

  getDetail(provinceCode: string) {
    let p: FromBodyBase<Province> = {};
    let item: Province = {
      provinceCode: provinceCode
    }
    p.item = item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Province/getbyprovinceCode`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  delete(listId: string) {
    let p: FromBodyBase<Province> = {};
    p.listId = listId;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/Province/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.PROVINCE);
          }
        }),
        catchError(this.handleError));
  }


  getPaging(params: HttpParams) {
    let p: FromBodyBase<Province> = {};
    let item: Province = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    return this.http.post(`${environment.apiUrl}/api/Province/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getAll(params: HttpParams, useCache: boolean = true) {
    let p: FromBodyBase<Province> = {};
    p.tokenKey = this.token;

    const cacheKey = `provinces_all`;
    const request = this.http.post(`${environment.apiUrl}/api/Province/getall`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));

    return useCache ? this.cacheService.get(cacheKey, request) : request;
  }

  clearCache() {
    this.cacheService.clearByEntity(CacheConstants.PROVINCE);
  }
}
