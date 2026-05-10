import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FromBodyBase } from '@app/shared/models';
import { DriverFuelApproval } from '@app/shared/models/transports/driver-fuel-approval.model';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { BaseService } from '../base.service';
import { JwtService } from '../jwt.service';

@Injectable({
  providedIn: 'root'
})
export class DriverFuelApprovalService  extends BaseService{
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token=jwtService.getToken();
  }

  add(entity:DriverFuelApproval){
    let p: FromBodyBase<DriverFuelApproval> = {};
    p.gType='0';
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/driverfuelapproval/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

  add2(entity:DriverFuelApproval){
    let p: FromBodyBase<DriverFuelApproval> = {};
    p.gType='1';
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/driverfuelapproval/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   update(entity:DriverFuelApproval){
    let p: FromBodyBase<DriverFuelApproval> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/DriverFuelApproval/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   updateRefuelingIgas(entity:DriverFuelApproval){
    let p: FromBodyBase<DriverFuelApproval> = {};
    p.item =entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/DriverFuelApproval/UpdateRefuelingIgas`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   approved(entity:DriverFuelApproval){
    let p: FromBodyBase<DriverFuelApproval> = {};
    p.item =entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/DriverFuelApproval/Approved`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   print(entity:DriverFuelApproval){
    let p: FromBodyBase<DriverFuelApproval> = {};
    p.item =entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/DriverFuelApproval/export-excel-fuelapproval`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }
   getDetail(id: number) {
    let p: FromBodyBase<DriverFuelApproval> = {};
    let item:DriverFuelApproval={
      id:id
    }
    p.gType='0'
    p.item=item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DriverFuelApproval/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
   getDetail2(id: number) {
    let p: FromBodyBase<DriverFuelApproval> = {};
    let item:DriverFuelApproval={
      id:id
    }
    p.gType='1'
    p.item=item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DriverFuelApproval/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  delete(id: number) {
    let p: FromBodyBase<DriverFuelApproval> = {item:{}};
    p.item.id=id;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/DriverFuelApproval/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getAll(params:HttpParams) {
    let p: FromBodyBase<DriverFuelApproval> = {};
    let item:DriverFuelApproval={};
    p.tokenKey = this.token;
    p.branchId =Number.parseInt(params.get('branchid'));
    p.item=item;
    return this.http.post(`${environment.apiUrl}/api/DriverFuelApproval/getall`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getPaging(params:HttpParams,iscbt:boolean) {
    let p: FromBodyBase<DriverFuelApproval> = {};
    let item:DriverFuelApproval={};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate=params.get('fromDate')
    p.toDate=params.get('toDate')
    p.branchId =Number.parseInt(params.get('branchid'));
    item.driverId=params.get('driverId')?Number.parseInt(params.get('driverId')):0
    item.supplierId=params.get('supplierId')?Number.parseInt(params.get('supplierId')):0
    item.customerId=params.get('customerId')?Number.parseInt(params.get('customerId')):0
    item.type =Number.parseInt(params.get('type'));
    item.isCbt=iscbt;
    p.item=item;
    return this.http.post(`${environment.apiUrl}/api/DriverFuelApproval/getpaging`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getExternalFuelApproval(params:HttpParams) {
    let p: FromBodyBase<DriverFuelApproval> = {};
    let item:DriverFuelApproval={};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate=params.get('fromDate')
    p.toDate=params.get('toDate')
    p.branchId =Number.parseInt(params.get('branchid'));
    item.supplierId=params.get('supplierId')?Number.parseInt(params.get('supplierId')):0
    p.item=item;
    return this.http.post(`${environment.apiUrl}/api/DriverFuelApproval/GetExternalFuelApproval`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getBySupplierForAccount(supplierId: number) {
    let p: FromBodyBase<DriverFuelApproval> = {};
    let item: DriverFuelApproval = { supplierId };
    p.item = item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DriverFuelApproval/get-by-supplier-for-account`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  updateIgas() {
    let p: FromBodyBase<DriverFuelApproval> = {};
    let item:DriverFuelApproval={};
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Igas/GetIgasInfor`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

}
