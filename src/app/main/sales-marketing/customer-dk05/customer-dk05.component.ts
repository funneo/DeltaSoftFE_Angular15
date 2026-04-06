import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalSalesCustomerComponent } from '@app/shared/components/sales-marketing/modal-sales-customer/modal-sales-customer.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Employee, ResponseValue } from '@app/shared/models';
import { SalesCustomer } from '@app/shared/models/sales-marketing/sales-customer.model';
import { AuthService, BranchService, EmployeeService, NotificationService } from '@app/shared/services';
import { SalesCustomerService } from '@app/shared/services/sales-marketing/sales-customer.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-customer-dk05',
  templateUrl: './customer-dk05.component.html',
  styleUrls: ['./customer-dk05.component.css']
})
export class CustomerDk05Component implements OnInit {

  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listCustomer:SalesCustomer[];
  listFilter:SalesCustomer[]=[];
  listBranch:Branch[];
  listEmployees:Employee[];
  busy: Subscription;
  viewModal = false;
  _branchId:number;
  _employeeId:number;
  _accept: boolean;
  _auth:number;

  nameSearch:string='';
  cusSearch:string='';
  codeSearch:string='';
  telSearch:string='';
  addSearch:string='';
  contactSearch:string='';
  contactPosiSearch:string='';
  contactTelSearch:string='';
  noteSearch:string='';

  public flagLinkEdit:boolean = false;
  @ViewChild(ModalSalesCustomerComponent, { static: false }) modalAddEdit: ModalSalesCustomerComponent
  // @ViewChild(ModalCustomerComponent, { static: false }) modalAddEdit: ModalCustomerComponent
  constructor(private notificationService: NotificationService, private customerService:SalesCustomerService,private branchService:BranchService,
    private authService:AuthService,private employeeService:EmployeeService) {
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._employeeId = Number.parseInt(user.employeeId);
    this._accept = this.authService.hasPermission('SC_ACCEPT');
    this._auth = Number.parseInt(user.authorisationLevel);
   }

  ngOnInit(): void {
    this.loadData();
    this.loadEmployee();
    this.loadChiNhanh();
  }

  loadEmployee() {
    const params = new HttpParams();
    this.employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
      this.listEmployees = res.data;
    });
  }

  changedEmployee(event: Employee) {
    this._employeeId = event?.id;
    this.loadData();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  loadData(): void {
    const params = new HttpParams()
      .set('keyword', this.keyword)
      .set('branchId', this._branchId?.toString())
      .set('type', '2');
      this.busy = this.customerService.getAll(params).subscribe((res: ResponseValue<SalesCustomer[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listCustomer = res.data;
          this.filter();
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }
  filter(){
    this.listFilter = Object.assign([], this.listCustomer);
    if(this.nameSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.salesFullName.toString().toLowerCase().includes(this.nameSearch.trim().toLocaleLowerCase());
    });
    if(this.codeSearch?.length>0)
      this.listFilter=this.listFilter.filter((data)=>{
      return data.customerCode.toString().toLowerCase().includes(this.codeSearch.trim().toLocaleLowerCase());
    });
    if(this.cusSearch?.length>0)
      this.listFilter=this.listFilter.filter((data)=>{
      return data.customerName.toString().toLowerCase().includes(this.cusSearch.trim().toLocaleLowerCase());
    });
    if(this.telSearch?.length>0)
      this.listFilter=this.listFilter.filter((data)=>{
      return data.tel.toString().toLowerCase().includes(this.telSearch.trim().toLocaleLowerCase());
    });
    if(this.addSearch?.length>0)
      this.listFilter=this.listFilter.filter((data)=>{
      return data.address.toString().toLowerCase().includes(this.addSearch.trim().toLocaleLowerCase());
    });
    if(this.contactSearch?.length>0)
      this.listFilter=this.listFilter.filter((data)=>{
      return data.contact.toString().toLowerCase().includes(this.contactSearch.trim().toLocaleLowerCase());
    });
    if(this.contactPosiSearch?.length>0)
      this.listFilter=this.listFilter.filter((data)=>{
      return data.contactPosition.toString().toLowerCase().includes(this.contactPosiSearch.trim().toLocaleLowerCase());
    });
    if(this.contactTelSearch?.length>0)
      this.listFilter=this.listFilter.filter((data)=>{
      return data.contactTel.toString().toLowerCase().includes(this.contactTelSearch.trim().toLocaleLowerCase());
    });
    if(this.noteSearch?.length>0)
      this.listFilter=this.listFilter.filter((data)=>{
      return data.notes.toString().toLowerCase().includes(this.noteSearch.trim().toLocaleLowerCase());
    });
    this.totalRows = this.listFilter?.length;
  }

  clickRow(item: SalesCustomer): void {
    item.checked = !item.checked;
    this.icheck();
  }

  timKiem(): void {
    this.loadData();
  }

  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add();
    }, 50);
  }

  edit(flag: boolean): void {
    const index = this.listCustomer.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listCustomer[index].customerId, flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listCustomer.filter(x => x.checked);
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(listChecks[0].customerId));
  }

  delete(id:number): void {
    this.customerService.delete(id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listCustomer.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listCustomer)
      return this.listCustomer.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listCustomer.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagDelete = true;
      this.flagEdit = true;
    }
    else if (checks.length > 1) {
      this.flagDelete = true;
      this.flagEdit = false;
    }
    else {
      this.flagDelete = false;
      this.flagEdit = false;
    }
  }

  saveSuccess(): void {
    this.loadData();
  }

  closeModal(): void {
    this.viewModal = false;
  }

  showModal(item: SalesCustomer) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.customerId, true);
    }, 50);
  }

  accept(item:SalesCustomer){
    this.customerService.accept(item.customerId).subscribe((res: ResponseValue<any>) => {
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

  lock(item:SalesCustomer,lock:boolean){
    this.customerService.lock(item.customerId,lock).subscribe((res: ResponseValue<any>) => {
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
