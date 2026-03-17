import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { FromBodyBase } from '@app/shared/models';
import { TicketPrices } from '@app/shared/models/danhmuc/ticket-prices.model';
import { environment } from '@environments/environment';
import { map, catchError, tap } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { JwtService } from '../jwt.service';
import { CacheService } from '../cache.service';
import { SignalRService } from '../signalr.service';
import { CacheConstants } from '../../constants/cache.constants';

@Injectable({
  providedIn: 'root'
})
export class TicketPricesService extends BaseService {
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
    this.cacheService.registerEntity(CacheConstants.TICKET_PRICES, /ticket_prices_.*/);
  }

  add(entity: TicketPrices) {
    let p: FromBodyBase<TicketPrices> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/TicketPrices/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.TICKET_PRICES);
          }
        }),
        catchError(this.handleError));
  }

  update(entity: TicketPrices) {
    let p: FromBodyBase<TicketPrices> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/TicketPrices/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.TICKET_PRICES);
          }
        }),
        catchError(this.handleError));
  }

  getDetail(id: number) {
    let p: FromBodyBase<TicketPrices> = {
      item: {
        id: id
      }
    };
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/TicketPrices/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  delete(id: number) {
    let p: FromBodyBase<TicketPrices> = { item: {} };
    p.item.id = id;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/TicketPrices/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.TICKET_PRICES);
          }
        }),
        catchError(this.handleError));
  }

  getByTollStation(id: number, useCache: boolean = true) {
    let p: FromBodyBase<TicketPrices> = { item: { tollStationId: id } };
    p.tokenKey = this.token;

    const cacheKey = `ticket_prices_${id}`;
    const request = this.http.post(environment.apiUrl + `/api/TicketPrices/getByTollStation`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));

    return useCache ? this.cacheService.get(cacheKey, request) : request;
  }

  clearCache() {
    this.cacheService.clearByEntity(CacheConstants.TICKET_PRICES);
  }
}
