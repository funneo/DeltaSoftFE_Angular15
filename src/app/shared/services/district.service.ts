import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { District, FromBodyBase } from '../models';
import { BaseService } from './base.service';
import { JwtService } from './jwt.service';
import { CacheService } from './cache.service';
import { SignalRService } from './signalr.service';
import { CacheConstants } from '../constants/cache.constants';

@Injectable({
  providedIn: 'root'
})
export class DistrictService extends BaseService {
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
    this.cacheService.registerEntity(CacheConstants.DISTRICT, /districts_.*/);
  }

  add(entity: District) {
    let p: FromBodyBase<District> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/District/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.DISTRICT);
          }
        }),
        catchError(this.handleError));
  }

  update(entity: District) {
    let p: FromBodyBase<District> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/District/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.DISTRICT);
          }
        }),
        catchError(this.handleError));
  }

  getDetail(districtCode: string) {
    let p: FromBodyBase<District> = {};
    let item: District = {
      districtCode: districtCode
    }
    p.item = item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/District/getbyDistrictCode`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  getbyProvinceCode(provinceCode: string) {
    let p: FromBodyBase<District> = {};
    let item: District = {
      provinceCode: provinceCode
    }
    p.item = item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/District/getbyProvinceCode`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  delete(listId: string) {
    let p: FromBodyBase<District> = {};
    p.listId = listId;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/District/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.DISTRICT);
          }
        }),
        catchError(this.handleError));
  }


  getPaging(params: HttpParams) {
    let p: FromBodyBase<District> = {};
    let item: District = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    item.provinceCode = params.get('provinceCode');
    p.item = item
    return this.http.post(`${environment.apiUrl}/api/District/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getAll(params: HttpParams, useCache: boolean = true) {
    let p: FromBodyBase<District> = {};
    p.tokenKey = this.token;

    const cacheKey = `districts_all`;
    const request = this.http.post(`${environment.apiUrl}/api/District/getall`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));

    return useCache ? this.cacheService.get(cacheKey, request) : request;
  }

  clearCache() {
    this.cacheService.clearByEntity(CacheConstants.DISTRICT);
  }
}
