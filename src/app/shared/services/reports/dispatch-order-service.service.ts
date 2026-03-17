import { Injectable } from '@angular/core';
import { FromBodyBase, Workflow } from '@app/shared/models';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { BaseService } from '../base.service';
import { JwtService } from '../jwt.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DispatchOrderServiceService extends BaseService {


  private token:string;
  constructor(private http:HttpClient,jwtServices: JwtService,private authenService:AuthService )
  {   
    super();
     this.token=jwtServices.getToken();
  }

report_delivery(entity:Workflow): Observable<any> {
  let p: FromBodyBase<Workflow> ={}
  p.item=entity;
  p.keyWord='0936391128';
  p.userId='Nguyễn Việt Cường';
  p.tokenKey=this.token;
  Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
  return this.http.post(`${environment.apiReportUrl}/api/Reports/Delivery`, p,{responseType: "blob",
  headers: new HttpHeaders().append("Content-Type", "application/json")});
  }
}

