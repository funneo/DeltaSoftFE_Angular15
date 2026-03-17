import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';
import { FromBodyBase, Shipment } from '../models';
import { Attachfiles } from '../models/attachfiles.models';
import { AuthService } from './auth.service';
import { BaseService } from './base.service';
import { JwtService } from './jwt.service';

@Injectable({
  providedIn: 'root'
})
export class AttachfilesService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: Attachfiles, files: File) {
    let p: FromBodyBase<Attachfiles> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    const body = JSON.stringify(p);
    const formData = new FormData();
    formData.append('TokenKey', body);
    formData.append('Files', files)
    return this.http.post(`${environment.apiUrl}/api/Attachfiles/create2`, formData)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  addMultiple(entity: Attachfiles, files: File[]) {
    let p: FromBodyBase<Attachfiles> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    const body = JSON.stringify(p);
    const formData = new FormData();
    formData.append('TokenKey', body);
    files.forEach(file => formData.append('Files', file));
    return this.http.post(`${environment.apiUrl}/api/Attachfiles/create2`, formData)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  update(entity: Attachfiles, files: File) {
    let p: FromBodyBase<Attachfiles> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    const body = JSON.stringify(p);
    const formData = new FormData();
    formData.append('TokenKey', body);
    formData.append('Files', files)
    return this.http.post(`${environment.apiUrl}/api/Attachfiles/update2`, formData)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  delete(entity: Attachfiles) {
    let p: FromBodyBase<Attachfiles> = {};
    p.item = entity
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/Attachfiles/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getAll(params: HttpParams) {
    let p: FromBodyBase<Attachfiles> = { item: {} };
    p.tokenKey = this.token;
    p.item.frmName = params.get('frmname');
    p.item.functionName = params.get('functionname');
    p.item.refNo = params.get('refno');
    return this.http.post(`${environment.apiUrl}/api/Attachfiles/get`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  getByShipment(id: number) {
    let p: FromBodyBase<Shipment> = { item: {} };
    p.tokenKey = this.token;
    p.item.id = id;
    return this.http.post(`${environment.apiUrl}/api/Attachfiles/GetByShipment`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

}
