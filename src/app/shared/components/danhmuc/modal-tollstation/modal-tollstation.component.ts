import { TicketPrices } from './../../../models/danhmuc/ticket-prices.model';
import { OtherCategoriesService } from './../../../services/other-categories.service';
import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { OtherCategories, Profile, ResponseValue } from '@app/shared/models';
import { TollStation } from '@app/shared/models/toll-station.model';
import { Tolllocations } from '@app/shared/models/tolllocations.model';
import { AuthService, NotificationService, UtilityService } from '@app/shared/services';
import { TollLocationsService } from '@app/shared/services/toll-locations.service';
import { TollStationService } from '@app/shared/services/toll-station.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: "modal-tollstation",
  templateUrl: "./modal-tollstation.component.html",
  styleUrls: ["./modal-tollstation.component.css"],
})
export class ModalTollstationComponent implements OnInit {
  public entity: TollStation;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public flagNew?: boolean = true;

  public userLoged: Profile;
  public busy: Subscription;
  listTollLocations: Tolllocations[] = [];
  listVehicleTypeBot:OtherCategories[]=[];
  maskNumber0 = UtilityService.mask0
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalAddEdit", { static: false }) modalAddEdit: ModalDirective;
  constructor(
    private _notificationService: NotificationService,
    private _authService: AuthService,
    private tollStationService: TollStationService,
    private tollLocationService: TollLocationsService, private otherService: OtherCategoriesService
  ) {}

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.loadTollLocations();
    this.loadVihicleTypeBot();
  }
  loadVihicleTypeBot(){
    const params = new HttpParams()
    .set('type','BOT')
      this.busy = this.otherService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listVehicleTypeBot = res.data
        }
      });
  }
  loadTollLocations() {
    this.busy = this.tollLocationService
      .getAll()
      .subscribe((res: ResponseValue<Tolllocations[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listTollLocations = res.data;
        }
      });
  }
  //Thêm mới giá vé trạm thu phí
  new() {
    let item: TicketPrices={
      tollStationId:this.entity.id
    }
    this.entity.listTicketPrices.push(item);
  }
  delete (index:number){
    this.entity.listTicketPrices.splice(index,1);
  }
  add() {
    this.entity = {
      checked: false,listTicketPrices:[]
    };
    this.flagXem = false;
    this.flagSave = false;
    this.flagNew = true;
    this.modalAddEdit.show();
  }

  edit(id: number, flag: boolean) {
    this.tollStationService
      .getDetail(id)
      .subscribe((res: ResponseValue<TollStation>) => {
        if (res.code == "200" || res.code == "201") {
          console.log(res.data);
          this.entity = res.data;
          this.flagXem = flag;
          this.flagSave = false;
          this.flagNew = false;
          this.modalAddEdit.show();
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.SYSTEM_ERROR_MSG
          );
        }
      });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      if (this.flagNew) {
        this.tollStationService.add(this.entity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              this.modalAddEdit.hide();
              form.resetForm();
              this._notificationService.printSuccessMessage(
                MessageContstants.CREATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data);
            } else {
              this._notificationService.printErrorMessage(
                MessageContstants.CREATED_ERR_MSG + res.code
              );
              this.flagSave = false;
            }
          },
          () => {
            this.flagSave = false;
          }
        );
      } else {
        this.tollStationService.update(this.entity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              this.modalAddEdit.hide();
              form.resetForm();
              this._notificationService.printSuccessMessage(
                MessageContstants.UPDATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data);
            } else {
              this._notificationService.printErrorMessage(
                MessageContstants.UPDATED_ERR_MSG + res.code
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

  OnHidden() {
    this.CloseModal.emit();
  }
}
