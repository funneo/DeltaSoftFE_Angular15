import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Pagination, TapTin, Permissions } from '../models';
import { Observable, of } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class TapTinService extends BaseService {
    constructor(private http: HttpClient) {
        super();
    }
    add(entity: TapTin) {
        Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
        return this.http.post(`${environment.apiUrl}/api/taptin/create`, entity)
            .pipe(catchError(this.handleError));
    }

    update(entity: TapTin) {
        return this.http.put(`${environment.apiUrl}/api/taptin/update`, entity)
            .pipe(catchError(this.handleError));
    }

    getDetail(id: number) {
        return this.http.get<TapTin>(`${environment.apiUrl}/api/taptin/getbyid/${id}`)
            .pipe(catchError(this.handleError));
    }

    getAllPaging(params: HttpParams): Observable<Pagination<TapTin>> {
        return this.http.get<Pagination<TapTin>>(`${environment.apiUrl}/api/taptin/paging`, { params })
            .pipe(catchError(this.handleError));
    }

    delete(id: number) {
        return this.http.delete(environment.apiUrl + '/api/taptin/delete?id=' + id)
            .pipe(
                catchError(this.handleError)
            );
    }
}