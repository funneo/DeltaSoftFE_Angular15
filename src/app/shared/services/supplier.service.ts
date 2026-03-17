import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { FromBodyBase } from '../models';
import { Supplier } from '../models/supplier';
import { BaseService } from './base.service';
import { JwtService } from './jwt.service';
import { CacheService } from './cache.service';
import { SignalRService } from './signalr.service';
import { CacheConstants } from '../constants/cache.constants';

@Injectable({
  providedIn: 'root'
})
export class SupplierService extends BaseService {
  private token: string;
  constructor(
    private http: HttpClient,
    jwtService: JwtService,
    private authService: AuthService,
    private cacheService: CacheService,
    private signalRService: SignalRService
  ) {
    super();
    this.token = jwtService.getToken();
    this.cacheService.registerEntity(CacheConstants.SUPPLIER, /suppliers_.*/);
  }

  add(entity: Supplier) {
    let p: FromBodyBase<Supplier> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Supplier/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.SUPPLIER);
          }
        }),
        catchError(this.handleError));
  }

  update(entity: Supplier) {
    let p: FromBodyBase<Supplier> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Supplier/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.SUPPLIER);
          }
        }),
        catchError(this.handleError));
  }

  getDetail(supplierCode: string) {
    let p: FromBodyBase<Supplier> = {};
    let item: Supplier = {
      supplierCode: supplierCode
    }
    p.item = item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/supplier/getbysupplierCode`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  checkTaxCode(taxCode: string) {
    let p: FromBodyBase<Supplier> = {};
    let item: Supplier = {
      tel: taxCode
    }
    p.item = item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/supplier/checkTaxCode`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getById(id: number) {
    let p: FromBodyBase<Supplier> = {};
    let item: Supplier = {
      id: id
    }
    p.item = item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/supplier/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }


  delete(listId: string) {
    let p: FromBodyBase<Supplier> = {};
    p.listId = listId;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/Supplier/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.SUPPLIER);
          }
        }),
        catchError(this.handleError));
  }

  getAll(params: HttpParams, useCache: boolean = true) {
    let p: FromBodyBase<Supplier> = {};
    p.tokenKey = this.token;
    let item: Supplier = {};
    p.branchId = Number.parseInt(params.get('branchid'));
    item.deleted = false;
    p.item = item;

    // Create cache key based on branchId
    const cacheKey = `suppliers_all_${p.branchId || '0'}`;

    const request = this.http.post(`${environment.apiUrl}/api/Supplier/getall`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));

    return useCache ? this.cacheService.get(cacheKey, request) : request;
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<Supplier> = {};
    let item: Supplier = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.item = item;
    return this.http.post(`${environment.apiUrl}/api/Supplier/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  clearCache() {
    this.cacheService.clearByEntity(CacheConstants.SUPPLIER);
  }
}
