import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalVihicleComponent } from '@app/shared/components/danhmuc/modal-vihicle/modal-vihicle.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, OtherCategories, Pagination, Profile, ResponseValue, Vihicle } from '@app/shared/models';
import { AuthService, BranchService, NotificationService, OtherCategoriesService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import { VihicleService } from '@app/shared/services/vihicle.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vihicle',
  templateUrl: './vihicle.component.html',
  styleUrls: ['./vihicle.component.css']
})
export class VihicleComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listVihicle:Vihicle[]=[];
  listDueSoon:Vihicle[]=[];
  listTypeVehicle:OtherCategories[]=[]
  listBranch:Branch[];
  userLoged:Profile;
  branchId?:number;
  busy: Subscription;
  adminPermission?:boolean;
  viewModal = false;
  vehitypeId?:number;
  @ViewChild(ModalVihicleComponent, { static: false }) modalAddEdit: ModalVihicleComponent

  constructor(
     private notificationService: NotificationService
    ,private vihicleService:VihicleService
    ,private branchService:BranchService
    ,private _authService: AuthService, private _export:ExportService,private _otherService: OtherCategoriesService
  ) { }

  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    this.branchId=Number.parseInt(this.userLoged.branchId);
    this.adminPermission=this.userLoged.roles.indexOf('Admin')>-1;
    this.loadBranch();
    this.loadData();
    this.loadDueSoon();
    this.loadVihicleType();
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

  changedType(event:OtherCategories){
    this.vehitypeId=event?.id;
    this.loadData();
  }
  exportExcel(){
    const params = new HttpParams()
    .set('pageIndex', this.pageIndex.toString())
    .set('pageSize', '9999')
    .set('keyword', this.keyword)
    .set('branchid', this.branchId.toString())
    this.busy = this.vihicleService.getPaging(params).subscribe((res: ResponseValue<Pagination<Vihicle>>) => {
        if (res.code == '200' || res.code == '201') {
          let listData = res.data?.items;
          this._export.exportExcel(listData,'danh-muc-phuong-tien')
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }

  loadData(): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword)
      .set('branchid', this.branchId?.toString())
      this.busy = this.vihicleService.getPaging(params).subscribe((res: ResponseValue<Pagination<Vihicle>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listVihicle = res.data?.items
          this.totalRows = res.data?.totalRows;
        }
        else {
          if(res.code == '204')
          {
            this.listVihicle=[];
            this.totalRows = 0;
          }
          else
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }
  loadDueSoon(): void {
    const params = new HttpParams()
      .set('branchid', this.branchId.toString())
      this.busy = this.vihicleService.getDueSoon(params).subscribe((res: ResponseValue<Vihicle[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listDueSoon = res.data
        }
        else {
          if(res.code == '204')
          {
            this.listDueSoon=[];
          }
          else
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }
  loadVihicleType(){
    const params = new HttpParams()
    .set('type','VIHITYPE')
      this.busy = this._otherService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listTypeVehicle = res.data
        }
      });
  }

  clickRow(item: Vihicle): void {
    item.checked = !item.checked;
    this.listVihicle.forEach(it=>{
      if(it!=item)it.checked=false;
    })
    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }


  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add();
    }, 50);
  }

  edit(flag: boolean): void {
    const index = this.listVihicle.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listVihicle[index].id, flag);
    }, 50);
  }
  showModal(item:Vihicle){
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(item.id, true);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listVihicle.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks[0]));
  }

  delete(id: number): void {
    this.vihicleService.delete(id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listVihicle.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listVihicle)
      return this.listVihicle.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listVihicle.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagDelete = true;
      this.flagEdit = true;
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

}
