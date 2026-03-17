import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalContractCustomerComponent } from '@app/shared/components/sales-marketing/modal-contract-customer/modal-contract-customer.component';
import { ModalAttachfileComponent } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.component';
import { MessageContstants } from '@app/shared/constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { Customer, Pagination, ContractCustomer, ResponseValue, Branch } from '@app/shared/models';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { AuthService, BranchService, ContractCustomerService, CustomerService, NotificationService, UtilityService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contract-customer',
  templateUrl: './contract-customer.component.html',
  styleUrls: ['./contract-customer.component.css']
})
export class ContractCustomerComponent implements OnInit {

  pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  flagView=false;
  keyword = '';
  listDatas:ContractCustomer[];
  listCustomer:Customer[];
  busy: Subscription;
  viewModal = false;
  _branchId:number;
  _customerId:number;
  _accept: boolean;
  _auth:number;
  _viewAll=2;
  listBranch:Branch[];
  public flagLinkEdit:boolean = false;
  @ViewChild(ModalContractCustomerComponent, { static: false }) modalAddEdit: ModalContractCustomerComponent
   constructor(private notificationService: NotificationService, private contractCustomerService:ContractCustomerService,
    private authService:AuthService,private customerService:CustomerService,private branchService:BranchService) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._accept = this.authService.hasPermission('CONTRACTCUSTOMER_ACCEPT');
    this._auth = Number.parseInt(user.authorisationLevel);
   }

  ngOnInit(): void {
    let list: any[] = UtilityService.getLocalParams(SystemContstants.APPSETTING);
    let i = list?.findIndex(x => x.id == 'CONTRACT');
    if (i != -1) {
      this._viewAll = list[i].value;
    }

    this.loadData();
    this.loadCustomer();
    this.loadChiNhanh();
  }

  loadCustomer() {
    const params = new HttpParams();
    this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      this.listCustomer = res.data;
    });
  }

  changedCustomer(event: Customer) {
    this._customerId = event?.id;
    this.timKiem();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  changedChiNhanh() {
    this.timKiem();
  }

  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('branchId', this._branchId?.toString())
      .set('customerId', this._customerId?.toString());
      this.busy = this.contractCustomerService.getPaging(params).subscribe((res: ResponseValue<Pagination<ContractCustomer>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listDatas = res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }

  clickRow(item: Customer): void {
    item.checked = !item.checked;
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
      this.modalAddEdit.edit(this.listDatas[index].id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listDatas.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.contractCustomerService.delete(listIds).subscribe((res: ResponseValue<any>) => {
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

  isAllChecked() {
    if (this.listDatas)
      return this.listDatas.every(_ => _.checked);
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

  showModal(item: ContractCustomer) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id.toString(), true);
    }, 50);
  }

  finish(item:ContractCustomer,key: string){
    this.notificationService.printConfirmationDialog('Bạn có chắc muốn kết thúc hợp đồng không?', () => this.accept(item,key));
  }

  accept(item:ContractCustomer,key: string){
    if(key=='No'){
      var retVal = prompt("Lý do từ chối", "Lý do từ chối");
      if (retVal) {
        this.contractCustomerService.accept(item.id.toString(),retVal).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.loadData();
          }
          else {
            this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
          }
        }, () => {
          this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
        });
      }
    }
    else{
      this.contractCustomerService.accept(item.id.toString(),key).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.loadData();
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
        }
      }, () => {
        this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
      });
    }
  }



  viewAttachFiles:boolean;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;
  showFiles(job:ContractCustomer){
    this.viewAttachFiles=true;
    let item:Attachfiles={
      frmName:'CONTRACTCUSTOMER',
      functionName:'CONTRACTCUSTOMER',
      refNo: job.id.toString()
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item,false);
    }, 50);
  }

  saveSuccessFile(event: any): void {
    console.log(event);
  }

  closeModalFile(){
    this.viewAttachFiles=false;
  }
}
