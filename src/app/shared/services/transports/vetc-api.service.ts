import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { BaseService } from '../base.service';
import { JwtService } from '../jwt.service';

// Đối chiếu ETC thực tế (Phase 1, 2026-09-22) — gọi BE VetcApiController, BE mới gọi ra VETC.
@Injectable({
  providedIn: 'root'
})
export class VetcApiService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtServices: JwtService, private authenService: AuthService) {
    super();
    this.token = jwtServices.getToken();
  }

  compareByRefNo(refNo: string) {
    let p: any = { item: { refNo }, tokenKey: this.token };
    return this.http.post(`${environment.apiUrl}/api/VetcApi/CompareByRefNo`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }
}
