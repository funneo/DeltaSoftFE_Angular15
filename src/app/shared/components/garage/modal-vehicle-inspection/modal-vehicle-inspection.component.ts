import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { Profile, ResponseValue, Vihicle } from '@app/shared/models';
import { VehicleInspectionDetailed } from '@app/shared/models/garage/vehicle-inspection-detailed.model';
import { VehicleInspection } from '@app/shared/models/garage/vehicle-inspection.model';
import { VehicleInspectionJob } from '@app/shared/models/transports/vehicle-inspection-job.model';
import { AuthService, NotificationService, UtilityService } from '@app/shared/services';
import { VehicleInspectionJobService } from '@app/shared/services/danhmuc/vehicle-inspection-job.service';
import { VehicleInspectionService } from '@app/shared/services/garage/vehicle-inspection.service';
import { VihicleService } from '@app/shared/services/vihicle.service';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-vehicle-inspection',
  templateUrl: './modal-vehicle-inspection.component.html',
  styleUrls: ['./modal-vehicle-inspection.component.css']
})
export class ModalVehicleInspectionComponent implements OnInit {
  public entity: VehicleInspection;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public flagNew: boolean = false;

  public userLoged: Profile;
  public busy: Subscription;
  public viewModal?: boolean = false;
  listJob:VehicleInspectionJob[]=[];
  listVihicle:Vihicle[]=[];
  listType=[{'id':0,'value':'Kiểm tra thường xuyên'},{'id':1,'value':'Kiểm tra định kỳ'}];
  listCheck=[{'id':0,'value':'Tốt'},{'id':1,'value':'Hư hỏng nhẹ'},{'id':2,'value':'Hư hỏng nặng'}];
  listTinhtrang=[{'id':0,'value':'Tốt'},{'id':1,'value':'Không tốt'}];
  type=0;
  hasPermissionApproved = false;
  ngaybatdauOption = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );
  ngayketthucOption = this._utilityService.dateTimeOptionDays(
    new Date(),
    true
  );

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;

  constructor(
    private _notificationService: NotificationService
    , private _service: VehicleInspectionService
    , private _authService: AuthService
    , private _utilityService: UtilityService
    , private _sJob: VehicleInspectionJobService
    ,private vehicleService:VihicleService
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.hasPermissionApproved=this._authService.hasPermission('VI_ACCEPT');
    this.loadVihicle();
  }

  loadVihicle(): void {
    const params = new HttpParams()
      .set('branchid', this.userLoged.branchId.toString())
      .set('vihicletype', "0");
    this.busy = this.vehicleService.getAll(params).subscribe((res: ResponseValue<Vihicle[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listVihicle = res.data
      } else {
        if (res.code == "204") {
          this.listVihicle = [];
        } else {
          this._notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      }
    });
  }

  loadJob() {
    const params = new HttpParams()
      .set('branchid', this.userLoged.branchId)
      .set('type',this.type.toString())
    this.busy = this._sJob.getAll(params).subscribe((res: ResponseValue<VehicleInspectionJob[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listJob = res.data;
        this.listJob.forEach(item=>{
          let value:VehicleInspectionDetailed={
            jobId:item.id,
            jobName:item.jobName,
            checkValue:0,
            notes:''
          }
          this.entity.detaileds.push(value);
        })
      }
    });
  }

  changeLoaihinh(event){
    this.type=event!.id;
    this.loadJob();
  }

  add() {
    this.entity = {
      checked: false, status:0,detaileds:[]
    };
    this.flagXem = false;
    this.flagSave = false;
    this.flagNew=true;
    this.modalAddEdit.show();
  }

  edit(id: number, flag: boolean) {
    this._service.getDetail(id).subscribe((res: ResponseValue<VehicleInspection>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;  
        this.flagNew = false;
        this.flagXem = flag;
        this.flagSave = false;
        if (this.entity.startWorkingTime) {
          this.ngaybatdauOption = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.startWorkingTime, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
          );
          this.entity.startWorkingTime = moment(this.entity.startWorkingTime, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
        }
        if (this.entity.endWorkingTime) {
          this.ngayketthucOption = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.endWorkingTime, FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEEN)), true
          );
          this.entity.endWorkingTime = moment(this.entity.endWorkingTime, FormatContstants.DATETIMEEN).format(
            FormatContstants.DATETIMEVN
          );
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
      this.entity.branchId = Number.parseInt(this.userLoged.branchId);
      this.entity.createdBy = this.userLoged.id;
      if (this.entity.id == undefined) {
        this._service.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
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
      else {
        this._service.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
    }
  }

  accept(type: number) {
    var t=Object.assign({}, this.entity)
    t.acceptBy = this.userLoged.id;
    t.status=type
          this._service.accept(t).subscribe((res: ResponseValue<VehicleInspection>) => {
            if (res.code == '200' || res.code == '201') {
              this.SaveSuccess.emit(true);
              this.modalAddEdit.hide();
            }
            else {
              this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
            }
      }, () => {
        this.flagSave = false;
      });
  }



  selectedNgaybatdau(event) {
    this.entity.startWorkingTime = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }
  closedNgaybatdau(event) {
    if (this.entity.startWorkingTime == null)
      this.entity.startWorkingTime = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');

  }
  selectedNgayketthuc(event) {
    this.entity.endWorkingTime = moment(event.start).format('DD/MM/YYYY HH:mm:ss');
  }
  closedNgayketthuc(event) {
    if (this.entity.endWorkingTime == null)
      this.entity.endWorkingTime = moment(event.oldStartDate).format('DD/MM/YYYY HH:mm:ss');
  }

  closeModal(): void {
    this.viewModal = false;
  }

  OnHidden() {
    this.CloseModal.emit();
  }

}
