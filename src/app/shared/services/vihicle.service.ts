import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from '.';
import { FromBodyBase, Vihicle } from '../models';
import { BaseService } from './base.service';
import { JwtService } from './jwt.service';
import { CacheService } from './cache.service';
import { SignalRService } from './signalr.service';
import { CacheConstants } from '../constants/cache.constants';

@Injectable({
  providedIn: 'root'
})
export class VihicleService extends BaseService {
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
    this.cacheService.registerEntity(CacheConstants.VEHICLE, /vehicles_.*/);
  }

  add(entity: Vihicle) {
    let p: FromBodyBase<Vihicle> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Vihicle/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.VEHICLE);
          }
        }),
        catchError(this.handleError));
  }

  update(entity: Vihicle) {
    let p: FromBodyBase<Vihicle> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Vihicle/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.VEHICLE);
          }
        }),
        catchError(this.handleError));
  }

  updateStatus(entity: Vihicle) {
    let p: FromBodyBase<Vihicle> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Vihicle/updateState`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.VEHICLE);
          }
        }),
        catchError(this.handleError));
  }
  updateContainer(entity: Vihicle) {
    let p: FromBodyBase<Vihicle> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Vihicle/updateContainer`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.VEHICLE);
          }
        }),
        catchError(this.handleError));
  }

  getDetail(id: number) {
    let p: FromBodyBase<Vihicle> = {};
    let item: Vihicle = {
      id: id
    }
    p.item = item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Vihicle/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }


  delete(id: number) {
    let p: FromBodyBase<Vihicle> = {};
    p.item.id = id;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/Vihicle/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.VEHICLE);
          }
        }),
        catchError(this.handleError));
  }

  getAll(params: HttpParams, useCache: boolean = true) {
    let p: FromBodyBase<Vihicle> = {};
    let item: Vihicle = {
      vihicleTypeId: Number.parseInt(params.get('vihicletype')),
    };
    p.tokenKey = this.token;
    p.branchId = Number.parseInt(params.get('branchid'));
    p.item = item;

    const cacheKey = `vehicles_all_${p.branchId}_${item.vihicleTypeId || '0'}`;

    const request = this.http.post(`${environment.apiUrl}/api/Vihicle/getall`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));

    return useCache ? this.cacheService.get(cacheKey, request) : request;
  }

  getDueSoon(params: HttpParams) {
    let p: FromBodyBase<Vihicle> = {};
    p.tokenKey = this.token;
    p.branchId = Number.parseInt(params.get('branchid'));
    return this.http.post(`${environment.apiUrl}/api/Vihicle/getDueSoon`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getAllMooc(params: HttpParams) {
    let p: FromBodyBase<Vihicle> = {};
    p.tokenKey = this.token;
    p.branchId = Number.parseInt(params.get('branchid'));
    return this.http.post(`${environment.apiUrl}/api/Vihicle/getallmooc`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  handleError(handleError: any): any {
    throw new Error('Method not implemented.');
  }


  getPaging(params: HttpParams) {
    let p: FromBodyBase<Vihicle> = { item: {} };
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.item.branchId = params.get('branchid') == null ? 0 : Number.parseInt(params.get('branchid'));
    return this.http.post(`${environment.apiUrl}/api/Vihicle/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  clearCache() {
    this.cacheService.clearByEntity(CacheConstants.VEHICLE);
  }
}
