import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { environment } from '@environments/environment';
import { FromBodyBase } from '@app/shared/models';
import { HttpClient, HttpParams } from '@angular/common/http';
import { JwtService } from '../jwt.service';
import { AuthService } from '../auth.service';
import { ShippingTask } from '@app/shared/models/transports/shipping-task.model';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ShippingTaskService extends BaseService {
  private token:string;
  constructor(private http:HttpClient, jwtServices: JwtService,private authenService:AuthService) {
    super();
    this.token=jwtServices.getToken();
   }

  add(entity: ShippingTask) {
    let p: FromBodyBase<ShippingTask> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/ShippingTask/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  update(entity: ShippingTask) {
    let p: FromBodyBase<ShippingTask> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/ShippingTask/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  cancel(entity: ShippingTask) {
    let p: FromBodyBase<ShippingTask> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/ShippingTask/Cancel`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  updatePlanning(entity: ShippingTask) {
    let p: FromBodyBase<ShippingTask> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/ShippingTask/updatePlanning`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  updateOpMan(id:number,type:number,value:boolean,note:string) {
    let p: FromBodyBase<ShippingTask> = {item:{}};
    p.item.id =id ;
    p.tokenKey = this.token;
    p.item.opManNote=note;
    p.tValue=type;
    p.bValue=value;
    return this.http.post(`${environment.apiUrl}/api/ShippingTask/updateOpMan`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  updateContainer(entity: ShippingTask) {
    let p: FromBodyBase<ShippingTask> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/ShippingTask/updateContainer`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  updateWeight(entity: ShippingTask) {
    let p: FromBodyBase<ShippingTask> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/ShippingTask/updateWeight`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  updateTransfer(entity: ShippingTask) {
    let p: FromBodyBase<ShippingTask> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/ShippingTask/updateTransfer`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getDetail(id: string) {
    let p: FromBodyBase<ShippingTask> = {};
    let item:ShippingTask={
      id:Number.parseInt(id)
    }
    p.item=item;
    p.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/ShippingTask/getbyid`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  duplicate(id: number) {
    let p: FromBodyBase<ShippingTask> = {};
    let item:ShippingTask={
      id:id
    }
    p.item=item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/ShippingTask/duplicate`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  delete(id: number) {
    let p: FromBodyBase<ShippingTask> = {item:{}};
    p.item.id = id;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/ShippingTask/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  setReceiving(entity: ShippingTask) {
    let p: FromBodyBase<ShippingTask> = {item:entity};
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/ShippingTask/Receiving`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  
  getByCs(params: HttpParams) {
    let p: FromBodyBase<ShippingTask> = {item:{}};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.userId = params.get('userid');
    p.fromDate=params.get('fromDate');
    p.toDate=params.get('toDate');
    p.item.branchId=Number.parseInt(params.get('branchId'));
    return this.http.post(`${environment.apiUrl}/api/ShippingTask/getByCs`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  
  getAllByCs(params: HttpParams) {
    let p: FromBodyBase<ShippingTask> = {item:{}};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.userId = params.get('userid');
    p.fromDate=params.get('fromDate');
    p.toDate=params.get('toDate');
    p.item.branchId=Number.parseInt(params.get('branchId'));
    return this.http.post(`${environment.apiUrl}/api/ShippingTask/getAllByCs`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  
  getByOpMan(params: HttpParams) {
    let p: FromBodyBase<ShippingTask> = {item:{}};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.userId = params.get('userid');
    p.fromDate=params.get('fromDate');
    p.item.branchId=Number.parseInt(params.get('branchId'));
    return this.http.post(`${environment.apiUrl}/api/ShippingTask/getByOpMan`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  
  getAllByOpMan(params: HttpParams) {
    let p: FromBodyBase<ShippingTask> = {item:{}};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.userId = params.get('userid');
    p.fromDate=params.get('fromDate');
    p.toDate=params.get('toDate');
    p.item.branchId=Number.parseInt(params.get('branchId'));
    return this.http.post(`${environment.apiUrl}/api/ShippingTask/getAllByOpMan`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  
  getBySearch(params: HttpParams) {
    let p: FromBodyBase<ShippingTask> = {item:{}};
    p.tokenKey = this.token;
    p.fromDate=params.get('fromDate');
    p.item.branchId=Number.parseInt(params.get('branchId'));
    return this.http.post(`${environment.apiUrl}/api/ShippingTask/GetBySearch`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  
  getByReceiving(params: HttpParams) {
    let p: FromBodyBase<ShippingTask> = {item:{}};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.item.branchId=Number.parseInt(params.get('branchId'));
    return this.http.post(`${environment.apiUrl}/api/ShippingTask/GetByReceiving`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  multiply(params:HttpParams){
    let p: FromBodyBase<ShippingTask> = {};
    let item:ShippingTask={};
    p.tokenKey = this.token;
    item.id=Number.parseInt(params.get('id'));
    p.item=item;
    return this.http.post(`${environment.apiUrl}/api/ShippingTask/duplicate`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }
}
