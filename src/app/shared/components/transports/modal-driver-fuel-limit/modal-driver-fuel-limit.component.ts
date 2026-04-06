import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Employee, Profile, ResponseValue } from '@app/shared/models';
import { DriverFuelLimit } from '@app/shared/models/transports/driver-fuel-limit.model';
import { AuthService, BranchService, EmployeeService, NotificationService, UtilityService } from '@app/shared/services';
import { DriverFuelLimitService } from '@app/shared/services/transports/driver-fuel-limit.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-driver-fuel-limit',
  templateUrl: './modal-driver-fuel-limit.component.html',
  styleUrls: ['./modal-driver-fuel-limit.component.css']
})
export class ModalDriverFuelLimitComponent implements OnInit {

  public entity: DriverFuelLimit;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public busy: Subscription;
  userLoged:Profile;
  listBranch: Branch[];
  listEmployee: Employee[];
  _branchId: number;
  _employeeId?:number;
  maskNumber = UtilityService.maskNumber;
  dateTimeOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  // _listAll: EmployeeLimit[];
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService, private driverFuelService: DriverFuelLimitService, private _utilityService: UtilityService,
    private branchService: BranchService, private employeeService: EmployeeService, private authService: AuthService) {

  }

  ngOnInit(): void {
    this.userLoged=this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(this.userLoged.branchId);
    this.loadChiNhanh();
    this.loadNhanVien();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  loadNhanVien() {
    let params = new HttpParams()
      .set('branchId', this._branchId?.toString());
    this.employeeService.getByBranch(params).subscribe((res: ResponseValue<Employee[]>) => {
      this.listEmployee = res.data;
    });
  }


  add(item: any=null) {
    this._branchId=item?.branchId?? this._branchId;
    this.entity = {
      branchId: this._branchId,
      driverId:item?.id,
      status: true,
      fuelLimit:0.0
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: number, flag: boolean) {
    this.driverFuelService.getDetail(id).subscribe((res: ResponseValue<DriverFuelLimit>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.flagXem = flag;
        this.flagSave = false;
        this.loadNhanVien();
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
      this.entity.updatedBy=this.userLoged.id;
      if (this.entity.id == undefined) {
        this.driverFuelService.add(this.entity).subscribe((res: ResponseValue<any>) => {
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
        this.driverFuelService.update(this.entity).subscribe((res: ResponseValue<any>) => {
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
