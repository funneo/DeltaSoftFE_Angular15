import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { ActionFunction, Functions, Permissions, Role } from '../models';


@Injectable({ providedIn: 'root' })
export class PermissionService extends BaseService {
  constructor(private http: HttpClient) {
    super();
  }

  getFunctions() {
    return this.http.get<Functions[]>(`${environment.apiUrl}/api/permission/functions-view`).pipe(map((res: Functions[]) => {
      return this.buildTree(res);
    }),
    catchError(this.handleError));
  }

  getPermissionByRole(roleId: string) {
    return this.http.get<Permissions[]>(`${environment.apiUrl}/api/permission/${roleId}/role-permissions`).pipe(map((res: Permissions[]) => {
      return res;
    }), catchError(this.handleError));
  }

  getFunctionAction(){
    return this.http.get<Functions[]>(`${environment.apiUrl}/api/permission/function-actions`).pipe(map((res: Functions[]) => {
      return res;
    }), catchError(this.handleError));
  }

  updatePermission(roleId: string, acctionFunctions: ActionFunction[]){
    return this.http.post(`${environment.apiUrl}/api/permission/${roleId}/save-permissions`, acctionFunctions)
            .pipe(catchError(this.handleError));
  }

  buildTree = (arr: Functions[]): Functions[] => {
    let roots: any[] = [];
    roots = arr.filter(x => x.parentId == null);
    for (var i = 0; i < roots.length; i++) {
      this.tree(arr, roots[i]);
    }
    return roots;
  }

  private tree(arr: Functions[], list: Functions) {
    let childs = arr.filter(x => x.parentId == list.id);
    //list.data.expanded = true;
    list.children = childs;
    for (var i = 0; i < childs.length; i++) {
      this.tree(arr, childs[i]);
    }
  }
}
