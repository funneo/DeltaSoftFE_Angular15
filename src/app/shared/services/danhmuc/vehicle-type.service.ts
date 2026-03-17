import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { FromBodyBase } from '@app/shared/models';
import { VehicleType } from '@app/shared/models/danhmuc/vehicle-type.model';
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
export class VehicleTypeService extends BaseService {

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
    this.cacheService.registerEntity(CacheConstants.VEHICLE_TYPE, /vehicle_types_.*/);
  }

  add(entity: VehicleType) {
    const p: FromBodyBase<VehicleType> = {
      item: entity,
      tokenKey: this.token,
    };
    Object.keys(entity).forEach((key) =>
      entity[key] === null ? delete entity[key] : ''
    );
    return this.http.post(`${environment.apiUrl}/api/VehicleType/create`, p).pipe(
      map((response: any) => {
        if (response.code === '401') this.authService.logout();
        else return response;
      }),
      tap((response: any) => {
        if (response.code == '200' || response.code == '201') {
          this.clearCache();
          this.signalRService.notifyUpdate(CacheConstants.VEHICLE_TYPE);
        }
      }),
      catchError(this.handleError)
    );
  }

  update(entity: VehicleType) {
    const p: FromBodyBase<VehicleType> = {
      item: entity,
      tokenKey: this.token,
    };
    Object.keys(entity).forEach((key) =>
      entity[key] === null ? delete entity[key] : ''
    );
    return this.http.post(`${environment.apiUrl}/api/VehicleType/update`, p).pipe(
      map((response: any) => {
        if (response.code === '401') this.authService.logout();
        else return response;
      }),
      tap((response: any) => {
        if (response.code == '200' || response.code == '201') {
          this.clearCache();
          this.signalRService.notifyUpdate(CacheConstants.VEHICLE_TYPE);
        }
      }),
      catchError(this.handleError)
    );
  }

  getDetail(id: number) {
    const p: FromBodyBase<VehicleType> = {
      item: { id: id },
      tokenKey: this.token,
    };
    return this.http.post(`${environment.apiUrl}/api/VehicleType/GetById`, p).pipe(
      map((response: any) => {
        if (response.code === '401') this.authService.logout();
        else return response;
      }),
      catchError(this.handleError)
    );
  }

  delete(id: number) {
    const p: FromBodyBase<VehicleType> = {
      item: { id: id },
      tokenKey: this.token,
    };
    return this.http.post(`${environment.apiUrl}/api/VehicleType/delete`, p).pipe(
      map((response: any) => {
        if (response.code === '401') this.authService.logout();
        else return response;
      }),
      tap((response: any) => {
        if (response.code == '200' || response.code == '201') {
          this.clearCache();
          this.signalRService.notifyUpdate(CacheConstants.VEHICLE_TYPE);
        }
      }),
      catchError(this.handleError)
    );
  }

  getAll(useCache: boolean = true) {
    const p: FromBodyBase<VehicleType> = {
      tokenKey: this.token
    };

    const cacheKey = `vehicle_types_all`;
    const request = this.http.post(`${environment.apiUrl}/api/VehicleType/getall`, p).pipe(
      map((response: any) => {
        if (response.code === '401') this.authService.logout();
        else return response;
      }),
      catchError(this.handleError)
    );

    return useCache ? this.cacheService.get(cacheKey, request) : request;
  }

  clearCache() {
    this.cacheService.clearByEntity(CacheConstants.VEHICLE_TYPE);
  }
}
