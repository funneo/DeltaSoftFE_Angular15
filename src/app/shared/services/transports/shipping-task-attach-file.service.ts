import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';
import { BaseService } from '../base.service';
import { JwtService } from '../jwt.service';
import { AuthService } from '../auth.service';
import { ShippingTaskAttachFile } from '@app/shared/models/transports/shipping-task-attach-file';
import { FromBodyBase } from '@app/shared/models';


@Injectable({
  providedIn: 'root'
})
export class ShippingTaskAttachFileService extends BaseService {
  private token: string;

  constructor(
    private http: HttpClient,
    jwtService: JwtService,
    private authService: AuthService
  ) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: ShippingTaskAttachFile,files:File) {
      let p: FromBodyBase<ShippingTaskAttachFile> = {};
      p.item = entity;
      p.tokenKey = this.token;
      Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
      const body=JSON.stringify(p);
      const formData=new FormData();
      formData.append('TokenKey',body);
      formData.append('Files',files)
      return this.http.post(`${environment.apiUrl}/api/ShippingTaskAttachFiles/create`, formData)
        .pipe(map((response: any) => {
          if (response.code == '401')
            this.authService.logout();
          else return response;
        }), catchError(this.handleError));
    }
    update(entity: ShippingTaskAttachFile,files:File) {
      let p: FromBodyBase<ShippingTaskAttachFile> = {};
      p.item = entity;
      p.tokenKey = this.token;
      Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
      const body=JSON.stringify(p);
      const formData=new FormData();
      formData.append('TokenKey',body);
      formData.append('Files',files)
      return this.http.post(`${environment.apiUrl}/api/ShippingTaskAttachFiles/update`, formData)
        .pipe(map((response: any) => {
          if (response.code == '401')
            this.authService.logout();
          else return response;
        }), catchError(this.handleError));
    }
  
    delete(entity: ShippingTaskAttachFile) {
      let p: FromBodyBase<ShippingTaskAttachFile> = {};
      p.item=entity
      p.tokenKey = this.token;
      return this.http.post(environment.apiUrl + `/api/ShippingTaskAttachFiles/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
    }
  
    getByShippingTask(id:number) {
      let p: FromBodyBase<ShippingTaskAttachFile> = {item:{}};
      p.tokenKey = this.token;
      p.item.shippingTaskId=id;

      return this.http.post(`${environment.apiUrl}/api/ShippingTaskAttachFiles/GetByShippingTaskId`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
    }
    getById(id:number) {
      let p: FromBodyBase<ShippingTaskAttachFile> = {item:{}};
      p.tokenKey = this.token;
      p.item.id=id;
      return this.http.post(`${environment.apiUrl}/api/ShippingTaskAttachFiles/GetById`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
    }
  
}
