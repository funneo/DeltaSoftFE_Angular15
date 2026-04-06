import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FromBodyBase } from '@app/shared/models';
import { environment } from '@environments/environment';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { BaseService } from '../base.service';
import { JwtService } from '../jwt.service';
import { TireDiagramType } from '@app/shared/models/danhmuc/tire-diagram-type.model';

@Injectable({
  providedIn: 'root'
})
export class TireDiagramService extends BaseService {
private token: string;

  constructor(
    private http: HttpClient,
    jwtService: JwtService,
    private authService: AuthService
  ) {
    super();
    this.token = jwtService.getToken();
  }

  add(entity: TireDiagramType) {
    const p: FromBodyBase<TireDiagramType> = {
      item: entity,
      tokenKey: this.token,
    };
    Object.keys(entity).forEach((key) =>
      entity[key] === null ? delete entity[key] : ''
    );
    return this.http.post(`${environment.apiUrl}/api/TireDiagram/create`, p).pipe(
      map((response: any) => {
        if (response.code === '401') this.authService.logout();
        else return response;
      }),
      catchError(this.handleError)
    );
  }

  update(entity: TireDiagramType) {
    const p: FromBodyBase<TireDiagramType> = {
      item: entity,
      tokenKey: this.token,
    };
    Object.keys(entity).forEach((key) =>
      entity[key] === null ? delete entity[key] : ''
    );
    return this.http.post(`${environment.apiUrl}/api/TireDiagram/update`, p).pipe(
      map((response: any) => {
        if (response.code === '401') this.authService.logout();
        else return response;
      }),
      catchError(this.handleError)
    );
  }

  getDetail(id: number) {
    const p: FromBodyBase<TireDiagramType> = {
      item: { id:id },
      tokenKey: this.token,
    };
    return this.http.post(`${environment.apiUrl}/api/TireDiagram/GetById`, p).pipe(
      map((response: any) => {
        if (response.code === '401') this.authService.logout();
        else return response;
      }),
      catchError(this.handleError)
    );
  }

  delete(id: number) {
    const p: FromBodyBase<TireDiagramType> = {
      item: { id : id },
      tokenKey: this.token,
    };
    return this.http.post(`${environment.apiUrl}/api/TireDiagram/delete`, p).pipe(
      map((response: any) => {
        if (response.code === '401') this.authService.logout();
        else return response;
      }),
      catchError(this.handleError)
    );
  }

  getAll() {
    const p: FromBodyBase<TireDiagramType> = {
      tokenKey: this.token
    };
    return this.http.post(`${environment.apiUrl}/api/TireDiagram/getall`, p).pipe(
      map((response: any) => {
        if (response.code === '401') this.authService.logout();
        else return response;
      }),
      catchError(this.handleError)
    );
  }
}
