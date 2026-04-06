import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { JwtService } from '../jwt.service';
import { AuthService } from '../auth.service';
import { VehicleInspectionPermission } from '@app/shared/models/garage/vehicle-inspection-permission.model';
import { FromBodyBase } from '@app/shared/models';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VehicleInspectionPermissionService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token=jwtService.getToken();
  }

  add(entity:VehicleInspectionPermission){
    let p: FromBodyBase<VehicleInspectionPermission> = {item:{}};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/VehicleInspectionPermission/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }


   delete(id: number) {
    let p: FromBodyBase<VehicleInspectionPermission> = {};
    let item:VehicleInspectionPermission={
      id:id
    }
    p.item=item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/VehicleInspectionPermission/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  get(entity:VehicleInspectionPermission) {
    let p: FromBodyBase<VehicleInspectionPermission> = {item:{}};
    p.tokenKey = this.token;
    p.item=entity
    return this.http.post(`${environment.apiUrl}/api/VehicleInspectionPermission/get`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
}
