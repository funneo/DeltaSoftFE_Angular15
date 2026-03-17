import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';
import { DbsShipment } from '../models/dbs/dbs-shipment.model';
import { FromBodyBase } from '../models';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';
import { DbsShipmentActions } from '../models/dbs/dbs-shipment-actions.model';
import { DbsShipmentWorkflow } from '../models/dbs/dbs-shipment-workflow.model';
import { DbsShipmentListAttachFiles } from '../models/dbs/dbs-shipment-list-attach-files.model';

@Injectable({
  providedIn: 'root'
})
export class DbsShipmentService extends BaseService{

  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  uploadFiles(entity: DbsShipmentListAttachFiles,files:File) {
    let p: FromBodyBase<DbsShipmentListAttachFiles> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    const body=JSON.stringify(p);
    const formData=new FormData();
    formData.append('TokenKey',body);
    formData.append('Files',files)
    return this.http.post(`${environment.apiUrl}/api/DbsEdi/DbsUploadFile`, formData)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  add(entity:DbsShipment){
    let p: FromBodyBase<DbsShipment> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/DbsEdi/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   updateNotes(entity:DbsShipment){
    let p: FromBodyBase<DbsShipment> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/DbsEdi/updateNotes`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }
   updateDone(entity:DbsShipment){
    let p: FromBodyBase<DbsShipment> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/DbsEdi/updateDone`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   addWorkflow(entity:DbsShipmentWorkflow){
    let p: FromBodyBase<DbsShipmentWorkflow> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/DbsEdi/CreateWorkflow`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   deleteWorkflow(entity:DbsShipmentWorkflow){
    let p: FromBodyBase<DbsShipmentWorkflow> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/DbsEdi/DeleteWorkflow`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   getEdi(branchId:number) {
    let p: FromBodyBase<DbsShipment> = {item:{}};
    p.item.branchId=branchId;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DbsEdi/LoadDbsFiles`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getDocument() {
    let p: FromBodyBase<DbsShipment> = {item:{}};
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DbsEdi/LoadDbsDocument`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

   getDetail(id: number) {
    let p: FromBodyBase<DbsShipment> = {item:{}};
    p.item.id=id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DbsEdi/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  accept(entity:DbsShipment) {
    let p: FromBodyBase<DbsShipment> = {item:{}};
    p.item=entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DbsEdi/accept`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  done(entity:DbsShipment) {
    let p: FromBodyBase<DbsShipment> = {item:{}};
    p.item=entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DbsEdi/setDone`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }



  updateState(entity:DbsShipmentActions) {
    let p: FromBodyBase<DbsShipmentActions> = {item:{}};
    p.item=entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DbsEdi/updateState`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }


  acceptDocument(entity:DbsShipment) {
    let p: FromBodyBase<DbsShipment> = {item:{}};
    p.item=entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DbsEdi/acceptDocument`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }


  getPaging(params: HttpParams) {
    let p: FromBodyBase<DbsShipment> = {item:{}};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate=params.get('fromDate');
    p.toDate=params.get('toDate');
    p.item.branchId=Number.parseInt(params.get('branchid'));
   return this.http.post(`${environment.apiUrl}/api/DbsEdi/getpaging`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
}
