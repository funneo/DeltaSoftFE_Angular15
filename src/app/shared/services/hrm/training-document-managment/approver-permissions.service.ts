import { Injectable } from '@angular/core';
import { FromBodyBase } from '@app/shared/models';
import { ApproverPermissions } from '@app/shared/models/hrm/training-document-managment/approver-permissions';
import { environment } from '@environments/environment';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../../auth.service';
import { BaseService } from '../../base.service';
import { JwtService } from '../../jwt.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApproverPermissionsService extends BaseService {

  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token=jwtService.getToken();
  }

  add(entity:ApproverPermissions){
    let p: FromBodyBase<ApproverPermissions> = {item:{}};
    var t=Object.assign({}, entity);
    p.item = t;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/ApproverPermissions/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   

   getDetail(id: number) {
    let p: FromBodyBase<ApproverPermissions> = {item:{}};
    p.tValue = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/ApproverPermissions/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getAll(level: number = 1) {
    let p: FromBodyBase<ApproverPermissions> = {item:{}};
    p.tValue=level
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/ApproverPermissions/getAll`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getApprover(entity:ApproverPermissions) {
    let p: FromBodyBase<ApproverPermissions> = {item:{}};
    p.item.step=entity.step;
    p.item.groupL1Id=entity.groupL1Id;
    p.item.groupL2Id=entity.groupL2Id;
    p.item.branchId=entity.branchId;
    p.tokenKey = this.token;

    return this.http.post(`${environment.apiUrl}/api/ApproverPermissions/getApprover`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }


  delete(id: number) {
    let p: FromBodyBase<ApproverPermissions> = {item:{}};
    p.tValue = id;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/ApproverPermissions/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

}
