import { CustomerLocations } from '@app/shared/models/danhmuc/customer-locations.model';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Profile, ResponseValue } from '@app/shared/models';
import { AuthService, NotificationService, UtilityService } from '@app/shared/services';
import { CustomerLocationsService } from '@app/shared/services/danhmuc/customer-locations.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ModalMapRoutesComponent } from '../modal-map-routes/modal-map-routes.component';
import { ModalVietmapRoutesComponent } from '../modal-vietmap-routes/modal-vietmap-routes.component';
import { Subscription } from 'rxjs';
import { MessageContstants } from '@app/shared/constants';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'modal-customer-locations',
  templateUrl: './modal-customer-locations.component.html',
  styleUrls: ['./modal-customer-locations.component.css']
})
export class ModalCustomerLocationsComponent implements OnInit {
  public entity:CustomerLocations;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public provinceCode?:string;
  public busy: Subscription;
  public userLoged?:Profile;
  mask0=UtilityService.mask0;
  _accept=false;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  @ViewChild('modalRoutes', { static: false }) modalRoutes: ModalMapRoutesComponent;
  @ViewChild('modalVietmapRoutes', { static: false }) modalVietmapRoutes: ModalVietmapRoutesComponent;



  constructor(private _notificationService: NotificationService,private service:CustomerLocationsService,private _authService: AuthService,
  ) { }

  ngOnInit(): void {
   this.userLoged= this._authService.getLoggedInUser();
   this._accept=this._authService.hasPermission('CUSTOMER_ACCEPT')|| this.userLoged.isAdmin; 
  }

  
  add(customerId:number) {
    this.entity={
      checked:false,
      customerId:customerId,
      status:0
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: number, flag: boolean) {
    this.service.getDetail(id).subscribe((res: ResponseValue<CustomerLocations>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.flagXem = flag;
        this.flagSave = false;
        this.entity.checked=this.entity.status>0;
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
      this.entity.status=this.entity.checked?1:0
      if (this.entity.id == undefined) {
        this.service.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(1);
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
            this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG +res.code +'\n'+res.message);
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

  public googleMapUrl?: string;
  public flagExtracting: boolean = false;

  convertUrlToCoordinates() {
    if (!this.googleMapUrl) {
      this._notificationService.printErrorMessage("Vui lòng nhập đường dẫn Google Maps!");
      return;
    }
    this.flagExtracting = true;
    this.service.convertMapUrl(this.googleMapUrl).subscribe((res: ResponseValue<any>) => {
      this.flagExtracting = false;
      if (res.code == '200' || res.code == '201') {
        if (res.data) {
          this.entity.latitude = res.data.latitude;
          this.entity.longtitude = res.data.longtitude;
          this._notificationService.printSuccessMessage("Quy đổi tọa độ thành công!");
          this.googleMapUrl = "";
        }
      } else {
        this._notificationService.printErrorMessage("Không thể quy đổi tọa độ từ đường dẫn này!");
      }
    }, () => {
      this.flagExtracting = false;
      this._notificationService.printErrorMessage("Có lỗi xảy ra trong quá trình quy đổi!");
    });
  }

  viewRouteGoogle() {
    const rawLat = this.entity.latitude;
    const rawLng = this.entity.longtitude;

    const lat = parseFloat(rawLat?.toString()?.replace(/[^0-9.-]/g, ''));
    const lng = parseFloat(rawLng?.toString()?.replace(/[^0-9.-]/g, ''));

    if (isNaN(lat) || isNaN(lng)) {
      this._notificationService.printErrorMessage(`Tọa độ không hợp lệ để tìm lộ trình!`);
      return;
    }

    const destLat = 20.835485;
    const destLng = 106.726535;

    // Gọi Google Maps Directions API trực tiếp (không qua backend C#)
    this.modalRoutes.show(lat, lng, destLat, destLng);
  }

  viewRouteVietmap() {
    const rawLat = this.entity.latitude;
    const rawLng = this.entity.longtitude;

    const lat = parseFloat(rawLat?.toString()?.replace(/[^0-9.-]/g, ''));
    const lng = parseFloat(rawLng?.toString()?.replace(/[^0-9.-]/g, ''));

    if (isNaN(lat) || isNaN(lng)) {
      this._notificationService.printErrorMessage(`Tọa độ không hợp lệ để tìm lộ trình!`);
      return;
    }

    const destLat = 20.835485;
    const destLng = 106.726535;

    this.modalVietmapRoutes.show(lat, lng, destLat, destLng);
  }

  selectRoute(eventData: any) {
    if (eventData && eventData.km !== undefined) {
      this.entity.distanceToWB = eventData.km;
    }
    this._notificationService.printSuccessMessage(`Đã điền tự động khoảng cách lộ trình qua ${eventData.summary}`);
  }
}
