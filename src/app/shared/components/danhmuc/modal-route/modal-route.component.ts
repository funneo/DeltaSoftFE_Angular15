import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Locations, Profile, ResponseValue, Route } from '@app/shared/models';
import { RouteTollStation } from '@app/shared/models/route-toll-station.model';
import { TollStation } from '@app/shared/models/toll-station.model';
import { AuthService, BranchService, NotificationService } from '@app/shared/services';
import { LocationService } from '@app/shared/services/location.service';
import { RouteService } from '@app/shared/services/route.service';
import { TollStationService } from '@app/shared/services/toll-station.service';
import { UserAuthService } from '@app/shared/services/user-auth.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-route',
  templateUrl: './modal-route.component.html',
  styleUrls: ['./modal-route.component.css']
})
export class ModalRouteComponent implements OnInit {
  public entity: Route;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public listLocation: Locations[];
  public listTollStation: TollStation[];
  public listBranch: Branch[];
  public busy: Subscription;
  checked?: boolean = false;
  approvedPermission = false;
  userLoged: Profile;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService
    , private routeService: RouteService, private locationService: LocationService
    , private branchService: BranchService
    , private tollStationService: TollStationService
    , private _authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.approvedPermission = this._authService.hasPermission('ROUTES_ACCEPT') || this.userLoged.isAdmin;
    this.loadBranch();
    this.loadLocation();
    this.loadToolStation();
  }
  loadToolStation() {
    const params = new HttpParams()
    this.busy = this.tollStationService.getAll().subscribe((res: ResponseValue<TollStation[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listTollStation = res.data
      }
    });
  }

  loadBranch() {
    this.busy = this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listBranch = res.data
      }
    });
  }
  loadLocation(): void {
    const params = new HttpParams()
    this.busy = this.locationService.getAll().subscribe((res: ResponseValue<Locations[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listLocation = res.data
      }
    });
  }

  add() {
    this.entity = {
      checked: false, listRouteTollStation: [], status: 0
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.routeService.getDetail(Number.parseInt(id)).subscribe((res: ResponseValue<Locations>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.flagXem = flag;
        this.flagSave = false;
        this.modalAddEdit.show();
        console.log(this.entity);
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }
  changeTollStation(event: TollStation, i: number) {
    this.entity.listRouteTollStation[i].tollStationAddress = event?.tollStationAddress;
  }
  new() {
    let item: RouteTollStation = {}
    this.entity.listRouteTollStation.push(item);
  }
  delete(index: number) {
    this.entity.listRouteTollStation.splice(index, 1);
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      if (this.entity.distance < 1) {
        this._notificationService.printErrorMessage(MessageContstants.DISTANCE_ERR_MSG);
        return;
      }
      let copy = Object.assign({}, this.entity);
      if (this.checked) copy.status = 1;
      if (this.entity.id == undefined) {
        this.routeService.add(copy).subscribe((res: ResponseValue<any>) => {
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
        this.routeService.update(copy).subscribe((res: ResponseValue<any>) => {
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

  approved(event: boolean) {
    this.routeService.approved(this.entity.id, event).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.modalAddEdit.hide();
        this._notificationService.printSuccessMessage(event ? MessageContstants.APPROVED_SUCCESS : MessageContstants.DENY_SUCCESS
        );
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

  OnHidden() {
    this.CloseModal.emit();
  }
}
