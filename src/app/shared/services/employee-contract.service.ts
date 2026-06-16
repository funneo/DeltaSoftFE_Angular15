import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { BaseService } from './base.service';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';
import { FromBodyBase } from '../models';
import { EmployeeContract } from '../models/employee-contract.model';

@Injectable({ providedIn: 'root' })
export class EmployeeContractService extends BaseService {
  private token: string;
  private base = `${environment.apiUrl}/api/employeecontract`;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  private post(url: string, body: any) {
    return this.http.post(`${this.base}/${url}`, body)
      .pipe(map((r: any) => { if (r.code == '401') this.authService.logout(); else return r; }),
        catchError(this.handleError));
  }

  getPaging(filter: { keyword?: string, branchId?: number, contractTypeId?: number, year?: number, expiringInDays?: number, onlyActive?: boolean, pageIndex?: number, pageSize?: number }) {
    const p: FromBodyBase<EmployeeContract> = {
      tokenKey: this.token,
      keyWord: filter.keyword,
      branchId: filter.branchId,
      year: filter.year,
      tValue: filter.expiringInDays || 0,
      bValue: !!filter.onlyActive,
      pageIndex: filter.pageIndex || 1,
      pageSize: filter.pageSize || 20,
      item: { contractTypeId: filter.contractTypeId }
    };
    return this.post('getpaging', p);
  }

  getByEmployee(employeeId: number) {
    const p: FromBodyBase<EmployeeContract> = { tokenKey: this.token, employeeId };
    return this.post('getbyemployee', p);
  }

  getNextNumber(branchId: number, year: number, contractTypeId: number) {
    const p: FromBodyBase<EmployeeContract> = { tokenKey: this.token, branchId, year, item: { contractTypeId } };
    return this.post('getnextnumber', p);
  }

  add(entity: EmployeeContract) {
    const p: FromBodyBase<EmployeeContract> = { tokenKey: this.token, item: entity };
    return this.post('add', p);
  }

  update(entity: EmployeeContract) {
    const p: FromBodyBase<EmployeeContract> = { tokenKey: this.token, item: entity };
    return this.post('update', p);
  }

  setActive(id: number, employeeId: number) {
    const p: FromBodyBase<EmployeeContract> = { tokenKey: this.token, item: { id, employeeId } };
    return this.post('setactive', p);
  }

  delete(id: number, employeeId: number) {
    const p: FromBodyBase<EmployeeContract> = { tokenKey: this.token, item: { id, employeeId } };
    return this.post('delete', p);
  }
}
