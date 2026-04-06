import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { JwtService } from '../jwt.service';
import { AuthService } from '../auth.service';
import { AdvancesCbt } from '@app/shared/models/cbt/advances-cbt.model';
import { environment } from '@environments/environment';
import { FromBodyBase } from '@app/shared/models';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdvancesCbtService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: AdvancesCbt) {
    let p: FromBodyBase<AdvancesCbt> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/AdvanceCbt/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  update(entity: AdvancesCbt) {
    let p: FromBodyBase<AdvancesCbt> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/AdvanceCbt/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getDetail(id: string) {
    let p: FromBodyBase<AdvancesCbt> = {};
    p.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/AdvanceCbt/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  delete(id: number) {
    let p: FromBodyBase<AdvancesCbt> = {item:{id:id}};
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/AdvanceCbt/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getAll(params: HttpParams) {
    let p: FromBodyBase<AdvancesCbt> = {};
    p.tokenKey = this.token;
    p.employeeId=Number.parseInt(params.get('employeeId'));
    p.id=params.get('id');
    return this.http.post(`${environment.apiUrl}/api/AdvanceCbt/getall`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<AdvancesCbt> = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate=params.get('fromDate');
    p.toDate=params.get('toDate');
    p.employeeId=Number.parseInt(params.get('employeeId'));
    p.branchId=Number.parseInt(params.get('branchId'));
    p.item={
      acceptStep:Number.parseInt(params.get('step'))
    }
    console.log(p);
    
    return this.http.post(`${environment.apiUrl}/api/AdvanceCbt/getpaging`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  accept(entity: AdvancesCbt,step: number) {
    let p: FromBodyBase<AdvancesCbt> = {};
    p.item = entity;
    p.tokenKey = this.token;
    p.tValue=step;
    return this.http.post(`${environment.apiUrl}/api/AdvanceCbt/accept`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
}
