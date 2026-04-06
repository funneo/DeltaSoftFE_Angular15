import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Profile, ResponseValue, Route } from '@app/shared/models';
import { CustomerNormalRoutes } from '@app/shared/models/danhmuc/customer-normal-routes.model';

import { AuthService, NotificationService } from '@app/shared/services';
import { CustomerNormalRoutesService } from '@app/shared/services/danhmuc/customer-normal-routes.service';
import { RouteService } from '@app/shared/services/route.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-customer-normal-routes',
  templateUrl: './customer-normal-routes.component.html',
  styleUrls: ['./customer-normal-routes.component.css']
})
export class ModalCustomerNormalRoutesComponent implements OnInit {
  public entity:CustomerNormalRoutes;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  listRoute:Route[]=[];
  public busy: Subscription;
  userLoged:Profile;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService
    ,private service:CustomerNormalRoutesService, private routeService:RouteService, private _authService:AuthService
  ) {
    this.userLoged = this._authService.getLoggedInUser();
   }

  ngOnInit(): void {
    this.loadRoutes();
    
  }

  loadRoutes(): void {
      const params = new HttpParams()
        .set('branchid',this.userLoged.branchId.toString())
        this.busy = this.routeService.getAll(params).subscribe((res: ResponseValue<Route[]>) => {
          if (res.code == '200' || res.code == '201') {
            this.listRoute = res.data
          }
          else {
              this.listRoute=[]
          }
        });
  
  }
  changeRoute(event:Route){
    this.entity.routeName=event?.routeName;
    this.entity.distance=event?.distance;
  }

  add(customerId:number) {
    this.entity={
      customerId:customerId
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }
  
  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
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
    }
  }

  OnHidden() {
    this.CloseModal.emit();
  }
}
