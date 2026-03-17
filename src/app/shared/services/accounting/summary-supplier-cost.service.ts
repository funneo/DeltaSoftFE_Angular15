
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from '../base.service';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { SummarySupplierCost, FromBodyBase } from '../../models';
import { JwtService } from '../jwt.service';
import { AuthService } from '../auth.service';

@Injectable({ providedIn: 'root' })
export class SummarySupplierCostsService extends BaseService {
  private token: string;

  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: SummarySupplierCost) {
    let p: FromBodyBase<SummarySupplierCost> = { item: entity, tokenKey: this.token };
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/SummarySupplierCosts/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  update(entity: SummarySupplierCost) {
    let p: FromBodyBase<SummarySupplierCost> = { item: entity, tokenKey: this.token };
    return this.http.post(`${environment.apiUrl}/api/SummarySupplierCosts/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getDetail(id: number) {
    let p: FromBodyBase<SummarySupplierCost> = { item:{id: id}, tokenKey: this.token };
    return this.http.post(`${environment.apiUrl}/api/SummarySupplierCosts/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  delete(id: number) {
    let p: FromBodyBase<SummarySupplierCost> = { item:{id:id}, tokenKey: this.token };
    return this.http.post(`${environment.apiUrl}/api/SummarySupplierCosts/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }



  getPaging(params: HttpParams) {
    let p: FromBodyBase<SummarySupplierCost> = {
      tokenKey: this.token,
      keyWord: params.get('keyword'),
      pageIndex: Number.parseInt(params.get('pageIndex')),
      pageSize: Number.parseInt(params.get('pageSize')),
      fromDate: params.get('fromDate'),
      toDate: params.get('toDate'),
      branchId: Number.parseInt(params.get('branchId')),
      item: { supplierId: Number.parseInt(params.get('supplierId')) }
    };
    return this.http.post(`${environment.apiUrl}/api/SummarySupplierCosts/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
}
