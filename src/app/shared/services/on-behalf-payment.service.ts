import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { environment } from '@environments/environment';
import { OnBehalfPayment, OnBehalfPaymentPayment, OnBehalfPaymentInvoice, OnBehalfPaymentRecovery, FromBodyBase, ResponseValue } from '../models';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class OnBehalfPaymentService extends BaseService {
    constructor(private http: HttpClient, private authService: AuthService) {
        super();
    }

    getAll(filter: OnBehalfPaymentFilter) {
        return this.http.post(`${environment.apiUrl}/api/onbehalfpayment/GetAll`, filter)
            .pipe(map((res: any) => {
                if (res.code == '401') this.authService.logout();
                return res;
            }), catchError(this.handleError));
    }

    getById(id: number) {
        return this.http.post(`${environment.apiUrl}/api/onbehalfpayment/GetById`, { id: id })
            .pipe(map((res: any) => {
                if (res.code == '401') this.authService.logout();
                return res;
            }), catchError(this.handleError));
    }

    create(entity: OnBehalfPayment) {
        return this.http.post(`${environment.apiUrl}/api/onbehalfpayment/Create`, entity)
            .pipe(map((res: any) => {
                if (res.code == '401') this.authService.logout();
                return res;
            }), catchError(this.handleError));
    }

    update(entity: OnBehalfPayment) {
        return this.http.post(`${environment.apiUrl}/api/onbehalfpayment/Update`, entity)
            .pipe(map((res: any) => {
                if (res.code == '401') this.authService.logout();
                return res;
            }), catchError(this.handleError));
    }

    delete(listIds: string) {
        const p = { listIds: listIds };
        return this.http.post(`${environment.apiUrl}/api/onbehalfpayment/Delete`, p)
            .pipe(map((res: any) => {
                if (res.code == '401') this.authService.logout();
                return res;
            }), catchError(this.handleError));
    }

    approve(id: number) {
        return this.http.post(`${environment.apiUrl}/api/onbehalfpayment/Approve`, { id: id })
            .pipe(map((res: any) => {
                if (res.code == '401') this.authService.logout();
                return res;
            }), catchError(this.handleError));
    }

    getPayments(paymentId: number) {
        return this.http.post(`${environment.apiUrl}/api/onbehalfpayment/GetPayments`, { id: paymentId })
            .pipe(map((res: any) => {
                if (res.code == '401') this.authService.logout();
                return res;
            }), catchError(this.handleError));
    }

    addPayment(entity: OnBehalfPaymentPayment) {
        return this.http.post(`${environment.apiUrl}/api/onbehalfpayment/AddPayment`, entity)
            .pipe(map((res: any) => {
                if (res.code == '401') this.authService.logout();
                return res;
            }), catchError(this.handleError));
    }

    getInvoices(paymentId: number) {
        return this.http.post(`${environment.apiUrl}/api/onbehalfpayment/GetInvoices`, { id: paymentId })
            .pipe(map((res: any) => {
                if (res.code == '401') this.authService.logout();
                return res;
            }), catchError(this.handleError));
    }

    addInvoice(entity: OnBehalfPaymentInvoice) {
        return this.http.post(`${environment.apiUrl}/api/onbehalfpayment/AddInvoice`, entity)
            .pipe(map((res: any) => {
                if (res.code == '401') this.authService.logout();
                return res;
            }), catchError(this.handleError));
    }

    getRecoveries(paymentId: number) {
        return this.http.post(`${environment.apiUrl}/api/onbehalfpayment/GetRecoveries`, { id: paymentId })
            .pipe(map((res: any) => {
                if (res.code == '401') this.authService.logout();
                return res;
            }), catchError(this.handleError));
    }

    addRecovery(entity: OnBehalfPaymentRecovery) {
        return this.http.post(`${environment.apiUrl}/api/onbehalfpayment/AddRecovery`, entity)
            .pipe(map((res: any) => {
                if (res.code == '401') this.authService.logout();
                return res;
            }), catchError(this.handleError));
    }
}

export interface OnBehalfPaymentFilter {
    keyword?: string;
    fromDate?: string;
    toDate?: string;
    supplierId?: number;
    employeeId?: string;
}
