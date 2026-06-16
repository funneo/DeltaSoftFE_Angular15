import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Employee, FromBodyBase } from '../models';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';
import { SignalRService } from './signalr.service';
import { CacheConstants } from '../constants/cache.constants';

@Injectable({ providedIn: 'root' })
export class EmployeeService extends BaseService {
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
    this.cacheService.registerEntity(CacheConstants.EMPLOYEE, /employees_.*/);
  }


  uploadImage(entity: Employee, files: File) {
    let p: FromBodyBase<Employee> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    const body = JSON.stringify(p);
    const formData = new FormData();
    formData.append('TokenKey', body);
    formData.append('Files', files)
    return this.http.post(`${environment.apiUrl}/api/employee/uploadImage`, formData)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }


  add(entity: Employee) {
    let p: FromBodyBase<Employee> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/employee/add`, p)
      .pipe(
        map((response: any) => {
          if (response.code == '401')
            this.authService.logout();
          else return response;
        }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.EMPLOYEE);
          }
        }),
        catchError(this.handleError)
      );
  }

  update(entity: Employee) {
    let p: FromBodyBase<Employee> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/employee/update`, p)
      .pipe(
        map((response: any) => {
          if (response.code == '401')
            this.authService.logout();
          else return response;
        }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.EMPLOYEE);
          }
        }),
        catchError(this.handleError)
      );
  }

  getDetail(id: string) {
    let p: FromBodyBase<Employee> = {};
    p.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/employee/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  // ===== Module HR (Hồ sơ NV) — endpoint MỚI =====
  addHR(entity: Employee) {
    let p: FromBodyBase<Employee> = { item: entity, tokenKey: this.token };
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/employee/addHR`, p)
      .pipe(
        map((response: any) => {
          if (response.code == '401') this.authService.logout();
          else return response;
        }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.EMPLOYEE);
          }
        }),
        catchError(this.handleError)
      );
  }

  updateHR(entity: Employee) {
    let p: FromBodyBase<Employee> = { item: entity, tokenKey: this.token };
    return this.http.post(`${environment.apiUrl}/api/employee/updateHR`, p)
      .pipe(
        map((response: any) => {
          if (response.code == '401') this.authService.logout();
          else return response;
        }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.EMPLOYEE);
          }
        }),
        catchError(this.handleError)
      );
  }

  getDetailHR(id: string) {
    let p: FromBodyBase<Employee> = { id: id, tokenKey: this.token };
    return this.http.post(`${environment.apiUrl}/api/employee/getByIdHR`, p)
      .pipe(map((response: any) => {
        if (response.code == '401') this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  delete(id: string) {
    let p: FromBodyBase<Employee> = { item: {} };
    p.item.id = Number.parseInt(id);
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/employee/delete`, p)
      .pipe(
        map((response: any) => {
          if (response.code == '401')
            this.authService.logout();
          else return response;
        }),
        tap((response: any) => {
          if (response.code == '200' || response.code == '201') {
            this.clearCache();
            this.signalRService.notifyUpdate(CacheConstants.EMPLOYEE);
          }
        }),
        catchError(this.handleError)
      );
  }

  getAll(params: HttpParams, useCache: boolean = true) {
    const branchId = params.get('branchId');
    const cacheKey = `employees_${branchId || 'all'}`;

    const source = (() => {
      let p: FromBodyBase<Employee> = {};
      p.tokenKey = this.token;
      if (branchId) {
        p.branchId = Number.parseInt(branchId);
      }
      return this.http.post(`${environment.apiUrl}/api/employee/getall`, p)
        .pipe(map((response: any) => {
          if (response.code == '401')
            this.authService.logout();
          else return response;
        }), catchError(this.handleError));
    })();

    if (useCache) {
      return this.cacheService.get(cacheKey, source);
    }
    return source;
  }

  /**
   * Clear employee cache
   */
  clearCache() {
    this.cacheService.clearByEntity(CacheConstants.EMPLOYEE);
  }

  getbyUser(params: HttpParams) {
    let p: FromBodyBase<Employee> = { item: {} };
    p.item.branchId = Number.parseInt(params.get('branchid'));
    p.tokenKey = this.token;
    p.branchId = Number.parseInt(params.get('branchid'));
    return this.http.post(`${environment.apiUrl}/api/employee/GetbyUser`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }


  getByBranch(params: HttpParams) {
    let p: FromBodyBase<Employee> = { item: {} };
    p.tokenKey = this.token;
    p.item.branchId = Number.parseInt(params.get('branchId'));
    return this.http.post(`${environment.apiUrl}/api/employee/GetbyBranchId`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }


  getPaging(params: HttpParams) {
    let p: FromBodyBase<Employee> = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.branchId = Number.parseInt(params.get('branchId'));
    return this.http.post(`${environment.apiUrl}/api/employee/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
}

