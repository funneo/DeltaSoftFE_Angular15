import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FromBodyBase } from '@app/shared/models';
import { Onleave } from '@app/shared/models/hrm/onleave.model';
import { environment } from '@environments/environment';
import { stat } from 'fs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { BaseService } from '../base.service';
import { JwtService } from '../jwt.service';

@Injectable({
  providedIn: 'root'
})
export class OnleaveService extends BaseService{
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token=jwtService.getToken();
  }

  add(entity:Onleave,status:number){
    let p: FromBodyBase<Onleave> = {item:{}};
    var t=Object.assign({}, entity);
    p.item = t;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Onleave/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   update(entity:Onleave,status:number){
    let p: FromBodyBase<Onleave> = {};
    var t=Object.assign({}, entity);
    t.status=status;
    p.item = t;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Onleave/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   approved(entity:Onleave,status:number){
    let p: FromBodyBase<Onleave> = {};
    var t=Object.assign({}, entity)
    t.status=status;
    p.item =t;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Onleave/approved`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }
   

   getDetail(id: number) {
    let p: FromBodyBase<Onleave> = {item:{}};
    p.item.id=id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Onleave/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getOnLeave(type:number) {
    let p: FromBodyBase<Onleave> = {item:{}};
    p.tokenKey = this.token;
    p.item.type=type;
    return this.http.post(`${environment.apiUrl}/api/Onleave/getOnleave`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }


  delete(id: number) {
    let p: FromBodyBase<Onleave> = {item:{}};
    p.item.id=id;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/Onleave/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getPaging(params:HttpParams) {
    let p: FromBodyBase<Onleave> = {};
    let item:Onleave={};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate=params.get('fromDate')
    p.toDate=params.get('toDate')
    p.branchId =Number.parseInt(params.get('branchid'));  
    p.item=item;
    return this.http.post(`${environment.apiUrl}/api/Onleave/getpaging`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getExport(params:HttpParams) {
    let p: FromBodyBase<Onleave> = {};
    let item:Onleave={};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.fromDate=params.get('fromDate')
    p.toDate=params.get('toDate')
    p.branchId =Number.parseInt(params.get('branchid'));  
    p.item=item;
    return this.http.post(`${environment.apiUrl}/api/Onleave/getExport`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
}
