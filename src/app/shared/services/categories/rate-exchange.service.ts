import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { JwtService } from '../jwt.service';
import { AuthService } from '../auth.service';
import { FromBodyBase } from '@app/shared/models';
import { RateExchange } from '@app/shared/models/categories/rate-exchange.model';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RateExchangeService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }
  get() {
    let p: FromBodyBase<RateExchange> = {};
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Rate/Get`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  getAll(params:HttpParams) {
    let p: FromBodyBase<RateExchange> = {item:{}};
    p.fromDate=params.get('fromDate');
    p.toDate=params.get('toDate'),
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/RateExchange/GetAll`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getByCurrency(item:RateExchange) {
    let p: FromBodyBase<RateExchange> = {item:{}};
    p.item=item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/RateExchange/GetByCurrency`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

}
