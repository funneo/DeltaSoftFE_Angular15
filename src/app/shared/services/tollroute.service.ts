import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService, CacheService, SignalRService } from '.';
import { FromBodyBase } from '../models';
import { Tollroute } from '../models/tollroute.model';
import { BaseService } from './base.service';
import { JwtService } from './jwt.service';
import { CacheConstants } from '../constants/cache.constants';

@Injectable({
  providedIn: 'root'
})
export class TollrouteService extends BaseService {
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
    this.cacheService.registerEntity(CacheConstants.TOLL_ROUTE, /^tollroute_/);
  }

  add(entity: Tollroute) {
    let p: FromBodyBase<Tollroute> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Tollroute/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.TOLL_ROUTE);
          }
        }),
        catchError(this.handleError));
  }

  update(entity: Tollroute) {
    let p: FromBodyBase<Tollroute> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Tollroute/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.TOLL_ROUTE);
          }
        }),
        catchError(this.handleError));
  }

  getDetail(id: number) {
    let p: FromBodyBase<Tollroute> = {};
    let item: Tollroute = {
      id: id
    }
    p.item = item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Tollroute/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }


  delete(id: number) {
    let p: FromBodyBase<Tollroute> = { item: {} };
    p.item.id = id;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/Tollroute/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.TOLL_ROUTE);
          }
        }),
        catchError(this.handleError));
  }

  getAll(params: HttpParams) {
    let p: FromBodyBase<Tollroute> = {};
    let item: Tollroute = {};
    p.tokenKey = this.token;
    p.branchId = Number.parseInt(params.get('branchid'));
    p.tValue = params.get('supplierid') ? Number.parseInt(params.get('supplierid')) : 0;
    p.item = item;
    return this.http.post(`${environment.apiUrl}/api/Tollroute/getall`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getAllCached(params: HttpParams) {
    let p: FromBodyBase<Tollroute> = {};
    let item: Tollroute = {};
    p.tokenKey = this.token;
    p.branchId = Number.parseInt(params.get('branchid'));
    p.tValue = params.get('supplierid') ? Number.parseInt(params.get('supplierid')) : 0;
    p.item = item;

    const cacheKey = `tollroute_branch_${p.branchId}_supplier_${p.tValue}`;
    const request = this.http.post(`${environment.apiUrl}/api/Tollroute/getall`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));

    return this.cacheService.get(cacheKey, request);
  }

  clearCache() {
    this.cacheService.clearByEntity(CacheConstants.TOLL_ROUTE);
  }
  handleError(handleError: any): any {
    throw new Error('Method not implemented.');
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<Tollroute> = {};
    let item: Tollroute = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.branchId = Number.parseInt(params.get('branchid'));
    p.item = item;
    return this.http.post(`${environment.apiUrl}/api/Tollroute/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
}
