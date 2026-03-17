import { Employee } from './../../../models/employee.model';
import { EmployeeService } from '@app/shared/services/employee.service';
import { Dispatchorder } from '@app/shared/models/transports/dispatchorders/dispatchorder';
import { DispatchordersService } from '@app/shared/services/transports/dispatchorders.service';
import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Profile, ResponseValue, User } from '@app/shared/models';
import { AuthService, NotificationService, UserService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { MessageContstants } from '@app/shared/constants';

@Component({
  selector: 'modal-changed-driver',
  templateUrl: './modal-changed-driver.component.html',
  styleUrls: ['./modal-changed-driver.component.css']
})
export class ModalChangedDriverComponent implements OnInit {
  entity:Dispatchorder={};
  public listUser: Employee[];
  userLoged?: Profile;
  public userId?: string;
  notes?:string='';
  driverId?:number;
  fuelDriverId?:number;
  refNo:string='';

  public busy: Subscription;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modaChangedDriver', { static: false }) modaChangedDriver: ModalDirective;
  constructor(private notificationService: NotificationService, private dispatchOrderService: DispatchordersService
    , private _authService: AuthService
    , private userService: EmployeeService
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.loaUser();
  }


  assigning(refNo:string):void {
    this.refNo=refNo;
    this.modaChangedDriver.show();
  }

  loaUser(): void {
    const params = new HttpParams()
      .set('branchId', this.userLoged.branchId.toString())
    this.busy = this.userService.getByBranch(params).subscribe((res:ResponseValue<Employee[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listUser = res.data;
      }
    });

  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.notificationService.printConfirmationDialog(MessageContstants.CHANGE_DRIVER, () => {
        this.entity.driverId=this.driverId;
        this.entity.fuelDriverId=this.fuelDriverId;
        this.entity.refNo=this.refNo;
        this.dispatchOrderService.chagedDriver(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modaChangedDriver.hide();
            form.resetForm();
            this.notificationService.printSuccessMessage(MessageContstants.CHANGED_DRIVER_OK);
            this.SaveSuccess.emit(res.data);
          }
          else {
            this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code);
          }
        }, () => {});
      });
    }
  }
  hide() {
    this.CloseModal.emit();
  }
  OnHidden() {
    this.CloseModal.emit();
  }
}
