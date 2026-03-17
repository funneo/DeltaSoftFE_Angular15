import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Route } from '../models';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';
import { AuthService, CacheService, SignalRService } from '.';
import { CacheConstants } from '../constants/cache.constants';
import { FromBodyBase } from '../models';
import { BaseService } from './base.service';
import { JwtService } from './jwt.service';

@Injectable({
  providedIn: 'root'
})
export class RouteService extends BaseService {
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
    this.cacheService.registerEntity(CacheConstants.ROUTE, /^routes_branch_/);
  }

  add(entity: Route) {
    let p: FromBodyBase<Route> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Route/create`, p)
      .pipe(map((response: any) => {
        this.clearCache();
        this.signalRService.notifyUpdate(CacheConstants.ROUTE);
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  update(entity: Route) {
    let p: FromBodyBase<Route> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Route/update`, p)
      .pipe(map((response: any) => {
        this.clearCache();
        this.signalRService.notifyUpdate(CacheConstants.ROUTE);
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getDetail(id: number) {
    let p: FromBodyBase<Route> = {};
    let item: Route = {
      id: id
    }
    p.item = item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Route/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  approved(id: number, flag: boolean) {
    let p: FromBodyBase<Route> = {};
    let item: Route = {
      id: id
    }
    p.bValue = flag;
    p.item = item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Route/approved`, p)
      .pipe(map((response: any) => {
        this.clearCache();
        this.signalRService.notifyUpdate(CacheConstants.ROUTE);
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  delete(id: number) {
    let p: FromBodyBase<Route> = { item: {} };
    p.item.id = id;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/Route/delete`, p)
      .pipe(map((response: any) => {
        this.clearCache();
        this.signalRService.notifyUpdate(CacheConstants.ROUTE);
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getAll(params: HttpParams, useCache: boolean = true) {
    let p: FromBodyBase<Route> = {};
    p.tokenKey = this.token;
    p.branchId = Number.parseInt(params.get('branchid'));

    const cacheKey = `routes_branch_${p.branchId}`;
    const request = this.http.post(`${environment.apiUrl}/api/Route/getall`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));

    return useCache ? this.cacheService.get(cacheKey, request) : request;
  }

  clearCache() {
    this.cacheService.clearPattern(/^routes_branch_/);
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<Route> = {};
    let item: Route = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.branchId = Number.parseInt(params.get('branchid'));
    p.item = item;
    return this.http.post(`${environment.apiUrl}/api/Route/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
}
