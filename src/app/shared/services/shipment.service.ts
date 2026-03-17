import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Shipment, FromBodyBase, Pagination, DebitNoteDetail } from '../models';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ShipmentService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: Shipment) {
    let p: FromBodyBase<Shipment> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/shipment/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  update(entity: Shipment) {
    let p: FromBodyBase<Shipment> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/shipment/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getDetail(id: string) {
    let p: FromBodyBase<Shipment> = {};
    p.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/shipment/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  getByJobId(jobId: string) {
    let p: FromBodyBase<Shipment> = {item:{jobId:jobId}};
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/shipment/getByJobId`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  delete(listId: string) {
    let p: FromBodyBase<Shipment> = {};
    p.listId = listId;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/shipment/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getAll(params: HttpParams ) {
    let p: FromBodyBase<Shipment> = {
      tokenKey:this.token,
      item:{}
    };
    p.customerId= Number.parseInt(params.get('customerId'));
    p.branchId=Number.parseInt(params.get('branchId'));
    p.item.isFinish=params.get('isFinish')=='true';
    return this.http.post(`${environment.apiUrl}/api/shipment/getall`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getForDebitNotes(params: HttpParams ) {
    let p: FromBodyBase<Shipment> = {
      tokenKey:this.token,
      item:{}
    };
    p.customerId= Number.parseInt(params.get('customerId'));
    p.branchId=Number.parseInt(params.get('branchId'));
    return this.http.post(`${environment.apiUrl}/api/shipment/getfordebitnotes`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getAllByCustomer(params: HttpParams ) {
    let p: FromBodyBase<Shipment> = {};
    let item:Shipment={};
    p.tokenKey = this.token;
    p.customerId= Number.parseInt(params.get('customerId'));
    item.isFinish=params.get('isFinish')=='1';
    item.branchId=Number.parseInt(params.get('branchId'))
    p.item=item;
    return this.http.post(`${environment.apiUrl}/api/shipment/getall`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  getAllByUser(params: HttpParams ) {
    let p: FromBodyBase<Shipment> = {};
    let item:Shipment={};
    p.tokenKey = this.token;
    item.isFinish=false;
    item.branchId=Number.parseInt(params.get('branchId'))
    p.item=item;
    return this.http.post(`${environment.apiUrl}/api/shipment/getallByUser`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<Shipment> = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate=params.get('fromDate');
    p.toDate=params.get('toDate');
    p.customerId=Number.parseInt(params.get('customerId'));
    p.branchId=Number.parseInt(params.get('branchId'));
    p.item={
      shipmentType: Number.parseInt(params.get('shipmentType'))
    };
    return this.http.post(`${environment.apiUrl}/api/shipment/getpaging`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getPagingNormal(params: HttpParams) {
    let p: FromBodyBase<Shipment> = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate=params.get('fromDate');
    p.toDate=params.get('toDate');
    p.customerId=Number.parseInt(params.get('customerId'));
    p.branchId=Number.parseInt(params.get('branchId'));
    p.item={
      shipmentType: Number.parseInt(params.get('shipmentType'))
    };
    return this.http.post(`${environment.apiUrl}/api/shipment/getpagingNormal`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  // Lấy lô hàng canon để lên Debit
  getJobCanon(params: HttpParams) {
    let p: FromBodyBase<Shipment> = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('roadCode');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate=params.get('fromDate');
    p.toDate=params.get('toDate');
    p.customerId=Number.parseInt(params.get('customerId'));
    p.branchId=Number.parseInt(params.get('branchId'));
    p.item={
      shipmentType: Number.parseInt(params.get('shipmentType'))
    };
    return this.http.post(`${environment.apiUrl}/api/shipment/shipment-canon`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  createDebitCanon(params: HttpParams) {
    let p: FromBodyBase<DebitNoteDetail> = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('listId');
    p.branchId=Number.parseInt(params.get('branchId'));
    p.customerId=Number.parseInt(params.get('customerId'));
    p.item={
      rVat: Number.parseInt(params.get('vat'))
    };
    return this.http.post(`${environment.apiUrl}/api/shipment/debit-canon`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  copy(id: string) {
    let p: FromBodyBase<Shipment> = {
      tokenKey:this.token,
      item:{}
    };
    p.id = id;
    return this.http.post(environment.apiUrl + `/api/shipment/copy`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  closeJob(id: number, b:boolean) {
    let p: FromBodyBase<Shipment> = {
      tokenKey:this.token,
      item:{
        isFinish:b
      }
    };
    p.id = id.toString();
    return this.http.post(environment.apiUrl + `/api/shipment/finish`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
}

