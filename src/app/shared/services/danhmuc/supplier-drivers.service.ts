import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { SupplierDrivers } from '@app/shared/models/danhmuc/supplier-drivers.model';
import { HttpClient } from '@angular/common/http';
import { FromBodyBase } from '@app/shared/models';
import { environment } from '@environments/environment';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { JwtService } from '../jwt.service';

@Injectable({
  providedIn: 'root'
})
export class SupplierDriversService extends BaseService{
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: SupplierDrivers) {
    let p: FromBodyBase<SupplierDrivers> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/SupplierDrivers/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  update(entity: SupplierDrivers) {
    let p: FromBodyBase<SupplierDrivers> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/SupplierDrivers/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  
  accept(id:number,flag:boolean) {
    let p: FromBodyBase<SupplierDrivers> = {item:{
      id:id
    }};
    p.bValue=flag;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/SupplierDrivers/accept`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getDetail(id: number) {
    let p: FromBodyBase<SupplierDrivers> = {item:{
      id:id
    }};
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/SupplierDrivers/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  delete(id: number) {
    let p: FromBodyBase<SupplierDrivers> = {item:{}};
    p.item.id = id;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/SupplierDrivers/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getAll(id: number, flag:boolean) {
    let p: FromBodyBase<SupplierDrivers> = {item:{supplierId:id}};
    p.item.id = id;
    p.bValue=flag;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/SupplierDrivers/getAll`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }


}
