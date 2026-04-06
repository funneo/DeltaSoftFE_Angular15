import { Injectable } from '@angular/core';
import { BaseService } from '../../base.service';
import { environment } from '@environments/environment';
@Injectable({
  providedIn: 'root'
})
export class GarageDeltaServiceService extends BaseService {
  private token: string;
  constructor() {
    super();
    this.token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc19kZWx0YV9lcnBfdG9rZW4iOnRydWV9.P9_ucCC_pOw0CmWWZih6tJrtx9-7uwWdVYah5DhXSdw';
  }

  async getHandover() {
    const headers = { 'Authorization': 'Bearer ' + this.token }
    const response = await fetch(`${environment.apiXuong}/delta_erp_handover`,{headers:headers});
    return await response.json();
  }
}
