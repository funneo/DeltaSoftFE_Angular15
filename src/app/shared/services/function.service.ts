import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Pagination, Functions } from '../models';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FunctionService extends BaseService {

  private chucNang: Functions;
  constructor(private http: HttpClient) {
    super();
  }
  add(entity: Functions) {
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/function`, entity)
      .pipe(catchError(this.handleError));
  }

  update(entity: Functions) {
    return this.http.put(`${environment.apiUrl}/api/function`, entity)
      .pipe(catchError(this.handleError));
  }

  getDetail(id: string) {
    return this.http.get<Functions>(`${environment.apiUrl}/api/function/${id}`)
      .pipe(catchError(this.handleError));
  }

  delete(listId: string) {
    return this.http.delete(`${environment.apiUrl}/api/function/${listId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getAll(): Observable<Functions[]> {
    return this.http.get<Functions[]>(`${environment.apiUrl}/api/function`)
      .pipe(map((response: Functions[]) => {
          return response;
        }), catchError(this.handleError));
  }

  getAllPaging(params: HttpParams): Observable<Pagination<Functions>> {
    return this.http.get<Pagination<Functions>>(`${environment.apiUrl}/api/function/paging`, { params })
      .pipe(tap((res: Pagination<Functions>) => {
        return of(res);
      })
        , catchError(this.handleError));
  }

  getFunctionsCurrent(): Functions {
    if (this.chucNang == null) {
      const dv = localStorage.getItem('CHUCNANG');
      if (dv != null) {
        this.chucNang = JSON.parse(dv);
      }
    }
    return this.chucNang;
  }

  setFunctionsCurrent(dv: Functions): void {
    this.chucNang = dv;
    localStorage.setItem('CHUCNANG', JSON.stringify(dv));
  }
}
