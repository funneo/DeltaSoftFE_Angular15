import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FromBodyBase } from '@app/shared/models';
import { DispatchOrderFcl } from '@app/shared/models/fcl/dispatch-order-fcl';
import { environment } from '@environments/environment';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { BaseService } from '../base.service';
import { JwtService } from '../jwt.service';

@Injectable({
  providedIn: 'root'
})
export class DispatchOrderFclService extends BaseService {
  private token:string;
  constructor(private http:HttpClient, jwtServices: JwtService,private authenService:AuthService) {
    super();
    this.token=jwtServices.getToken();
   }

  add(entity: DispatchOrderFcl) {
    let p: FromBodyBase<DispatchOrderFcl> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderFcl/create`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  update(entity: DispatchOrderFcl) {
    let p: FromBodyBase<DispatchOrderFcl> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderFcl/update`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  
  driverUpdate(entity: DispatchOrderFcl) {
    let p: FromBodyBase<DispatchOrderFcl> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderFcl/driverUpdate`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  
  getExport(params: HttpParams) {
      let p: FromBodyBase<DispatchOrderFcl> = {item:{}};
      p.tokenKey = this.token;
      p.fromDate=params.get('fromDate');
      p.toDate=params.get('toDate');
      p.branchId=Number.parseInt(params.get('branchid'));
      p.gType=params.get('type')
      return this.http.post(`${environment.apiUrl}/api/DispatchOrderFcl/getExport`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
    }
  

  updateEtcFee(entity: DispatchOrderFcl) {
    let p: FromBodyBase<DispatchOrderFcl> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderFcl/updateEtcFee`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }



  updateState(entity: DispatchOrderFcl,isDeny:boolean,typeDeny:number) {
    let p: FromBodyBase<DispatchOrderFcl> = {};
    p.item = entity;
    p.bValue=isDeny;
    p.tValue=typeDeny;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderFcl/updatestate`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getReport03(params: HttpParams, type:number) {
      let p: FromBodyBase<DispatchOrderFcl> = {item:{}};
      p.gType=type.toString();
      p.tokenKey = this.token;
      p.fromDate=params.get('fromDate');
      p.toDate=params.get('toDate');
      p.branchId=Number.parseInt(params.get('branchid'));
      return this.http.post(`${environment.apiUrl}/api/DispatchOrderFcl/report03`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
    }
  

  getDetail(refNo: string) {
    let p: FromBodyBase<DispatchOrderFcl> = {};
    let item:DispatchOrderFcl={
      refNo:refNo
    }
    p.item=item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderFcl/getbyrefno`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }



  delete(refNo: string) {
    let p: FromBodyBase<DispatchOrderFcl> = {item:{}};
    p.item.refNo= refNo;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/DispatchOrderFcl/delete`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getAll(params: HttpParams) {
    let p: FromBodyBase<DispatchOrderFcl> = {item:{branchId:Number.parseInt(params.get('branchid'))}};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.fromDate=params.get('fromDate');
    p.toDate=params.get('toDate');
    p.branchId=Number.parseInt(params.get('branchid'));
    // Lọc theo loại lệnh: '1' = lệnh cũ legacy, '0' = lệnh mới; không truyền → SP mặc định lấy lệnh mới (NULL ~ 0)
    const il = params.get('isLegacy');
    if (il !== null && il !== '') p.item.isLegacy = il === '1' || il === 'true';
    // Lọc thầu phụ (tab "Lệnh FCL" trong module thầu phụ): cờ bValue (false = không lọc; true = chỉ thầu phụ) + supplierId (=ShippingUnitId).
    // Caller cũ không truyền → bValue mặc định false → BE giữ nguyên hành vi.
    const isSub = params.get('isSubcontractors');
    if (isSub === '1' || isSub === 'true') p.bValue = true;
    const supplierId = params.get('supplierid');
    if (supplierId !== null && supplierId !== '' && supplierId !== '0') p.item.shippingUnitId = Number.parseInt(supplierId);
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderFcl/getPaging`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getByDriver(params: HttpParams) {
    let p: FromBodyBase<DispatchOrderFcl> = {item:{branchId:Number.parseInt(params.get('branchid'))}};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.fromDate=params.get('fromDate');
    p.toDate=params.get('toDate');
    p.branchId=Number.parseInt(params.get('branchid'));
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderFcl/getByDriver`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  getPerformance(params: HttpParams) {
    let p: FromBodyBase<DispatchOrderFcl> = {item:{branchId:Number.parseInt(params.get('branchid'))}};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.fromDate=params.get('fromDate');
    p.toDate=params.get('toDate');
    p.branchId=Number.parseInt(params.get('branchid'));
    p.item.driverId=Number.parseInt(params.get('driverid'));
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderFcl/getPerformance`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }
  
  getByJobId(jobId: string) {
    let p: FromBodyBase<DispatchOrderFcl> = {};
    p.tokenKey = this.token;
    p.id=jobId;
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderFcl/GetByJobId`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  // =====================================================================
  // TO refactor (2026-05-15): các method WithTO — tạo/sửa/đọc atomic FCL+TO.
  //   • Method cũ (add/update/getDetail) GIỮ NGUYÊN cho lệnh legacy.
  //   • FE gọi *WithTo khi tạo/sửa lệnh MỚI và khi mở xem lệnh — backend trả
  //     m.IsLegacy để FE rẽ nhánh hiển thị.
  // Response createWithTo: { newToId, newToRefNo, newFclRefNo }.
  // =====================================================================

  createWithTo(entity: DispatchOrderFcl) {
    let p: FromBodyBase<DispatchOrderFcl> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderFcl/CreateWithTO`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  updateWithTo(entity: DispatchOrderFcl) {
    let p: FromBodyBase<DispatchOrderFcl> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderFcl/UpdateWithTO`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  getDetailWithTo(refNo: string) {
    let p: FromBodyBase<DispatchOrderFcl> = {};
    let item: DispatchOrderFcl = { refNo: refNo };
    p.item = item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderFcl/GetByRefNoWithTO`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }

  // Dầu máy phát (2026-06-17): lưu thông số máy phát + tự tính dầu. Trả về { generatorFuelAmount, generatorFuelCost }.
  updateGenerator(entity: DispatchOrderFcl) {
    let p: FromBodyBase<DispatchOrderFcl> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderFcl/UpdateGenerator`, p)
    .pipe(map((response: any) => {
      if (response.code == '401')
        this.authenService.logout();
      else return response;
    }), catchError(this.handleError));
  }
}
