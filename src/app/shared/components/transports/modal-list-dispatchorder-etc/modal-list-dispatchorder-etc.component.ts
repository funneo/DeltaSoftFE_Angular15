import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { ResponseValue } from '@app/shared/models';
import { Dispatchorder } from '@app/shared/models/transports/dispatchorders/dispatchorder';
import { NotificationService } from '@app/shared/services';
import { DispatchordersService } from '@app/shared/services/transports/dispatchorders.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ModalDispatchorderComponent } from '../modal-dispatchorder/modal-dispatchorder.component';

@Component({
  selector: 'modal-list-dispatchorder-etc',
  templateUrl: './modal-list-dispatchorder-etc.component.html',
  styleUrls: ['./modal-list-dispatchorder-etc.component.css']
})
export class ModalListDispatchorderEtcComponent implements OnInit {

  public busy: Subscription;
  public listDispatchorder: Dispatchorder[] = [];
  listFilter:Dispatchorder[]=[];
  isSelected = false;
  viewModal?: boolean = false;
  branchId?:number;
  refNoSearch?:string;
  driverNameSearch?:string;
  loaiSearch?:string;
  bksSearch?:string;
  contSearch?:string;
  routeSearch?:string;
  sumSearch?:string;

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalListDispatchOrder', { static: false }) modalListDispatchOrder: ModalDirective;
  @ViewChild(ModalDispatchorderComponent, { static: false }) modalDispatchOrderAddEdit: ModalDispatchorderComponent

  constructor(
    private dispatchOrderService: DispatchordersService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {

  }

  viewDispatchOrder(refNo: string) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalDispatchOrderAddEdit.edit(refNo, true);
    }, 50);
  }
  clickRow(item:Dispatchorder){
    item.checked=!item.checked;
    this.isSelected=false;
    this.listDispatchorder.forEach(it=>{
      if(it.checked){
        this.isSelected=true;
        return;
      }
    })
  }

  filter(){
    this.listFilter = Object.assign([], this.listDispatchorder);
    if(this.refNoSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.refNo.toString().toLowerCase().includes(this.refNoSearch.trim().toLocaleLowerCase());
      });
    if(this.driverNameSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.driverName.toLowerCase().includes(this.driverNameSearch.trim().toLocaleLowerCase());
      });
    if(this.bksSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.vihiclelLicensePlates?.toLowerCase().includes(this.bksSearch.trim().toLocaleLowerCase());
    });
    if(this.loaiSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.vehicleTypeName?.toLowerCase().includes(this.loaiSearch.trim().toLocaleLowerCase());
    });
    if(this.contSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.numberOfCont.toString().toLowerCase().includes(this.contSearch.trim().toLocaleLowerCase());
    });
    if(this.routeSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.fullRoute?.toLowerCase().includes(this.routeSearch.trim().toLocaleLowerCase());
    });
    if(this.sumSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.dispatchSummarize?.toLowerCase().includes(this.sumSearch.trim().toLocaleLowerCase());
    });
  }

  view(list:Dispatchorder[]) {
    this.listDispatchorder=list;
    this.listFilter=list;
    this.modalListDispatchOrder.show();
  }
  select(){
    let rList:Dispatchorder[]=[];
    this.listDispatchorder.forEach(it=>{
      if(it.checked)rList.push(it);
    })
    this.SaveSuccess.emit(rList);
  }

  OnHidden() {
    this.CloseModal.emit();
  }
  closeModal() {
    this.viewModal = false;
  }


}
