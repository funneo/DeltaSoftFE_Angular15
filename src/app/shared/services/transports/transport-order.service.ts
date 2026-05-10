import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '..';
import { FromBodyBase } from '../../models';
import { RouteSegmentDefault, TransportOrder, TransportOrderSegment, UnifiedLocation } from '../../models/transports/dispatchorders/transport-order.model';
import { BaseService } from '../base.service';
import { JwtService } from '../jwt.service';

@Injectable({
  providedIn: 'root'
})
export class TransportOrderService extends BaseService {
  private token: string;

  constructor(private http: HttpClient, jwtServices: JwtService, private authenService: AuthService) {
    super();
    this.token = jwtServices.getToken();
  }

  add(entity: TransportOrder) {
    let p: FromBodyBase<TransportOrder> = {
      item: entity,
      tokenKey: this.token
    };
    // Clean null fields before sending
    this._cleanEntity(entity);
    return this.http.post(`${environment.apiUrl}/api/TransportOrder/Create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401') this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  update(entity: TransportOrder) {
    let p: FromBodyBase<TransportOrder> = {
      item: entity,
      tokenKey: this.token
    };
    return this.http.post(`${environment.apiUrl}/api/TransportOrder/Update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401') this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  delete(id: number) {
    let p: FromBodyBase<TransportOrder> = {
      id: id.toString(),
      tokenKey: this.token
    };
    return this.http.post(`${environment.apiUrl}/api/TransportOrder/Delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401') this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getAll(params: HttpParams) {
    let p: FromBodyBase<TransportOrder> = {
      tokenKey: this.token,
      branchId: Number.parseInt(params.get('branchid')),
      fromDate: params.get('fromDate'),
      toDate: params.get('toDate'),
      keyWord: params.get('keyword')
    };
    return this.http.post(`${environment.apiUrl}/api/TransportOrder/GetAll`, p)
      .pipe(map((response: any) => {
        if (response.code == '401') this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getById(id: number) {
    let p: FromBodyBase<TransportOrder> = {
      id: id.toString(),
      tokenKey: this.token
    };
    return this.http.post(`${environment.apiUrl}/api/TransportOrder/GetById`, p)
      .pipe(map((response: any) => {
        if (response.code == '401') this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  updateStatus(id: number, status: number, feedback: string = '', isRejection: boolean = false) {
    let p: FromBodyBase<TransportOrder> = {
      id: id.toString(),
      tokenKey: this.token,
      tValue: status,
      keyWord: feedback,
      bValue: isRejection
    };
    return this.http.post(`${environment.apiUrl}/api/TransportOrder/UpdateStatus`, p)
      .pipe(map((response: any) => {
        if (response.code == '401') this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getLocations(listCustId?: string) {
    const p: FromBodyBase<TransportOrder> = {
      tokenKey: this.token,
      keyWord: listCustId ?? null
    };
    return this.http.post<any>(`${environment.apiUrl}/api/TransportOrder/GetAllLocations`, p)
      .pipe(
        map((response: any) => {
          if (response.code === '401') this.authenService.logout();
          return response.data as UnifiedLocation[];
        }),
        catchError(this.handleError)
      );
  }

  saveSegmentDefault(item: RouteSegmentDefault) {
    const p: FromBodyBase<RouteSegmentDefault> = { item, tokenKey: this.token };
    return this.http.post(`${environment.apiUrl}/api/TransportOrder/SaveSegmentDefault`, p)
      .pipe(map((response: any) => {
        if (response.code == '401') this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getSegmentHistory(startLocationId: number, startLocationType: number, endLocationId: number, endLocationType: number) {
    let p: FromBodyBase<TransportOrderSegment> = {
      tokenKey: this.token,
      item: {
        startLocationId,
        startLocationType,
        endLocationId,
        endLocationType
      } as TransportOrderSegment
    };
    return this.http.post(`${environment.apiUrl}/api/TransportOrder/GetSegmentHistory`, p)
      .pipe(map((response: any) => {
        if (response.code == '401') this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  private _cleanEntity(entity: any) {
    Object.keys(entity).forEach(key => {
      if (entity[key] === null) delete entity[key];
      else if (typeof entity[key] === 'object' && !Array.isArray(entity[key])) {
        this._cleanEntity(entity[key]);
      }
    });
  }
}
