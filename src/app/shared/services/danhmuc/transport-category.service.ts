import { TransportCategory } from './../../models/danhmuc/transport-category.model';
import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { JwtService } from '../jwt.service';
import { AuthService } from '../auth.service';
import { CacheService } from '../cache.service';
import { FromBodyBase } from '@app/shared/models';
import { environment } from '@environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SignalRService } from '../signalr.service';
import { CacheConstants } from '../../constants/cache.constants';

@Injectable({
  providedIn: 'root'
})
export class TransportCategoryService extends BaseService {
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
    this.cacheService.registerEntity(CacheConstants.TRANSPORT_CATEGORY, /transport_category_.*/);
  }

  add(entity: TransportCategory) {
    let p: FromBodyBase<TransportCategory> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/TransportCategory/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.TRANSPORT_CATEGORY);
          }
        }),
        catchError(this.handleError));
  }

  update(entity: TransportCategory) {
    let p: FromBodyBase<TransportCategory> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/TransportCategory/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.TRANSPORT_CATEGORY);
          }
        }),
        catchError(this.handleError));
  }

  getDetail(id: number) {
    let p: FromBodyBase<TransportCategory> = {
      item: {
        id: id
      }
    };
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/TransportCategory/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  delete(id: number) {
    let p: FromBodyBase<TransportCategory> = { item: {} };
    p.item.id = id;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/TransportCategory/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.TRANSPORT_CATEGORY);
          }
        }),
        catchError(this.handleError));
  }

  getAll(params: HttpParams, useCache: boolean = true) {
    let p: FromBodyBase<TransportCategory> = {
      tokenKey: this.token,
      keyWord: params.get('keyword'),
      branchId: Number.parseInt(params.get('branchid'))
    };

    const cacheKey = `transport_category_${p.branchId || ''}_${p.keyWord || ''}`;
    const request = this.http.post(`${environment.apiUrl}/api/TransportCategory/getall`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));

    return useCache ? this.cacheService.get(cacheKey, request) : request;
  }

  clearCache() {
    this.cacheService.clearByEntity(CacheConstants.TRANSPORT_CATEGORY);
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<TransportCategory> = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    return this.http.post(`${environment.apiUrl}/api/TransportCategory/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  public getBranch(): Observable<any> {
    return this.http.get("./assets/data/transportcategorytype.json");
  }


}
