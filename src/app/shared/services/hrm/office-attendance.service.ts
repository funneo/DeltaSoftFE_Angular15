import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { BaseService } from '../base.service';
import { JwtService } from '../jwt.service';
import {
  OfficeAttendanceFilterLike, OfficeHoliday, OfficeAttendanceOpening, OfficeAttendanceNameMapReq
} from './office-attendance.types';

@Injectable({ providedIn: 'root' })
export class OfficeAttendanceService extends BaseService {
  private token: string;
  private base = `${environment.apiUrl}/api/officeAttendance`;

  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  private wrap(item: any, branchId?: number, id?: number) {
    return { tokenKey: this.token, branchId, id, item };
  }
  private post(url: string, body: any): Observable<any> {
    return this.http.post(`${this.base}/${url}`, body).pipe(
      map((r: any) => { if (r.code == '401') this.authService.logout(); else return r; }),
      catchError(this.handleError));
  }

  // ===== Import (multipart) =====
  importPreview(file: File): Observable<any> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post(`${this.base}/ImportPreview`, fd).pipe(catchError(this.handleError));
  }

  import(file: File, branchId: number, year: number, month: number, startRow: number,
         cols: { colCode: number, colName: number, colDate: number, colIn: number, colOut: number }): Observable<any> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('branchId', branchId.toString());
    fd.append('year', year.toString());
    fd.append('month', month.toString());
    fd.append('startRow', startRow.toString());
    fd.append('colCode', cols.colCode.toString());
    fd.append('colName', cols.colName.toString());
    fd.append('colDate', cols.colDate.toString());
    fd.append('colIn', cols.colIn.toString());
    fd.append('colOut', cols.colOut.toString());
    return this.http.post(`${this.base}/Import`, fd).pipe(catchError(this.handleError));
  }

  // ===== JSON =====
  reMatch(f: OfficeAttendanceFilterLike) { return this.post('ReMatch', this.wrap(f)); }
  getUnmatched(f: OfficeAttendanceFilterLike) { return this.post('GetUnmatched', this.wrap(f)); }
  nameMapSave(req: OfficeAttendanceNameMapReq) { return this.post('NameMapSave', this.wrap(req)); }
  nameMapGetAll(branchId: number) { return this.post('NameMapGetAll', this.wrap({ branchId }, branchId)); }

  calculate(f: OfficeAttendanceFilterLike) { return this.post('Calculate', this.wrap(f)); }
  getPaging(f: OfficeAttendanceFilterLike) { return this.post('GetPaging', this.wrap(f, f.branchId)); }
  getDetail(id: number) { return this.post('GetDetail', this.wrap({}, undefined, id)); }
  setStatus(f: OfficeAttendanceFilterLike) { return this.post('SetStatus', this.wrap(f)); }

  holidayGetAll(branchId: number, year: number) { return this.post('HolidayGetAll', this.wrap({ branchId, year })); }
  holidaySave(item: OfficeHoliday) { return this.post('HolidaySave', this.wrap(item)); }
  holidayDelete(id: number) { return this.post('HolidayDelete', this.wrap({ id })); }

  openingGetAll(branchId: number, year: number) { return this.post('OpeningGetAll', this.wrap({ branchId, year })); }
  openingUpsert(item: OfficeAttendanceOpening) { return this.post('OpeningUpsert', this.wrap(item)); }

  export(f: OfficeAttendanceFilterLike): Observable<Blob> {
    return this.http.post(`${this.base}/Export`, this.wrap(f, f.branchId), { responseType: 'blob' })
      .pipe(catchError(this.handleError));
  }
}
