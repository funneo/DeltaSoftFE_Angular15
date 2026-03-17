import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Employee, Profile, ResponseValue, Vihicle } from '@app/shared/models';
import { VehicleInspectionPermission } from '@app/shared/models/garage/vehicle-inspection-permission.model';
import { AuthService, EmployeeService, NotificationService } from '@app/shared/services';
import { VehicleInspectionPermissionService } from '@app/shared/services/garage/vehicle-inspection-permission.service';
import { VihicleService } from '@app/shared/services/vihicle.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-vehicle-inspection-permission',
  templateUrl: './modal-vehicle-inspection-permission.component.html',
  styleUrls: ['./modal-vehicle-inspection-permission.component.css']
})
export class ModalVehicleInspectionPermissionComponent implements OnInit {

  public entity:VehicleInspectionPermission;
  public listVehicle:Vihicle[]=[];
  public listDetailed:VehicleInspectionPermission[]=[];
  public tmpList:VehicleInspectionPermission[]=[];
  public listEmployee:Employee[]=[];
  public userLoged:Profile;
  public busy: Subscription;
  public branchId?:number;
  public viewModal?:boolean=false;
  hasPermissionApproved=false;
  acceptPermission=false;
  adminPermission=false;
  permission:Permissions;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  
  constructor(private _notificationService: NotificationService
    ,private service:VehicleInspectionPermissionService,private userService:EmployeeService
    ,private _authService:AuthService,private vehicleService:VihicleService
  ) { }

  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    this.adminPermission=this.userLoged.isAdmin??false;
    this.loadVehicle();
    this.loadEmployee();
  }
  loadEmployee(){
    const params = new HttpParams()
    .set('branchid',this.userLoged.branchId.toString());
        this.busy = this.userService.getbyUser(params).subscribe((res: ResponseValue<Employee[]>) => {
          if (res.code == '200' || res.code == '201') {
            this.listEmployee = res.data
          }
        });
  }
  loadVehicle(){
    const params = new HttpParams()
    .set('branchid',this.userLoged.branchId.toString())
    .set('vihicletype','0')
        this.busy = this.vehicleService.getAll(params).subscribe((res: ResponseValue<Vihicle[]>) => {
          if (res.code == '200' || res.code == '201') {
            this.listVehicle = res.data
          }
        });
    }

  add() {
    this.entity={
      
    };
    this.modalAddEdit.show();
  }
  addDetailed(){
    let item:Vihicle={

    }
    this.listDetailed.push(item);
  }
  changedValue(event: VehicleInspectionPermission,i:number) {
    let isOk=true;
    this.tmpList.forEach(it=>{
      if(it.vehicleId==event?.vehicleId){
        this._notificationService.printAlert("Thông báo","Đã tồn tại xe trong danh sách, kiểm tra lại!");
        this.listDetailed[i].vehicleId=null;
        isOk=false;
        return;
      }
    })
    if(isOk)this.tmpList.push(event);      
  }

  delete(item:Vihicle){
    let index = this.listDetailed.indexOf(item);
    if (index !== -1) {
      this.listDetailed.splice(index, 1);
    }
  }

  
  saveChange(form: NgForm) {
    if (form.valid) {
      this.listDetailed.forEach(it=>{
        if(it.vehicleId>0){
          let item:VehicleInspectionPermission={
            vehicleId:it.vehicleId,
            userId:this.entity.userId
          }
          this.service.add(item).subscribe((res: ResponseValue<any>) => {
            if (res.code == '200' || res.code == '201') {
              if(this.listDetailed[this.listDetailed.length-1]==it){
                this.modalAddEdit.hide();
                form.resetForm();
                this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
                this.SaveSuccess.emit(true);
              }
            }
            else {
              this._notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG + res.code);
              }
          });
        }
      })
    }
  }

  closeModal(): void {
    this.viewModal = false;
  }

  OnHidden() {
    this.CloseModal.emit();
  }

}
