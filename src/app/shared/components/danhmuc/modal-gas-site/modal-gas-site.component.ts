import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Branch, OtherCategories, ResponseValue } from '@app/shared/models';
import { GasSite } from '@app/shared/models/gas-site.model';
import { BranchService, NotificationService, OtherCategoriesService } from '@app/shared/services';
import { GasSiteService } from '@app/shared/services/gas-site.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-gas-site',
  templateUrl: './modal-gas-site.component.html',
  styleUrls: ['./modal-gas-site.component.css']
})
export class ModalGasSiteComponent implements OnInit {
  public entity:GasSite;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public busy: Subscription;

  listGasType:OtherCategories[]=[];
  listBranch:Branch[]=[];

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(
    private branchService:BranchService,
    private otherCategoryService:OtherCategoriesService,
    private gasSiteService:GasSiteService,
    private _notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadChiNhanh();
    this.loadGasType();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  loadGasType(){
    const params = new HttpParams()
    .set('type', 'GAS');
    this.otherCategoryService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      this.listGasType=res.data;
      });
  }
  add() {
    this.entity={
      checked:false,
      capacity:0,startInventory:0
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: number, flag: boolean) {
    this.gasSiteService.getDetail(id).subscribe((res: ResponseValue<GasSite>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
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
      if (this.entity.id == undefined) {
        this.gasSiteService.add(this.entity).subscribe((res: ResponseValue<any>) => {
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
        this.gasSiteService.update(this.entity).subscribe((res: ResponseValue<any>) => {
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
