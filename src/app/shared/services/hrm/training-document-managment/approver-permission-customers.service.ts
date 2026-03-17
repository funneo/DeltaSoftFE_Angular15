import { Injectable } from '@angular/core';
import { AuthService } from '../../auth.service';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../../base.service';
import { JwtService } from '../../jwt.service';
import { ApproverPermissionCustomers } from '@app/shared/models/hrm/training-document-management/approver-permission-customers';
import { FromBodyBase } from '@app/shared/models';
import { environment } from '@environments/environment';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApproverPermissionCustomersService extends BaseService  {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
     this.token=jwtService.getToken();
  }

  add(entity:ApproverPermissionCustomers){
      let p: FromBodyBase<ApproverPermissionCustomers> = {item:{}};
      var t=Object.assign({}, entity);
      p.item = t;
      p.tokenKey = this.token;
      Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
      return this.http.post(`${environment.apiUrl}/api/ApproverPermissionCustomers/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
     }
  
     
  update(entity:ApproverPermissionCustomers){
      let p: FromBodyBase<ApproverPermissionCustomers> = {item:{}};
      var t=Object.assign({}, entity);
      p.item = t;
      p.tokenKey = this.token;
      Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
      return this.http.post(`${environment.apiUrl}/api/ApproverPermissionCustomers/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
     }
  
     
  
  
    getById(id: number = 1) {
      let p: FromBodyBase<ApproverPermissionCustomers> = {item:{}};
      p.item.id=id
      p.tokenKey = this.token;
      return this.http.post(`${environment.apiUrl}/api/ApproverPermissionCustomers/GetByApproverPermissionId`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
    }
  

  
    delete(id: number) {
      let p: FromBodyBase<ApproverPermissionCustomers> = {item:{}};
      p.tValue = id;
      p.tokenKey = this.token;
      return this.http.post(environment.apiUrl + `/api/ApproverPermissionCustomers/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
    }
}
