import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { ExportInvoice, FromBodyBase, Pagination, PaymentDetail, ReportViewModel } from '../models';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ReportsService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtService: JwtService, private authService: AuthService) {
    super();
    this.token = jwtService.getToken();
  }

  count(params: HttpParams) {
    let p: FromBodyBase<ReportViewModel> = {
      tokenKey: this.token,
      item: {}
    };
    p.branchId = Number.parseInt(params.get('branchId'));
    p.year = Number.parseInt(params.get('year'));
    p.gType = params.get('type');
    return this.http.post(`${environment.apiUrl}/api/reports/count`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getRevenue(params: HttpParams) {
    let p: FromBodyBase<ReportViewModel> = {
      tokenKey: this.token,
      pageIndex: Number.parseInt(params.get('pageIndex')),
      pageSize: Number.parseInt(params.get('pageSize')),
      keyWord:params.get('keyword'),
      item: {}
    };
    p.branchId = Number.parseInt(params.get('branchId'));
    p.customerId = Number.parseInt(params.get('customerId'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.gType = params.get('type');
    return this.http.post(`${environment.apiUrl}/api/reports/get-revennue`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getCp03(params: HttpParams) {
    let p: FromBodyBase<ReportViewModel> = {
      tokenKey: this.token,
      pageIndex: Number.parseInt(params.get('pageIndex')),
      pageSize: Number.parseInt(params.get('pageSize')),
      keyWord:params.get('keyword'),
      item: {}
    };
    p.branchId = Number.parseInt(params.get('branchId'));
    p.customerId = Number.parseInt(params.get('customerId'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.gType = params.get('type');
    p.tValue = params.get('datetype')==null?0:Number.parseInt(params.get('datetype'));
    return this.http.post(`${environment.apiUrl}/api/reports/get-cp03`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getNotDebit(params: HttpParams) {
    let p: FromBodyBase<ReportViewModel> = {
      tokenKey: this.token,
      pageIndex: Number.parseInt(params.get('pageIndex')),
      pageSize: Number.parseInt(params.get('pageSize')),
      keyWord:params.get('keyword'),
      item: {}
    };
    p.branchId = Number.parseInt(params.get('branchId'));
    p.customerId = Number.parseInt(params.get('customerId'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.gType = params.get('type');
    return this.http.post(`${environment.apiUrl}/api/reports/get-shipment-not-debit`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getStatement(params: HttpParams) {
    let p: FromBodyBase<ReportViewModel> = {
      tokenKey: this.token,
      pageIndex: Number.parseInt(params.get('pageIndex')),
      pageSize: Number.parseInt(params.get('pageSize')),
      keyWord:params.get('keyword'),
      item: {}
    };
    p.branchId = Number.parseInt(params.get('branchId'));
    p.customerId = Number.parseInt(params.get('customerId'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.gType = params.get('type');
    p.tValue = params.get('datetype')==null?0:Number.parseInt(params.get('datetype'));
    return this.http.post(`${environment.apiUrl}/api/reports/get-statement`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getPaymentDetail(params: HttpParams) {
    let p: FromBodyBase<PaymentDetail> = {
      tokenKey: this.token,
      pageIndex: Number.parseInt(params.get('pageIndex')),
      pageSize: Number.parseInt(params.get('pageSize')),
      keyWord:params.get('keyword'),
      item: {
        step:Number.parseInt(params.get('step')),
      }
    };
    p.branchId = Number.parseInt(params.get('branchId'));
    p.customerId = Number.parseInt(params.get('customerId'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.gType = params.get('type');
    p.tValue = params.get('reporttype')==null?0:Number.parseInt(params.get('reporttype'));
    return this.http.post(`${environment.apiUrl}/api/reports/get-payment-detail`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getDebitNoteDetail(params: HttpParams) {
    let p: FromBodyBase<ReportViewModel> = {
      tokenKey: this.token,
      pageIndex: Number.parseInt(params.get('pageIndex')),
      pageSize: Number.parseInt(params.get('pageSize')),
      keyWord:params.get('keyword'),
      item: {}
    };
    p.branchId = Number.parseInt(params.get('branchId'));
    p.customerId = Number.parseInt(params.get('customerId'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.gType = params.get('type');
    p.tValue = params.get('datetype')==null?0:Number.parseInt(params.get('datetype'));
    return this.http.post(`${environment.apiUrl}/api/reports/get-debit-note-detail`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getReport05(params: HttpParams) {
    let p: FromBodyBase<ReportViewModel> = {
      tokenKey: this.token,
      keyWord:params.get('keyword'),
      item: {}
    };
    p.branchId = Number.parseInt(params.get('branchId'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.customerId = Number.parseInt(params.get('customerId'));
    return this.http.post(`${environment.apiUrl}/api/reports/get-report-05`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  
  getReport01(params: HttpParams) {
    let p: FromBodyBase<ReportViewModel> = {
      tokenKey: this.token,
      pageIndex: Number.parseInt(params.get('pageIndex')),
      pageSize: Number.parseInt(params.get('pageSize')),
      keyWord:params.get('keyword'),
      item: {}
    };
    p.branchId = Number.parseInt(params.get('branchId'));
    p.customerId = Number.parseInt(params.get('customerId'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.gType = params.get('type');
    p.tValue = params.get('datetype')==null?0:Number.parseInt(params.get('datetype'));
    return this.http.post(`${environment.apiUrl}/api/reports/get-report-01`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  getReport01_01(params: HttpParams) {
    let p: FromBodyBase<ReportViewModel> = {
      tokenKey: this.token,
      keyWord:params.get('keyword'),
      item: {}
    };
    p.branchId = Number.parseInt(params.get('branchId'));
    p.customerId = Number.parseInt(params.get('customerId'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.tValue = params.get('datetype')==null?0:Number.parseInt(params.get('datetype'));
    return this.http.post(`${environment.apiUrl}/api/reports/get-report-01-01`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getReport01_02(params: HttpParams) {
    let p: FromBodyBase<ReportViewModel> = {
      tokenKey: this.token,
      keyWord:params.get('keyword'),
      item: {}
    };
    p.branchId = Number.parseInt(params.get('branchId'));
    p.customerId = Number.parseInt(params.get('customerId'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.tValue = params.get('datetype')==null?0:Number.parseInt(params.get('datetype'));
    return this.http.post(`${environment.apiUrl}/api/reports/get-report-01-02`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  
  getReport04(params: HttpParams) {
    let p: FromBodyBase<number> = {
      tokenKey: this.token,
      keyWord:params.get('keyword'),
      item: 0
    };
    p.branchId = Number.parseInt(params.get('branchId'));
    p.customerId = Number.parseInt(params.get('customerId'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.gType = params.get('type');
    return this.http.post(`${environment.apiUrl}/api/reports/get-report-04-dt12`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getReportCbt01(params: HttpParams) {
    let p: FromBodyBase<ReportViewModel> = {
      tokenKey: this.token,
      pageIndex: Number.parseInt(params.get('pageIndex')),
      pageSize: Number.parseInt(params.get('pageSize')),
      keyWord:params.get('keyword'),
      item: {}
    };
    p.branchId = Number.parseInt(params.get('branchId'));
    p.customerId = Number.parseInt(params.get('customerId'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.gType = params.get('type');
    return this.http.post(`${environment.apiUrl}/api/reports/get-cbt-report-01`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  getReportCbt01_01(params: HttpParams) {
    let p: FromBodyBase<ReportViewModel> = {
      tokenKey: this.token,
      keyWord:params.get('keyword'),
      item: {}
    };
    p.branchId = Number.parseInt(params.get('branchId'));
    p.customerId = Number.parseInt(params.get('customerId'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    return this.http.post(`${environment.apiUrl}/api/reports/get-cbt-report-01-01`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getReportCbt01_02(params: HttpParams) {
    let p: FromBodyBase<ReportViewModel> = {
      tokenKey: this.token,
      keyWord:params.get('keyword'),
      item: {}
    };
    p.branchId = Number.parseInt(params.get('branchId'));
    p.customerId = Number.parseInt(params.get('customerId'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    return this.http.post(`${environment.apiUrl}/api/reports/get-cbt-report-01-02`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  getReport02(params: HttpParams) {
    let p: FromBodyBase<ReportViewModel> = {
      tokenKey: this.token,
      item: {}
    };
    p.branchId = Number.parseInt(params.get('branchId'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.keyWord=params.get('keyword');
    return this.http.post(`${environment.apiUrl}/api/reports/get-report-02`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  exportRevennue(params: HttpParams) {
    let p: FromBodyBase<ReportViewModel> = {
      tokenKey: this.token,
      pageIndex: Number.parseInt(params.get('pageIndex')),
      pageSize: Number.parseInt(params.get('pageSize')),
      keyWord:params.get('keyword'),
      item: {}
    };
    p.branchId = Number.parseInt(params.get('branchId'));
    p.customerId = Number.parseInt(params.get('customerId'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.gType = params.get('type');
    return this.http.post(`${environment.apiUrl}/api/reports/export-excel-revennue`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authService.logout();
        else return response;
      }), catchError(this.handleError));
    }

    exportCP03(params: HttpParams) {
      let p: FromBodyBase<ReportViewModel> = {
        tokenKey: this.token,
        pageIndex: Number.parseInt(params.get('pageIndex')),
        pageSize: Number.parseInt(params.get('pageSize')),
        keyWord:params.get('keyword'),
        item: {}
      };
      p.branchId = Number.parseInt(params.get('branchId'));
      p.customerId = Number.parseInt(params.get('customerId'));
      p.fromDate = params.get('fromDate');
      p.toDate = params.get('toDate');
      p.gType = params.get('type');
      p.tValue = params.get('datetype')==null?0:Number.parseInt(params.get('datetype'));
      return this.http.post(`${environment.apiUrl}/api/reports/export-excel-cp03`, p)
        .pipe(map((response: any) => {
          if (response.code == '401')
            this.authService.logout();
          else return response;
        }), catchError(this.handleError));
      }

      exportStatement(params: HttpParams) {
        let p: FromBodyBase<ReportViewModel> = {
          tokenKey: this.token,
          pageIndex: Number.parseInt(params.get('pageIndex')),
          pageSize: Number.parseInt(params.get('pageSize')),
          keyWord:params.get('keyword'),
          item: {}
        };
        p.branchId = Number.parseInt(params.get('branchId'));
        p.customerId = Number.parseInt(params.get('customerId'));
        p.fromDate = params.get('fromDate');
        p.toDate = params.get('toDate');
        p.gType = params.get('type');
        return this.http.post(`${environment.apiUrl}/api/reports/export-excel-statement`, p)
          .pipe(map((response: any) => {
            if (response.code == '401')
              this.authService.logout();
            else return response;
          }), catchError(this.handleError));
      }

      exportNotDebit(params: HttpParams) {
        let p: FromBodyBase<ReportViewModel> = {
          tokenKey: this.token,
          pageIndex: Number.parseInt(params.get('pageIndex')),
          pageSize: Number.parseInt(params.get('pageSize')),
          keyWord:params.get('keyword'),
          item: {}
        };
        p.branchId = Number.parseInt(params.get('branchId'));
        p.customerId = Number.parseInt(params.get('customerId'));
        p.fromDate = params.get('fromDate');
        p.toDate = params.get('toDate');
        p.gType = params.get('type');
        return this.http.post(`${environment.apiUrl}/api/reports/export-excel-not-debit`, p)
          .pipe(map((response: any) => {
            if (response.code == '401')
              this.authService.logout();
            else return response;
          }), catchError(this.handleError));
      }

      exportPaymentDetail(params: HttpParams) {
        let p: FromBodyBase<ReportViewModel> = {
          tokenKey: this.token,
          pageIndex: Number.parseInt(params.get('pageIndex')),
          pageSize: Number.parseInt(params.get('pageSize')),
          keyWord:params.get('keyword'),
          item: {}
        };
        p.branchId = Number.parseInt(params.get('branchId'));
        p.customerId = Number.parseInt(params.get('customerId'));
        p.fromDate = params.get('fromDate');
        p.toDate = params.get('toDate');
        p.gType = params.get('type');
        p.tValue = params.get('datetype')==null?0:Number.parseInt(params.get('datetype'));
        p.tValue = params.get('reporttype')==null?0:Number.parseInt(params.get('reporttype'));
        return this.http.post(`${environment.apiUrl}/api/reports/export-payment-detail`, p)
          .pipe(map((response: any) => {
            if (response.code == '401')
              this.authService.logout();
            else return response;
          }), catchError(this.handleError));
      }

      exportDebitNoteDetail(params: HttpParams) {
        let p: FromBodyBase<ReportViewModel> = {
          tokenKey: this.token,
          pageIndex: Number.parseInt(params.get('pageIndex')),
          pageSize: Number.parseInt(params.get('pageSize')),
          keyWord:params.get('keyword'),
          item: {}
        };
        p.branchId = Number.parseInt(params.get('branchId'));
        p.customerId = Number.parseInt(params.get('customerId'));
        p.fromDate = params.get('fromDate');
        p.toDate = params.get('toDate');
        p.gType = params.get('type');
        p.tValue = params.get('datetype')==null?0:Number.parseInt(params.get('datetype'));
        return this.http.post(`${environment.apiUrl}/api/reports/export-debit-note-detail`, p)
          .pipe(map((response: any) => {
            if (response.code == '401')
              this.authService.logout();
            else return response;
          }), catchError(this.handleError));
      }

      exportReport01(params: HttpParams) {
        let p: FromBodyBase<ReportViewModel> = {
          tokenKey: this.token,
          pageIndex: Number.parseInt(params.get('pageIndex')),
          pageSize: Number.parseInt(params.get('pageSize')),
          keyWord:params.get('keyword'),
          item: {}
        };
        p.branchId = Number.parseInt(params.get('branchId'));
        p.customerId = Number.parseInt(params.get('customerId'));
        p.fromDate = params.get('fromDate');
        p.toDate = params.get('toDate');
        p.gType = params.get('type');
        p.tValue = params.get('datetype')==null?0:Number.parseInt(params.get('datetype'));
        return this.http.post(`${environment.apiUrl}/api/reports/export-report01`, p)
          .pipe(map((response: any) => {
            if (response.code == '401')
              this.authService.logout();
            else return response;
          }), catchError(this.handleError));
      }

      exportReport02(params: HttpParams) {
        let p: FromBodyBase<ReportViewModel> = {
          tokenKey: this.token,
          item: {}
        };
        p.branchId = Number.parseInt(params.get('branchId'));
        p.fromDate = params.get('fromDate');
        p.toDate = params.get('toDate');
        return this.http.post(`${environment.apiUrl}/api/reports/export-report02`, p)
          .pipe(map((response: any) => {
            if (response.code == '401')
              this.authService.logout();
            else return response;
          }), catchError(this.handleError));
      }


      exportInvoiceDetail(entity: ExportInvoice) {
        let p: FromBodyBase<ExportInvoice> = {
          tokenKey: this.token,
          item: {}
        };
        p.item=entity;
        return this.http.post(`${environment.apiUrl}/api/reports/export-invoice`, p)
          .pipe(map((response: any) => {
            if (response.code == '401')
              this.authService.logout();
            else return response;
          }), catchError(this.handleError));
      }
    }


