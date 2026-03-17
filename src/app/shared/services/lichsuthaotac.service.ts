import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Pagination, LichSuThaoTac } from '../models';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LichSuThaoTacService extends BaseService {
  private listLichSuThaoTacs: LichSuThaoTac[];
  private lichSuThaoTac: LichSuThaoTac;
  constructor(private http: HttpClient) {
    super();
  }
  add(entity: LichSuThaoTac) {
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/lichsuthaotac/create`, entity)
      .pipe(catchError(this.handleError));
  }

  update(entity: LichSuThaoTac) {
    return this.http.put(`${environment.apiUrl}/api/lichsuthaotac/update`, entity)
      .pipe(catchError(this.handleError));
  }

  getDetail(id: number) {
    return this.http.get<LichSuThaoTac>(`${environment.apiUrl}/api/lichsuthaotac/detail/${id}`)
      .pipe(catchError(this.handleError));
  }

  delete(listId: string) {
    return this.http.delete(environment.apiUrl + '/api/lichsuthaotac/delete?listId=' + listId)
      .pipe(
        catchError(this.handleError)
      );
  }

  private getAll(keywork: string): Observable<LichSuThaoTac[]> {
    return this.http.get<LichSuThaoTac[]>(`${environment.apiUrl}/api/lichsuthaotac/getall`)
      .pipe(
        tap((res) => {
          this.listLichSuThaoTacs = res;
        }),
        map((response: LichSuThaoTac[]) => {
          // return response.filter(x=> keywork == '' || x.ten.includes(keywork));
          return response;
        }), catchError(this.handleError));
  }

  // getLichSuThaoTacs(refresh: boolean = false, keywork: string = ''): Observable<LichSuThaoTac[]> {
  //   if(refresh || this.listLichSuThaoTacs == null){
  //     return this.getAll(keywork);
  //   }
  //   else{
  //     return of(this.listLichSuThaoTacs.filter(x=> keywork == '' || x.ten.includes(keywork)));
  //   }
  // }
  getAllPaging(params: HttpParams): Observable<Pagination<LichSuThaoTac>> {
    return this.http.get<Pagination<LichSuThaoTac>>(`${environment.apiUrl}/api/lichsuthaotac/paging`, { params })
      .pipe(tap((res: Pagination<LichSuThaoTac>) => {
        return of(res);
      })
        , catchError(this.handleError));
  }

  getLichSuThaoTacCurrent(): LichSuThaoTac {
    if (this.lichSuThaoTac == null) {
      const dv = localStorage.getItem('LICHSUTHAOTAC');
      if (dv != null) {
        this.lichSuThaoTac = JSON.parse(dv);
      }
    }
    return this.lichSuThaoTac;
  }

  setLichSuThaoTacCurrent(dv: LichSuThaoTac): void {
    this.lichSuThaoTac = dv;
    localStorage.setItem('LICHSUTHAOTAC', JSON.stringify(dv));
  }
}
