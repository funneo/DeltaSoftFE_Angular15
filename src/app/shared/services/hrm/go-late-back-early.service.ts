import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FromBodyBase } from "@app/shared/models";
import { GolateBackearly } from "@app/shared/models/hrm/golate-backearly.model";
import { environment } from "@environments/environment";
import { catchError, map } from "rxjs/operators";
import { AuthService } from "../auth.service";
import { BaseService } from "../base.service";
import { JwtService } from "../jwt.service";

@Injectable({
  providedIn: "root",
})
export class GolateBackearlyService extends BaseService {
  private token: string;

  constructor(
    private http: HttpClient,
    jwtService: JwtService,
    private authService: AuthService
  ) {
    super();
    this.token = jwtService.getToken();
  }

  create(entity: GolateBackearly) {
    let p: FromBodyBase<GolateBackearly> = { item: {} };
    var t = Object.assign({}, entity);
    p.item = t;
    p.tokenKey = this.token;
    Object.keys(entity).forEach((key) =>
      entity[key] === null ? delete entity[key] : ""
    );

    return this.http
      .post(`${environment.apiUrl}/api/GolateBackearly/create`, p)
      .pipe(
        map((response: any) => {
          if (response.code == "401") this.authService.logout();
          else return response;
        }),
        catchError(this.handleError)
      );
  }

  update(entity: GolateBackearly) {
    let p: FromBodyBase<GolateBackearly> = { item: {} };
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach((key) =>
      entity[key] === null ? delete entity[key] : ""
    );

    return this.http
      .post(`${environment.apiUrl}/api/GolateBackearly/update`, p)
      .pipe(
        map((response: any) => {
          if (response.code == "401") this.authService.logout();
          else return response;
        }),
        catchError(this.handleError)
      );
  }

  accept(id: number, feedback: string, accept: boolean) {
    let p: FromBodyBase<any> = { item: { id, feedback, accept } };
    p.tokenKey = this.token;

    return this.http
      .post(`${environment.apiUrl}/api/GolateBackearly/accept`, p)
      .pipe(
        map((response: any) => {
          if (response.code == "401") this.authService.logout();
          else return response;
        }),
        catchError(this.handleError)
      );
  }

  delete(id: number) {
    return this.http
      .delete(`${environment.apiUrl}/api/GolateBackearly/delete/${id}`, {
        headers: { tokenKey: this.token },
      })
      .pipe(
        map((response: any) => {
          if (response.code == "401") this.authService.logout();
          else return response;
        }),
        catchError(this.handleError)
      );
  }

  getDetail(id: number) {
    let p: FromBodyBase<GolateBackearly> = { item: {} };
    p.item.id = id;
    p.tokenKey = this.token;
    return this.http
      .post(`${environment.apiUrl}/api/GolateBackearly/getbyid`, p)
      .pipe(
        map((response: any) => {
          if (response.code == "401") this.authService.logout();
          else return response;
        }),
        catchError(this.handleError)
      );
  }
  approved(entity: GolateBackearly, status: number) {
    let p: FromBodyBase<GolateBackearly> = {};
    var t = Object.assign({}, entity);
    t.status = status;
    p.item = t;
    p.tokenKey = this.token;
    Object.keys(entity).forEach((key) =>
      entity[key] === null ? delete entity[key] : ""
    );
    return this.http
      .post(`${environment.apiUrl}/api/GolateBackearly/approved`, p)
      .pipe(
        map((response: any) => {
          if (response.code == "401") this.authService.logout();
          else return response;
        }),
        catchError(this.handleError)
      );
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<GolateBackearly> = { item: {} };
    p.tokenKey = this.token;
    p.pageIndex = Number.parseInt(params.get("pageIndex") || "1");
    p.pageSize = Number.parseInt(params.get("pageSize") || "50");
    p.item.branchId = Number.parseInt(params.get("branchId") || "0");
    p.item.departmentId = Number.parseInt(params.get("departmentId") || "0");
    p.keyWord = params.get("keyword") || "";
    p.fromDate = params.get("fromDate");
    p.toDate = params.get("toDate");
    return this.http
      .post(`${environment.apiUrl}/api/GolateBackearly/getpaging`, p)
      .pipe(
        map((response: any) => {
          if (response.code == "401") this.authService.logout();
          else return response;
        }),
        catchError(this.handleError)
      );
  }
}
