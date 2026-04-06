import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalRequestNewEmployeeComponent } from '@app/shared/components/garage/modal-request-new-employee/modal-request-new-employee.component';
import { ModalTrainingDocumentComponent } from '@app/shared/components/hrm/modal-training-document/modal-training-document.component';
import { ModalViewScopeComponent } from '@app/shared/components/hrm/modal-view-scope/modal-view-scope.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Profile, ResponseValue } from '@app/shared/models';
import { RequestNewEmployee } from '@app/shared/models/garage/request-new-employee';
import { NotificationService, AuthService, BranchService, UtilityService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import { RequestNewEmployeeService } from '@app/shared/services/garage/request-new-employee.service';
import { TrainingDocumentManagmentService } from '@app/shared/services/hrm/training-document-managment/training-document-managment.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-request-new-employee',
  templateUrl: './request-new-employee.component.html',
  styleUrls: ['./request-new-employee.component.css']
})
export class RequestNewEmployeeComponent implements OnInit {
pageIndex = 1;
  pageSize = 50;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = "";
  listData: RequestNewEmployee[] = [];
  listFilter: RequestNewEmployee[] = [];
  
  listBranch: Branch[] = [];
  userLoged?: Profile;
  supplierId?: number = 0;
  busy: Subscription;
  viewModal = false;
  adminPermission = false;
  branchId?: number;
  _auth = 5;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(
    this.ngayBatDau,
    this.ngayKetThuc
  );
  @ViewChild(ModalRequestNewEmployeeComponent, { static: false })
  modalAddEdit: ModalRequestNewEmployeeComponent;
   constructor(
    private _sevice: RequestNewEmployeeService,
    private notificationService: NotificationService,
    private _authService: AuthService,
    private branchService: BranchService,private exportService: ExportService,
    private _utilityService: UtilityService,
  ) {}

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.branchId = Number.parseInt(this.userLoged.branchId);
    this._auth = Number.parseInt(this.userLoged.authorisationLevel);
    this.adminPermission = this.userLoged.isAdmin || this._auth < 1;
    this.ngayBatDau = new Date(
      moment().hours(0).minutes(0).seconds(0).startOf("month").toString()
    );
    this.ngayKetThuc = new Date(
      moment().hours(23).minutes(59).seconds(59).endOf("month").toString()
    );
    this.dateOptions = this._utilityService.dateOptionMultis(
      this.ngayBatDau,
      this.ngayKetThuc
    );
    this.loadData();
  }

 
  filterColumns: { [key: string]: string } = {
    documentCode: '',
    title: '',
    level: '',
    customerName: '',
    summary: '',
    createdByName: '',
    assigneeName: '',
    rStatus: ''
  };
  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }
  showModal(item: RequestNewEmployee) {
    this.viewModal = true;
    let permission = item.createdBy == this.userLoged.id;
    setTimeout(() => {
     this.modalAddEdit.edit(item.id,);
    }, 50);
  }
  loadData(): void {
    // .set('usergroupid')
    const params = new HttpParams()
      .set("pageIndex", this.pageIndex.toString())
      .set("pageSize", this.pageSize.toString())
      .set("fromDate", moment(this.ngayBatDau).format("YYYY-MM-DD"))
      .set("toDate", moment(this.ngayKetThuc).format("YYYY-MM-DD"))
      .set("branchId", this.branchId ? this.branchId.toString() : "0")
          .set("keyword", this.keyword);
    this.busy = this._sevice
      .getPaging(params)
      .subscribe((res: ResponseValue<RequestNewEmployee[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listData = res.data;
          this.filterData();
        } else {
          if (res.code == "204") {
            this.listData = [];
            this.totalRows = 0;
          } else {
            this.notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
            );
          }
        }
      });
  }
  get visibleData(): any[] {
    const startIndex = (this.pageIndex - 1) * 50;
    const endIndex = startIndex + 50;
    return this.listFilter?.slice(startIndex, endIndex);
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
  }

  filterData(): void {
  this.listFilter = this.listData?.filter((item) => {
    return Object.keys(this.filterColumns).every((key) => {
      if (!this.filterColumns[key]) return true; // Nếu không nhập gì, bỏ qua filter
      const filterValue = this.filterColumns[key].toString().toLowerCase();
      const itemValue = String(item[key] ?? '').toLowerCase();
      return itemValue.includes(filterValue);
    });
    });
  }

  saveSuccess(): void {
    this.loadData();
  }

  closeModal(): void {
    this.viewModal = false;
  }



}
