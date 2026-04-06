import { ModalAttachfileComponent } from './../../systems/modal-attachfile/modal-attachfile.component';
import { formatNumber } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { ContBets, Branch, Employee, ResponseValue, AdvanceGroup, OtherCategories, Profile, Customer} from '@app/shared/models';
import { NotificationService, ContBetsService, BranchService, AuthService, UtilityService, EmployeeService, AdvanceGroupService, OtherCategoriesService, CustomerService } from '@app/shared/services';
import {ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { Attachfiles } from '@app/shared/models/attachfiles.models';

@Component({
  selector: 'modal-cont-bets',
  templateUrl: './modal-cont-bets.component.html',
  styleUrls: ['./modal-cont-bets.component.css'],
})
export class ModalContBetsComponent implements OnInit {
  entity: ContBets;
  flagXem: boolean = false;
  flagSave: boolean = false;
  flagEditExp: boolean = false;
  flagNew: boolean = false;
  busy: Subscription;
  listBranch: Branch[];
  maskNumber = UtilityService.maskNumber;
  listEmployee: Employee[]= [];
  listCustomer: Customer[]= []; 
  listGroup: AdvanceGroup[];
  groupId: number;
  _listAdvanceGroupId:string[]=[];
  // _viewAll=2;
  _functionId = SystemContstants.BETS;
  _acc: boolean = false;
  _accept: boolean = false;
  _auth: number = 5;
  _employeeId: number;
  _branchId: number;
  feedback: string;
  listHangTaus: OtherCategories[];
  explanationStatus?: boolean = true;
  userLoged?: Profile;
  solution?: number;
  viewAttachFiles=false;
  acceptPermission=false;
  dateTimeOptions = this._utilityService.dateTimeOptionDays(new Date(), false);
  ngaybatdauOption = this._utilityService.dateTimeOptionDays(new Date(), false);
  listType: any[] = [
    { id: 0, name: 'Tiền mặt' },
    { id: 1, name: 'Chuyển khoản' },
  ];
  listArray: any[] = [
    { id: 0, name: 'Chưa hoàn thành và theo dõi tiếp' },
    { id: 1, name: 'Hoàn thành và đợi tiền' },
  ];
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(
    private _notificationService: NotificationService,
    private contBetsService: ContBetsService,
    private branchService: BranchService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private _utilityService: UtilityService,
    private advanceGroupService: AdvanceGroupService,
    private otherCategoriesService: OtherCategoriesService,private customerService:CustomerService
  ) {
    let user = this.authService.getLoggedInUser();
    this._auth = Number.parseInt(user.authorisationLevel);
    this._employeeId = Number.parseInt(user.employeeId);
    this._acc = this.authService.hasPermission('BETS_ACCOUNT');
    this.acceptPermission = this.authService.hasPermission('BETS_ACCEPT');
    this._branchId = Number.parseInt(user.branchId);
    this.userLoged = user;
    this._listAdvanceGroupId = user.listAdvanceGroupId?.split(',');
    let i=this._listAdvanceGroupId.findIndex(it=>it==='2')
    this._accept = this.authService.hasPermission('BETS_ACCEPT')&&(i>-1);
    // let list: any[] =UtilityService.getLocalParams(SystemContstants.APPSETTING);
    // let i=list?.findIndex(x=>x.id==this._functionId);
    // if(i!=-1){
    //   this._viewAll=list[i].value;
    // }
  }

  ngOnInit(): void {
    this.loadChiNhanh();
    this.loadOtherCategory();
    this.loadCustomer();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  
  loadCustomer(): void {
    const params = new HttpParams()
    this.busy = this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listCustomer = res.data
      }
    });
  }


  loadEmployee() {
    const params = new HttpParams().set('branchId', this._branchId?.toString());
    this.employeeService
      .getAll(params)
      .subscribe((res: ResponseValue<Employee[]>) => {
        this.listEmployee = res.data;
      });
  }

  loadAdvanceGroup() {
    this.advanceGroupService
      .getAll()
      .subscribe((res: ResponseValue<AdvanceGroup[]>) => {
        this.listGroup = res.data?.filter((x) => x.type == 1);
      });
  }

  loadOtherCategory() {
    const params = new HttpParams().set('type', 'HANGTAU');
    this.otherCategoriesService
      .getAll(params)
      .subscribe((res: ResponseValue<OtherCategories[]>) => {
        this.listHangTaus = res.data.filter((x) => x.type === 'HANGTAU');
      });
  }

  selectedDate(event) {
    this.entity.refDate = moment(event.start).format('DD/MM/YYYY');
  }

  closedDate(event) {
    if (this.entity.refDate == null)
      this.entity.refDate = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  add(type: number) {
    this.advanceGroupService
      .getAll()
      .subscribe((res: ResponseValue<AdvanceGroup[]>) => {
        this.listGroup = res.data?.filter((x) => x.type == 1);
        if (this.listGroup?.length > 0) this.groupId = this.listGroup[0].id;
        else this.groupId = null;
        this.entity = {
          status: true,
          branchId: this._branchId,
          employeeId: this._employeeId,
          advanceGroupId: this.groupId,
          refDate: moment(new Date()).format('DD/MM/YYYY'),
          type: type,
        };
        this.loadEmployee();
        this._accept = false;
        this.flagXem = false;
        this.flagSave = false;
        this.flagNew=true;
        this.modalAddEdit.show();
      });
  }

  edit(id: string, flag: boolean) {
    this.contBetsService
      .getDetail(id)
      .subscribe((res: ResponseValue<ContBets>) => {
        if (res.code == '200' || res.code == '201') {
          this.entity = res.data;
          this.entity.isAlert = false;
          this._branchId = this.entity.branchId;
          if (this.entity.refDate) {
            this.dateTimeOptions = this._utilityService.dateTimeOptionDays(
              new Date(
                moment(this.entity.refDate, FormatContstants.DATEEN).format(
                  FormatContstants.DATEEN
                )
              )
            );
            this.entity.refDate = moment(
              this.entity.refDate,
              FormatContstants.DATEEN
            ).format(FormatContstants.DATEVN);
          }
          if (!this.entity.isPayment) {
            if (
              moment(this.entity.createdDate).add(9, 'days') <
              moment(new Date())
            ) {
              this.entity.isAlert = true;
            }
          }
          if(this.entity.explanationStatus==2){
            this.solution=0;
            if (this.entity.explanationDate) {
              this.ngaybatdauOption = this._utilityService.dateTimeOptionDays(
                new Date(
                  moment(this.entity.explanationDate, FormatContstants.DATEEN).format(
                    FormatContstants.DATEEN
                  )
                )
              );
              this.entity.explanationDate = moment(
                this.entity.explanationDate,
                FormatContstants.DATEEN
              ).format(FormatContstants.DATEVN);
            }
          }
          if(this.entity.explanationStatus==3)this.solution=1;
          this.flagXem = flag;
          this.flagSave = false;
          this.loadEmployee();
          this.loadAdvanceGroup();
          //Xet quyen duyet
          this._accept =
            this._accept &&
            this.flagXem &&
            this.entity.status &&
            this.entity.acceptStep == 0
              ? true
              : false;
          if ((this.entity.employeeId == this._employeeId || this.userLoged.isAdmin) && this.entity.isAlert)this.flagEditExp = true;
          this.modalAddEdit.show();
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.SYSTEM_ERROR_MSG
          );
        }
      });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      let list = this.listHangTaus.filter(
        (x) => x.id == this.entity.carriersId
      );
      if (list?.length > 0) this.entity.carriers = list[0].categoryName;
      if (this.entity.refDate)
        this.entity.refDate = moment(
          this.entity.refDate,
          FormatContstants.DATEVN
        ).format(FormatContstants.CLIENTDATE);
      if (this.entity.id == undefined) {
        this.contBetsService.add(this.entity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == '200' || res.code == '201') {
              this.modalAddEdit.hide();
              form.resetForm();
              this._notificationService.printSuccessMessage(
                MessageContstants.CREATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data);
            } else {
              this._notificationService.printErrorMessage(
                MessageContstants.CREATED_ERR_MSG
              );
              this.flagSave = false;
            }
          },
          () => {
            this.flagSave = false;
          }
        );
      } else {
        this.contBetsService.update(this.entity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == '200' || res.code == '201') {
              this.modalAddEdit.hide();
              form.resetForm();
              this._notificationService.printSuccessMessage(
                MessageContstants.UPDATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data);
            } else {
              this._notificationService.printErrorMessage(
                MessageContstants.UPDATED_ERR_MSG
              );
              this.flagSave = false;
            }
          },
          () => {
            this.flagSave = false;
          }
        );
      }
    }
  }
  selectedNgaybatdau(event) {
    this.entity.explanationDate = moment(event.start).format(
      'DD/MM/YYYY'
    );
  }
  closedNgaybatdau(event) {
    if (this.entity.explanationDate == null)
      this.entity.explanationDate = moment(event.oldStartDate).format(
        'DD/MM/YYYY'
      );
  }
  updateExplanation() {
    if (this.entity.explanationContents.trim().length < 1) return;
    //this.entity.explanationStatus=1;
    this.contBetsService.updateExp(this.entity).subscribe(
      (res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
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
  changedExpAccept(event: boolean) {
    //Kiểm tra xem loại hình lựa chọn là như thế nào
    if (event) {
      //Nếu duyệt
      if (this.solution==undefined) {
        this._notificationService.printAlert(
          MessageContstants.TITLE_ERROR_INFO,
          'Chưa lựa chọn phương án xử lý!'
        );
        return;
      }
      if (this.solution == 0) {
        if (!this.entity.explanationDate || this.entity.explanationDate.trim().length<1) {
          this._notificationService.printAlert(
            MessageContstants.TITLE_ERROR_INFO,
            'Hạn hoàn cược chưa nhập hoặc ngày không hợp lệ!'
          );
          return;
        }else{
          let item:ContBets={
            id:this.entity.id,
            explanationFeedback:this.entity.explanationFeedback,
            explanationDate:this.entity.explanationDate,
            explanationStatus:2
          }
          this.contBetsService.acceptExp(item).subscribe(
            (res: ResponseValue<any>) => {
              if (res.code == '200' || res.code == '201') {
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
      }else{
        let item:ContBets={
          id:this.entity.id,
          explanationFeedback:this.entity.explanationFeedback,
          explanationStatus:3
        }
        this.contBetsService.acceptExp(item).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == '200' || res.code == '201') {
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
    } else
      if ( !this.entity.explanationFeedback || this.entity.explanationFeedback?.trim().length < 1) {
        this._notificationService.printAlert(
          MessageContstants.TITLE_ERROR_INFO,
          'Chưa nhập phản hồi khi từ chối giải trình, kiểm tra lại!'
        );
        return;
      }
      else {
        let item:ContBets={
          id:this.entity.id,
          explanationFeedback:this.entity.explanationFeedback,
          explanationDate:this.entity.explanationDate,
          explanationStatus:-1
        }
        this.contBetsService.acceptExp(item).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == '200' || res.code == '201') {
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

  attachFile() {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: 'CONTBETS',
      functionName: 'CONTBETS',
      refNo: this.entity.refNo
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item, false);
    }, 50);
  }
  changedAccept(event: boolean) {
    let item: ContBets={
      id :this.entity.id,
      feedback : this.feedback,
      status : event
    };
    this.flagSave = true;
    this.contBetsService.accept(item).subscribe(
      (res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
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
  closeModalAttachFiles(): void {
    this.viewAttachFiles = false;
  }

  OnHidden() {
    this.CloseModal.emit();
  }
}
