import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { Fund, Branch, ResponseValue, AccountList } from '@app/shared/models';
import { NotificationService, FundService, BranchService, AccountListService, AuthService, UtilityService } from '@app/shared/services';
import * as moment from 'moment';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';


@Component({
  selector: 'modal-fund',
  templateUrl: './modal-fund.component.html',
  styleUrls: ['./modal-fund.component.css']
})
export class ModalFundComponent implements OnInit {
  public entity: Fund;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public busy: Subscription;
  listBranch: Branch[];
  listAccountList: AccountList[];
  branchId: number;
  maskNumber = UtilityService.maskNumber;
  dateTimeOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService, private fundService: FundService,private _utilityService: UtilityService,
    private branchService: BranchService, private accountListService: AccountListService, private authService: AuthService) { }

  ngOnInit(): void {
    let user = this.authService.getLoggedInUser();
    this.branchId = Number.parseInt(user.branchId);
    this.loadChiNhanh();
    this.loadQuy();
  }

  selectedDate(event) {
    this.entity.refDate = moment(event.start).format('DD/MM/YYYY');
  }

  closedDate(event) {
    if (this.entity.refDate == null)
      this.entity.refDate = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  loadQuy() {
    const params = new HttpParams()
      .set('branchId', this.branchId?.toString())
    this.accountListService.getAll(params).subscribe((res: ResponseValue<AccountList[]>) => {
      this.listAccountList = res.data;
    });
  }

  add() {
    this.entity = {
      branchId:this.branchId,
      refDate: moment(new Date()).format('DD/MM/YYYY'),
      status: true
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.fundService.getDetail(id).subscribe((res: ResponseValue<Fund>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;

        if (this.entity.refDate) {
          this.dateTimeOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.refDate, 'MM/DD/YYYY').format('MM/DD/YYYY')),
            false
          );
          this.entity.refDate = moment(this.entity.refDate, 'MM/DD/YYYY').format(
           'DD/MM/YYYY'
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
      if (this.entity.refDate)
      this.entity.refDate = moment(this.entity.refDate, 'DD/MM/YYYY').format(
        'YYYYMMDD'
      );
      if (this.entity.id == undefined) {
        this.fundService.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(res);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.fundService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res);
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

  OnHidden() {
    this.CloseModal.emit();
  }

}
