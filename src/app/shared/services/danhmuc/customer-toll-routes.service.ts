import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../base.service';
import { FromBodyBase } from '@app/shared/models';
import { environment } from '@environments/environment';
import { AuthService } from '../auth.service';
import { CacheService } from '../cache.service';
import { JwtService } from '../jwt.service';
import { catchError, map, tap } from 'rxjs/operators';
import { CustomerTollRoutes } from '@app/shared/models/danhmuc/customer-toll-routes';
import { SignalRService } from '../signalr.service';
import { CacheConstants } from '../../constants/cache.constants';

@Injectable({
  providedIn: 'root'
})
export class CustomerTollRoutesService extends BaseService {
  private token: string;

  constructor(
    private http: HttpClient,
    private jwtService: JwtService,
    private authService: AuthService,
    private cacheService: CacheService,
    private signalRService: SignalRService
  ) {
    super();
    this.token = jwtService.getToken();
    this.cacheService.registerEntity(CacheConstants.CUSTOMER_TOLL_ROUTES, /customer_toll_routes_.*/);
  }

  create(entity: CustomerTollRoutes) {
    const p: FromBodyBase<CustomerTollRoutes> = {
      item: entity,
      tokenKey: this.token
    };
    return this.http.post(`${environment.apiUrl}/api/CustomerTollRoutes/create`, p).pipe(
      map(res => {
        return this.handleAuthResponse(res);
      }),
      tap((res: any) => {
        if (res.code == '200' || res.code == '201') {
          this.clearCache();
          this.signalRService.notifyUpdate(CacheConstants.CUSTOMER_TOLL_ROUTES);
        }
      }),
      catchError(this.handleError)
    );
  }

  update(entity: CustomerTollRoutes) {
    const p: FromBodyBase<CustomerTollRoutes> = {
      item: entity,
      tokenKey: this.token
    };
    return this.http.post(`${environment.apiUrl}/api/CustomerTollRoutes/update`, p).pipe(
      map(res => {
        return this.handleAuthResponse(res);
      }),
      tap((res: any) => {
        if (res.code == '200' || res.code == '201') {
          this.clearCache();
          this.signalRService.notifyUpdate(CacheConstants.CUSTOMER_TOLL_ROUTES);
        }
      }),
      catchError(this.handleError)
    );
  }

  getById(id: number) {
    const p: FromBodyBase<CustomerTollRoutes> = {
      item: { id },
      tokenKey: this.token
    };
    return this.http.post(`${environment.apiUrl}/api/CustomerTollRoutes/getbyid`, p).pipe(
      map(res => this.handleAuthResponse(res)),
      catchError(this.handleError)
    );
  }

  delete(id: number) {
    const p: FromBodyBase<CustomerTollRoutes> = {
      item: { id },
      tokenKey: this.token
    };
    return this.http.post(`${environment.apiUrl}/api/CustomerTollRoutes/delete`, p).pipe(
      map(res => {
        return this.handleAuthResponse(res);
      }),
      tap((res: any) => {
        if (res.code == '200' || res.code == '201') {
          this.clearCache();
          this.signalRService.notifyUpdate(CacheConstants.CUSTOMER_TOLL_ROUTES);
        }
      }),
      catchError(this.handleError)
    );
  }

  getByCustomer(customerId: number) {
    const p: FromBodyBase<CustomerTollRoutes> = {
      item: { customerId },
      tokenKey: this.token
    };

    const cacheKey = `customer_toll_routes_${customerId}`;
    const request = this.http.post(`${environment.apiUrl}/api/CustomerTollRoutes/getbycustomer`, p).pipe(
      map(res => this.handleAuthResponse(res)),
      catchError(this.handleError)
    );
    return this.cacheService.get(cacheKey, request);
  }

  clearCache() {
    this.cacheService.clearByEntity(CacheConstants.CUSTOMER_TOLL_ROUTES);
  }

  accept(id: number, accept: boolean, reason?: string) {
    const p: FromBodyBase<CustomerTollRoutes> = {
      item: { id, notes: reason },
      tokenKey: this.token,
      bValue: accept
    };
    return this.http.post(`${environment.apiUrl}/api/CustomerTollRoutes/accept`, p).pipe(
      map(res => {
        return this.handleAuthResponse(res);
      }),
      tap((res: any) => {
        if (res.code == '200' || res.code == '201') {
          this.clearCache();
          this.signalRService.notifyUpdate(CacheConstants.CUSTOMER_TOLL_ROUTES);
        }
      }),
      catchError(this.handleError)
    );
  }

  private handleAuthResponse(response: any) {
    if (response.code === '401') {
      this.authService.logout();
    }
    return response;
  }
}
