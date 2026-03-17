import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { JwtService } from '../jwt.service';
import { AuthService } from '../auth.service';
import { environment } from '@environments/environment';
import { FromBodyBase } from '@app/shared/models';
import { DispatchOrderCbt } from '@app/shared/models/cbt/dispatch-order-cbt.model';
import { map, catchError } from 'rxjs/operators';
import { FirebaseNotification } from '@app/shared/models/systems/notification.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseNotificationService extends BaseService {
  private token:string;
  constructor(private http:HttpClient, jwtServices: JwtService,private authenService:AuthService) {
    super();
    this.token=jwtServices.getToken();
   }


  getAll(params: HttpParams) {
    let p: FromBodyBase<FirebaseNotification> = {};
    p.tokenKey = this.token;
    p.fromDate=params.get('fromDate');
    p.toDate=params.get('toDate');
    return this.http.post(`${environment.apiUrl}/api/Notifications/getAll`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  setRead(id:number,isAll:boolean) {
    let p: FromBodyBase<FirebaseNotification> = {item:{}};
    p.tokenKey = this.token;
    p.item.id=id;
    p.bValue=isAll;
    return this.http.post(`${environment.apiUrl}/api/Notifications/setRead`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }
}
