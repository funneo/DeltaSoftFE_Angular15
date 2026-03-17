import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { FromBodyBase } from '@app/shared/models';
import { environment } from '@environments/environment';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { JwtService } from '../jwt.service';
import { HttpClient } from '@angular/common/http';
import { SupplierVehicles } from '@app/shared/models/danhmuc/supplier-vehicles.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierVehiclesService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: SupplierVehicles) {
    let p: FromBodyBase<SupplierVehicles> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/SupplierVehicles/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  update(entity: SupplierVehicles) {
    let p: FromBodyBase<SupplierVehicles> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/SupplierVehicles/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  
  accept(id:number,flag:boolean) {
    let p: FromBodyBase<SupplierVehicles> = {item:{
      id:id
    }};
    p.bValue=flag;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/SupplierVehicles/accept`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getDetail(id: number) {
    let p: FromBodyBase<SupplierVehicles> = {item:{
      id:id
    }};
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/SupplierVehicles/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  delete(id: number) {
    let p: FromBodyBase<SupplierVehicles> = {item:{}};
    p.item.id = id;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/SupplierVehicles/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getAll(id: number, flag:boolean) {
    let p: FromBodyBase<SupplierVehicles> = {item:{supplierId:id}};
    p.item.id = id;
    p.bValue=flag;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/SupplierVehicles/getAll`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

}
