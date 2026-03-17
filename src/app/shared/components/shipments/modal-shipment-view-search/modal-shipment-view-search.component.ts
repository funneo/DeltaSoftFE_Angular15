import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ResponseValue, Shipment } from '@app/shared/models';
import { ShipmentService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'modal-shipment-view-search',
  templateUrl: './modal-shipment-view-search.component.html',
  styleUrls: ['./modal-shipment-view-search.component.css']
})
export class ModalShipmentViewSearchComponent implements OnInit {

  public busy: Subscription;
  public listShipment:Shipment[]=[];
  public filteredShipment:Shipment[];
  public branchId?:number;
  jobIdSearch:String='';
  hawB_HBLSearch:String='';
  invoiceNoSearch='';
  cdsNumberSearch='';
  bookingNoSearch='';
  noteSearch='';
  loaiDv='';
  customerId?:number=0;
  selectedShipment:Shipment={};
  isSelected=false;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @Input() listItem : Shipment[];

  @ViewChild('modalListShipment', { static: false }) modalListShipment: ModalDirective;
  constructor(
    private shipmentService:ShipmentService
  ) { }

  ngOnInit(): void {

  }
  filter(){
    this.filteredShipment = Object.assign([], this.listShipment);
    if(this.jobIdSearch?.length>0)
    this.filteredShipment=this.filteredShipment.filter((data)=>{
        return data.jobId.toLowerCase().includes(this.jobIdSearch.trim().toLocaleLowerCase());
      });
    if(this.loaiDv?.length>0)
    this.filteredShipment=this.filteredShipment.filter((data)=>{
      return data.shipmentTypeName?.toLowerCase().includes(this.loaiDv.trim().toLocaleLowerCase());
    });
    if(this.hawB_HBLSearch?.length>0)
    this.filteredShipment=this.filteredShipment.filter((data)=>{
      return data.hawB_HBL?.toLowerCase().includes(this.hawB_HBLSearch.trim().toLocaleLowerCase());
    });
    if(this.cdsNumberSearch?.length>0)
    this.filteredShipment=this.filteredShipment.filter((data)=>{
      return data.cdsNumber?.toLowerCase().includes(this.cdsNumberSearch.trim().toLocaleLowerCase());
    });
    if(this.invoiceNoSearch?.length>0)
    this.filteredShipment=this.filteredShipment.filter((data)=>{
      return data.invoiceNo?.toLowerCase().includes(this.invoiceNoSearch.trim().toLocaleLowerCase());
    });
    if(this.bookingNoSearch?.length>0)
    this.filteredShipment=this.filteredShipment.filter((data)=>{
      return data.bookingNo?.toLowerCase().includes(this.bookingNoSearch.trim().toLocaleLowerCase());
    });
    if(this.noteSearch?.length>0)
    this.filteredShipment=this.filteredShipment.filter((data)=>{
      return data.notes?.toLowerCase().includes(this.noteSearch.trim().toLocaleLowerCase());
    });
  }

  loadShipment() {
    const params = new HttpParams()
    .set('customerId', this.customerId.toString())
    .set('isFinish','0')
    .set('branchId',this.branchId.toString())
    this.shipmentService.getAllByCustomer(params).subscribe((res: ResponseValue<Shipment[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listShipment = res.data;
        this.filter();
      } else {
        this.listShipment =[];
        this.filter();
      }
    });
  }
  loadAllShipmentUser() {
    const params = new HttpParams()
    .set('branchId',this.branchId.toString())
    this.shipmentService.getAllByUser(params).subscribe((res: ResponseValue<Shipment[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listShipment = res.data;
        this.filter();
      } else {
        this.listShipment =[];
        this.filter();
      }
    });
  }
  loadAllShipment() {
    const params = new HttpParams()
    .set('isFinish','0')
    .set('branchId',this.branchId.toString())
    this.shipmentService.getAllByCustomer(params).subscribe((res: ResponseValue<Shipment[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listShipment = res.data;
        this.filter();
      } else {
        this.listShipment =[];
        this.filter();
      }
    });
  }

  view(customerId:number,branchId:number,type:number) {
    this.isSelected=false;
    this.branchId=branchId;
    if(type==0)//Lấy theo khách hàng
    {
      this.customerId=customerId;
      this.loadShipment();
    }else //Lấy tất cả job chưa khóa, phân quyền theo CS
    {
      this.loadAllShipmentUser();
    }
    this.modalListShipment.show();
  }

  clickRow(item:Shipment){
    if(item!=null){
      for (var i = 0; i < this.listShipment.length; i++) {
        this.listShipment[i].checked = false;
    }
      item.checked=true
      this.isSelected=true;
      this.selectedShipment=item;
      this.jobIdSearch=item.jobId;
    }
  }

  saveChange() {
    if(this.selectedShipment.jobId.length>0){
      this.modalListShipment.hide();
        this.SaveSuccess.emit(this.selectedShipment);
    }
  }

  OnHidden() {
      this.CloseModal.emit();
  }

  showSearchJob():void{
    if(this.listItem.length>0)
    this.listShipment=this.listItem;
    this.filter();
    this.isSelected=false;
    this.modalListShipment.show();
  }

  onSelect(item: Shipment):void{
    this.modalListShipment.hide();
    this.SaveSuccess.emit(item);
  }
}
