import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { DebitNotes, FromBodyBase, Pagination, RatingCS, ResponseValue } from '../models';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';
import { type } from 'os';

@Injectable({ providedIn: 'root' })
export class DebitNotesService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: DebitNotes) {
    let p: FromBodyBase<DebitNotes> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/debitnote/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  addDebit0(entity: DebitNotes) {
    let p: FromBodyBase<DebitNotes> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/debitnote/CreateDebit0`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  /**
   * Duyệt nháp (draft.DraftEntries) thành Debit thật — Phase 4 Draft Site.
   * Gửi id = draftId + item = entity đã map; BE tạo debit xong tự ghi ngược draft
   * (Status='Promoted' + refNo=debitNo + shipmentId=debitId). Trả { debitId, debitNo, alreadyPromoted }.
   */
  addFromDraft(entity: DebitNotes, draftId: number) {
    let p: FromBodyBase<DebitNotes> = {};
    p.item = entity;
    p.id = '' + draftId;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/debitnote/addFromDraft`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  update(entity: DebitNotes) {
    let p: FromBodyBase<DebitNotes> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/debitnote/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getDetail(id: string) {
    let p: FromBodyBase<DebitNotes> = {};
    p.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/debitnote/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getByRefNo(debitNo: string) {
    let p: FromBodyBase<DebitNotes> = {item:{}};
    p.item.debitNo = debitNo;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/debitnote/getbyDebitNo`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  delete(listId: string) {
    let p: FromBodyBase<DebitNotes> = {};
    p.listId = listId;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/debitnote/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getAll() {
    let p: FromBodyBase<DebitNotes> = {};
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/debitnote/getall`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  updateInvoice(listId:string, invoiceNo:string, invoiceNotes:string,invoiceDate:string,accountingDate: string) {
    let p: FromBodyBase<DebitNotes> = {item:{}};
    p.item.invoiceNo=invoiceNo;
    p.item.invoiceNotes=invoiceNotes;
    p.item.invoiceDate=invoiceDate;
    p.item.accountingDate=accountingDate;
    p.listId=listId
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/debitnote/UpdateDebtInvoice`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  updateAccountingDate(listId:string, accountingDate:string) {
    let p: FromBodyBase<DebitNotes> = {item:{}};
    p.item.accountingDate=accountingDate;
    p.listId=listId
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/debitnote/UpdateAccountingDate`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  updateDebitDate(listId:string, debitDate:string) {
    let p: FromBodyBase<DebitNotes> = {item:{}};
    p.item.debitDate=debitDate;
    p.listId=listId
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/debitnote/updateDebitDate`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  updateExchangeRate(listId:string, tygia:number) {
    let p: FromBodyBase<DebitNotes> = {item:{}};
    p.item.exchangeRate=tygia;
    p.listId=listId
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/debitnote/UpdateDebtExchangeRate`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getAllForInvoice(params: HttpParams) {
    let p: FromBodyBase<DebitNotes> = {item:{}};
    p.customerId= Number.parseInt(params.get('customerId')),
    p.branchId=Number.parseInt(params.get('branchId')),
    p.fromDate= params.get('fromDate');
    p.toDate= params.get('toDate');    
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/debitnote/GetForInvoice`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getAllForUpdateExchangeRate(params: HttpParams) {
    let p: FromBodyBase<DebitNotes> = {item:{}};
    p.fromDate= params.get('fromDate');
    p.toDate= params.get('toDate');
    p.customerId= Number.parseInt(params.get('customerId'))
    p.branchId=Number.parseInt(params.get('branchId')),
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/debitnote/GetForUpdateExchangeRate`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getLocking(params: HttpParams) {
    let p: FromBodyBase<DebitNotes> = {item:{}};
    p.fromDate= params.get('fromDate');
    p.toDate= params.get('toDate');
    p.customerId= Number.parseInt(params.get('customerId'))
    p.branchId=Number.parseInt(params.get('branchId')),
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/debitnote/GetLocking`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  
  getAccepting(params: HttpParams) {
    let p: FromBodyBase<DebitNotes> = {item:{}};
    p.fromDate= params.get('fromDate');
    p.toDate= params.get('toDate');
    p.customerId= Number.parseInt(params.get('customerId'))
    p.branchId=Number.parseInt(params.get('branchId')),
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/debitnote/GetAccepting`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }


  getPaging(params: HttpParams) {
    let p: FromBodyBase<DebitNotes> = {
      tokenKey: this.token,
      keyWord: params.get('keyword'),
      pageIndex: Number.parseInt(params.get('pageIndex')),
      pageSize: Number.parseInt(params.get('pageSize')),
      fromDate: params.get('fromDate'),
      toDate: params.get('toDate'),
      customerId: Number.parseInt(params.get('customerId')),
      branchId: Number.parseInt(params.get('branchId')),
      item:{
        debitType:params.get('debitType'),
        type:parseInt(params.get('type'))
      }
    };
    p.tValue = params.get('datetype')==null?0:Number.parseInt(params.get('datetype'));
    return this.http.post(`${environment.apiUrl}/api/debitnote/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  getCanon(params: HttpParams) {
    let p: FromBodyBase<DebitNotes> = {
      tokenKey: this.token,
      keyWord: params.get('keyword'),
      pageIndex: Number.parseInt(params.get('pageIndex')),
      pageSize: Number.parseInt(params.get('pageSize')),
      fromDate: params.get('fromDate'),
      toDate: params.get('toDate'),
      customerId: Number.parseInt(params.get('customerId')),
      branchId: Number.parseInt(params.get('branchId')),
      item:{
        debitType:params.get('debitType'),
        type:parseInt(params.get('type'))
      }
    };
    p.tValue = params.get('datetype')==null?0:Number.parseInt(params.get('datetype'));
    return this.http.post(`${environment.apiUrl}/api/debitnote/getCanon`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getReport(params: HttpParams) {
    let p: FromBodyBase<DebitNotes> = {
      tokenKey: this.token,
      keyWord: params.get('keyword'),
      pageIndex: Number.parseInt(params.get('pageIndex')),
      pageSize: Number.parseInt(params.get('pageSize')),
      fromDate: params.get('fromDate'),
      toDate: params.get('toDate'),
      customerId: Number.parseInt(params.get('customerId')),
      branchId: Number.parseInt(params.get('branchId')),
      item:{
        debitType:params.get('debitType'),
        type:parseInt(params.get('type'))
      }
    };
    return this.http.post(`${environment.apiUrl}/api/debitnote/getreport`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }


  accept(entity: any) {
    let p: FromBodyBase<DebitNotes> = {
      tokenKey:this.token,
      id: entity.id,
      keyWord:entity.text
    };
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/debitnote/accept`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  locked(listId:string) {
    let p: FromBodyBase<DebitNotes> = {
      tokenKey:this.token,item:{}
    };
    p.listId=listId
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/debitnote/locked`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  acceptList(listId:string) {
    let p: FromBodyBase<DebitNotes> = {
      tokenKey:this.token,item:{}
    };
    p.listId=listId
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/debitnote/AcceptList`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }


  rating(entity: RatingCS) {
    let p: FromBodyBase<RatingCS> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/debitnote/rating`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
}

