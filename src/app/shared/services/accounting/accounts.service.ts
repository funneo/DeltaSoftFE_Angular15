import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from '../base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { AccountingDebitCredit, Accounts, FromBodyBase, Pagination, ResponseValue } from '../../models';
import { JwtService } from '../jwt.service';
import { AuthService } from '../auth.service';

@Injectable({ providedIn: 'root' })
export class AccountsService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: Accounts) {
    let p: FromBodyBase<Accounts> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/accounts/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  add2(entity: Accounts) {
    let p: FromBodyBase<Accounts> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/accounts/create2`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  update(entity: Accounts) {
    let p: FromBodyBase<Accounts> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/accounts/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getDetail(id: string) {
    let p: FromBodyBase<Accounts> = {};
    p.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/accounts/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  delete(listId: string) {
    let p: FromBodyBase<Accounts> = {};
    p.listId = listId;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/accounts/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getAll() {
    let p: FromBodyBase<Accounts> = {};
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/accounts/getall`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<Accounts> = {
      tokenKey: this.token,
      keyWord: params.get('keyword'),
      pageIndex: Number.parseInt(params.get('pageIndex')),
      pageSize: Number.parseInt(params.get('pageSize')),
      fromDate: params.get('fromDate'),
      toDate: params.get('toDate'),
      employeeId: Number.parseInt(params.get('employeeId')),
      branchId: Number.parseInt(params.get('branchId')),
      item: {
        type: Number.parseInt(params.get('type')),
        accountListId: parseInt(params.get('accountListId')),
        groupType: parseInt(params.get('iTransfer')),//ck/tm/all
      }
    };

    return this.http.post(`${environment.apiUrl}/api/accounts/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  // accept(entity: Accounts) {
  //   let p: FromBodyBase<Accounts> = {};
  //   p.item = entity;
  //   p.tokenKey = this.token;
  //   return this.http.post(`${environment.apiUrl}/api/accounts/accept`, p)
  //     .pipe(map((response: any) => {
  //       if (response.code == '401')
  //         this.authService.logout();
  //       else return response;
  //     }), catchError(this.handleError));
  // }

  getFundReserve(params: HttpParams) {
    let p: FromBodyBase<Accounts> = {
      tokenKey: this.token,
      keyWord: params.get('keyword'),
      pageIndex: Number.parseInt(params.get('pageIndex')),
      pageSize: Number.parseInt(params.get('pageSize')),
      fromDate: params.get('fromDate'),
      toDate: params.get('toDate'),
      branchId: Number.parseInt(params.get('branchId')),
      item: { accountListId: Number.parseInt(params.get('accountListId')) }
    };

    return this.http.post(`${environment.apiUrl}/api/accounts/getfundreserve`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getFundReserveDetail(params: HttpParams) {
    let p: FromBodyBase<Accounts> = {
      tokenKey: this.token,
      keyWord: params.get('keyword'),
      pageIndex: Number.parseInt(params.get('pageIndex')),
      pageSize: Number.parseInt(params.get('pageSize')),
      fromDate: params.get('fromDate'),
      toDate: params.get('toDate'),
      branchId: Number.parseInt(params.get('branchId')),
      item: { accountListId: Number.parseInt(params.get('accountListId')) }
    };

    return this.http.post(`${environment.apiUrl}/api/accounts/getfundreservedetail`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getAccountingDebitCredit(params: HttpParams) {
    let p: FromBodyBase<AccountingDebitCredit> = {
      tokenKey: this.token,
      keyWord: params.get('keyword'),
      pageIndex: Number.parseInt(params.get('pageIndex')),
      pageSize: Number.parseInt(params.get('pageSize')),
      fromDate: params.get('fromDate'),
      toDate: params.get('toDate'),
      branchId: Number.parseInt(params.get('branchId')),
      item: {}
    };

    return this.http.post(`${environment.apiUrl}/api/accounts/GetDebitCredit`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getAccountingDebitCreditDetail(params: HttpParams) {
    let p: FromBodyBase<AccountingDebitCredit> = {
      tokenKey: this.token,
      keyWord: params.get('keyword'),
      pageIndex: Number.parseInt(params.get('pageIndex')),
      pageSize: Number.parseInt(params.get('pageSize')),
      fromDate: params.get('fromDate'),
      toDate: params.get('toDate'),
      branchId: Number.parseInt(params.get('branchId')),
      item: { categoryCode: params.get('categoryCode') }
    };
    return this.http.post(`${environment.apiUrl}/api/accounts/GetDebitCreditDetail`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  exportExcelDetail(params: HttpParams) {
    let p: FromBodyBase<Accounts> = {
      tokenKey: this.token,
      keyWord: params.get('keyword'),
      pageIndex: Number.parseInt(params.get('pageIndex')),
      pageSize: Number.parseInt(params.get('pageSize')),
      fromDate: params.get('fromDate'),
      toDate: params.get('toDate'),
      branchId: Number.parseInt(params.get('branchId')),
      item: { accountListId: Number.parseInt(params.get('accountListId')) }
    };
    return this.http.post(`${environment.apiUrl}/api/accounts/export-excel-detail`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  exportExcel(params: HttpParams) {
    let p: FromBodyBase<Accounts> = {
      tokenKey: this.token,
      keyWord: params.get('keyword'),
      pageIndex: Number.parseInt(params.get('pageIndex')),
      pageSize: Number.parseInt(params.get('pageSize')),
      fromDate: params.get('fromDate'),
      toDate: params.get('toDate'),
      employeeId: Number.parseInt(params.get('employeeId')),
      branchId: Number.parseInt(params.get('branchId')),
      item: {
        type: Number.parseInt(params.get('type')),
        accountListId: parseInt(params.get('accountListId')),
        groupType: parseInt(params.get('iTransfer')),//ck/tm/all
      }
    };
    return this.http.post(`${environment.apiUrl}/api/accounts/export-excel`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getDriverPayments(employeeId: number) {
    let p: FromBodyBase<Accounts> = {
      tokenKey: this.token,
      item: { employeeId: employeeId }
    };
    return this.http.post(`${environment.apiUrl}/api/accounts/GetDriverPayments`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  createForDriver(entity: Accounts) {
    let p: FromBodyBase<Accounts> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/accounts/CreateForDriver`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
}

