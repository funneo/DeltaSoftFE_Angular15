import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { FromBodyBase } from '@app/shared/models';
import { CustomerNormalRoutes } from '@app/shared/models/danhmuc/customer-normal-routes.model';
import { environment } from '@environments/environment';
import { map, catchError, tap } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { CacheService } from '../cache.service';
import { JwtService } from '../jwt.service';
import { SignalRService } from '../signalr.service';
import { CacheConstants } from '../../constants/cache.constants';

@Injectable({
  providedIn: 'root'
})
export class CustomerNormalRoutesService extends BaseService {
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
    this.cacheService.registerEntity(CacheConstants.CUSTOMER_NORMAL_ROUTES, /customer_normal_routes_.*/);
  }

  add(entity: CustomerNormalRoutes) {
    let p: FromBodyBase<CustomerNormalRoutes> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/CustomerNormalRoutes/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.CUSTOMER_NORMAL_ROUTES);
          }
        }),
        catchError(this.handleError));
  }


  delete(id: number) {
    let p: FromBodyBase<CustomerNormalRoutes> = { item: {} };
    p.item.id = id;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/CustomerNormalRoutes/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.CUSTOMER_NORMAL_ROUTES);
          }
        }),
        catchError(this.handleError));
  }

  getAll(id: number) {
    let p: FromBodyBase<CustomerNormalRoutes> = { item: { customerId: id } };
    p.item.id = id;
    p.tokenKey = this.token;
    const cacheKey = `customer_normal_routes_${id}`;
    const request = this.http.post(environment.apiUrl + `/api/CustomerNormalRoutes/getAll`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));

    return this.cacheService.get(cacheKey, request);
  }

  clearCache() {
    this.cacheService.clearByEntity(CacheConstants.CUSTOMER_NORMAL_ROUTES);
  }
}
