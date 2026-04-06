import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '.';
import { FromBodyBase } from '../models';
import { Jobgroupoption } from '../models/jobgroupoption';
import { BaseService } from './base.service';
import { JwtService } from './jwt.service';

@Injectable({
  providedIn: 'root'
})
export class JobgroupoptionService extends BaseService{
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity:Jobgroupoption){
    let p: FromBodyBase<Jobgroupoption> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/jobgroupoption/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   update(entity:Jobgroupoption){
    let p: FromBodyBase<Jobgroupoption> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/jobgroupoption/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }
   getDetail(id: string) {
    let p: FromBodyBase<Jobgroupoption> = {};
    p.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Jobgroupoption/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }


  delete(id: number) {
    let p: FromBodyBase<Jobgroupoption> = {item:{}};
    p.item.id=id;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/Jobgroupoption/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getAll() {
    let p: FromBodyBase<Jobgroupoption> = {};
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Jobgroupoption/getall`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  getByJobGroup(params:HttpParams) {
    let p: FromBodyBase<Jobgroupoption> = {};
    let item:Jobgroupoption={};
    item.jobGroupId=Number.parseInt(params.get('jobGroupId'));
    item.includeProcedure=params.get('includeProcedure')=='1';
    p.tokenKey = this.token;
    p.item=item;
    return this.http.post(`${environment.apiUrl}/api/Jobgroupoption/getbyjobgroup`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  getPaging(params:HttpParams) {
    let p: FromBodyBase<Jobgroupoption> = {};
    let item:Jobgroupoption={};
    item.jobGroupId=Number.parseInt(params.get('jobgroupId'));
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.item=item;
    return this.http.post(`${environment.apiUrl}/api/jobgroupoption/getpaging`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
}
