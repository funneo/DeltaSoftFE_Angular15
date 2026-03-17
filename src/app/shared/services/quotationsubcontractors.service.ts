import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';
import { FromBodyBase } from '../models';
import { Quotationsubcontractors } from '../models/transports/quotationsubcontractors.model';
import { AuthService } from './auth.service';
import { BaseService } from './base.service';
import { JwtService } from './jwt.service';

@Injectable({
  providedIn: 'root'
})
export class QuotationsubcontractorsService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity:Quotationsubcontractors){
    let p: FromBodyBase<Quotationsubcontractors> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Quotationsubcontractors/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   update(entity:Quotationsubcontractors){
    let p: FromBodyBase<Quotationsubcontractors> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Quotationsubcontractors/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }
   setApproved(entity:Quotationsubcontractors, type:number){
    let p: FromBodyBase<Quotationsubcontractors> = {};
    p.gType=type.toString();
    p.item =entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Quotationsubcontractors/setApproved`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   getDetail(id: number) {
    let p: FromBodyBase<Quotationsubcontractors> = {};
    let item:Quotationsubcontractors={
      id:id
    }
    p.item=item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Quotationsubcontractors/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }


  delete(id: number) {
    let p: FromBodyBase<Quotationsubcontractors> = {item:{}};
    p.item.id=id;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/Quotationsubcontractors/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getAll(params:HttpParams) {
    let p: FromBodyBase<Quotationsubcontractors> = {};
    let item:Quotationsubcontractors={};
    p.tokenKey = this.token;
    p.branchId =Number.parseInt(params.get('branchid'));
    p.item=item;
    p.item.supplierId=Number.parseInt(params.get('supplierid'));
    return this.http.post(`${environment.apiUrl}/api/Quotationsubcontractors/getall`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  getQuotation(params:HttpParams) {
    let p: FromBodyBase<Quotationsubcontractors> = {};
    let item:Quotationsubcontractors={};
    p.tokenKey = this.token;
    item.supplierId =Number.parseInt(params.get('supplierid'));
    item.tollRouteCode =params.get('tollroutecode');
    item.vihicleTypeId =Number.parseInt(params.get('vihicletypeid'));
    p.item=item;
    return this.http.post(`${environment.apiUrl}/api/Quotationsubcontractors/GetByVihicleTypeAndTollRoute`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getPaging(params:HttpParams) {
    let p: FromBodyBase<Quotationsubcontractors> = {};
    let item:Quotationsubcontractors={};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.branchId =Number.parseInt(params.get('branchid'));
    item.supplierId =Number.parseInt(params.get('supplierid'));
    p.item=item;
    return this.http.post(`${environment.apiUrl}/api/quotationsubcontractors/getpaging`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
}
