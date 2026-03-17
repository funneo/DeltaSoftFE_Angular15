import { Injectable } from '@angular/core';
import { BaseService } from '../../base.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth.service';
import { JwtService } from '../../jwt.service';
import { FromBodyBase } from '@app/shared/models';
import { TrainingTemplates } from '@app/shared/models/hrm/training-document-managment/training-templates';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TrainingTemplatesService extends BaseService {

private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token=jwtService.getToken();
  }

  
    getAll(level:number, groupL1Id?:number, groupL2Id?:number) {
      let p: FromBodyBase<TrainingTemplates> = {item:{}};
      p.tValue = level;
      p.item.groupL1Id=groupL1Id;
      p.item.groupL2Id=groupL2Id;
      p.tokenKey = this.token;
      return this.http.post(`${environment.apiUrl}/api/TrainingTemplates/getAll`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
    }
}
