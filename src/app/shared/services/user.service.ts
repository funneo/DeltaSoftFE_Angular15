import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Employee, FromBodyBase, Pagination, User } from '../models';
import { JwtService } from './jwt.service';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class UserService extends BaseService {
  constructor(private http: HttpClient, private jwtService: JwtService) {
    super();
  }
  add(entity: User) {
    return this.http.post(`${environment.apiUrl}/api/user/create`, entity)
      .pipe(catchError(this.handleError));
  }

  update(entity: User) {
    return this.http.post(`${environment.apiUrl}/api/user/update`, entity)
      .pipe(catchError(this.handleError));
  }

  changedPass(entity: User) {
    return this.http.post(`${environment.apiUrl}/api/account/changedpass`, entity)
      .pipe(catchError(this.handleError));
  }

  getDetail(id) {
    let p: FromBodyBase<User> = {id:id};
    return this.http.post<User>(`${environment.apiUrl}/api/user/detail`,p)
      .pipe(catchError(this.handleError));
  }

  getAllPaging(params: HttpParams): Observable<Pagination<User>> {
    let p: FromBodyBase<User> = {};
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.branchId=Number.parseInt(params.get('branchId'));
    return this.http.post<Pagination<User>>(`${environment.apiUrl}/api/user/paging`, p)
      .pipe(map((response: Pagination<User>) => {
        return response;
      }), catchError(this.handleError));
  }

  getExternal(): Observable<User[]> {
    let p: FromBodyBase<User> = {};
    return this.http.post<User[]>(`${environment.apiUrl}/api/user/getExternal`, p)
      .pipe(map((response: User[]) => {
        return response;
      }), catchError(this.handleError));
  }

  getByHandlingGroupId(params: HttpParams): Observable<User[]> {
    let p: FromBodyBase<User> = {};
    p.id=params.get('id');
    return this.http.post<User[]>(`${environment.apiUrl}/api/user/GetByHandlingGroupId`, p)
      .pipe(map((response: User[]) => {
        return response;
      }), catchError(this.handleError));
  }

  delete(id) {
    return this.http.delete(environment.apiUrl + '/api/user/' + id)
      .pipe(
        catchError(this.handleError)
      );
  }

  getAll() {
    return this.http.get<User[]>(`${environment.apiUrl}/api/user`)
      .pipe(map((response: User[]) => {
        return response;
      }), catchError(this.handleError));
  }

  logout() {
    return this.http.post<string>(`${environment.apiUrl}/api/account/logout`, null).pipe(tap(() => {
      this.jwtService.destroyToken();
    }), catchError(this.handleError));
  }

  resetPass(entity: any) {
    return this.http.post<string>(`${environment.apiUrl}/api/account/resetpass`, entity)
    .pipe(catchError(this.handleError));
  }

  getEmployee(userName:string) {
    let p: FromBodyBase<User> = {userName:userName};
    return this.http.post<Employee[]>(`${environment.apiUrl}/api/user/getemployee`, p)
      .pipe(map((response: Employee[]) => {
        return response;
      }), catchError(this.handleError));
  }

  getByFind(params: HttpParams) {
    return this.http.get<User[]>(`${environment.apiUrl}/api/user`, { params: params })
      .pipe(map((response: User[]) => {
        return response;
      }), catchError(this.handleError));
  }
}
