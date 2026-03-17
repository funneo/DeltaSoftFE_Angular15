import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Pagination, LichSuTruyCap } from '../models';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LichSuTruyCapService extends BaseService {
  private listLichSuTruyCaps: LichSuTruyCap[];
  private lichSuTruyCap: LichSuTruyCap;
  constructor(private http: HttpClient) {
    super();
  }
  add(entity: LichSuTruyCap) {
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/lichsutruycap/create`, entity)
      .pipe(catchError(this.handleError));
  }

  update(entity: LichSuTruyCap) {
    return this.http.put(`${environment.apiUrl}/api/lichsutruycap/update`, entity)
      .pipe(catchError(this.handleError));
  }

  getDetail(id: number) {
    return this.http.get<LichSuTruyCap>(`${environment.apiUrl}/api/lichsutruycap/detail/${id}`)
      .pipe(catchError(this.handleError));
  }

  delete(listId: string) {
    return this.http.delete(environment.apiUrl + '/api/lichsutruycap/delete?listId=' + listId)
      .pipe(
        catchError(this.handleError)
      );
  }

  private getAll(keywork: string): Observable<LichSuTruyCap[]> {
    return this.http.get<LichSuTruyCap[]>(`${environment.apiUrl}/api/lichsutruycap/getall`)
      .pipe(
        tap((res) => {
          this.listLichSuTruyCaps = res;
        }),
        map((response: LichSuTruyCap[]) => {
          // return response.filter(x=> keywork == '' || x.ten.includes(keywork));
          return response;
        }), catchError(this.handleError));
  }

  // getLichSuTruyCaps(refresh: boolean = false, keywork: string = ''): Observable<LichSuTruyCap[]> {
  //   if(refresh || this.listLichSuTruyCaps == null){
  //     return this.getAll(keywork);
  //   }
  //   else{
  //     return of(this.listLichSuTruyCaps.filter(x=> keywork == '' || x.ten.includes(keywork)));
  //   }
  // }
  getAllPaging(params: HttpParams): Observable<Pagination<LichSuTruyCap>> {
    return this.http.get<Pagination<LichSuTruyCap>>(`${environment.apiUrl}/api/lichsutruycap/paging`, { params })
      .pipe(tap((res: Pagination<LichSuTruyCap>) => {
        return of(res);
      })
        , catchError(this.handleError));
  }

  getLichSuTruyCapCurrent(): LichSuTruyCap {
    if (this.lichSuTruyCap == null) {
      const dv = localStorage.getItem('LICHSUTRUYCAP');
      if (dv != null) {
        this.lichSuTruyCap = JSON.parse(dv);
      }
    }
    return this.lichSuTruyCap;
  }

  setLichSuTruyCapCurrent(dv: LichSuTruyCap): void {
    this.lichSuTruyCap = dv;
    localStorage.setItem('LICHSUTRUYCAP', JSON.stringify(dv));
  }
}
