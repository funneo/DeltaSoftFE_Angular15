import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { JwtService } from '../jwt.service';
import { AuthService } from '../auth.service';
import { environment } from '@environments/environment';
import { FromBodyBase } from '@app/shared/models';
import { catchError, map } from 'rxjs/operators';
import { SalesMarketingSublist } from '@app/shared/models/sales-marketing/sales-marketing-sublist.model';

@Injectable({
  providedIn: 'root'
})
export class SalesSublistService extends BaseService{

  private token: string;

  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  // Add a new SalesMarketingSublist entry
  add(entity: SalesMarketingSublist) {
    let p: FromBodyBase<SalesMarketingSublist> = {};
    p.item = entity;
    p.tokenKey = this.token;

    return this.http.post(`${environment.apiUrl}/api/SalesMarketingSublist/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401') {
          this.authService.logout();
        } else {
          return response;
        }
      }), catchError(this.handleError));
  }

  // Update a SalesMarketingSublist entry
  update(entity: SalesMarketingSublist) {
    let p: FromBodyBase<SalesMarketingSublist> = {};
    p.item = entity;
    p.tokenKey = this.token;

    return this.http.post(`${environment.apiUrl}/api/SalesMarketingSublist/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401') {
          this.authService.logout();
        } else {
          return response;
        }
      }), catchError(this.handleError));
  }

  // Get details by Id
  getDetail(id: string) {
    let p: FromBodyBase<SalesMarketingSublist> = {};
    p.id = id;
    p.tokenKey = this.token;

    return this.http.post(`${environment.apiUrl}/api/SalesMarketingSublist/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401') {
          this.authService.logout();
        } else {
          return response;
        }
      }), catchError(this.handleError));
  }

  // Delete a SalesMarketingSublist entry
  delete(id: number) {
    let p: FromBodyBase<SalesMarketingSublist> = { item: { id: id } };
    p.tokenKey = this.token;

    return this.http.post(environment.apiUrl + `/api/SalesMarketingSublist/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401') {
          this.authService.logout();
        } else {
          return response;
        }
      }), catchError(this.handleError));
  }

  // Get all SalesMarketingSublist entries
  getAll(params: HttpParams) {
    let p: FromBodyBase<SalesMarketingSublist> = {item:{}};
    p.tokenKey = this.token;
    p.item.type = Number.parseInt(params.get('type'));
    p.item.languages=params.get('languages');
    return this.http.post(`${environment.apiUrl}/api/SalesMarketingSublist/getall`, p)
      .pipe(map((response: any) => {
        if (response.code == '401') {
          this.authService.logout();
        } else {
          return response;
        }
      }), catchError(this.handleError));
  }
}
