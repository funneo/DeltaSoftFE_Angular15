import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Profile, ResponseValue } from '@app/shared/models';
import { CustomerLocations } from '@app/shared/models/danhmuc/customer-locations.model';
import { TransitPorts } from '@app/shared/models/danhmuc/transit-ports';
import { GroupPorts } from '@app/shared/models/danhmuc/group-ports.model';
import { Ports } from '@app/shared/models/danhmuc/ports.model';
import { TollStation } from '@app/shared/models/toll-station.model';
import { AuthService, NotificationService } from '@app/shared/services';
import { CustomerLocationsService } from '@app/shared/services/danhmuc/customer-locations.service';
import { PortsService } from '@app/shared/services/danhmuc/ports.service';
import { TollStationService } from '@app/shared/services/toll-station.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { TransitPortsService } from '@app/shared/services/danhmuc/transit-ports.service';

@Component({
  selector: 'modal-transit-ports',
  templateUrl: './modal-transit-ports.component.html',
  styleUrls: ['./modal-transit-ports.component.css']
})
export class ModalTransitPortsComponent implements OnInit {

  public entity:TransitPorts;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public listLocation:CustomerLocations[]=[];
  listPorts:Ports[]=[];
  distance1=0;
  distance2=0;
  public listTollStation:TollStation[];
  public busy: Subscription;
  userLoged?:Profile;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService, private _authService: AuthService
    ,private service:TransitPortsService, private portsSevice:PortsService
  ) { }
  hasPermissionApproved = false;
  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.hasPermissionApproved = this._authService.hasPermission('F026_ACCEPT') || this.userLoged .isAdmin;
    // this.loadToolStation();
    this.loadPorts(); 
  }
  loadPorts(): void {
      this.busy = this.portsSevice.getAll().subscribe((res: ResponseValue<Ports[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listPorts = res.data
        }
      });
  }

 

  
  add() {
    this.entity={
      checked:false,status:0,km:0
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: number, flag: boolean) {
    this.service.getDetail(id).subscribe((res: ResponseValue<TransitPorts>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.entity.checked = this.entity.status >0 ;
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
      if(this.entity.km<1){
        this._notificationService.printErrorMessage(MessageContstants.DISTANCE_ERR_MSG);
        return;
      }
      this.entity.status=this.entity.checked?1:0;
      if (this.entity.id == undefined) {
        this.service.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
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
        this.service.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG +res.code);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
    }
  }
  accept(flag: boolean) {
    this.service.accept(this.entity.id, flag).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.modalAddEdit.hide();
        this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
        this.SaveSuccess.emit(res.data);
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code);
      }
    });
  }

  OnHidden() {
    this.CloseModal.emit();
  }

}
