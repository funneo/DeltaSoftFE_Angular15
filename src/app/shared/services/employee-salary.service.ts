import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { BaseService } from './base.service';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';
import { FromBodyBase } from '../models';
import { EmployeeSalary } from '../models/employee-contract.model';

@Injectable({ providedIn: 'root' })
export class EmployeeSalaryService extends BaseService {
  private token: string;
  private base = `${environment.apiUrl}/api/employeesalary`;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  private post(url: string, body: any) {
    return this.http.post(`${this.base}/${url}`, body)
      .pipe(map((r: any) => { if (r.code == '401') this.authService.logout(); else return r; }),
        catchError(this.handleError));
  }

  getByEmployee(employeeId: number) {
    const p: FromBodyBase<EmployeeSalary> = { tokenKey: this.token, employeeId };
    return this.post('getbyemployee', p);
  }

  add(entity: EmployeeSalary) {
    const p: FromBodyBase<EmployeeSalary> = { tokenKey: this.token, item: entity };
    return this.post('add', p);
  }

  update(entity: EmployeeSalary) {
    const p: FromBodyBase<EmployeeSalary> = { tokenKey: this.token, item: entity };
    return this.post('update', p);
  }

  setActive(id: number, employeeId: number) {
    const p: FromBodyBase<EmployeeSalary> = { tokenKey: this.token, item: { id, employeeId } };
    return this.post('setactive', p);
  }

  delete(id: number) {
    const p: FromBodyBase<EmployeeSalary> = { tokenKey: this.token, item: { id } };
    return this.post('delete', p);
  }
}
