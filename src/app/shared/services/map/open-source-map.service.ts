import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtService } from '../jwt.service';
import { AuthService } from '../auth.service';
import { environment } from '@environments/environment';
import { map, catchError } from 'rxjs/operators';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root'
})
export class OpenSourceMapService extends BaseService {
  private token: string;

  constructor(
    private http: HttpClient,
    jwtService: JwtService,
    private authService: AuthService
  ) {
    super();
    this.token = jwtService.getToken();
  }

  /**
   * Phương thức gọi qua Backend C# để xử lý OSRM (OpenSourceMap) API
   * Backend sẽ thay mặt gọi sang router.project-osrm.org
   */
  getRoutesOSRM(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    routePreferences?: {
      avoidHighway?: boolean;
      avoidTolls?: boolean;
      avoidFerries?: boolean;
      preferHighway?: boolean;
      roadType?: 'all' | 'highway' | 'national' | 'provincial';
    }
  ) {
    let p: any = {};
    p.item = { 
        originLat: originLat,
        originLng: originLng,
        destLat: destLat,
        destLng: destLng,
        routePreferences: routePreferences || {}
    };
    p.tokenKey = this.token;
    
    return this.http.post(`${environment.apiUrl}/api/OpenSourceMap/get-routes`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
}
