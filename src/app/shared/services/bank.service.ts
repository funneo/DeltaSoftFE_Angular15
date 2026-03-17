import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Bank, FromBodyBase, Pagination } from '../models';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class BankService extends BaseService {
    private token: string;
    constructor(
        private http: HttpClient,
        jwtService: JwtService,
        private authService: AuthService
    ) {
        super();
        this.token = jwtService.getToken();
    }

    add(entity: Bank) {
        let p: FromBodyBase<Bank> = {};
        p.item = entity;
        p.tokenKey = this.token;
        return this.http.post(`${environment.apiUrl}/api/bank/create`, p)
            .pipe(
                map((response: any) => {
                    if (response.code == '401') this.authService.logout();
                    else return response;
                }),
                catchError(this.handleError)
            );
    }

    update(entity: Bank) {
        let p: FromBodyBase<Bank> = {};
        p.item = entity;
        p.tokenKey = this.token;
        return this.http.post(`${environment.apiUrl}/api/bank/update`, p)
            .pipe(
                map((response: any) => {
                    if (response.code == '401') this.authService.logout();
                    else return response;
                }),
                catchError(this.handleError)
            );
    }

    delete(listId: string) {
        let p: FromBodyBase<Bank> = {};
        p.listId = listId;
        p.tokenKey = this.token;
        return this.http.post(`${environment.apiUrl}/api/bank/delete`, p)
            .pipe(
                map((response: any) => {
                    if (response.code == '401') this.authService.logout();
                    else return response;
                }),
                catchError(this.handleError)
            );
    }

    getDetail(id: string) {
        let p: FromBodyBase<Bank> = {};
        p.id = id;
        p.tokenKey = this.token;
        return this.http.post(`${environment.apiUrl}/api/bank/getbyid`, p)
            .pipe(map((response: any) => {
                if (response.code == '401') this.authService.logout();
                else return response;
            }), catchError(this.handleError));
    }

    getAll() {
        let p: FromBodyBase<Bank> = { tokenKey: this.token };
        return this.http.post(`${environment.apiUrl}/api/bank/getall`, p)
            .pipe(map((response: any) => {
                if (response.code == '401') this.authService.logout();
                else return response;
            }), catchError(this.handleError));
    }

}
