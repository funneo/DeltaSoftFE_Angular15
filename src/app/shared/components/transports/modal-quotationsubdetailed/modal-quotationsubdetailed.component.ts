import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { OtherCategories, ResponseValue } from '@app/shared/models';
import { Quotationsubcontractorsdetailed } from '@app/shared/models/transports/quotationsubcontractorsdetailed.model';
import { NotificationService, OtherCategoriesService, UtilityService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-quotationsubdetailed',
  templateUrl: './modal-quotationsubdetailed.component.html',
  styleUrls: ['./modal-quotationsubdetailed.component.css']
})
export class ModalQuotationsubdetailedComponent implements OnInit {
  public entity:Quotationsubcontractorsdetailed;
  public listEntity:Quotationsubcontractorsdetailed[]=[];
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public flagNew:boolean=false;
  public busy: Subscription;
  public branchId?:number;
  public listVihicleType?:OtherCategories[];
  maskNumber = UtilityService.maskNumber;

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalDetailed', { static: false }) modalDetailed: ModalDirective;
  constructor(private _notificationService: NotificationService
  ,private vihicleTypeService:OtherCategoriesService
  ) { }

  ngOnInit(): void {
    this.loadVihicleType();
  }

  loadVihicleType(){
    const params = new HttpParams()
    .set('type','VIHITYPE')
      this.busy = this.vihicleTypeService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listVihicleType = res.data
        }
      });
  }

  add(list:Quotationsubcontractorsdetailed[]) {
    this.listEntity=list;
    this.entity={
      price:0,
      vat:0,
      totalPrice:0,
      checked:false
    };
    this.flagXem = false;
    this.flagSave = false;
    this.flagNew=true;
    this.modalDetailed.show();
  }

  edit(item:Quotationsubcontractorsdetailed) {
    this.entity=item;
    this.flagNew=false;
    this.modalDetailed.show();
  }
  vatChanged(){
    this.entity.totalPrice= this.entity.price + this.entity.vat;
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      if(this.listEntity.findIndex(x=>x.vihicleTypeId==this.entity.vihicleTypeId)>=0){
        this._notificationService.printErrorMessage("Loại phương tiện đã tồn tại, kiểm tra lại!");
      }else{
        this.modalDetailed.hide();
        this.flagSave = true;
        this.SaveSuccess.emit(this.entity);
      }
    }
  }
  vihicleTypeChange(item:OtherCategories){
    this.entity.vihicleTypeName=item?.categoryName;
  }

  OnHidden() {
    this.CloseModal.emit();
  }
}
