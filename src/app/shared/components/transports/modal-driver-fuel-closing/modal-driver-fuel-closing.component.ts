import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Employee, Profile, ResponseValue } from '@app/shared/models';
import { DriverFuelApproval } from '@app/shared/models/transports/driver-fuel-approval.model';
import { FuelClosingDetailed } from '@app/shared/models/transports/fuel-closing-detailed.model';
import { FuelClosing } from '@app/shared/models/transports/fuel-closing.model';
import { AuthService, EmployeeService, NotificationService } from '@app/shared/services';
import { DriverFuelApprovalService } from '@app/shared/services/transports/driver-fuel-approval.service';
import { FuelClosingService } from '@app/shared/services/transports/fuel-closing.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-driver-fuel-closing',
  templateUrl: './modal-driver-fuel-closing.component.html',
  styleUrls: ['./modal-driver-fuel-closing.component.css']
})
export class ModalDriverFuelClosingComponent implements OnInit {
  public entity:FuelClosing;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public flagNew:boolean=true;

  listEmployee:Employee[]=[];
  listDriverFuelApproval:FuelClosingDetailed[]=[];
  public userLoged:Profile;
  public busy: Subscription;
  public viewModal?:boolean=false;

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;

  constructor(
    private _notificationService: NotificationService
    ,private employeeService:EmployeeService
    ,private driverFuelApprovalService:DriverFuelApprovalService
    ,private _authService:AuthService
    ,private fuelClosingService:FuelClosingService
  ) { }
  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    this.loadEmployee();
  }
  loadEmployee(){
    const params = new HttpParams()
      .set('branchid',this.userLoged.branchId.toString());
        this.busy = this.employeeService.getByBranch(params).subscribe((res: ResponseValue<Employee[]>) => {
          if (res.code == '200' || res.code == '201') {
            this.listEmployee = res.data
            console.log(this.listEmployee);
            
          }
        });
  }

add(branchId:number) {
  this.entity={
    checked:false
  };
  this.flagXem = false;
  this.modalAddEdit.show();
}


edit(id: number) {
  this.fuelClosingService.getDetail(id).subscribe((res: ResponseValue<FuelClosing>) => {
    if (res.code == '200' || res.code == '201') {
      this.entity = res.data;
      this.listDriverFuelApproval=this.entity.listFuelClosingDetailed;
      this.flagXem = true;
      this.modalAddEdit.show();
    }
    else {
      this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
    }
  });
}

saveChange() {
  if (this.listDriverFuelApproval.length==0)return;
    this.flagSave = true;
    this.entity.branchId=Number.parseInt(this.userLoged.branchId);
    this.entity.listFuelClosingDetailed=this.listDriverFuelApproval;
    this.entity.createdBy=this.userLoged.id;
      this.fuelClosingService.add(this.entity).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.modalAddEdit.hide();
          this._notificationService.printSuccessMessage(MessageContstants.FUEL_CLOSING_OK_MSG);
          this.SaveSuccess.emit(true);
        }
        else {
          this._notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG + res.code);
          this.flagSave = false;
        }
      }, () => {
        this.flagSave = false;
      });
}

changedEmployee(event:Employee){
  console.log(event.id);
}
closeModal(): void {
  this.viewModal = false;
}

OnHidden() {
  this.CloseModal.emit();
}


}
