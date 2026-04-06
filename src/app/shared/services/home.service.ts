import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Observable, of } from 'rxjs';
import ThongKe from '../models/thongke.model';


@Injectable({ providedIn: 'root' })

export class HomeService extends BaseService {
  constructor(private http: HttpClient) {
    super();
  }

  getThongKe() {
    return this.http.get<ThongKe>(`${environment.apiUrl}/api/thongke/thongke`,)
      .pipe(map((response: ThongKe) => {
        return response;
      }), catchError(this.handleError));
  }

}
