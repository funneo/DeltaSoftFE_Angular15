import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { JwtService } from '../jwt.service';
import { CustomerLocations } from '@app/shared/models/danhmuc/customer-locations.model';
import { FromBodyBase } from '@app/shared/models';
import { environment } from '@environments/environment';
import { map, catchError, tap } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { CacheService } from '../cache.service';
import { SignalRService } from '../signalr.service';
import { CacheConstants } from '../../constants/cache.constants';

@Injectable({
  providedIn: 'root'
})
export class CustomerLocationsService extends BaseService {
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
    this.cacheService.registerEntity(CacheConstants.CUSTOMER_LOCATIONS, /customer_locations_.*/);
  }

  add(entity: CustomerLocations) {
    let p: FromBodyBase<CustomerLocations> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/CustomerLocations/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.CUSTOMER_LOCATIONS);
          }
        }),
        catchError(this.handleError));
  }

  update(entity: CustomerLocations) {
    let p: FromBodyBase<CustomerLocations> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/CustomerLocations/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.CUSTOMER_LOCATIONS);
          }
        }),
        catchError(this.handleError));
  }

  accept(id: number, flag: boolean) {
    let p: FromBodyBase<CustomerLocations> = {
      item: {
        id: id
      }
    };
    p.bValue = flag;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/CustomerLocations/accept`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.CUSTOMER_LOCATIONS);
          }
        }),
        catchError(this.handleError));
  }

  getDetail(id: number) {
    let p: FromBodyBase<CustomerLocations> = {
      item: {
        id: id
      }
    };
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/CustomerLocations/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  delete(id: number) {
    let p: FromBodyBase<CustomerLocations> = { item: {} };
    p.item.id = id;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/CustomerLocations/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.CUSTOMER_LOCATIONS);
          }
        }),
        catchError(this.handleError));
  }

  getAll(id: number, flag: boolean, useCache: boolean = true) {
    let p: FromBodyBase<CustomerLocations> = { item: { customerId: id } };
    p.item.id = id;
    p.bValue = flag;
    p.tokenKey = this.token;

    const cacheKey = `customer_locations_${id}_${flag}`;

    const request = this.http.post(environment.apiUrl + `/api/CustomerLocations/getAll`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));

    return useCache ? this.cacheService.get(cacheKey, request) : request;
  }

  getMultiCustomer(listCust: string) {
    let p: FromBodyBase<CustomerLocations> = {};
    p.listId = listCust;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/CustomerLocations/GetMultiCustomer`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  clearCache() {
    this.cacheService.clearByEntity(CacheConstants.CUSTOMER_LOCATIONS);
  }

}
