import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FromBodyBase } from '@app/shared/models';
import { Ports } from '@app/shared/models/danhmuc/ports.model';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { CacheService } from '../cache.service';
import { BaseService } from '../base.service';
import { JwtService } from '../jwt.service';


@Injectable({
  providedIn: 'root',
})
export class PortsService extends BaseService {
  private token: string;

  constructor(
    private http: HttpClient,
    jwtService: JwtService,
    private authService: AuthService,
    private cacheService: CacheService
  ) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: Ports) {
    const p: FromBodyBase<Ports> = {
      item: entity,
      tokenKey: this.token,
    };
    Object.keys(entity).forEach((key) =>
      entity[key] === null ? delete entity[key] : ''
    );
    return this.http.post(`${environment.apiUrl}/api/Ports/create`, p).pipe(
      map((response: any) => {
        this.clearCache();
        if (response.code === '401') this.authService.logout();
        else return response;
      }),
      catchError(this.handleError)
    );
  }

  update(entity: Ports) {
    const p: FromBodyBase<Ports> = {
      item: entity,
      tokenKey: this.token,
    };
    Object.keys(entity).forEach((key) =>
      entity[key] === null ? delete entity[key] : ''
    );
    return this.http.post(`${environment.apiUrl}/api/Ports/update`, p).pipe(
      map((response: any) => {
        this.clearCache();
        if (response.code === '401') this.authService.logout();
        else return response;
      }),
      catchError(this.handleError)
    );
  }

  getDetail(code: string) {
    const p: FromBodyBase<Ports> = {
      item: { code },
      tokenKey: this.token,
    };
    return this.http.post(`${environment.apiUrl}/api/Ports/getbycode`, p).pipe(
      map((response: any) => {
        if (response.code === '401') this.authService.logout();
        else return response;
      }),
      catchError(this.handleError)
    );
  }

  delete(code: string) {
    const p: FromBodyBase<Ports> = {
      item: { code },
      tokenKey: this.token,
    };
    return this.http.post(`${environment.apiUrl}/api/Ports/delete`, p).pipe(
      map((response: any) => {
        this.clearCache();
        if (response.code === '401') this.authService.logout();
        else return response;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * @param branchId null/0 = lấy tất cả cảng; >0 = cảng của chi nhánh đó + cảng dùng chung.
   * @param useCache false = luôn gọi API. Trang danh mục phải dùng false, nếu không đổi
   *   chi nhánh lần thứ 2 sẽ ăn cache 60 phút (CacheService) và KHÔNG gọi API nữa.
   *   Các modal (FCL, lệnh điều xe…) giữ mặc định true — cache tách theo chi nhánh,
   *   nếu dùng chung 1 key thì màn khác sẽ ăn phải kết quả đã lọc của trang danh mục.
   */
  getAll(branchId?: number, useCache: boolean = true) {
    const p: FromBodyBase<Ports> = {
      item: { branchId: branchId || 0 },
      tokenKey: this.token
    };
    const cacheKey = `ports_all_${branchId || 0}`;
    const request = this.http.post(`${environment.apiUrl}/api/Ports/getall`, p).pipe(
      map((response: any) => {
        if (response.code === '401') this.authService.logout();
        else return response;
      }),
      catchError(this.handleError)
    );
    return useCache ? this.cacheService.get(cacheKey, request) : request;
  }

  getAllGroupPorts() {
    const p: FromBodyBase<Ports> = {
      tokenKey: this.token
    };
    const cacheKey = `ports_groups`;
    const request = this.http.post(`${environment.apiUrl}/api/Ports/getAllGroupPorts`, p).pipe(
      map((response: any) => {
        if (response.code === '401') this.authService.logout();
        else return response;
      }),
      catchError(this.handleError)
    );
    return this.cacheService.get(cacheKey, request);
  }

  clearCache() {
    this.cacheService.clearPattern(/^ports_/);
  }

}
