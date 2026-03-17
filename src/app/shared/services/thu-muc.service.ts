import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { ThuMuc } from '../models';


@Injectable({ providedIn: 'root' })
export class ThuMucService extends BaseService {
    constructor(private http: HttpClient) {
        super();
    }
    add(entity: ThuMuc) {
        Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
        return this.http.post(`${environment.apiUrl}/api/thumuc/create`, entity)
            .pipe(catchError(this.handleError));
    }

    update(entity: ThuMuc) {
        return this.http.put(`${environment.apiUrl}/api/thumuc/update`, entity)
            .pipe(catchError(this.handleError));
    }

    getDetail(id: number) {
        return this.http.get<ThuMuc>(`${environment.apiUrl}/api/thumuc/getbyid/${id}`)
            .pipe(catchError(this.handleError));
    }

    delete(id: number) {
        return this.http.delete(environment.apiUrl + '/api/thumuc/delete?id=' + id)
            .pipe(
                catchError(this.handleError)
            );
    }

    getAll() {
        return this.http.get<ThuMuc[]>(`${environment.apiUrl}/api/thumuc/getall`)
            .pipe(map((response: ThuMuc[]) => {
                return this.buildTree(response);
            }), catchError(this.handleError));
    }

    private buildTree = (arr: ThuMuc[]): ThuMuc[] => {
        let roots: ThuMuc[] = [];
        roots = arr.filter(x => x.idThuMucCha == null);
        for (var i = 0; i < roots.length; i++) {
          this.tree(arr, roots[i]);
        }
        return roots;
      }
    
    private tree(arr: ThuMuc[], list: ThuMuc) {
        let childs = arr.filter(x => x.idThuMucCha == list.id);
        list.expanded = true;
        list.children = childs;
        for (var i = 0; i < childs.length; i++) {
          this.tree(arr, childs[i]);
        }
      }
}