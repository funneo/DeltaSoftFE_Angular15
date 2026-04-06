import { TrainingDocumentsReport02 } from './../../../models/hrm/training-documents-report02';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FromBodyBase } from '@app/shared/models';
import { TrainingDocuments } from '@app/shared/models/hrm/training-document-managment/training-documents';
import { JwtService } from '../../jwt.service';
import { AuthService } from '../../auth.service';
import { BaseService } from '../../base.service';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class TrainingDocumentManagmentService extends BaseService {

  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token=jwtService.getToken();
  }

  add(entity:TrainingDocuments){
    let p: FromBodyBase<TrainingDocuments> = {item:{}};
    var t=Object.assign({}, entity);
    p.item = t;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/TrainingDocuments/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   update(entity:TrainingDocuments){
    let p: FromBodyBase<TrainingDocuments> = {};
    var t=Object.assign({}, entity);
    p.item = t;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/TrainingDocuments/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }
   modified(id:string){
    let p: FromBodyBase<TrainingDocuments> = {item:{}};
    p.item.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/TrainingDocuments/modified`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }
   
   assignment(entity:TrainingDocuments){
    let p: FromBodyBase<TrainingDocuments> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/TrainingDocuments/Assignment`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }

   accept(entity:TrainingDocuments){
    let p: FromBodyBase<TrainingDocuments> = {};
    var t=Object.assign({}, entity)
    p.item =t;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/TrainingDocuments/accept`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }
   

   receiving(entity:TrainingDocuments){
    let p: FromBodyBase<TrainingDocuments> = {};
    var t=Object.assign({}, entity)
    p.item =t;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/TrainingDocuments/receiving`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
   }
   

   getDetail(id: string) {
    let p: FromBodyBase<TrainingDocuments> = {item:{}};
    p.item.id=id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/TrainingDocuments/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getAll(params: HttpParams) {
    let p: FromBodyBase<TrainingDocuments> = {item:{}};
    p.keyWord = params.get("keyword") || "";
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/TrainingDocuments/getAll`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }


  getProcessing(params: HttpParams) {
    let p: FromBodyBase<TrainingDocuments> = {item:{}};
    p.keyWord = params.get("keyword") || "";
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/TrainingDocuments/GetProcessing`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }


  getArchive1(params: HttpParams) {
    let p: FromBodyBase<TrainingDocuments> = {item:{}};
    p.keyWord = params.get("keyword") || "";
    p.item.createdBy = params.get("userId") || "";
    p.item.steps = Number.parseInt(params.get("type") || "0");
    p.tValue = Number.parseInt(params.get("departmentId") || "0");
    p.branchId = Number.parseInt(params.get("branchId") || "0");
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/TrainingDocuments/GetArchive1`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }


  getArchive2(params: HttpParams) {
    let p: FromBodyBase<TrainingDocuments> = {item:{}};
    p.keyWord = params.get("keyword") || "";
    p.item.createdBy = params.get("userId") || "";
    p.item.steps = Number.parseInt(params.get("type") || "0");
    p.tValue = Number.parseInt(params.get("departmentId") || "0");
    p.branchId = Number.parseInt(params.get("branchId") || "0");
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/TrainingDocuments/GetArchive2`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }


  loadEmployee(params: HttpParams) {
    let p: FromBodyBase<TrainingDocuments> = {item:{}};
    p.tokenKey = this.token;
    p.fromDate=params.get('fromDate')
    p.toDate=params.get('toDate')
    return this.http.post(`${environment.apiUrl}/api/TrainingDocuments/getEmployee`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  report01(params: HttpParams) {
    let p: FromBodyBase<TrainingDocuments> = {item:{}};
    p.keyWord = params.get("keyword") || "";
    p.tokenKey = this.token;
    p.fromDate=params.get('fromDate')
    p.toDate=params.get('toDate')
    p.item.branchId = Number.parseInt(params.get('branchId') || '0');
    return this.http.post(`${environment.apiUrl}/api/TrainingDocuments/report01`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }


  report02(params: HttpParams) {
    let p: FromBodyBase<TrainingDocuments> = {item:{}};
    p.tokenKey = this.token;
    p.fromDate=params.get('fromDate')
    p.toDate=params.get('toDate')
    let empId = Number(params.get('employeeId'));
    p.tValue = isNaN(empId) ? 0 : empId;
    return this.http.post(`${environment.apiUrl}/api/TrainingDocuments/report02`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  exportReport01(params: HttpParams): Observable<HttpResponse<Blob>> {
    const p: FromBodyBase<any> = {};
    p.keyWord = params.get('keyword') || '';
    p.tokenKey = this.token;
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.item.branchId = Number.parseInt(params.get('branchId') || '0');
    // ĐỔI URL này cho khớp BE của bạn:
    // - Nếu theo đề xuất trước: /api/training-report-summary/export
    // - Nếu bạn muốn giữ /api/TrainingDocuments/... thì đặt endpoint tương ứng ở BE.
    const url = `${environment.apiUrl}/api/TrainingDocuments/ExportReport01`;

    return this.http.post(url, p, {
      observe: 'response',
      responseType: 'blob' as const,
    }).pipe(
      map((res) => res),
      catchError((err) => {
        if (err?.status === 401) this.authService.logout();
        return throwError(() => err);
      })
    );
  }

  // =======================
  // Export Report02 (Chi tiết)
  // =======================
  exportReport02(params: HttpParams): Observable<HttpResponse<Blob>> {
    const p: FromBodyBase<any> = {};
    p.keyWord = params.get('keyword') || '';
    p.tokenKey = this.token;
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    let empId = Number(params.get('employeeId'));
    p.tValue = isNaN(empId) ? 0 : empId;
    const url = `${environment.apiUrl}/api/TrainingDocuments/ExportReport02`;
    return this.http.post(url, p, {
      observe: 'response',
      responseType: 'blob' as const,
    }).pipe(
      map((res) => res),
      catchError((err) => {
        if (err?.status === 401) this.authService.logout();
        return throwError(() => err);
      })
    );
  }


  getCritera() {
    let p: FromBodyBase<TrainingDocuments> = {item:{}};
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/TrainingDocuments/GetCriteria`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getScore(id:string, steps:number) {
    let p: FromBodyBase<TrainingDocuments> = {item:{
      id: id,
      steps: steps
    }};
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/TrainingDocuments/GetScore`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }


  downloaPfd(id: string) {
    let p: FromBodyBase<TrainingDocuments> = { item: { id: id }, tokenKey: this.token };
  return this.http.post(
    environment.apiUrl + `/api/TrainingDocuments/DownloadPdf`,
    p,
    { responseType: 'blob' as 'json' } // BẮT BUỘC
  );  
  }

  downloadWord(id: string) {
  let p: FromBodyBase<TrainingDocuments> = { item: { id: id }, tokenKey: this.token };
  return this.http.post(
    environment.apiUrl + `/api/TrainingDocuments/Downloadword`,
    p,
    { responseType: 'blob' as 'json' } // BẮT BUỘC
  );
}

  delete(id: string) {
    let p: FromBodyBase<TrainingDocuments> = {item:{}};
    p.item.id=id;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/TrainingDocuments/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authService.logout();
      else return response;
    }), catchError(this.handleError));
  }


}
