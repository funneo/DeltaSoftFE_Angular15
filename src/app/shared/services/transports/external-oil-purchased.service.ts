import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FromBodyBase } from '@app/shared/models';
import { ExternalOilPurchased } from '@app/shared/models/transports/external-oil-purchased.model';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { BaseService } from '../base.service';
import { JwtService } from '../jwt.service';

@Injectable({
  providedIn: 'root'
})
export class ExternalOilPurchasedService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token=jwtService.getToken();
  }

  add(entity:ExternalOilPurchased){
    let p: FromBodyBase<ExternalOilPurchased> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/ExternalOilPurchased/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   update(entity:ExternalOilPurchased){
    let p: FromBodyBase<ExternalOilPurchased> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/ExternalOilPurchased/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }
   updateState(entity:ExternalOilPurchased,type:number){
    let p: FromBodyBase<ExternalOilPurchased> = {};
    var t=Object.assign({}, entity);
    t.status=type;
    p.item =t;
    p.year=type;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/ExternalOilPurchased/updateState`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   getDetail(id: number) {
    let p: FromBodyBase<ExternalOilPurchased> = {item:{}};
    p.item.id=id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/ExternalOilPurchased/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }


  delete(id:number) {
    let p: FromBodyBase<ExternalOilPurchased> = {item:{}};
    p.item.id = id;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/ExternalOilPurchased/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getAll(params:HttpParams) {
    let p: FromBodyBase<ExternalOilPurchased> = {item:{}};
    p.tokenKey = this.token;
    p.branchId =Number.parseInt(params.get('branchid'));
    return this.http.post(`${environment.apiUrl}/api/ExternalOilPurchased/getall`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getPaging(params:HttpParams,iscbt:boolean) {
    let p: FromBodyBase<ExternalOilPurchased> = {item:{isCbt:iscbt}};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate=params.get('fromDate')
    p.toDate=params.get('toDate')
    if(params.get('branchid'))p.item.branchId =Number.parseInt(params.get('branchid'));
    if(params.get('employeeid')) p.item.employeeId =Number.parseInt(params.get('employeeid'));
    return this.http.post(`${environment.apiUrl}/api/ExternalOilPurchased/getpaging`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
}
