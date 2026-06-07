import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FromBodyBase } from '@app/shared/models';
import { DriverFuelClosing } from '@app/shared/models/transports/driver-fuel-closing.model';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { BaseService } from '../base.service';
import { JwtService } from '../jwt.service';

@Injectable({ providedIn: 'root' })
export class DriverFuelClosingService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: DriverFuelClosing) {
    let p: FromBodyBase<DriverFuelClosing> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DriverFuelClosing/Create`, p)
      .pipe(map((r: any) => { if (r.code == '401') this.authService.logout(); else return r; }), catchError(this.handleError));
  }

  update(entity: DriverFuelClosing) {
    let p: FromBodyBase<DriverFuelClosing> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DriverFuelClosing/Update`, p)
      .pipe(map((r: any) => { if (r.code == '401') this.authService.logout(); else return r; }), catchError(this.handleError));
  }

  approve(id: number) {
    let p: FromBodyBase<DriverFuelClosing> = {};
    p.item = { id };
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DriverFuelClosing/Approve`, p)
      .pipe(map((r: any) => { if (r.code == '401') this.authService.logout(); else return r; }), catchError(this.handleError));
  }

  delete(id: number) {
    let p: FromBodyBase<DriverFuelClosing> = {};
    p.item = { id };
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DriverFuelClosing/Delete`, p)
      .pipe(map((r: any) => { if (r.code == '401') this.authService.logout(); else return r; }), catchError(this.handleError));
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<DriverFuelClosing> = {};
    let item: DriverFuelClosing = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.branchId = Number.parseInt(params.get('branchid'));
    if (params.get('vihicleId')) item.vihicleId = Number.parseInt(params.get('vihicleId'));
    if (params.get('driverId')) item.driverId = Number.parseInt(params.get('driverId'));
    if (params.get('closeReason')) item.closeReason = Number.parseInt(params.get('closeReason'));
    if (params.get('status')) p.tValue = Number.parseInt(params.get('status'));
    p.item = item;
    return this.http.post(`${environment.apiUrl}/api/DriverFuelClosing/GetPaging`, p)
      .pipe(map((r: any) => { if (r.code == '401') this.authService.logout(); else return r; }), catchError(this.handleError));
  }

  getById(id: number) {
    let p: FromBodyBase<DriverFuelClosing> = {};
    p.item = { id };
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DriverFuelClosing/GetById`, p)
      .pipe(map((r: any) => { if (r.code == '401') this.authService.logout(); else return r; }), catchError(this.handleError));
  }

  getCandidates(branchId: number, vihicleId: number, fromDate: string, toDate: string) {
    let p: FromBodyBase<DriverFuelClosing> = {};
    p.item = { branchId, vihicleId };
    p.fromDate = fromDate;
    p.toDate = toDate;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DriverFuelClosing/GetCandidates`, p)
      .pipe(map((r: any) => { if (r.code == '401') this.authService.logout(); else return r; }), catchError(this.handleError));
  }
}
