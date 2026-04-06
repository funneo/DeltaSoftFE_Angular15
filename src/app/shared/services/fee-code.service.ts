import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { FeeCode, ResponseValue } from '@app/shared/models';
import { Observable } from 'rxjs';

import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FeeCodeService {
  private url = environment.apiUrl + '/api/FeeCode';

  constructor(private http: HttpClient) { }

  getAll(parentId?: number, level?: number, status?: number): Observable<ResponseValue<FeeCode[]>> {
    const obj = { 
      Item: { 
        ParentId: parentId, 
        Level: level, 
        Status: status 
      } 
    };
    return this.http.post<ResponseValue<FeeCode[]>>(this.url + '/GetAll', obj);
  }

  getPaging(params: HttpParams): Observable<ResponseValue<any>> {
    const keyword = params.get('keyword');
    const pageIndex = params.get('pageIndex');
    const pageSize = params.get('pageSize');
    const parentId = params.get('parentId');
    const level = params.get('level');
    const status = params.get('status');
    const feeCode = params.get('feeCode');
    const feeName = params.get('feeName');
    const feeNameEnglish = params.get('feeNameEnglish');

    const obj = {
      KeyWord: keyword,
      PageIndex: pageIndex,
      PageSize: pageSize,
      Item: {
        parentId: parentId,
        level: level,
        status: status,
        feeCode: feeCode,
        feeName: feeName,
        feeNameEnglish: feeNameEnglish
      }
    };
    return this.http.post<ResponseValue<any>>(this.url + '/GetPaging', obj);
  }

  add(item: FeeCode): Observable<ResponseValue<any>> {
    return this.http.post<ResponseValue<any>>(this.url + '/Create', { Item: item });
  }

  update(item: FeeCode): Observable<ResponseValue<any>> {
    return this.http.post<ResponseValue<any>>(this.url + '/Update', { Item: item });
  }

  delete(listId: string): Observable<ResponseValue<any>> {
    return this.http.post<ResponseValue<any>>(this.url + '/Delete', { ListId: listId });
  }

  changeStatus(id: number, status: number): Observable<ResponseValue<any>> {
    return this.http.post<ResponseValue<any>>(this.url + '/ChangeStatus', { Item: { id, status } });
  }

  getDetail(id: string): Observable<ResponseValue<FeeCode>> {
    return this.http.post<ResponseValue<FeeCode>>(this.url + '/GetById', { Id: id });
  }
}
