import { Injectable } from '@angular/core';
import { FromBodyBase } from '@app/shared/models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@environments/environment';
import { map, catchError, tap } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { BaseService } from '../base.service';
import { JwtService } from '../jwt.service';
import { TransitPorts } from '@app/shared/models/danhmuc/transit-ports';
import { CacheService } from '../cache.service';
import { SignalRService } from '../signalr.service';
import { CacheConstants } from '../../constants/cache.constants';

@Injectable({
  providedIn: 'root'
})
export class TransitPortsService extends BaseService {
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
    this.cacheService.registerEntity(CacheConstants.TRANSIT_PORTS, /transit_ports_.*/);
  }

  add(entity: TransitPorts) {
    let p: FromBodyBase<TransitPorts> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/TransitPorts/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.TRANSIT_PORTS);
          }
        }),
        catchError(this.handleError));
  }

  update(entity: TransitPorts) {
    let p: FromBodyBase<TransitPorts> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/TransitPorts/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.TRANSIT_PORTS);
          }
        }),
        catchError(this.handleError));
  }
  accept(id: number, flag: boolean) {
    let p: FromBodyBase<TransitPorts> = {
      item: {
        id: id
      }
    };
    p.bValue = flag;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/TransitPorts/accept`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.TRANSIT_PORTS);
          }
        }),
        catchError(this.handleError));
  }


  getDetail(id: number) {
    let p: FromBodyBase<TransitPorts> = {
      item: {
        id: id
      }
    };
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/TransitPorts/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  delete(id: number) {
    let p: FromBodyBase<TransitPorts> = { item: {} };
    p.item.id = id;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/TransitPorts/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.TRANSIT_PORTS);
          }
        }),
        catchError(this.handleError));
  }
  getAll(flag: boolean, useCache: boolean = true) {
    let p: FromBodyBase<TransitPorts> = { item: {} };
    p.bValue = flag;
    p.tokenKey = this.token;

    const cacheKey = `transit_ports_${flag}`;
    const request = this.http.post(environment.apiUrl + `/api/TransitPorts/getAll`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));

    return useCache ? this.cacheService.get(cacheKey, request) : request;
  }
  getPaging(params: HttpParams) {
    let p: FromBodyBase<TransitPorts> = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    return this.http.post(`${environment.apiUrl}/api/TransitPorts/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  clearCache() {
    this.cacheService.clearByEntity(CacheConstants.TRANSIT_PORTS);
  }

  // getByTollStation(id: number) {
  //   let p: FromBodyBase<TransitPorts> = {item:{tollStationId:id}};
  //   p.tokenKey = this.token;
  //   return this.http.post(environment.apiUrl + `/api/TransitPorts/getByTollStation`, p)
  //   .pipe(map((response: any) => {
  //     if (response.code == '401')
  //       this.authService.logout();
  //     else return response;
  //   }), catchError(this.handleError));
  //   }
}