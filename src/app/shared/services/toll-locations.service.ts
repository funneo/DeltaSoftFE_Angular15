import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { FromBodyBase } from '../models';
import { Tolllocations } from '../models/tolllocations.model';
import { AuthService } from './auth.service';
import { BaseService } from './base.service';
import { JwtService } from './jwt.service';
import { CacheService } from './cache.service';
import { SignalRService } from './signalr.service';
import { CacheConstants } from '../constants/cache.constants';

@Injectable({
  providedIn: 'root'
})
export class TollLocationsService extends BaseService {

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
    this.cacheService.registerEntity(CacheConstants.TOLL_LOCATIONS, /toll_locations_.*/);
  }

  add(entity: Tolllocations) {
    let p: FromBodyBase<Tolllocations> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Tolllocations/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.TOLL_LOCATIONS);
          }
        }),
        catchError(this.handleError));
  }


  getAll(useCache: boolean = true) {
    let p: FromBodyBase<Tolllocations> = {};
    p.tokenKey = this.token;

    const cacheKey = `toll_locations_all`;
    const request = this.http.post(`${environment.apiUrl}/api/Tolllocations/getall`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));

    return useCache ? this.cacheService.get(cacheKey, request) : request;
  }
  handleError(handleError: any): any {
    throw new Error('Method not implemented.');
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<Tolllocations> = { item: {} };
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    return this.http.post(`${environment.apiUrl}/api/Tolllocations/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  clearCache() {
    this.cacheService.clearByEntity(CacheConstants.TOLL_LOCATIONS);
  }
}
