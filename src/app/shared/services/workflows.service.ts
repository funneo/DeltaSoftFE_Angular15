import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { catchError, map } from 'rxjs/operators';
import { FromBodyBase, WorkflowJobOptionProcedure } from '../models';
import { Workflow } from '../models/workflows/workflow.model';
import { BaseService } from './base.service';
import { JwtService } from './jwt.service';
import { AuthService } from './auth.service';
import { WorkflowAttackFiles } from '../models/workflows/workflow-attack-files.model';

@Injectable({
  providedIn: 'root'
})
export class WorkflowsService extends BaseService {
  private token: string;
  constructor(private http: HttpClient, jwtServices: JwtService, private authenService: AuthService) {
    super();
    this.token = jwtServices.getToken();
  }

  add(entity: Workflow) {
    let p: FromBodyBase<Workflow> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Workflow/create`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  /**
   * Duyệt nháp (draft.DraftEntries, DraftType='Job') thành Công việc thật.
   * Gửi id=draftId + item=entity (map từ payload nháp); BE tạo job + ghi ngược draft.
   * Trả { jobId, shipmentId, alreadyPromoted }.
   */
  promoteFromDraft(entity: Workflow, draftId: number) {
    let p: FromBodyBase<Workflow> = {};
    p.item = entity;
    p.id = '' + draftId;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Workflow/PromoteFromDraft`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  update(entity: Workflow) {
    let p: FromBodyBase<Workflow> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Workflow/update`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getDetail(id: string) {
    let p: FromBodyBase<Workflow> = {};
    let item: Workflow = {
      id: Number.parseInt(id)
    }
    p.item = item;
    p.id = id;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Workflow/getbyid`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getSearching(branchid: number) {
    let p: FromBodyBase<Workflow> = { item: {} }
    p.item.branchId = branchid;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Workflow/SearchForDispatchOrder`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  delete(id: number, deleted: boolean) {
    let p: FromBodyBase<Workflow> = { item: {} };
    p.item.id = id;
    p.item.deleted = deleted;
    p.tokenKey = this.token;
    return this.http.post(environment.apiUrl + `/api/Workflow/delete`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  setReceiving(params: HttpParams) {
    let p: FromBodyBase<Workflow> = {};
    let item: Workflow = {};
    p.tokenKey = this.token;
    p.userId = params.get('userid');
    item.isBoolValue = params.get('isReceiving') == "1";
    item.id = Number.parseInt(params.get('id'));
    p.item = item;
    return this.http.post(`${environment.apiUrl}/api/Workflow/Receiving`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  setAssigning(params: HttpParams) {
    let p: FromBodyBase<Workflow> = {};
    let item: Workflow = {};
    p.tokenKey = this.token;
    item.isBoolValue = params.get('isAssigning') == "1";
    item.jobAssigningUserId = params.get('assigninguserid');
    item.jobAssignedUserId = params.get('assigneduserid');
    item.opManUpdateNotes = params.get('note');
    p.listId = params.get('listid');
    p.item = item;
    return this.http.post(`${environment.apiUrl}/api/Workflow/Assigning`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  getPaging(params: HttpParams) {
    let p: FromBodyBase<Workflow> = { item: {} };
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.userId = params.get('userid');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.listId = params.get('listid');
    p.gType = params.get('type')
    p.item.isJobFinish = params.get('isFinish') == "1";
    p.item.branchId = Number.parseInt(params.get('branchId'));
    p.item.isJobDone = params.get('isjobdone') == "1";
    p.item.isLeader = params.get('isleader') == "1";
    p.item.isBoolValue = params.get('isCs') == "1";
    p.customerId = params.get('customerId') ? Number.parseInt(params.get('customerId')) : 0;
    return this.http.post(`${environment.apiUrl}/api/Workflow/getpaging2`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  /** Picker "Công việc (PCCV)" cho modal đọc hóa đơn: chỉ CV người đăng nhập thực hiện + lô chưa khóa. */
  getForPicker(params: HttpParams) {
    let p: FromBodyBase<Workflow> = { item: {} };
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.customerId = params.get('customerId') ? Number.parseInt(params.get('customerId')) : 0;
    p.item.branchId = params.get('branchId') ? Number.parseInt(params.get('branchId')) : 0;
    return this.http.post(`${environment.apiUrl}/api/Workflow/GetForPicker`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getCanon(params: HttpParams) {
    let p: FromBodyBase<Workflow> = { item: {} };
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.userId = params.get('userid');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.item.branchId = Number.parseInt(params.get('branchId'));
    return this.http.post(`${environment.apiUrl}/api/Workflow/getCanons`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getPagingByDelivery(params: HttpParams) {
    let p: FromBodyBase<Workflow> = { item: {} };
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.userId = params.get('userid');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.listId = params.get('listid');
    p.tValue = Number.parseInt(params.get('type'));
    p.item.branchId = Number.parseInt(params.get('branchId'));
    return this.http.post(`${environment.apiUrl}/api/Workflow/GetPagingByDelivery`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  report01(params: HttpParams) {
    let p: FromBodyBase<Workflow> = { item: {} };
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    p.item.handlingGroupId = params.get('handlinggroupid') ? Number.parseInt(params.get('handlinggroupid')) : 0;
    p.item.branchId = Number.parseInt(params.get('branchId'));
    return this.http.post(`${environment.apiUrl}/api/Workflow/report01`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getReceiving(params: HttpParams) {
    let p: FromBodyBase<Workflow> = { item: {} };
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.userId = params.get('userid');
    p.listId = params.get('listHandlinggroupid');
    return this.http.post(`${environment.apiUrl}/api/Workflow/getreceiving`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  getByAssignedUser(params: HttpParams) {
    let p: FromBodyBase<Workflow> = { item: {} };
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Workflow/GetByAssignedUser`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getOptionProcedure(id: number) {
    let p: FromBodyBase<WorkflowJobOptionProcedure> = {};
    let item: WorkflowJobOptionProcedure;
    item.workflowId = id;
    p.item = item;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/WorkflowJobOptionProcedure/getall`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  getAll(params: HttpParams) {
    let p: FromBodyBase<Workflow> = {};
    let item: Workflow = {};
    p.tokenKey = this.token;
    p.keyWord = params.get('keyword');
    p.userId = params.get('userid');
    p.pageIndex = Number.parseInt(params.get('pageIndex'));
    p.pageSize = Number.parseInt(params.get('pageSize'));
    p.fromDate = params.get('fromDate');
    p.toDate = params.get('toDate');
    item.handlingGroupId = Number.parseInt(params.get('handlinggroupid'));
    p.item.branchId = Number.parseInt(params.get('branchId'));
    item.isJobFinish = params.get('isjobfinish') == "1";
    item.isJobDone = params.get('isjobdone') == "1";
    item.isLeader = params.get('isleader') == "1";
    item.isBoolValue = params.get('Isboolvalue') == "1";
    p.item = item;
    console.log(p);
    return this.http.post(`${environment.apiUrl}/api/Workflow/getall`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  updateNote(params: HttpParams) {
    let p: FromBodyBase<WorkflowJobOptionProcedure> = {};
    let item: WorkflowJobOptionProcedure = {};
    p.tokenKey = this.token;
    item.note = params.get('note');
    item.id = Number.parseInt(params.get('id'));
    p.item = item;
    return this.http.post(`${environment.apiUrl}/api/WorkflowJobOptionProcedure/UpdateNote`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  setDone(params: HttpParams) {
    let p: FromBodyBase<WorkflowJobOptionProcedure> = {};
    let item: WorkflowJobOptionProcedure = {};
    p.tokenKey = this.token;
    item.latitude = Number.parseFloat(params.get('latitude'));
    item.longtitude = Number.parseFloat(params.get('longtitude'));
    item.id = Number.parseInt(params.get('id'));
    item.isFinish = params.get('isfinish') == '1';
    p.item = item;
    return this.http.post(`${environment.apiUrl}/api/WorkflowJobOptionProcedure/SetDone`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  updateGrade(entity: Workflow) {
    let p: FromBodyBase<Workflow> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Workflow/grade`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  multiply(params: HttpParams) {
    let p: FromBodyBase<Workflow> = {};
    let item: Workflow = {};
    p.tokenKey = this.token;
    item.id = Number.parseInt(params.get('id'));
    item.numberDuplicate = Number.parseInt(params.get('number'));
    p.item = item;
    return this.http.post(`${environment.apiUrl}/api/Workflow/duplicate`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  setFinishWorkflow(params: HttpParams) {
    let p: FromBodyBase<Workflow> = {};
    let item: Workflow = {};
    p.tokenKey = this.token;
    item.id = Number.parseInt(params.get('id'));
    item.csGradeByOp = Number.parseInt(params.get('gradecs'));
    item.opManGradeByOp = Number.parseInt(params.get('gradeopman'));
    item.csEvaluationByOp = params.get('evaluationcs');
    item.opManEvaluationByOp = params.get('evaluationopman');
    item.noteFinish = params.get('notefinish');
    p.item = item;
    return this.http.post(`${environment.apiUrl}/api/Workflow/SetFinish`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  opManUpdate(entity: Workflow) {
    let p: FromBodyBase<Workflow> = {};
    p.item = entity;
    p.tokenKey = this.token;
    return this.http.post(`${environment.apiUrl}/api/Workflow/opmanupdate`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  attackfiles_add(entity: WorkflowAttackFiles, files: File) {
    let p: FromBodyBase<WorkflowAttackFiles> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    const body = JSON.stringify(p);
    const formData = new FormData();
    formData.append('TokenKey', body);
    formData.append('Files', files)
    return this.http.post(`${environment.apiUrl}/api/Workflow/AttackFiles`, formData)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  attackfiles_addMultiple(entity: WorkflowAttackFiles, files: File[]) {
    let p: FromBodyBase<WorkflowAttackFiles> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    const body = JSON.stringify(p);
    const formData = new FormData();
    formData.append('TokenKey', body);
    files.forEach(file => formData.append('Files', file));
    return this.http.post(`${environment.apiUrl}/api/Workflow/AttackFiles`, formData)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  attackfiles_delete(entity: WorkflowAttackFiles) {
    let p: FromBodyBase<WorkflowAttackFiles> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Workflow/DeleteAttackFiles`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  attackfiles_get(entity: WorkflowAttackFiles) {
    let p: FromBodyBase<WorkflowAttackFiles> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Workflow/GetAttackFiles`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }

  attackfiles_getbyShipment(entity: Workflow) {
    let p: FromBodyBase<Workflow> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Workflow/GetAttackFilesByShipment`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }
  imagesPod_get(entity: Workflow) {
    let p: FromBodyBase<Workflow> = {};
    p.item = entity;
    p.tokenKey = this.token;
    Object.keys(entity).forEach(key => entity[key] === null ? delete entity[key] : '');
    return this.http.post(`${environment.apiUrl}/api/Workflow/GetImagePod`, p)
      .pipe(map((response: any) => {
        if (response.code == '401')
          this.authenService.logout();
        else return response;
      }), catchError(this.handleError));
  }
}
