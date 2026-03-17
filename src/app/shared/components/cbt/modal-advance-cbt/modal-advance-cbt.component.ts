import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { AdvanceGroup, Branch, Employee, OtherCategories, ResponseValue } from '@app/shared/models';
import { AdvancesCbt } from '@app/shared/models/cbt/advances-cbt.model';
import { DispatchOrderCbt } from '@app/shared/models/cbt/dispatch-order-cbt.model';
import { AdvanceGroupService, AdvanceService, AuthService, BranchService, EmployeeService, NotificationService, OtherCategoriesService, UtilityService } from '@app/shared/services';
import { AdvancesCbtService } from '@app/shared/services/cbt/advances-cbt.service';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-advance-cbt',
  templateUrl: './modal-advance-cbt.component.html',
  styleUrls: ['./modal-advance-cbt.component.css']
})
export class ModalAdvanceCbtComponent implements OnInit {

  entity: AdvancesCbt;
  flagXem: boolean = false;
  flagSave: boolean = false;
  busy: Subscription;
  listBranch: Branch[];
  maskNumber = UtilityService.maskNumber;
  listEmployee: Employee[];
  listGroup: AdvanceGroup[];
  groupId: number;
  // _viewAll=2;
  _functionId=SystemContstants.ADVANCE;
  _acc: boolean = false;
  _accept: boolean = false;
  _auth: number = 5;
  _employeeId: number;
  _branchId: number;
  _levelPermissionAdvance: number;
  _hasPermissionAdvance: boolean = false;
  _bangchu='';
  listAdvanceGroupId: string[];
  dateTimeOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  listCurrencys = UtilityService.listCurrencys();
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService, private advanceService: AdvancesCbtService,
    private branchService: BranchService, private employeeService: EmployeeService, private authService: AuthService,
    private _utilityService: UtilityService, private advanceGroupService: AdvanceGroupService, private otherCategoriesService: OtherCategoriesService) {
    let user = this.authService.getLoggedInUser();
    this._auth = Number.parseInt(user.authorisationLevel);
    this._employeeId = Number.parseInt(user.employeeId);
    this._acc = this.authService.hasPermission('ADVANCE_ACCOUNT');
    this._accept = this.authService.hasPermission('ADVANCE_ACCEPT');
    this._branchId = Number.parseInt(user.branchId);
    this._levelPermissionAdvance = Number.parseInt(user.advanceConfirmLevel);
    this.listAdvanceGroupId = user.listAdvanceGroupId?.split(',');
  }

  ngOnInit(): void {
    this.loadChiNhanh();
    this.loadOtherCategory();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  loadEmployee() {
    const params = new HttpParams()
      .set('branchId', this._branchId?.toString())
    this.employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
      this.listEmployee = res.data;
    });
  }

  loadAdvanceGroup() {
    this.advanceGroupService.getAll().subscribe((res: ResponseValue<AdvanceGroup[]>) => {
      this.listGroup = res.data?.filter(x => x.type == 2);
    });
  }

  loadOtherCategory() {
    const params = new HttpParams()
      .set('type', 'CURRENCY');
    this.otherCategoriesService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      this.listCurrencys = [...res.data.filter(x => x.type === 'CURRENCY')];
    });
  }

  selectedDate(event) {
    this.entity.refDate = moment(event.start).format('DD/MM/YYYY');
  }

  closedDate(event) {
    if (this.entity.refDate == null)
      this.entity.refDate = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  changedSoTien(event):void{
    this._bangchu=this._utilityService.ReadNumber(event);
  }

  add(item:DispatchOrderCbt) {
    this.advanceGroupService.getAll().subscribe((res: ResponseValue<AdvanceGroup[]>) => {
      this.listGroup = res.data?.filter(x => x.type == 2);
      if (this.listGroup?.length > 0)
        this.groupId = this.listGroup[0].id;
      else this.groupId = null;
      this.entity = {
        dispatchOrderRefNo:item.refNo,
        status: true,
        branchId: this._branchId,
        invoiceBranchId:this._branchId,
        employeeId:item.driverId,
        advanceGroupId: this.groupId,
        currency: 'VND',
        refDate: moment(new Date()).format('DD/MM/YYYY')
      };
      this.loadEmployee();
      this.flagXem = false;
      this.flagSave = false;
      this.modalAddEdit.show();
    });
  }

  edit(id: string, flag: boolean) {
    this.advanceService.getDetail(id).subscribe((res: ResponseValue<AdvancesCbt>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        if (this.entity.refDate) {
          this.dateTimeOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.refDate, FormatContstants.DATEEN).format(FormatContstants.DATEEN))
          );
          this.entity.refDate = moment(this.entity.refDate, FormatContstants.DATEEN).format(
            FormatContstants.DATEVN
          );
        }
        this.flagXem = flag;
        this.flagSave = false;
        this.loadAdvanceGroup();
        this.loadEmployee();
        //Xet quyen duyet
        if (this._accept && this.flagXem && this.entity.status && this._levelPermissionAdvance > 0 && this._levelPermissionAdvance == this.entity.acceptStep + 1) {
          let index = this.listAdvanceGroupId.findIndex(x => x == this.entity.advanceGroupId.toString());
          if (index != -1) this._hasPermissionAdvance = true;
        }
        this.modalAddEdit.show();
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      if (this.entity.refDate)
        this.entity.refDate = moment(this.entity.refDate, FormatContstants.DATEVN).format(
          FormatContstants.CLIENTDATE
        );
      if (this.entity.id == undefined) {
        this.advanceService.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          }
          else {
            if (res.message == 'OVER')
              this._notificationService.printErrorMessage('Tạm ứng vượt hạn mức cho phép!');
            else
              this._notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG);
            this.entity.refDate = moment(this.entity.refDate, FormatContstants.CLIENTDATE).format(
              FormatContstants.DATEVN
            );
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.advanceService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          }
          else {
            if (res.message == 'OVER')
              this._notificationService.printErrorMessage('Tạm ứng vượt hạn mức cho phép!');
            else
              this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
            this.entity.refDate = moment(this.entity.refDate, FormatContstants.CLIENTDATE).format(
              FormatContstants.DATEVN
            );
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
    }
  }

  changedAccept(event: boolean) {
    if(!this.flagSave){
      let item: AdvancesCbt = {
        id: this.entity.id,
        feedback: this.entity.feedback,
        status: event,
      };
      this.flagSave = true;
      this.advanceService.accept(item, event?1:-1).subscribe(
        (res: ResponseValue<any>) => {
          if (res.code == "200" || res.code == "201") {
            this.modalAddEdit.hide();
            this.SaveSuccess.emit(res.data);
          } else {
            this._notificationService.printErrorMessage(
              MessageContstants.UPDATED_ERR_MSG
            );
            this.flagSave = false;
          }
        },
        () => {
          this._notificationService.printErrorMessage(
            MessageContstants.UPDATED_ERR_MSG
          );
          this.flagSave = false;
        }
      );
    }
  }

  OnHidden() {
    this.CloseModal.emit();
  }

}
