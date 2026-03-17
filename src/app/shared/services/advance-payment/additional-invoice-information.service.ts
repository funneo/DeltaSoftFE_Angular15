import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { AdditionalInvoiceInformation } from '@app/shared/models/advance-payments/additional-invoice-information.model';
import { FromBodyBase } from '@app/shared/models';
import { environment } from '@environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { JwtService } from '../jwt.service';
import { AuthService } from '../auth.service';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdditionalInvoiceInformationService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: AdditionalInvoiceInformation) {
    let p: FromBodyBase<AdditionalInvoiceInformation> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/AdditionalInvoiceInformation/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  update(entity: AdditionalInvoiceInformation) {
    let p: FromBodyBase<AdditionalInvoiceInformation> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/AdditionalInvoiceInformation/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  

  getDetail(id: number) {
    let p: FromBodyBase<AdditionalInvoiceInformation> = {item:{
      id:id
    }};
    p.id = id.toString();
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/AdditionalInvoiceInformation/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  delete(id: number) {
    let p: FromBodyBase<AdditionalInvoiceInformation> = {item:{
      id:id
    }};
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/AdditionalInvoiceInformation/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }


  getPaging(params: HttpParams) {
    let p: FromBodyBase<AdditionalInvoiceInformation> = {};
    p.tokenKey = this.token;
    p.fromDate=params.get('fromDate');
    p.toDate=params.get('toDate');
    p.keyWord = params.get('keyword');
    p.pageIndex=Number.parseInt(params.get('pageIndex'));
    p.pageSize=Number.parseInt(params.get('pageSize'));
    p.branchId=Number.parseInt(params.get('branchId'));
    return this.http.post(`${environment.apiUrl}/api/AdditionalInvoiceInformation/getpaging`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  accept(id:number,note:string,flag:boolean) {
    let p: FromBodyBase<AdditionalInvoiceInformation> = {item:{
      id:id,
      note:note
    }};
    p.bValue=flag;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/AdditionalInvoiceInformation/accept`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
}
