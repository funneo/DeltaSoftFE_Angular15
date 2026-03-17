import { ModalAttachfileComponent } from './../../systems/modal-attachfile/modal-attachfile.component';
import { HttpParams } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Employee, Fee, Profile, ResponseValue } from '@app/shared/models';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { DispatchOrderAdditionalFeeDetailed } from '@app/shared/models/transports/dispatchorders/dispatch-order-additional-fee-detailed.model';
import { DispatchOrderAdditionalFee } from '@app/shared/models/transports/dispatchorders/dispatch-order-additional-fee.model';
import {
  AuthService,
  EmployeeService,
  FeeService,
  NotificationService,
  UtilityService,
} from '@app/shared/services';
import { AdditionalFeeService } from '@app/shared/services/transports/additional-fee.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-dispatch-order-additional-fee',
  templateUrl: './modal-dispatch-order-additional-fee.component.html',
  styleUrls: ['./modal-dispatch-order-additional-fee.component.css'],
})
export class ModalDispatchOrderAdditionalFeeComponent implements OnInit {
  public entity: DispatchOrderAdditionalFee;
  public flagXem: boolean = false;
  public flagNew = true;
  public flagSave: boolean = false;
  public userLoged: Profile;
  public listFee: Fee[];
  public listEmployee: Employee[];
  closing_permission: boolean = false;
  maskNumber = UtilityService.maskNumber;
  public busy: Subscription;
  listUser: Employee[] = [];
  transportConfirmLevel = '0';
  listType = [{ id: 0, value: "Thanh toán cho người ghi nhận dầu trên lệnh" }, { id: 1, value: 'Thanh toán cho người lập phiếu' }, { id: 2, value: "Không thanh toán" }]

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild('modalFeeAddEdit', { static: false })
  modalFeeAddEdit: ModalDirective;

  constructor(
    private notificationService: NotificationService,
    private _authService: AuthService,
    private _utilityService: UtilityService,
    private feeService: FeeService, private cdr: ChangeDetectorRef,
    private entityService: AdditionalFeeService, private userService: EmployeeService
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.transportConfirmLevel = this.userLoged.transportConfirmLevel;
    this.closing_permission = this._authService.hasPermission(
      'DISPATCHORDER_CLOSING'
    );
    this.loadFee();
    this.loaUser();
  }
  onChangeFee(event: any, item: any): void {
    if (event && !event.status) {
      this.notificationService.printAlert("Lỗi nhập liệu", "Mã phí đã bị khóa, không được sử dụng")
      setTimeout(() => {
        item.feeId = null;
      });
      this.cdr.detectChanges();
    } else {
      item.feeId = event?.id;
    }
  }
  loaUser(): void {
    const params = new HttpParams()
      .set('branchId', this.userLoged.branchId.toString())
    this.busy = this.userService.getByBranch(params).subscribe((res: ResponseValue<Employee[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listUser = res.data;
      }
    });

  }

  viewAttachFiles: boolean;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;
  showFiles() {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: 'DP_ADD_FEE',
      functionName: 'DP_ADD_FEE',
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

  loadFee() {
    const params = new HttpParams().set('groupFeeId', 'CP01');
    this.busy = this.feeService
      .getAll(params)
      .subscribe((res: ResponseValue<Fee[]>) => {
        if (res.code == '200' || res.code == '201') {
          const filtered = res.data?.filter(_ => _.groupCode == 'CP01' || _.groupCode == 'CP02' || _.groupCode == 'CP03') || [];
          // Create completely new objects to prevent cache mutation
          this.listFee = filtered.map(fee => {
            const newFee: Fee = {
              id: fee.id,
              feeCode: fee.feeCode,
              feeName: fee.feeCode + '-' + fee.feeName,
              feeNameEnglish: fee.feeNameEnglish,
              groupFeeId: fee.groupFeeId,
              paymentFeeGroupId: fee.paymentFeeGroupId,
              revenueFeeGroupId: fee.revenueFeeGroupId,
              debitAccount: fee.debitAccount,
              creditAccount: fee.creditAccount,
              notes: fee.notes,
              status: fee.status,
              checked: fee.checked,
              groupName: fee.groupName,
              groupCode: fee.groupCode,
              paymentGroupName: fee.paymentGroupName,
              revenueGroupName: fee.revenueGroupName,
              isDef: fee.isDef
            };
            return newFee;
          });
        }
      });
  }
  changeCost(item: DispatchOrderAdditionalFeeDetailed) {
    item.totalCost = item.cost! + item.vat;
  }

  feeCodeChanged(item: DispatchOrderAdditionalFeeDetailed, event: Fee) {
    item.feeId = event?.id;
  }

  add(refNo: string) {
    this.entity = {
      dispatchOrderRefNo: refNo,
      status: 0,
      type: 0,
      detaileds: [],
    };
    this.flagNew = true;
    this.flagXem = false;
    this.flagSave = false;
    this.modalFeeAddEdit.show();
  }

  edit(id: number, flag: boolean) {
    this.entityService
      .getDetail(id)
      .subscribe((res: ResponseValue<DispatchOrderAdditionalFee>) => {
        if (res.code == '200' || res.code == '201') {
          this.entity = res.data;
          this.flagXem = flag;
          this.flagSave = false;
          this.flagNew = false;
          this.modalFeeAddEdit.show();
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.SYSTEM_ERROR_MSG
          );
        }
      });
  }

