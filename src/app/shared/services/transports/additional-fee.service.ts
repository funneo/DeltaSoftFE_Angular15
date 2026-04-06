import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { JwtService } from '../jwt.service';
import { AuthService } from '../auth.service';
import { environment } from '@environments/environment';
import { DispatchOrderAdditionalFee } from '@app/shared/models/transports/dispatchorders/dispatch-order-additional-fee.model';
import { FromBodyBase } from '@app/shared/models';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdditionalFeeService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token=jwtService.getToken();
  }

  add(entity:DispatchOrderAdditionalFee){
    let p: FromBodyBase<DispatchOrderAdditionalFee> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/dispatchorderadditionalfee/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   update(entity:DispatchOrderAdditionalFee){
    let p: FromBodyBase<DispatchOrderAdditionalFee> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderAdditionalFee/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }


   updateState(entity:DispatchOrderAdditionalFee){
    let p: FromBodyBase<DispatchOrderAdditionalFee> = {};
    p.item =entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderAdditionalFee/updatestate`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   getDetail(id: number) {
    let p: FromBodyBase<DispatchOrderAdditionalFee> = {item:{}};
    p.item.id=id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderAdditionalFee/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  delete(id: number) {
    let p: FromBodyBase<DispatchOrderAdditionalFee> = {item:{}};
    p.item.id=id;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/DispatchOrderAdditionalFee/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getPaging(params:HttpParams) {
    let p: FromBodyBase<DispatchOrderAdditionalFee> = {item:{}};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate=params.get('fromDate')
    p.toDate=params.get('toDate')
    p.branchId =Number.parseInt(params.get('branchid'));
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderAdditionalFee/getpaging`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
}
