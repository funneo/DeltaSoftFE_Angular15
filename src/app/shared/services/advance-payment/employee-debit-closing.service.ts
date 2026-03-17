import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { EmployeeDebitClosing } from '@app/shared/models/advance-payments/employee-debit-closing.model';
import { FromBodyBase } from '@app/shared/models';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { JwtService } from '../jwt.service';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeDebitClosingService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: EmployeeDebitClosing) {
    let p: FromBodyBase<EmployeeDebitClosing> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/EmployeeDebitClosing/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  update(entity: EmployeeDebitClosing) {
    let p: FromBodyBase<EmployeeDebitClosing> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/EmployeeDebitClosing/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }



  getDetail(id: number) {
    let p: FromBodyBase<EmployeeDebitClosing> = {
      item: {
        id: id
      }
    };
    p.id = id.toString();
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/EmployeeDebitClosing/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  exportExcel(item: EmployeeDebitClosing, type: number) {
    let p: FromBodyBase<EmployeeDebitClosing> = {
      item: item
    };
    p.gType = type.toString();
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/EmployeeDebitClosing/export-excel-detail`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getDebitCredit(id: number) {
    let p: FromBodyBase<EmployeeDebitClosing> = {
      item: {
        employeeId: id
      }
    };
    p.employeeId = id;
    if (id && typeof id === 'object' && 'id' in (id as any) && 'isTransfer' in (id as any)) {
      p.item.employeeId = (id as any).id;
      p.employeeId = (id as any).id;
      p.item.isTransfer = (id as any).isTransfer;
    }
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/EmployeeDebitClosing/GetDebitCredit`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  check(id: number) {
    let p: FromBodyBase<EmployeeDebitClosing> = {
      item: {
        employeeId: id
      }
    };
    p.employeeId = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/EmployeeDebitClosing/CheckEmployeeDebitClosing`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }


  delete(id: number) {
    let p: FromBodyBase<EmployeeDebitClosing> = {
      item: {
        id: id
      }
    };
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/EmployeeDebitClosing/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }


  getAll(params: HttpParams) {
    let p: FromBodyBase<EmployeeDebitClosing> = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.employeeId = Number.parseInt(params.get('employeeId'));
    p.branchId = Number.parseInt(params.get('branchId'));
    if (params.has('isTransfer')) {
      p.item = { isTransfer: params.get('isTransfer') === 'true' };
    }
    return this.http.post(`${environment.apiUrl}/api/EmployeeDebitClosing/getall`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  accept(id: number, note: string, type: number) {
    let p: FromBodyBase<EmployeeDebitClosing> = {
      item: {
        id: id,
        status: type,
        note: note
      }
    };
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/EmployeeDebitClosing/accept`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
}
