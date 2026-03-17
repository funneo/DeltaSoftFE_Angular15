import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Pagination, Role, Permissions, FromBodyBase } from '../models';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RolesService extends BaseService {
  private listRoles: Observable<Pagination<Role>>;
  constructor(private http: HttpClient) {
    super();
  }
  add(entity: Role) {
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/role/create`, entity)
      .pipe(catchError(this.handleError));
  }

  update(entity: Role) {
    return this.http.post(`${environment.apiUrl}/api/role/update`, entity)
      .pipe(catchError(this.handleError));
  }

  getDetail(id: string) {
    let p: FromBodyBase<Role> = {};
    p.id = id;
    return this.http.post<Role>(`${environment.apiUrl}/api/role/detail`,p)
    .pipe(map((res: Role) => {
      return res;
    }), catchError(this.handleError));
  }

  getAllPaging(params: HttpParams): Observable<Pagination<Role>> {
    let p: FromBodyBase<Role> = {};
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));

    return this.http.post<Pagination<Role>>(`${environment.apiUrl}/api/role/paging`, p)
      .pipe(map((res: Pagination<Role>) => {
        return res;
      }), catchError(this.handleError));
  }

  delete(id: string) {
    return this.http.delete(environment.apiUrl + '/api/role/' + id)
      .pipe(
        catchError(this.handleError)
      );
  }

  getAll() {
    return this.http.get<Role[]>(`${environment.apiUrl}/api/role`)
      .pipe(map((response: Role[]) => {
        return response;
      }), catchError(this.handleError));
  }
  getRolePermissions(roleId) {
    return this.http.get<Permissions[]>(`${environment.apiUrl}/api/role/${roleId}/permissions`)
      .pipe(catchError(this.handleError));
  }

  getRole(params: HttpParams): Observable<Pagination<Role>> {
    return this.listRoles == null ? this.getAllPaging(params) : this.listRoles;
  }
}
