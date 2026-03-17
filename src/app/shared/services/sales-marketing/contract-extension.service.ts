import { ContractExtension } from './../../models/sales-marketing/contract-extension.model';
import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { JwtService } from '../jwt.service';
import { AuthService } from '../auth.service';
import { FromBodyBase } from '@app/shared/models';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ContractExtensionService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }


  add(entity: ContractExtension) {
    let p: FromBodyBase<ContractExtension> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/ContractExtension/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  update(entity: ContractExtension) {
    let p: FromBodyBase<ContractExtension> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/ContractExtension/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  updateStatus(entity: ContractExtension) {
    let p: FromBodyBase<ContractExtension> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/ContractExtension/updateStatus`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getDetail(id: number) {
    let p: FromBodyBase<ContractExtension> = {item:{id:id}};
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/ContractExtension/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  delete(id: number) {
    let p: FromBodyBase<ContractExtension> = {item:{id:id}};
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/ContractExtension/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getAll(params: HttpParams) {
    let p: FromBodyBase<ContractExtension> = {
      tokenKey:this.token,
      item:{}
    };
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    return this.http.post(`${environment.apiUrl}/api/ContractExtension/getall`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

}
