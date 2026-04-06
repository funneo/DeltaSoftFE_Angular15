import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalLocationComponent } from '@app/shared/components/danhmuc/modal-location/modal-location.component';
import { ModalRouteComponent } from '@app/shared/components/danhmuc/modal-route/modal-route.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Locations, Pagination, Profile, ResponseValue, Route } from '@app/shared/models';
import { AuthService, BranchService, NotificationService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import { LocationService } from '@app/shared/services/location.service';
import { RouteService } from '@app/shared/services/route.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-route',
  templateUrl: './route.component.html',
  styleUrls: ['./route.component.css']
})
export class RouteComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listRoute:Route[];
  filteredData:Route[];
  busy: Subscription;
  viewModal = false;
  idSelected=0;
  public flagLinkEdit:boolean = false;
  adminPermission:boolean=false;
  listBranch:Branch[]=[];
  branchId?:number;
  userLoged:Profile;
  selectedType=0;
  array = [{ "value": 0, "text": "Tất cả" }, { "value": 1, "text": "Khởi tạo" }, { "value": 2, "text": "Chuyển duyệt" }, { "value": 3, "text": "Duyệt" }, { "value": 4, "text": "Từ chối" }];
  filterColumns: { [key: string]: string } = {};
  sortKey: string = "";
  sortOrder: "asc" | "desc" = "asc";
  @ViewChild(ModalRouteComponent, { static: false }) modalAddEdit: ModalRouteComponent
  
  constructor(
     private notificationService: NotificationService
    ,private routeService:RouteService
    ,private _authService:AuthService
    ,private branchService:BranchService, private _export:ExportService
  ) { }

  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
    this.branchId=Number.parseInt(this.userLoged.branchId);
    this.adminPermission=this.userLoged.roles.indexOf('Admin')>-1;
    this.loadData();
    this.loadBranch();
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
      .set('keyword', this.keyword)
      .set('branchid',this.branchId?this.branchId!.toString():'0')
      this.busy = this.routeService.getPaging(params).subscribe((res: ResponseValue<Pagination<Route>>) => {
        if (res.code == '200' || res.code == '201') {
          this.listRoute = res.data?.items
          this.totalRows = res.data?.totalRows;
          this.filterData();
        }
        else {
          if(res.code == '204')
          {
            this.listRoute=[];
            this.totalRows = 0;
          }
          else
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }

  filterData(): void {
    let listFileter=this.listRoute;
    if(this.selectedType>0){
      listFileter = listFileter.filter((data) => {
        return this.selectedType==1? data.status==0: this.selectedType==2? data.status==1:this.selectedType==3? data.status==2:data.status<0;
      });
    }
    this.filteredData = listFileter.filter((item) => {
      return Object.keys(this.filterColumns).every((key) => {
        const filterValue = this.filterColumns[key].toString().toLowerCase();
        const itemValue = String(item[key]).toLowerCase();
        return itemValue.includes(filterValue);
      });
    });
  }

  sortData(key: string): void {
    if (this.sortKey === key) {
      // Đảo chiều sắp xếp nếu cùng một cột được nhấp
      this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
    } else {
      // Sắp xếp theo cột mới
      this.sortOrder = "asc";
    }
    this.sortKey = key;
    this.filteredData.sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      if (aValue > bValue) {
        return this.sortOrder === "asc" ? 1 : -1;
      } else if (aValue < bValue) {
        return this.sortOrder === "asc" ? -1 : 1;
      } else {
        return 0;
      }
    });
  }

  export(): void {
    const params = new HttpParams()
      .set('pageIndex', "1")
      .set('pageSize', "99999")
      .set('branchid',this.branchId?this.branchId!.toString():'0')
      this.busy = this.routeService.getPaging(params).subscribe((res: ResponseValue<Pagination<Route>>) => {
        if (res.code == '200' || res.code == '201') {
          let list  = res.data?.items
          let printList= list.map(({id,branchId, ...item }) => item);
          this._export.exportExcel(printList,'cung-duong');
        }
        else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }
  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
    this.loadData();
  }

  clickRow(item: Locations): void {
    item.checked = !item.checked;
    this.idSelected=item.checked?item.id:0;
    this.listRoute.forEach(it=>{
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
    const index = this.listRoute.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listRoute[index].id.toString(), flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listRoute.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(this.idSelected));
  }

  delete(id: number): void {
    this.routeService.delete(id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

  checkAll(ev) {
    this.listRoute.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listRoute)
      return this.listRoute.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listRoute.filter(x => x.checked);
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
}
