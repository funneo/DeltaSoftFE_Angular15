import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { JwtService } from '../jwt.service';
import { AuthService } from '../auth.service';
import { DispatchOrderCbt } from '@app/shared/models/cbt/dispatch-order-cbt.model';
import { FromBodyBase } from '@app/shared/models';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CbtService extends BaseService {
  private token:string;
  constructor(private http:HttpClient, jwtServices: JwtService,private authenService:AuthService) {
    super();
    this.token=jwtServices.getToken();
   }

  add(entity: DispatchOrderCbt) {
    let p: FromBodyBase<DispatchOrderCbt> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderCbt/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  update(entity: DispatchOrderCbt) {
    let p: FromBodyBase<DispatchOrderCbt> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderCbt/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }



  updateState(entity: DispatchOrderCbt) {
    let p: FromBodyBase<DispatchOrderCbt> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderCbt/updatestate`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getDetail(refNo: string) {
    let p: FromBodyBase<DispatchOrderCbt> = {};
    let item:DispatchOrderCbt={
      refNo:refNo
    }
    p.item=item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderCbt/getbyrefno`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }



  delete(refNo: string) {
    let p: FromBodyBase<DispatchOrderCbt> = {item:{}};
    p.item.refNo= refNo;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/DispatchOrderCbt/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<DispatchOrderCbt> = {item:{branchId:Number.parseInt(params.get('branchid'))}};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.fromDate=params.get('fromDate');
    p.toDate=params.get('toDate');
    p.branchId=Number.parseInt(params.get('branchid'));
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderCbt/getpaging`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }
}
