import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtService } from '../jwt.service';
import { AuthService } from '../auth.service';
import { BaseService } from '../base.service';
import { RequestNewEmployee } from '@app/shared/models/garage/request-new-employee';
import { FromBodyBase } from '@app/shared/models';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RequestNewEmployeeService extends BaseService {
private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token=jwtService.getToken();
  }

  accept(entity:RequestNewEmployee){
    let p: FromBodyBase<RequestNewEmployee> = {item:{}};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/RequestNewEmployee/Accept`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   update(entity:RequestNewEmployee){
    let p: FromBodyBase<RequestNewEmployee> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/RequestNewEmployee/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   

   getDetail(id: number) {
    let p: FromBodyBase<RequestNewEmployee> = {};
    let item:RequestNewEmployee={
      id:id
    }
    p.item=item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/RequestNewEmployee/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }



  getPaging(params:HttpParams) {
    let p: FromBodyBase<RequestNewEmployee> = {item:{}};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate=params.get('fromDate')
    p.toDate=params.get('toDate')
    return this.http.post(`${environment.apiUrl}/api/RequestNewEmployee/getpaging`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
 }
