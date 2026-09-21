import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { HttpClient } from '@angular/common/http';
import { JwtService } from '../jwt.service';
import { GpsCustomerVehicle } from '@app/shared/models/danhmuc/gps-customer.model';
import { FromBodyBase } from '@app/shared/models';
import { environment } from '@environments/environment';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class GpsCustomerService extends BaseService {
  private token: string;
  constructor(
    private http: HttpClient,
    jwtService: JwtService,
    private authService: AuthService
  ) {
    super();
    this.token = jwtService.getToken();
  }

  getVehicles(customerId: number) {
    let p: FromBodyBase<any> = { customerId: customerId, tokenKey: this.token };
    return this.http.post(`${environment.apiUrl}/api/GpsCustomer/GetVehicles`, p)
      .pipe(map((response: any) => {
        if (response.code == '401') this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  addVehicle(entity: GpsCustomerVehicle) {
    let p: FromBodyBase<GpsCustomerVehicle> = { item: entity, tokenKey: this.token };
    return this.http.post(`${environment.apiUrl}/api/GpsCustomer/AddVehicle`, p)
      .pipe(map((response: any) => {
        if (response.code == '401') this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  deleteVehicle(id: number, customerId: number) {
    let p: FromBodyBase<GpsCustomerVehicle> = { item: { id: id, customerId: customerId }, tokenKey: this.token };
    return this.http.post(`${environment.apiUrl}/api/GpsCustomer/DeleteVehicle`, p)
      .pipe(map((response: any) => {
        if (response.code == '401') this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getToken(customerId: number) {
    let p: FromBodyBase<any> = { customerId: customerId, tokenKey: this.token };
    return this.http.post(`${environment.apiUrl}/api/GpsCustomer/GetToken`, p)
      .pipe(map((response: any) => {
        if (response.code == '401') this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  createToken(customerId: number) {
    let p: FromBodyBase<any> = { customerId: customerId, tokenKey: this.token };
    return this.http.post(`${environment.apiUrl}/api/GpsCustomer/CreateToken`, p)
      .pipe(map((response: any) => {
        if (response.code == '401') this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
}
