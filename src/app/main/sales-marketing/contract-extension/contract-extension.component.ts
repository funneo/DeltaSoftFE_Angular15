import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalContractCustomerComponent } from '@app/shared/components/sales-marketing/modal-contract-customer/modal-contract-customer.component';
import { ModalContractExtensionComponent } from '@app/shared/components/sales-marketing/modal-contract-extension/modal-contract-extension.component';
import { ModalAttachfileComponent } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.component';
import { MessageContstants } from '@app/shared/constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { Profile, ResponseValue } from '@app/shared/models';
import { ContractExtension } from '@app/shared/models/sales-marketing/contract-extension.model';
import { AuthService, NotificationService, UtilityService } from '@app/shared/services';
import { ContractExtensionService } from '@app/shared/services/sales-marketing/contract-extension.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contract-extension',
  templateUrl: './contract-extension.component.html',
  styleUrls: ['./contract-extension.component.css']
})
export class ContractExtensionComponent implements OnInit {
  pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  flagView=false;
  keyword = '';
  listDatas:ContractExtension[];
  busy: Subscription;
  viewModal = false;
  viewContractModal=false;
  viewAttach=false;
  userLoged:Profile
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  public flagLinkEdit:boolean = false;

  @ViewChild(ModalContractExtensionComponent, { static: false }) modalAddEdit: ModalContractExtensionComponent
  @ViewChild(ModalContractCustomerComponent, { static: false }) modalContract: ModalContractCustomerComponent
  @ViewChild(ModalAttachfileComponent,{static:false}) modalAttach:ModalAttachfileComponent

   constructor(private notificationService: NotificationService, private ceService:ContractExtensionService,
    private authService:AuthService,private _utilityService:UtilityService) {
    let user = this.authService.getLoggedInUser();
   }

  ngOnInit(): void {
    this.userLoged=this.authService.getLoggedInUser();
    this.ngayBatDau = new Date(moment().subtract(7,'d').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadData();

  }
  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }

  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('fromDate', tuNgay.toString())
      .set('toDate', denNgay.toString())
      this.busy = this.ceService.getAll(params).subscribe((res: ResponseValue<ContractExtension[]>) => {
        if (res.code == '200' || res.code == '201' || res.code=='204') {
          this.listDatas = res.data;
          console.log(this.listDatas);
          
          this.totalRows = res.data?.length;
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }

  clickRow(item: ContractExtension): void {
    item.checked = !item.checked;
    if(item.checked){
          this.listDatas.forEach(it=>{
      if(it!=item)it.checked=false;
    })
    }

    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }

  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add();
    }, 50);
  }

  edit(flag: boolean): void {
    const index = this.listDatas.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listDatas[index].id, flag);
    }, 50);
  }

  showFiles(item: ContractExtension): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalContract.edit(item.id.toString(), true);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listDatas.filter(x => x.checked);
    if(listChecks[0].status>0 ||listChecks[0].createdBy!=this.userLoged.id)return;
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(listChecks[0].id));
  }

  delete(id: number): void {
    this.ceService.delete(id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listDatas.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }


  icheck() {
    let checks = this.listDatas.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagDelete = true;// checks[0].step<=0;
      this.flagEdit =true;// checks[0].step<=0;
      this.flagView=true;
    }
    // else if (checks.length > 1) {
    //   this.flagDelete = true;
    //   this.flagEdit = false;
    // }
    else {
      this.flagDelete = false;
      this.flagEdit = false;
      this.flagView=false;
    }
  }

  saveSuccess(): void {
    this.loadData();
  }

  closeModal(): void {
    this.viewModal = false;
  }

  closeContractModal(){
    this.viewContractModal=false;
  }
  closeModalFile() {
    this.viewAttach = false;
  }

  showModal(item: ContractExtension) {
  this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id, true);
    }, 50);
  }

  showContract(item: ContractExtension) {
    this.viewContractModal = true;
    setTimeout(() => {
      this.modalContract.edit(item.contractId.toString(), true);
    }, 50);
  }

  saveSuccessFile(event: any): void {
    console.log(event);
  }
}
