import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FromBodyBase } from '@app/shared/models';
import { FuelClosing } from '@app/shared/models/transports/fuel-closing.model';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { BaseService } from '../base.service';
import { JwtService } from '../jwt.service';

@Injectable({
  providedIn: 'root'
})
export class FuelClosingService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService ) {
    super();
    this.token=jwtService.getToken();
  }

  add(entity:FuelClosing){
    let p: FromBodyBase<FuelClosing> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/FuelClosing/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

  delete(id:number){
    let p: FromBodyBase<FuelClosing> = {item:{
      id:id
    }};
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/FuelClosing/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }
   
  checkClosing(id:number){
    let p: FromBodyBase<FuelClosing> = {item:{
      gasSiteId:id
    }};
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/FuelClosing/checkClosing`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

  update(entity:FuelClosing){
    let p: FromBodyBase<FuelClosing> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/FuelClosing/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }
   
  accept(entity:FuelClosing){
    let p: FromBodyBase<FuelClosing> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/FuelClosing/accept`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   getDetail(id: number) {
    let p: FromBodyBase<FuelClosing> = {};
    let item:FuelClosing={
      id:id
    }
    p.item=item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/FuelClosing/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  
  exportExcel(item:FuelClosing,type:number) {
    let p: FromBodyBase<FuelClosing> = {item:item
    };
    p.gType=type.toString();
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/FuelClosing/export-excel-detail`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  
  
  getForClosing(id:number) {
    let p: FromBodyBase<FuelClosing> = {};
    let item:FuelClosing={
      gasSiteId:id
    }
    p.item=item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/FuelClosing/getForClosing`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getAll(params:HttpParams) {
    let p: FromBodyBase<FuelClosing> = {};
    let item:FuelClosing={};
    p.tokenKey = this.token;
    p.branchId =Number.parseInt(params.get('branchid'));
    p.item=item;
    return this.http.post(`${environment.apiUrl}/api/FuelClosing/getall`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getPaging(params:HttpParams) {
    let p: FromBodyBase<FuelClosing> = {};
    let item:FuelClosing={};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate=params.get('fromDate')
    p.toDate=params.get('toDate')
    p.branchId =Number.parseInt(params.get('branchid'));
    item.gasSiteId=params.get('gasSiteId')?Number.parseInt(params.get('gasSiteId')):0
    p.item=item;
    return this.http.post(`${environment.apiUrl}/api/FuelClosing/getpaging`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
}


