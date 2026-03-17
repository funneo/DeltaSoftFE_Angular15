import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalQuotationCustomerComponent } from '@app/shared/components/sales-marketing/modal-quotation-customer/modal-quotation-customer.component';
import { ModalAttachfileComponent } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.component';
import { MessageContstants } from '@app/shared/constants';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { Branch, Customer, Employee, Pagination, QuotationCustomer, ResponseValue } from '@app/shared/models';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { AuthService,  BranchService,  CustomerService,  EmployeeService, NotificationService, UtilityService } from '@app/shared/services';
import { QuotationCustomerService } from '@app/shared/services/sales-marketing/quotation-customer.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-quotation-dk04',
  templateUrl: './quotation-dk04.component.html',
  styleUrls: ['./quotation-dk04.component.css']
})
export class QuotationDk04Component implements OnInit {
  pageIndex = 1;
  pageSize = SystemContstants.PAGESIZE;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  flagView=false;
  keyword = '';
  listDatas:QuotationCustomer[];
  listFilter:QuotationCustomer[]=[];
  busy: Subscription;
  viewModal = false;
  _branchId:number;
  _customerId:number;
  _accept: boolean;
  _auth:number;
  _type:number=2;
  _viewAll=2;
  listCustomer:Customer[];
  listBranch:Branch[];

  saleSearch:string='';
  tenkhSearch:string='';
  mabgSearch:string='';
  sobgSearch:string='';
  tenbgSearch:string='';
  noidungSearch:string='';
  ngay1Search:string='';
  ngay2Search:string='';
  ghichuSearch:string='';
  public flagLinkEdit:boolean = false;
  @ViewChild(ModalQuotationCustomerComponent, { static: false }) modalAddEdit: ModalQuotationCustomerComponent
   constructor(private notificationService: NotificationService, private quotationCustomerService:QuotationCustomerService,
    private authService:AuthService,private customerService:CustomerService,private branchService:BranchService,public datepipe: DatePipe) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._accept = this.authService.hasPermission('QUOTATIONCUSTOMER_ACCEPT');
    this._auth = Number.parseInt(user.authorisationLevel);
   }

  ngOnInit(): void {
    let list: any[] = UtilityService.getLocalParams(SystemContstants.APPSETTING);
    let i = list?.findIndex(x => x.id == 'CONTRACT');
    if (i != -1) {
      this._viewAll = list[i].value;
    }

    this.loadChiNhanh();
    this.loadCustomer();
    this.loadData();
  }

  loadCustomer() {
    const params = new HttpParams();
    this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      this.listCustomer = res.data;
    });
  }

  changedCustomer(event: Customer) {
    this._customerId = event?.id;
    this.loadData();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  changedChiNhanh() {
    this.loadData();
  }

  changedType(){
    this.loadData();
  }

  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('branchId', this._branchId?.toString())
      .set('type', this._type?.toString())
      .set('customerId', this._customerId?.toString());
      this.busy = this.quotationCustomerService.getPaging(params).subscribe((res: ResponseValue<Pagination<QuotationCustomer>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listDatas = res.data?.items;
          this.filter();
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }

  filter(){
    this.listFilter = Object.assign([], this.listDatas);
    if(this.saleSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.employeeFullName.toString().toLowerCase().includes(this.saleSearch.trim().toLocaleLowerCase());
    });
    if(this.tenkhSearch?.length>0)
      this.listFilter=this.listFilter.filter((data)=>{
      return data.customerName.toString().toLowerCase().includes(this.tenkhSearch.trim().toLocaleLowerCase());
    });
    if(this.mabgSearch?.length>0)
      this.listFilter=this.listFilter.filter((data)=>{
      return data.quotationId.toString().toLowerCase().includes(this.mabgSearch.trim().toLocaleLowerCase());
    });
    if(this.sobgSearch?.length>0)
      this.listFilter=this.listFilter.filter((data)=>{
      return data.quotationNo.toString().toLowerCase().includes(this.sobgSearch.trim().toLocaleLowerCase());
    });
    if(this.tenbgSearch?.length>0)
      this.listFilter=this.listFilter.filter((data)=>{
      return data.quotationName.toString().toLowerCase().includes(this.tenbgSearch.trim().toLocaleLowerCase());
    });
    if(this.noidungSearch?.length>0)
      this.listFilter=this.listFilter.filter((data)=>{
      return data.contents.toString().toLowerCase().includes(this.noidungSearch.trim().toLocaleLowerCase());
    });

    if (this.ngay1Search?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {if(data.sDate)
        return this.datepipe.transform(data.sDate, 'dd/MM/yyyy')
          .toString()
          .toLowerCase()
          .includes(this.ngay1Search.trim().toLocaleLowerCase());
      });
      if (this.ngay2Search?.length > 0)
      this.listFilter = this.listFilter.filter((data) => {if(data.fDate)
        return this.datepipe.transform(data.fDate, 'dd/MM/yyyy')
          .toString()
          .toLowerCase()
          .includes(this.ngay2Search.trim().toLocaleLowerCase());
      });

    if(this.ghichuSearch?.length>0)
      this.listFilter=this.listFilter.filter((data)=>{
      return data.notes.toString().toLowerCase().includes(this.ghichuSearch.trim().toLocaleLowerCase());
    });
    this.totalRows = this.listFilter?.length;
  }

  clickRow(item: Customer): void {
    item.checked = !item.checked;
    this.listDatas.forEach(it=>{
      if(it!=item)it.checked=false;
    })
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

  add(type:number): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add(type);
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
    if(listChecks[0].status)return;
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.quotationCustomerService.delete(listIds).subscribe((res: ResponseValue<any>) => {
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
      this.flagDelete =true;// checks[0].step<=0;
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

  showModal(item: QuotationCustomer) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id.toString(), true);
    }, 50);
  }

  finish(item:QuotationCustomer,key: string){
    this.notificationService.printConfirmationDialog('Bạn có chắc muốn kết thúc hợp đồng không?', () => this.accept(item,key));
  }

  accept(item:QuotationCustomer,key: string){
    if(key=='No'){
      var retVal = prompt("Lý do từ chối", "Lý do từ chối");
      if (retVal) {
        this.quotationCustomerService.accept(item.id.toString(),retVal).subscribe((res: ResponseValue<any>) => {
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
      this.quotationCustomerService.accept(item.id.toString(),key).subscribe((res: ResponseValue<any>) => {
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
  showFiles(job:QuotationCustomer){
    this.viewAttachFiles=true;
    let item:Attachfiles={
      frmName:'QUOTATIONCUSTOMER',
      functionName:'QUOTATIONCUSTOMER',
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
