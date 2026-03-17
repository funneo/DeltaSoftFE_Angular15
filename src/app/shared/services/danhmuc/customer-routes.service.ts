import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { CustomerRoutes } from '@app/shared/models/danhmuc/customer-routes.model';
import { FromBodyBase } from '@app/shared/models';
import { environment } from '@environments/environment';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { CacheService } from '../cache.service';
import { JwtService } from '../jwt.service';
import { SignalRService } from '../signalr.service';
import { CacheConstants } from '../../constants/cache.constants';

@Injectable({
  providedIn: 'root'
})
export class CustomerRoutesService extends BaseService {
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
    this.cacheService.registerEntity(CacheConstants.CUSTOMER_ROUTES, /^customer_routes_.*/);
  }

  add(entity: CustomerRoutes) {
    let p: FromBodyBase<CustomerRoutes> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/CustomerRoutes/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '200' || response.code == '201') {
          this.clearCache();
          this.signalRService.notifyUpdate(CacheConstants.CUSTOMER_ROUTES);
        }
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  update(entity: CustomerRoutes) {
    let p: FromBodyBase<CustomerRoutes> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/CustomerRoutes/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '200' || response.code == '201') {
          this.clearCache();
          this.signalRService.notifyUpdate(CacheConstants.CUSTOMER_ROUTES);
        }
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getDetail(id: number) {
    let p: FromBodyBase<CustomerRoutes> = {
      item: {
        id: id
      }
    };
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/CustomerRoutes/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  delete(id: number) {
    let p: FromBodyBase<CustomerRoutes> = { item: {} };
    p.item.id = id;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/CustomerRoutes/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '200' || response.code == '201') {
          this.clearCache();
          this.signalRService.notifyUpdate(CacheConstants.CUSTOMER_ROUTES);
        }
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getAll(id: number, flag: boolean, useCache: boolean = true) {
    let p: FromBodyBase<CustomerRoutes> = { item: { customerId: id } };
    p.item.id = id;
    p.bValue = flag;
    p.tokenKey = this.token;

    const cacheKey = `customer_routes_${id}_${flag}`;
    const request = this.http.post(environment.apiUrl + `/api/CustomerRoutes/getAll`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));

    return useCache ? this.cacheService.get(cacheKey, request) : request;
  }

  clearCache() {
    this.cacheService.clearByEntity(CacheConstants.CUSTOMER_ROUTES);
  }

  accept(id: number, flag: boolean) {
    let p: FromBodyBase<CustomerRoutes> = { item: { customerId: id } };
    p.item.id = id;
    p.bValue = flag;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/CustomerRoutes/accept`, p)
      .pipe(map((response: any) => {
        if (response.code == '200' || response.code == '201') {
          this.clearCache();
          this.signalRService.notifyUpdate(CacheConstants.CUSTOMER_ROUTES);
        }
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getMultiCustomer(listCust: string) {
    let p: FromBodyBase<CustomerRoutes> = {};
    p.listId = listCust;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/CustomerRoutes/GetMultiCustomer`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
}
