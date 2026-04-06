import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { OtherCategories, FromBodyBase, Pagination } from '../models';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';

@Injectable({ providedIn: 'root' })
export class OtherCategoriesService extends BaseService {
  private token: string;
  constructor(
    private http: HttpClient,
    jwtService: JwtService,
    private authService: AuthService,
    private cacheService: CacheService
  ) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: OtherCategories) {
    let p: FromBodyBase<OtherCategories> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/othercategories/create`, p)
      .pipe(
        map((response: any) => {
          if (response.code == '401')
            this.authService.logout();
          else return response;
        }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
          }
        }),
        catchError(this.handleError)
      );
  }

  update(entity: OtherCategories) {
    let p: FromBodyBase<OtherCategories> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/othercategories/update`, p)
      .pipe(
        map((response: any) => {
          if (response.code == '401')
            this.authService.logout();
          else return response;
        }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
          }
        }),
        catchError(this.handleError)
      );
  }

  getDetail(id: string) {
    let p: FromBodyBase<OtherCategories> = {};
    p.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/othercategories/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  delete(listId: string) {
    let p: FromBodyBase<OtherCategories> = {};
    p.listId = listId;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/othercategories/delete`, p)
      .pipe(
        map((response: any) => {
          if (response.code == '401')
            this.authService.logout();
          else return response;
        }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
          }
        }),
        catchError(this.handleError)
      );
  }

  getAll(params: HttpParams, useCache: boolean = true) {
    const rawType = params.get('type');
    const type = (rawType === null || rawType === undefined || rawType === '' || rawType === 'null') ? 'all' : rawType;
    const cacheKey = `othercategories_${type}`;

    const source = (() => {
      let p: FromBodyBase<OtherCategories> = {
        tokenKey: this.token,
        keyWord: type === 'all' ? null : type,
        item: { type: type === 'all' ? null : type }
      };
      return this.http.post(`${environment.apiUrl}/api/othercategories/getall`, p)
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
   * Clear other categories cache
   */
  clearCache() {
    this.cacheService.clearPattern(/^othercategories_/);
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<OtherCategories> = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    return this.http.post(`${environment.apiUrl}/api/othercategories/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
}

