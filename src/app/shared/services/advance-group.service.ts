import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { AdvanceGroup, FromBodyBase, Pagination } from '../models';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AdvanceGroupService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: AdvanceGroup) {
    let p: FromBodyBase<AdvanceGroup> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/advancegroup/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  update(entity: AdvanceGroup) {
    let p: FromBodyBase<AdvanceGroup> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/advancegroup/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getDetail(id: string) {
    let p: FromBodyBase<AdvanceGroup> = {};
    p.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/advancegroup/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  delete(listId: string) {
    let p: FromBodyBase<AdvanceGroup> = {};
    p.listId = listId;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/advancegroup/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getAll() {
    let p: FromBodyBase<AdvanceGroup> = {};
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/advancegroup/getall`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<AdvanceGroup> = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    return this.http.post(`${environment.apiUrl}/api/advancegroup/getpaging`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
}

