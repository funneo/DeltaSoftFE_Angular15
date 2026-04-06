import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FromBodyBase } from '@app/shared/models';
import { OnleaveManagement } from '@app/shared/models/hrm/onleave-management.model';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { BaseService } from '../base.service';
import { JwtService } from '../jwt.service';

@Injectable({
  providedIn: 'root'
})
export class OnleaveManagementService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token=jwtService.getToken();
  }

  add(entity:OnleaveManagement){
    let p: FromBodyBase<OnleaveManagement> = {item:{}};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/OnleaveManagement/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }


  get(params:HttpParams) {
    let p: FromBodyBase<OnleaveManagement> = {item:{}};
    p.tokenKey = this.token;
    p.item.branchId= Number.parseInt(params.get('branchid'));
    p.item.years=Number.parseInt(params.get('year'));
    return this.http.post(`${environment.apiUrl}/api/OnleaveManagement/get`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }
}
