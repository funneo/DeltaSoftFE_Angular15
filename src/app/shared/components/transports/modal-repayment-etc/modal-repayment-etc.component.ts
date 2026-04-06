import { ModalListDispatchorderEtcComponent } from './../modal-list-dispatchorder-etc/modal-list-dispatchorder-etc.component';
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { RepaymentEtc } from '@app/shared/models/transports/repayment-etc.model';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ModalDispatchorderComponent } from '../modal-dispatchorder/modal-dispatchorder.component';
import {
  DispatchOrderEtc,
  Profile,
  ResponseValue,
  Vihicle,
} from '@app/shared/models';
import { AuthService, NotificationService } from '@app/shared/services';
import { NgForm } from '@angular/forms';
import { RepaymentEtcService } from '@app/shared/services/transports/repayment-etc.service';

import { RepaymentEtcDetail } from '@app/shared/models/transports/repayment-etc-detail.model';
import { HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { VihicleService } from '@app/shared/services/vihicle.service';
import { MessageContstants } from '@app/shared/constants';
import { Dispatchorder } from '@app/shared/models/transports/dispatchorders/dispatchorder';
import { DispatchordersService } from '@app/shared/services/transports/dispatchorders.service';

@Component({
  selector: 'modal-repayment-etc',
  templateUrl: './modal-repayment-etc.component.html',
  styleUrls: ['./modal-repayment-etc.component.css'],
})
export class ModalRepaymentEtcComponent implements OnInit {
  public entity: RepaymentEtc;
  public flagNew?: boolean;
  public flagXem?: boolean;
  public flagSave?: boolean;
  _status = false;
  public userLoged: Profile;
  closing_permission = false;
  accept_permission: boolean = false;
  viewDispatchOrder: boolean = false;
  viewModal: boolean = false;
  listVihicle: Vihicle[] = [];
  listDispatchOrder: Dispatchorder[];
  selectedList: Dispatchorder[];
  public busy: Subscription;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild('modalRpeAddEdit', { static: false })
  modalRpeAddEdit: ModalDirective;
  @ViewChild(ModalDispatchorderComponent, { static: false })
  modalDispatchOrderAddEdit: ModalDispatchorderComponent;
  @ViewChild(ModalListDispatchorderEtcComponent, { static: false })
  modalList: ModalListDispatchorderEtcComponent;

  constructor(
    private authService: AuthService,
    private service: RepaymentEtcService,
    private dispatchOrderService: DispatchordersService,
    private vehicleService: VihicleService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.userLoged = this.authService.getLoggedInUser();
    this.accept_permission = this.authService.hasPermission('RPE_ACCEPT');
    this.loadVehicle();
  }
  newItem() {
    if (!this.entity.vehicleId || this.entity.vehicleId < 1) return;
    const params = new HttpParams()
      .set('branchid', this.userLoged.branchId.toString())
      .set('vehicleid', this.entity.vehicleId.toString());
    this.busy = this.dispatchOrderService
      .getRpe(params)
      .subscribe((res: ResponseValue<Dispatchorder[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listDispatchOrder = res.data;
          this.viewDispatchOrder = true;
          setTimeout(() => {
            this.modalList.view(this.listDispatchOrder);
          }, 50);
        } else {
          if (res.code == '204') {
            this.listDispatchOrder = [];
          } else {
            this.notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + '\n' + res.code
            );
          }
        }
      });
  }

  loadVehicle(): void {
    const params = new HttpParams()
      .set('branchid', this.userLoged.branchId.toString())
      .set('vihicletype', '0');
    this.busy = this.vehicleService
      .getAll(params)
      .subscribe((res: ResponseValue<Vihicle[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listVihicle = res.data;
        } else {
          if (res.code == '204') {
            this.listVihicle = [];
          } else {
            this.notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + '\n' + res.code
            );
          }
        }
      });
  }

  add() {
    this.flagNew = true;
    this.flagXem = false;
    this.flagSave = false;
    this.entity = {
      status: 0,
      detaileds: [],
    };
    this.modalRpeAddEdit.show();
  }

  edit(id: number, flag: boolean) {
    this.flagXem = flag;
    this.busy = this.service
      .getDetail(id)
      .subscribe((res: ResponseValue<RepaymentEtc>) => {
        if (res.code == '200' || res.code == '201') {
          this.entity = res.data;
          this._status = this.entity.status == 1;
          this.modalRpeAddEdit.show();
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG + '\n' + res.code
          );
        }
      });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      let copy = Object.assign({}, this.entity);
      copy.status = this._status ? 1 : 0;
      if (copy.id == undefined) {
        this.busy = this.service
          .add(copy)
          .subscribe((res: ResponseValue<RepaymentEtc>) => {
            if (res.code == '200' || res.code == '201') {
              form.resetForm();
              this.notificationService.printSuccessMessage(
                MessageContstants.CREATED_OK_MSG
              );
              this.modalRpeAddEdit.hide();
              this.SaveSuccess.emit();
            } else {
              this.notificationService.printErrorMessage(
                MessageContstants.GETDATA_ERR_MSG + '\n' + res.code
              );
            }
          });
      } else {
        this.busy = this.service
          .update(copy)
          .subscribe((res: ResponseValue<RepaymentEtc>) => {
            if (res.code == '200' || res.code == '201') {
              form.resetForm();
              this.notificationService.printSuccessMessage(
                MessageContstants.CREATED_OK_MSG
              );
              this.modalRpeAddEdit.hide();
              this.SaveSuccess.emit();
            } else {
              this.notificationService.printErrorMessage(
                MessageContstants.GETDATA_ERR_MSG + '\n' + res.code
              );
            }
          });
      }
    }
  }

  viewLenh(refNo: string) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalDispatchOrderAddEdit.edit(refNo, true);
    }, 50);
  }

  deleteItem(item: RepaymentEtcDetail) {
    let index = this.entity.detaileds.indexOf(item);
    if (index !== -1) {
      this.entity.detaileds.splice(index, 1);
      this.calculator();
    }
  }

  duyet() {
    this.entity.acceptBy=this.userLoged.id;let copy = Object.assign({}, this.entity);
    copy.status = 2;
    copy.acceptBy=this.userLoged.id;
    this.busy = this.service
    .updateState(copy)
    .subscribe((res: ResponseValue<RepaymentEtc>) => {
      if (res.code == '200' || res.code == '201') {
        this.notificationService.printSuccessMessage(
          MessageContstants.UPDATED_OK_MSG
        );
        this.modalRpeAddEdit.hide();
        this.SaveSuccess.emit();
      } else {
        this.notificationService.printErrorMessage(
          MessageContstants.GETDATA_ERR_MSG + '\n' + res.code
        );
      }
    });
  }
  tuchoi() {
    let copy = Object.assign({}, this.entity);
      copy.status = -1;
      copy.acceptBy=this.userLoged.id;
    this.busy = this.service
          .updateState(copy)
          .subscribe((res: ResponseValue<RepaymentEtc>) => {
            if (res.code == '200' || res.code == '201') {
              this.notificationService.printSuccessMessage(
                MessageContstants.UPDATED_OK_MSG
              );
              this.modalRpeAddEdit.hide();
              this.SaveSuccess.emit();
            } else {
              this.notificationService.printErrorMessage(
                MessageContstants.GETDATA_ERR_MSG + '\n' + res.code
              );
            }
          });
  }
  saveSuccess(event: Dispatchorder[]) {
    //this.entity.detaileds=[];
    this.viewDispatchOrder = false;
    if (event.length < 1) return;
    event.forEach((it) => {
      this.busy = this.dispatchOrderService
        .getEtcFee(it.refNo)
        .subscribe((res: ResponseValue<DispatchOrderEtc>) => {
          if (res.code == '200' || res.code == '201') {
            let value = res.data;
            let item: RepaymentEtcDetail = {
              dispatchOrderRefNo: value.refNo,
              cost: value.cost,
              vat: value.vat,
              totalCost: value.cost + value.vat,
              notes: '',
            };
            let index = this.entity.detaileds.findIndex(
              (x) => x.dispatchOrderRefNo == value.refNo
            );
            if (index < 0) {
              this.entity.detaileds.push(item);
              this.calculator();
            }
          } else {
            if (res.code == '204') {
              this.listVihicle = [];
            } else {
              this.notificationService.printErrorMessage(
                MessageContstants.GETDATA_ERR_MSG + '\n' + res.code
              );
            }
          }
        });
    });
  }
  calculator() {
    this.entity.totalCost = 0;
    this.entity.detaileds.forEach((it) => {
      this.entity.totalCost += it.cost + it.vat;
    });
  }

  closeDispatchOrderModal() {
    this.viewModal = false;
  }
  closeModal() {
    this.viewDispatchOrder = false;
  }

  OnHidden() {
    this.modalRpeAddEdit.hide();
  }
}
