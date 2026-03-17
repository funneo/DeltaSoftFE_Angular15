import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { FromBodyBase } from '@app/shared/models';
import { environment } from '@environments/environment';
import { map, catchError, tap } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { JwtService } from '../jwt.service';
import { VehicleOilQuota } from '@app/shared/models/danhmuc/vehicle-oil-quota.model';
import { CacheService } from '../cache.service';
import { SignalRService } from '../signalr.service';
import { CacheConstants } from '../../constants/cache.constants';

@Injectable({
  providedIn: 'root'
})
export class VehicleOilQuotaService extends BaseService {

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
    this.cacheService.registerEntity(CacheConstants.VEHICLE_OIL_QUOTA, /vehicle_oil_quota_.*/);
  }

  add(entity: VehicleOilQuota) {
    let p: FromBodyBase<VehicleOilQuota> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/VehicleOilQuota/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.VEHICLE_OIL_QUOTA);
          }
        }),
        catchError(this.handleError));
  }

  update(entity: VehicleOilQuota) {
    let p: FromBodyBase<VehicleOilQuota> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/VehicleOilQuota/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.VEHICLE_OIL_QUOTA);
          }
        }),
        catchError(this.handleError));
  }

  getDetail(id: number) {
    let p: FromBodyBase<VehicleOilQuota> = {};
    let item: VehicleOilQuota = {
      id: id
    }
    p.item = item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/VehicleOilQuota/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }


  delete(id: number) {
    let p: FromBodyBase<VehicleOilQuota> = { item: {} };
    p.item.id = id;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/VehicleOilQuota/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.VEHICLE_OIL_QUOTA);
          }
        }),
        catchError(this.handleError));
  }


  getByVehicleId(id: number, useCache: boolean = true) {
    let p: FromBodyBase<VehicleOilQuota> = { item: { vehicleId: id } };
    p.tokenKey = this.token;

    const cacheKey = `vehicle_oil_quota_${id}`;
    const request = this.http.post(`${environment.apiUrl}/api/VehicleOilQuota/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));

    return useCache ? this.cacheService.get(cacheKey, request) : request;
  }

  clearCache() {
    this.cacheService.clearByEntity(CacheConstants.VEHICLE_OIL_QUOTA);
  }
}
