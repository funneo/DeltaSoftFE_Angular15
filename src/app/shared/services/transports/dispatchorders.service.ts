import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '..';
import { FromBodyBase, Shipment } from '../../models';
import { CancelDispatchOrder } from '../../models/transports/cancel-dispatch-order.model';
import { DispatchOrderAttachfiles } from '../../models/transports/dispatchorders/dispatch-order-attachfiles';
import { DispatchOrderProcedure } from '../../models/transports/dispatchorders/dispatch-order-procedure.model';
import { Dispatchorder } from '../../models/transports/dispatchorders/dispatchorder';
import { BaseService } from '../base.service';
import { JwtService } from '../jwt.service';

@Injectable({
  providedIn: 'root'
})
export class DispatchordersService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtServices: JwtService, private authenService: AuthService) {
    super();
    this.token = jwtServices.getToken();
  }

  add(entity: Dispatchorder) {
    let p: FromBodyBase<Dispatchorder> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Dispatchorder/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  update(entity: Dispatchorder) {
    let p: FromBodyBase<Dispatchorder> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Dispatchorder/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  addFcl(entity: Dispatchorder) {
    let p: FromBodyBase<Dispatchorder> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Dispatchorder/createFcl`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  updateFcl(entity: Dispatchorder) {
    let p: FromBodyBase<Dispatchorder> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Dispatchorder/updateFcl`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  evaluationDriver(entity: Dispatchorder) {
    let p: FromBodyBase<Dispatchorder> = { item: {} };
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Dispatchorder/EvaluationDriver`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  chagedDriver(entity: Dispatchorder) {
    let p: FromBodyBase<Dispatchorder> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Dispatchorder/changedDriver`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  updateOdor(entity: Dispatchorder) {
    let p: FromBodyBase<Dispatchorder> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Dispatchorder/updateOdor`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  setFinish(entity: Dispatchorder) {
    let p: FromBodyBase<Dispatchorder> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Dispatchorder/setfinish`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  updateState(entity: Dispatchorder) {
    let p: FromBodyBase<Dispatchorder> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Dispatchorder/updatestate`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getDetail(refNo: string) {
    let p: FromBodyBase<Dispatchorder> = {};
    let item: Dispatchorder = {
      refNo: refNo
    }
    p.item = item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Dispatchorder/getbyrefno`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getByJobId(jobId: string) {
    let p: FromBodyBase<Dispatchorder> = { item: {} };
    p.item.refNo = jobId
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Dispatchorder/getbyjobid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getForSummary(vehicleId: number) {
    let p: FromBodyBase<Dispatchorder> = { item: {} };
    p.item.vihicleId = vehicleId
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Dispatchorder/GetForSummary`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getForPayment(driverId: number) {
    let p: FromBodyBase<Dispatchorder> = { item: {} };
    p.item.driverId = driverId
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Dispatchorder/GetForPayment`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getSummarySupplier(id: number) {
    let p: FromBodyBase<Dispatchorder> = { item: {} };
    p.item.shippingUnitId = id
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Dispatchorder/getSummarySupplier`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getRpe(params: HttpParams) {
    let p: FromBodyBase<Dispatchorder> = { item: {} };
    p.item.branchId = Number.parseInt(params.get('branchid'));;
    p.item.vihicleId = Number.parseInt(params.get('vehicleid'));;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Dispatchorder/getRpe`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getEtcFee(refNo: string) {
    let p: FromBodyBase<Dispatchorder> = { item: {} };
    p.item.refNo = refNo;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Dispatchorder/GetEtcFeeByRefNo`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  delete(refNo: string) {
    let p: FromBodyBase<Dispatchorder> = { item: {} };
    p.item.refNo = refNo;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/Dispatchorder/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getPaging(params: HttpParams) {
    let p: FromBodyBase<Dispatchorder> = { item: {} };
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.userId = params.get('userid');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.branchId = Number.parseInt(params.get('branchid'));
    p.item.finished = params.get('isFinish') == "1";
    p.item.driverId = params.get('driverid') == null ? 0 : Number.parseInt(params.get('driverid'));
    p.item.status = Number.isNaN(Number.parseInt(params.get('type'))) ? 0 : Number.parseInt(params.get('type'));
    p.item.shippingUnitId = params.get('supplierid') == null ? 0 : Number.parseInt(params.get('supplierid'));
    return this.http.post(`${environment.apiUrl}/api/Dispatchorder/getpaging`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  getExport(params: HttpParams) {
    let p: FromBodyBase<Dispatchorder> = { item: {} };
    p.tokenKey = this.token;
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.branchId = Number.parseInt(params.get('branchid'));
    p.gType = params.get('type')
    return this.http.post(`${environment.apiUrl}/api/Dispatchorder/getExport`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getReport01(params: HttpParams) {
    let p: FromBodyBase<Dispatchorder> = { item: {} };
    p.tokenKey = this.token;
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.branchId = Number.parseInt(params.get('branchid'));
    p.keyWord = params.get('keyword');
    p.item.driverId = params.get('driverid') == null ? 0 : Number.parseInt(params.get('driverid'));
    return this.http.post(`${environment.apiUrl}/api/Dispatchorder/report01`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getReport03(params: HttpParams, type: number) {
    let p: FromBodyBase<Dispatchorder> = { item: {} };
    p.gType = type.toString();
    p.tokenKey = this.token;
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.branchId = Number.parseInt(params.get('branchid'));
    return this.http.post(`${environment.apiUrl}/api/Dispatchorder/report03`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }


  getAll(params: HttpParams) {
    let p: FromBodyBase<Dispatchorder> = {};
    let item: Dispatchorder = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.userId = params.get('userid');
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.branchId = Number.parseInt(params.get('branchid'));
    item.finished = params.get('isFinish') == "1";
    p.item = item;
    return this.http.post(`${environment.apiUrl}/api/Dispatchorder/getall`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  setDoneProcedure(params: HttpParams) {
    let p: FromBodyBase<DispatchOrderProcedure> = {};
    let item: DispatchOrderProcedure = {};
    p.tokenKey = this.token;
    item.refNo = params.get('refno');
    item.latitude = Number.parseFloat(params.get('latitude'));
    item.longtitude = Number.parseFloat(params.get('longtitude'));
    item.procedureId = Number.parseInt(params.get('procedureid'));
    item.isFinish = params.get('isfinish') == "1";
    p.item = item;
    return this.http.post(`${environment.apiUrl}/api/DispatchOrder/SetDoneProcedure`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  addAttachFile(entity: DispatchOrderAttachfiles, files: File) {
    let p: FromBodyBase<DispatchOrderAttachfiles> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    const body = JSON.stringify(p);
    const formData = new FormData();
    formData.append('TokenKey', body);
    formData.append('Files', files)
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderAttachfiles/create`, formData)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getAttachFile(entity: DispatchOrderAttachfiles) {
    let p: FromBodyBase<DispatchOrderAttachfiles> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderAttachfiles/getbyrefno`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  getAttachFileByShipent(entity: Shipment) {
    let p: FromBodyBase<Shipment> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderAttachfiles/GetAttackFilesByShipment`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  deleteAttachFile(entity: DispatchOrderAttachfiles) {
    let p: FromBodyBase<DispatchOrderAttachfiles> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/DispatchOrderAttachfiles/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  //Cancel Dispatch Order
  CancelDispatchOrder_GetAll(params: HttpParams) {
    let p: FromBodyBase<CancelDispatchOrder> = { item: {} };
    p.tokenKey = this.token;
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.branchId = Number.parseInt(params.get('branchid'));
    p.item.refNo = params.get('refno');
    return this.http.post(`${environment.apiUrl}/api/Dispatchorder/GetCancelDispatchOrder`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  CancelDispatchOrder_Create(entity: CancelDispatchOrder) {
    let p: FromBodyBase<CancelDispatchOrder> = {};
    p.tokenKey = this.token;
    p.item = entity;
    return this.http.post(`${environment.apiUrl}/api/Dispatchorder/CreateCancelDispatchOrder`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  CancelDispatchOrder_Accept(entity: CancelDispatchOrder) {
    let p: FromBodyBase<CancelDispatchOrder> = {};
    p.tokenKey = this.token;
    p.item = entity;
    return this.http.post(`${environment.apiUrl}/api/Dispatchorder/AcceptCancelDispatchOrder`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  //

}
