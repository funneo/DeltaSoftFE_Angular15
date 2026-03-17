import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Branch, FromBodyBase, Pagination } from '../models';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';
import { SignalRService } from './signalr.service';
import { CacheConstants } from '../constants/cache.constants';

@Injectable({ providedIn: 'root' })
export class BranchService extends BaseService {
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
    // Register the cache pattern for this entity
    this.cacheService.registerEntity(CacheConstants.BRANCH, /branches_.*/);
  }

  add(entity: Branch) {
    let p: FromBodyBase<Branch> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/branch/create`, p)
      .pipe(
        map((response: any) => {
          if (response.code == '401')
            this.authService.logout();
          else return response;
        }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.BRANCH);
          }
        }),
        catchError(this.handleError)
      );
  }

  update(entity: Branch) {
    let p: FromBodyBase<Branch> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/branch/update`, p)
      .pipe(
        map((response: any) => {
          if (response.code == '401')
            this.authService.logout();
          else return response;
        }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.BRANCH);
          }
        }),
        catchError(this.handleError)
      );
  }

  getDetail(id: string) {
    let p: FromBodyBase<Branch> = {};
    p.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/branch/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  delete(listId: string) {
    let p: FromBodyBase<Branch> = {};
    p.listId = listId;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/branch/delete`, p)
      .pipe(
        map((response: any) => {
          if (response.code == '401')
            this.authService.logout();
          else return response;
        }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.BRANCH);
          }
        }),
        catchError(this.handleError)
      );
  }

  getAll(useCache: boolean = true) {
    const cacheKey = 'branches_all';

    const source = (() => {
      let p: FromBodyBase<Branch> = {};
      p.tokenKey = this.token;
      return this.http.post(`${environment.apiUrl}/api/branch/getall`, p)
        .pipe(map((response: any) => {
          if (response.code == '401')
            this.authService.logout();
          else return response;
        }), catchError(this.handleError));
    })();

    if (useCache) {
      return this.cacheService.get(cacheKey, source);
    }
    return source;
  }

  /**
   * Clear branch cache (call this after add/update/delete)
   */
  clearCache() {
    this.cacheService.clearByEntity(CacheConstants.BRANCH);
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<Branch> = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    return this.http.post(`${environment.apiUrl}/api/branch/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
}