  saveChange(form: NgForm) {
    if (form.valid && !this.flagSave) {
      //Kiểm tra nếu có thông tin phí thuê ngoài và chi phí thì phải có thông tin về mã phí, tiền>0
      if (this.entity.detaileds.length > 0) {
        this.entity.detaileds.forEach((item) => {
          if (!item.feeId || item.feeId < 1) {
            this.notificationService.printErrorMessage(
              MessageContstants.INPUT_DATA_NOT_VALID
            );
            return;
          }
        });
      }
      this.flagSave = true;
      if (this.flagNew) {
        this.entity.branchId = Number.parseInt(this.userLoged.branchId);
        this.entity.createdBy = this.userLoged.id;
        this.entityService.add(this.entity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == '200' || res.code == '201') {
              this.modalFeeAddEdit.hide();
              form.resetForm();
              this.notificationService.printSuccessMessage(
                MessageContstants.CREATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data);
            } else {
              this.notificationService.printErrorMessage(
                MessageContstants.CREATED_ERR_MSG + ':' + res.code + ' - ' + res.message
              );
              this.flagSave = false;
            }
          },
          () => {
            this.flagSave = false;
          }
        );
      } else {
        this.entityService.update(this.entity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == '200' || res.code == '201') {
              this.modalFeeAddEdit.hide();
              form.resetForm();
              this.notificationService.printSuccessMessage(
                MessageContstants.UPDATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data);
            } else {
              this.notificationService.printErrorMessage(
                MessageContstants.UPDATED_ERR_MSG + ':' + res.code + ' - ' + res.message
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

  updateState(type: number) {
    var item = Object.assign({}, this.entity);
    item.status = type;
    if (type == 1) {
      //Nếu là chuyển duyệt thì update xong rồi chuyển duyệt
      this.entityService.update(this.entity).subscribe(
        (res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.busy = this.entityService
              .updateState(item)
              .subscribe((res: ResponseValue<DispatchOrderAdditionalFee[]>) => {
                if (res.code == '200' || res.code == '201') {
                  this.modalFeeAddEdit.hide();
                  this.notificationService.printSuccessMessage(
                    MessageContstants.UPDATED_OK_MSG
                  );
                  this.SaveSuccess.emit(res.data);
                } else {
                  this.notificationService.printErrorMessage(
                    MessageContstants.GETDATA_ERR_MSG + '\n' + ':' + res.code + ' - ' + res.message
                  );
                }
              });
          } else {
            this.notificationService.printErrorMessage(
              MessageContstants.UPDATED_ERR_MSG + ':' + res.code + ' - ' + res.message
            );
            this.flagSave = false;
          }
        },
        () => {
          this.flagSave = false;
        }
      );
    } else {
      this.busy = this.entityService
        .updateState(item)
        .subscribe((res: ResponseValue<DispatchOrderAdditionalFee[]>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalFeeAddEdit.hide();
            this.notificationService.printSuccessMessage(
              MessageContstants.UPDATED_OK_MSG
            );
            this.SaveSuccess.emit(res.data);
          } else {
            this.notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + '\n' + ':' + res.code + ' - ' + res.message
            );
          }
        });
    }
  }
  duyetchotlenh() {
    if (this.entity.detaileds.length < 1) return;
    this.notificationService.printConfirmationYesNo(
      'Duyệt bổ sung chi phí lệnh vận chuyển?',
      () => {
        this.updateState(3);
      },
      () => { }
    );
  }
  duyetchotlenhB(step: number) {
    if (this.entity.detaileds.length < 1) return;
    if (step == 1) {
      this.updateState(2);
    } else {
      this.notificationService.printConfirmationYesNo(
        'Duyệt bổ sung chi phí lệnh vận chuyển?',
        () => {
          this.updateState(3);
        },
        () => { }
      );
    }
  }
  huychotlenh() {
    this.notificationService.printConfirmationYesNo(
      'Từ chối hay không?',
      () => {
        this.updateState(-1);
      },
      () => { }
    );
  }

  newFee() {
    let item: DispatchOrderAdditionalFeeDetailed = {
      cost: 0,
      quantity: 0,
      vat: 0,
      totalCost: 0,
    };
    this.entity.detaileds.push(item);
  }

  deleteFee(item: DispatchOrderAdditionalFeeDetailed) {
    let index = this.entity.detaileds.indexOf(item);
    if (index !== -1) {
      this.entity.detaileds.splice(index, 1);
    }
  }

  OnHidden() {
    this.CloseModal.emit();
  }
}
