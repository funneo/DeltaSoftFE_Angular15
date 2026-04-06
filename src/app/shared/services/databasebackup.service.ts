import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Pagination, DatabaseBackup } from '../models';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DatabaseBackupService extends BaseService {
  private listDatabaseBackups: DatabaseBackup[];
  private databaseBackup: DatabaseBackup;
  constructor(private http: HttpClient) {
    super();
  }
  restore(entity: DatabaseBackup) {
    return this.http.post(`${environment.apiUrl}/api/databasebackup/restore`, entity)
      .pipe(catchError(this.handleError));
  }

  add(entity: DatabaseBackup) {
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/databasebackup/create`, entity)
      .pipe(catchError(this.handleError));
  }

  update(entity: DatabaseBackup) {
    return this.http.put(`${environment.apiUrl}/api/databasebackup/update`, entity)
      .pipe(catchError(this.handleError));
  }

  getDetail(id: number) {
    return this.http.get<DatabaseBackup>(`${environment.apiUrl}/api/databasebackup/detail/${id}`)
      .pipe(catchError(this.handleError));
  }

  delete(listId: string) {
    return this.http.delete(environment.apiUrl + '/api/databasebackup/delete?listId=' + listId)
      .pipe(
        catchError(this.handleError)
      );
  }

  private getAll(keywork: string): Observable<DatabaseBackup[]> {
    return this.http.get<DatabaseBackup[]>(`${environment.apiUrl}/api/databasebackup/getall`)
      .pipe(
        tap((res) => {
          this.listDatabaseBackups = res;
        }),
        map((response: DatabaseBackup[]) => {
          // return response.filter(x=> keywork == '' || x.ten.includes(keywork));
          return response;
        }), catchError(this.handleError));
  }

  // getDatabaseBackups(refresh: boolean = false, keywork: string = ''): Observable<DatabaseBackup[]> {
  //   if(refresh || this.listDatabaseBackups == null){
  //     return this.getAll(keywork);
  //   }
  //   else{
  //     return of(this.listDatabaseBackups.filter(x=> keywork == '' || x.ten.includes(keywork)));
  //   }
  // }
  getAllPaging(params: HttpParams): Observable<Pagination<DatabaseBackup>> {
    return this.http.get<Pagination<DatabaseBackup>>(`${environment.apiUrl}/api/databasebackup/paging`, { params })
      .pipe(tap((res: Pagination<DatabaseBackup>) => {
        return of(res);
      })
        , catchError(this.handleError));
  }

  getDatabaseBackupCurrent(): DatabaseBackup {
    if (this.databaseBackup == null) {
      const dv = localStorage.getItem('DATABASEBACKUP');
      if (dv != null) {
        this.databaseBackup = JSON.parse(dv);
      }
    }
    return this.databaseBackup;
  }

  setDatabaseBackupCurrent(dv: DatabaseBackup): void {
    this.databaseBackup = dv;
    localStorage.setItem('DATABASEBACKUP', JSON.stringify(dv));
  }
}
