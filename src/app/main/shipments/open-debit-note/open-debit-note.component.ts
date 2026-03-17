import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Shipment, Pagination, Customer, ResponseValue, OpenDebitNote, PermissionCS, Branch } from '@app/shared/models';
import { AuthService, BranchService, CustomerService, NotificationService, OpenDebitNoteService, PermissionCSService, ShipmentService, UtilityService } from '@app/shared/services';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { ModalOpenDebitNoteComponent } from '@app/shared/components/shipments/modal-open-debit-note/modal-open-debit-note.component';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ExportService } from '@app/shared/services/export-excel.service';

@Component({
  selector: 'app-open-debit-note',
  templateUrl: './open-debit-note.component.html',
  styleUrls: ['./open-debit-note.component.css']
})
export class OpenDebitNoteComponent implements OnInit {

  pageIndex = 1;
  pageSize = 99999;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listOpenDebitNote: OpenDebitNote[];
  listFilter: OpenDebitNote[];
  listCustomer:Customer[];
  customerId?: number;
  busy: Subscription;
  viewModal = false;
  viewOpenJob=false;
  listPermissionCS: PermissionCS[];
  listBranch:Branch[];
  _branchId:number;
  _auth=3;


  tenkhSearch:string='';
  jobidSearch:string='';
  ngaySearch:string='';
  nguoiSearch:string='';
  lydoSearch:string='';
  debitNoSearch='';

  public flagLinkEdit:boolean = false;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  listTrangThai: any[]=[{id:-1, text:'Từ chối'},{id: 0, text: 'Chờ duyệt'},{id: 1,text:'Đã duyệt'}];
  listLabelTrangThai: any[]=[{id:-1, text:'label label-danger'},{id: 0, text: 'label label-info'},{id: 1,text:'label label-success'}]
  @ViewChild(ModalOpenDebitNoteComponent, { static: false }) modalAddEdit: ModalOpenDebitNoteComponent
  constructor(private notificationService: NotificationService, private router: Router, private _utilityService: UtilityService, private customerService:CustomerService, public datepipe: DatePipe,
   private openJobService: OpenDebitNoteService,private _export:ExportService, private authService: AuthService, permissionCSService: PermissionCSService,private branchService:BranchService) {
    this.listPermissionCS = permissionCSService.getPermissionCS();
    let user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId);
    this._auth = Number.parseInt(user.authorisationLevel);
   }

  ngOnInit(): void {
    this.ngayBatDau = new Date(moment().hours(0).minutes(0).seconds(0).startOf('month').toString());
    this.ngayKetThuc = new Date(moment().hours(23).minutes(59).seconds(59).endOf('month').toString());
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadCustomer();
    this.loadChiNhanh();
    this.loadData();
    // console.log(this.listPermissionCS);

  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.timKiem();
  }

  loadCustomer() {
    const params = new HttpParams();
    this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      this.listCustomer = res.data;
    });
  }

  changedCustomer(event:Customer){
    this.customerId=event?.id;
    this.timKiem();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  export() {
    let printList= this.listFilter.map(({ id, ...item }) => item);
     this._export.exportExcel(printList, 'openDebitNote');
  }

  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
    let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('customerId',this.customerId?.toString())
      .set('branchId',this._branchId?.toString());
      this.busy = this.openJobService.getPaging(params).subscribe((res: ResponseValue<Pagination<OpenDebitNote>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listOpenDebitNote = res.data?.items;
          this.totalRows = res.data?.totalRows;
           this.listOpenDebitNote.forEach(x=>{
            if(this.listPermissionCS.findIndex(z=>z.customerId==x.customerId && z.isOpenDebit)!=-1){
              x.accept=true;
            }

           });
           this.listOpenDebitNote=[...this.listOpenDebitNote];
           this.listFilter=this.listOpenDebitNote;
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }

  filter(){
    this.listFilter = Object.assign([], this.listOpenDebitNote);

    if(this.tenkhSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
        return data.customerName.toString().toLowerCase().includes(this.tenkhSearch.trim().toLocaleLowerCase());
      });
    if(this.ngaySearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return this.datepipe.transform(data.createdDate, 'dd/MM/yyyy').toString().toLowerCase().includes(this.ngaySearch.trim().toLocaleLowerCase());
      });
    if(this.jobidSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.jobId?.toLowerCase().includes(this.jobidSearch.trim().toLocaleLowerCase());
    });
    if(this.nguoiSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.createdByName?.toLowerCase().includes(this.nguoiSearch.trim().toLocaleLowerCase());
    });
    if(this.lydoSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.notes?.toLowerCase().includes(this.lydoSearch.trim().toLocaleLowerCase());
    });
  }
  editDebit(id: number, flag: boolean): void {
    let p = {
      d1: moment(this.ngayBatDau).format('YYYY-MM-DD'),
      d2: moment(this.ngayKetThuc).format('YYYY-MM-DD'),
      // customerId: this._customerId,
      // branchId:this._branchId,
      // makhSearch:this.makhSearch,
      // loaihinhSearch:this.loaihinhSearch,
      // sodebitSearch:this.sodebitSearch,
      // ngaySearch:this.ngaySearch,
      // ngayDTSearch:this.ngayDTSearch,
      // jobIdSearch:this.jobIdSearch,
      // tokhaiSearch:this.tokhaiSearch,
      // vandonSearch:this.vandonSearch,
      // sobookingSearch:this.sobookingSearch,
      // invoiceSearch:this.invoiceSearch,
      // ghichuSearch:this.ghichuSearch,
      // selectedType:this.selectedType,
      keyword:this.keyword
    }
    //UtilityService.setLocalParams(p,this._functionId);
    if (id == null) {
      const index = this.listFilter.findIndex(x => x.checked);
      if (index >= 0) {
        id = this.listFilter[index].id;
      }
    }
    this.router.navigateByUrl('/main/shipments/debit-notes/detail/' + id.toString() + '/' + flag);
  }

  clickRow(item: Shipment): void {
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

  edit(flag: boolean): void {
    const index = this.listOpenDebitNote.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listOpenDebitNote[index].id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listOpenDebitNote.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.openJobService.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listOpenDebitNote.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listOpenDebitNote)
      return this.listOpenDebitNote.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listOpenDebitNote.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagDelete = checks[0].step<=0? true:false;
      this.flagEdit = checks[0].step<=0? true:false;;
    }
    else if (checks.length > 1) {
      this.flagDelete = checks.findIndex(x=>x.step>0)==-1?true:false;
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

  showModal(item: OpenDebitNote) {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id.toString(), true);
    }, 50);
  }

  accept(item: OpenDebitNote, b: boolean){
    let emtity={
      id: item.id,
      debitNoteId:item.debitNoteId,
      feedback:item.feedback,
      step: b?1:-1
    }
    this.openJobService.accept(emtity).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + '\n' + res.code)
      }
    });
  }
}
