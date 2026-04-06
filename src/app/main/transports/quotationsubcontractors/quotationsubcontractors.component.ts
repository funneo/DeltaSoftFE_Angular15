import { BranchService } from './../../../shared/services/branch.service';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalQuotationsubcontractorsComponent } from '@app/shared/components/transports/modal-quotationsubcontractors/modal-quotationsubcontractors.component';
import { MessageContstants } from '@app/shared/constants';
import { Pagination, Profile, ResponseValue, Supplier, Branch } from '@app/shared/models';
import { Quotationsubcontractors } from '@app/shared/models/transports/quotationsubcontractors.model';
import { AuthService, NotificationService, UtilityService } from '@app/shared/services';
import { QuotationsubcontractorsService } from '@app/shared/services/quotationsubcontractors.service';
import { SupplierService } from '@app/shared/services/supplier.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-quotationsubcontractors',
  templateUrl: './quotationsubcontractors.component.html',
  styleUrls: ['./quotationsubcontractors.component.css']
})
export class QuotationsubcontractorsComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listQuotation: Quotationsubcontractors[];
  listSupplier:Supplier[];
  listBranch:Branch[]=[];
  userLoged?:Profile;
  supplierId?:number=0;
  branchId?:number;
  busy: Subscription;
  viewModal = false;
  adminPermission=false;
  public flagLinkEdit:boolean = false;
  @ViewChild(ModalQuotationsubcontractorsComponent, { static: false }) modalAddEdit: ModalQuotationsubcontractorsComponent
  constructor(private quotationService: QuotationsubcontractorsService,
    private notificationService: NotificationService, private _utilityService: UtilityService
    ,private _authService:AuthService
    ,private supplierService:SupplierService
    ,private branchService:BranchService
    ) { }


  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    this.branchId=Number.parseInt(this.userLoged.branchId);
    this.adminPermission=this.userLoged.roles.indexOf('Admin')>-1;
    //this.loadCustomer();
    this.loadBranch();
    this.loadData();
    this.loadSupplier();
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  changedBranch(event:Branch){
    this.branchId=event?.id;
    this.loadData();
  }
  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('branchid',this.branchId.toString())
      .set('supplierid',this.supplierId?this.supplierId.toString():'0')
      .set('keyword',this.keyword)
     // .set('usergroupid')
      this.busy = this.quotationService.getPaging(params).subscribe((res: ResponseValue<Pagination<Quotationsubcontractors>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listQuotation = res.data?.items;
          this.totalRows = res.data?.totalRows;
        }
        else {
          if(res.code=='204'){
            this.listQuotation =[];
            this.totalRows = 0;
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
        }
      });
  }

  loadSupplier(): void {
    const params = new HttpParams()
      .set('branchid',this.userLoged.branchId)
      this.busy = this.supplierService.getAll(params).subscribe((res: ResponseValue<Supplier[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listSupplier = res.data;
        }
        else {
          if(res.code=='204'){
            this.listSupplier =[];
            this.totalRows = 0;
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
        }
      });
  }

  clickRow(item: Quotationsubcontractors): void {
    item.checked = !item.checked;
    this.listQuotation.forEach(it=>{
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

  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add();
    }, 50);
  }

  edit(flag:boolean): void {
    const index = this.listQuotation.findIndex(x => x.checked);
    this.viewModal = true;
    let permission=this.listQuotation[index].createdBy==this.userLoged.id;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listQuotation[index].id, flag,permission );
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listQuotation.filter(x => x.checked);
    if(listChecks[0].createdBy!=this.userLoged.id)return;
    if(listChecks[0].status>0)return;
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(listChecks[0].id));
  }

  delete(id: number): void {
    this.quotationService.delete(id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  icheck() {
    let checks = this.listQuotation.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagDelete = true;
      this.flagEdit = true;
    }
    else {
      this.flagDelete = false;
      this.flagEdit = false;
    }
  }

  saveSuccess(event:boolean): void {
   if(event) {
    this.flagEdit = false;
    this.loadData();}
  }

  closeModal(): void {
    this.viewModal = false;
  }

}
