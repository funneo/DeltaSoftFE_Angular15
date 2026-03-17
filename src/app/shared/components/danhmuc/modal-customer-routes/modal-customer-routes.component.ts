import { Subscription } from 'rxjs';
import { CustomerLocations } from './../../../models/danhmuc/customer-locations.model';
import { CustomerRoutes } from './../../../models/danhmuc/customer-routes.model';
import { Component, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { CustomerRoutesService } from '@app/shared/services/danhmuc/customer-routes.service';
import { CustomerLocationsService } from '@app/shared/services/danhmuc/customer-locations.service';
import { NotificationService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ResponseValue } from '@app/shared/models';
import { MessageContstants } from '@app/shared/constants';
import { NgForm } from '@angular/forms';
import { RouteTollStation } from '@app/shared/models/route-toll-station.model';
import { TollStation } from '@app/shared/models/toll-station.model';
import { TollStationService } from '@app/shared/services/toll-station.service';
import { CustomerRoutesTollStation } from '@app/shared/models/danhmuc/customer-routes-toll-station.model';
import { PortsService } from '@app/shared/services/danhmuc/ports.service';
import { GroupPorts } from '@app/shared/models/danhmuc/group-ports.model';
import { Ports } from '@app/shared/models/danhmuc/ports.model';

@Component({
  selector: 'modal-customer-routes',
  templateUrl: './modal-customer-routes.component.html',
  styleUrls: ['./modal-customer-routes.component.css']
})
export class ModalCustomerRoutesComponent implements OnInit {

  public entity:CustomerRoutes;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public listLocation:CustomerLocations[]=[];
  listPorts:GroupPorts[]=[];
  distance1=0;
  distance2=0;
  public listTollStation:TollStation[];
  public busy: Subscription;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService
    ,private service:CustomerRoutesService,private locationService:CustomerLocationsService,
    private tollStationService:TollStationService, private portsSevice:PortsService

  ) { }

  ngOnInit(): void {
    // this.loadToolStation();
    this.loadPorts(); 
  }

  loadLocation(id:number): void {
    const params = new HttpParams()
      this.busy = this.locationService.getAll(id,true).subscribe((res: ResponseValue<CustomerLocations[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listLocation = res.data
          debugger;
        }
      });
  }
  loadPorts(): void {
      this.busy = this.portsSevice.getAll().subscribe((res: ResponseValue<Ports[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listPorts = res.data
        }
      });
  }

  changeLocation(event: CustomerLocations) {
    this.distance1=event?.distanceToWB;
    this.entity.distance=this.distance1+this.distance2;
    this.entity.distanceThrough=this.distance1+this.distance2;
  }

  changePorts(event: GroupPorts) {
    this.distance2=event?.distanceToWb;
    this.entity.distance=this.distance1+this.distance2;
    this.entity.distanceThrough=this.distance1+this.distance2;
  }

  add(customerId:number) {
    this.entity={
      checked:false,customerId:customerId,status:0,listTollStation:[]
    };
    this.flagXem = false;
    this.flagSave = false;
    this.loadLocation(customerId);
    debugger;
    this.modalAddEdit.show();
  }

  edit(id: number, flag: boolean) {
    this.service.getDetail(id).subscribe((res: ResponseValue<CustomerRoutes>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.flagXem = flag;
        this.flagSave = false;
        this.loadLocation(this.entity.customerId);
        this.modalAddEdit.show();
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }
  loadToolStation(){
    const params = new HttpParams()
      this.busy = this.tollStationService.getAll().subscribe((res: ResponseValue<TollStation[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listTollStation = res.data
        }
      });
  }
  new(){
    let item: CustomerRoutesTollStation={
      customerRoutesId:this.entity.id
    }
    this.entity.listTollStation.push(item);
  }
  delete (index:number){
    this.entity.listTollStation.splice(index,1);
  }
  changeTollStation(event:TollStation,i:number){
    this.entity.listTollStation[i].tollStationAddress=event?.tollStationAddress;
  }
  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      if(this.entity.distance<1){
        this._notificationService.printErrorMessage(MessageContstants.DISTANCE_ERR_MSG);
        return;
      }
      this.entity.status=this.entity.checked?1:0;
      console.log(this.entity);
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

  OnHidden() {
    this.CloseModal.emit();
  }
}
