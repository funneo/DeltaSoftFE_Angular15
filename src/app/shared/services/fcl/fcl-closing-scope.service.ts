import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FromBodyBase } from '@app/shared/models';
import { FclClosingScope, FclClosingScopeSaveRequest } from '@app/shared/models/fcl/fcl-closing-scope';
import { environment } from '@environments/environment';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { BaseService } from '../base.service';
import { JwtService } from '../jwt.service';

@Injectable({ providedIn: 'root' })
export class FclClosingScopeService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  getAll() {
    let p: FromBodyBase<any> = { tokenKey: this.token };
    return this.http.post(`${environment.apiUrl}/api/FclClosingScope/GetAll`, p)
      .pipe(map((response: any) => {
        if (response.code == '401') this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  saveForUser(entity: FclClosingScopeSaveRequest) {
    let p: FromBodyBase<FclClosingScopeSaveRequest> = { item: entity, tokenKey: this.token };
    return this.http.post(`${environment.apiUrl}/api/FclClosingScope/SaveForUser`, p)
      .pipe(map((response: any) => {
        if (response.code == '401') this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  deleteForUser(userId: string) {
    let p: FromBodyBase<any> = { tokenKey: this.token, userId: userId };
    return this.http.post(`${environment.apiUrl}/api/FclClosingScope/DeleteForUser`, p)
      .pipe(map((response: any) => {
        if (response.code == '401') this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
}
