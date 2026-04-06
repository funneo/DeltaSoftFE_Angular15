import { formatNumber } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { DebtInventory, Branch, Employee, ResponseValue, AdvanceGroup, OtherCategories, EmployeeDebit } from '@app/shared/models';
import { NotificationService, DebtInventoryService, BranchService, AuthService, UtilityService, EmployeeService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';
import { ModalSelectEmployeeDebitComponent } from '../modal-select-employee-debit/modal-select-employee-debit.component';
import { join } from 'path';

@Component({
  selector: 'modal-inventory',
  templateUrl: './modal-inventory.component.html',
  styleUrls: ['./modal-inventory.component.css']
})
export class ModalInventoryComponent implements OnInit {
  entity: DebtInventory;
  flagXem: boolean = false;
  flagSave: boolean = false;
  busy: Subscription;
  listBranch: Branch[];
  maskNumber = UtilityService.maskNumber;
  listEmployee: Employee[];

  _acc: boolean = false;
  _accept: boolean = false;
  _auth: number = 5;
  _employeeId: number;
  _branchId: number;
  feedback: string;
  viewAttachFiles = false;
  listInventory: DebtInventory[];
  loai:number;

  dateTimeOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  _ngay: string = moment(new Date()).format('DD/MM/YYYY');
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;
  @ViewChild(ModalSelectEmployeeDebitComponent, { static: false }) modalSelect: ModalSelectEmployeeDebitComponent;

  constructor(private _notificationService: NotificationService, private debtInventoryService: DebtInventoryService,
    private branchService: BranchService, private employeeService: EmployeeService, private authService: AuthService,
    private _utilityService: UtilityService) {

    let user = this.authService.getLoggedInUser();
    this._auth = Number.parseInt(user.authorisationLevel);
    this._employeeId = Number.parseInt(user.employeeId);
    this._acc = this.authService.hasPermission('INVENTORY_ACCOUNT');
    this._accept = this.authService.hasPermission('INVENTORY_ACCEPT');
    this._branchId = Number.parseInt(user.branchId);
  }

  ngOnInit(): void {
    this.loadChiNhanh();
    this.loadEmployee();
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

  changedEmployee(e: Employee) {
    let _eId = e.id;
    this.entity.beginPeriod=0;
    const params = new HttpParams()
      .set('employeeId', _eId?.toString())
    this.debtInventoryService.getAll(params).subscribe((res: ResponseValue<DebtInventory[]>) => {
      this.listInventory = res.data;
      let list=this.listInventory.filter(x=>x.isComplete).sort((a,b)=>b.id-a.id);
      if(list && list.length>0){
        this.entity.beginPeriod=list[0].amount;
      }
    });
  }

  selectedDate(event) {
    this._ngay = moment(event.start).format('DD/MM/YYYY');
  }

  closedDate(event) {
    if (this._ngay == null)
      this._ngay = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  add() {
    this.entity = { status: true, branchId: this._branchId }
    this._accept = false;
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.debtInventoryService.getDetail(id).subscribe((res: ResponseValue<DebtInventory>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;

        if (this.entity.refDate) {
          this.dateTimeOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.refDate, FormatContstants.DATEEN).format(FormatContstants.DATEEN))
          );
          this._ngay = moment(this.entity.refDate, FormatContstants.DATEEN).format(
            FormatContstants.DATEVN
          );
        }
        this.flagXem = flag;
        this.flagSave = false;
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
      if (this._ngay)
        this.entity.refDate = moment(this._ngay, FormatContstants.DATEVN).format(
          FormatContstants.CLIENTDATE
        );
      if (this.entity.id == undefined) {
        if(this.listInventory.filter(x=>!x.isComplete)?.length>0){
          alert('Có biên bản của nhân viên chưa được xác nhận!');
        }
        else{
          this.debtInventoryService.add(this.entity).subscribe((res: ResponseValue<any>) => {
            if (res.code == '200' || res.code == '201') {
              // this.modalAddEdit.hide();
              // form.resetForm();
              this.entity.id = res.data;
              this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
              this.SaveSuccess.emit(res.data);
            }
            else {
              this._notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG);
              this.flagSave = false;
            }
          }, () => {
            this.flagSave = false;
          });
        }
      }
      else {
        this.debtInventoryService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            // this.modalAddEdit.hide();
            // form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
    }
  }


  showAttachFile() {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: 'INVENTORY',
      functionName: 'INVENTORY',
      refNo: this.entity.id.toString()
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item, false);
    }, 50);
  }

  saveSuccessFile(event: any): void {
    console.log(event);
  }

  closeModalFile() {
    this.viewAttachFiles = false;
  }

  OnHidden() {
    this.CloseModal.emit();
  }

  viewSelect=false;
  showModalSelect(loai:number) {
    this.viewSelect = true;
    let item:any={};
    item.employeeId=this.entity.employeeId;
    item.id=this.entity.id;
    item.isComplete=this.entity.isComplete;
    item.listAdvanceId=this.entity.listAdvanceId;
    item.listPaymentId=this.entity.listPaymentId;
    item.loai=loai;
    this.loai=loai;
    item.toDate= moment(this._ngay,'DD/MM/YYYY').format(
      FormatContstants.CLIENTDATE
    );

    setTimeout(() => {
      this.modalSelect.show(item);
    }, 50);
  }

  saveModalSelect(event: EmployeeDebit[]): void {
    if(this.loai!=undefined){
      let list=event;
      let listId:string[]=[];
      let soTien:number=0;
        if(this.loai==0){
          list?.forEach(x=>{
            soTien+=x.debit;
            listId.push(x.id.toString());
          });
          this.entity.advanceAmount=soTien;
          this.entity.listAdvanceId=listId.join(',');
        }
        else{
          list?.forEach(x=>{
            soTien+=x.credit;
            listId.push(x.id.toString());
          });
          this.entity.paymentAmount=soTien;
          this.entity.listPaymentId=listId.join(',');
        }
        let duCuoi=0;
        if(this.entity.beginPeriod!=undefined)
        duCuoi +=this.entity.beginPeriod??0;

        if(this.entity.advanceAmount!=undefined)
        duCuoi +=this.entity.advanceAmount??0;

        if(this.entity.paymentAmount!=undefined)
        duCuoi -=this.entity.paymentAmount??0;

        this.entity.amount=duCuoi;
    }
  }

  closeModalSelect() {
    this.viewSelect = false;
  }

}
