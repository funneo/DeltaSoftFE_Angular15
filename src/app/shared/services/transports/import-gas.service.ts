import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FromBodyBase } from '@app/shared/models';
import { ImportGas } from '@app/shared/models/transports/import-gas.model';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { BaseService } from '../base.service';
import { JwtService } from '../jwt.service';

@Injectable({
  providedIn: 'root'
})
export class ImportGasService extends BaseService{
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token=jwtService.getToken();
  }

  add(entity:ImportGas){
    let p: FromBodyBase<ImportGas> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/ImportGas/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   update(entity:ImportGas){
    let p: FromBodyBase<ImportGas> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/ImportGas/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }
   updateState(entity:ImportGas,type:number){
    let p: FromBodyBase<ImportGas> = {};
    p.item =entity;
    p.year=type;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/ImportGas/updateState`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   getDetail(id: number) {
    let p: FromBodyBase<ImportGas> = {};
    let item:ImportGas={
      id:id
    }
    p.item=item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/ImportGas/getbyid`, p)
    .pipe(map((response: any) => {
      console.log(response);
      
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }


  delete(listId: string) {
    let p: FromBodyBase<ImportGas> = {};
    p.listId = listId;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/ImportGas/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getAll(params:HttpParams) {
    let p: FromBodyBase<ImportGas> = {};
    let item:ImportGas={};
    p.tokenKey = this.token;
    p.branchId =Number.parseInt(params.get('branchid'));
    p.item=item;
    return this.http.post(`${environment.apiUrl}/api/ImportGas/getall`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
 
  getPaging(params:HttpParams) {
    let p: FromBodyBase<ImportGas> = {};
    let item:ImportGas={};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate=params.get('fromDate')
    p.toDate=params.get('toDate')
    p.branchId =Number.parseInt(params.get('branchid'));
    item.supplierId =Number.parseInt(params.get('supplierid'));   
    p.item=item;
    return this.http.post(`${environment.apiUrl}/api/ImportGas/getpaging`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
}
