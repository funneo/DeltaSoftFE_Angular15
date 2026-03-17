import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalTrainingDocumentComponent } from '@app/shared/components/hrm/modal-training-document/modal-training-document.component';
import { ModalViewScopeComponent } from '@app/shared/components/hrm/modal-view-scope/modal-view-scope.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, OtherCategories, Profile, ResponseValue } from '@app/shared/models';
import { TrainingDocuments } from '@app/shared/models/hrm/training-document-managment/training-documents';
import { NotificationService, AuthService, BranchService, UtilityService, OtherCategoriesService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import { TrainingDocumentManagmentService } from '@app/shared/services/hrm/training-document-managment/training-document-managment.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-list-training-documents',
  templateUrl: './list-training-documents.component.html',
  styleUrls: ['./list-training-documents.component.css']
})
export class ListTrainingDocumentsComponent implements OnInit {
  pageIndex = 1;
  pageSize = 50;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = "";
  listData: TrainingDocuments[] = [];
  listFilter: TrainingDocuments[] = [];
  
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
  @ViewChild(ModalTrainingDocumentComponent, { static: false })
  modalAddEdit: ModalTrainingDocumentComponent;
   constructor(
    private _sevice: TrainingDocumentManagmentService,
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

  showModal(item: TrainingDocuments) {
    this.viewModal = true;
    let permission = item.createdBy == this.userLoged.id;
    setTimeout(() => {
     this.modalAddEdit.edit(item.id, true, permission);
    }, 50);
  }
  loadData(): void {
    // .set('usergroupid')
    const params = new HttpParams()
          .set("keyword", this.keyword);
    this.busy = this._sevice
      .getProcessing(params)
      .subscribe((res: ResponseValue<TrainingDocuments[]>) => {
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

  viewScoreModal=false;
 @ViewChild(ModalViewScopeComponent, { static: false })  modalViewScore: ModalViewScopeComponent;
  openScoreDetails(item: TrainingDocuments, steps: number): void {
    this.viewScoreModal = true;
    setTimeout(() => {
      this.modalViewScore.view(item.id, steps);
    }, 50);
  }
  

  clickRow(item: TrainingDocuments): void {
    item.checked = !item.checked;
    this.listData.forEach((value) => {
      if (value != item) value.checked = false;
    });
    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }

  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
  }

  add(level:number): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add(level);
    }, 50);
  }
  edit(flag: boolean): void {
    const index = this.listData.findIndex((x) => x.checked);
    this.viewModal = true;
    let permission =
      this.listData[index].createdBy == this.userLoged.id;
    setTimeout(() => {
      this.modalAddEdit.edit(
        this.listData[index].id,
        flag,
        permission
      );
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listData.filter((x) => x.checked);
    let checks: string[] = [];
    for (let items of listChecks) {
      checks.push(items.id);
    }
    if (listChecks[0].status > 0) return;
    if (listChecks[0].createdBy != this.userLoged.id) return;
    this.notificationService.printConfirmationDialog(
      MessageContstants.CONFIRM_DELETE_MSG,
      () => this.delete(checks[0])
    );
  }

  delete(id: string): void {
    this._sevice.delete(id).subscribe(
      (res: ResponseValue<any>) => {
        if (res.code == "200" || res.code == "201") {
          this.loadData();
        } else {
          this.notificationService.printErrorMessage(
            MessageContstants.DELETE_ERR_MSG + "\n" + res.code
          );
        }
      }
    );
  }

  icheck() {
    let checks = this.listData.filter((x) => x.checked);
    if (checks.length == 1) {
      this.flagDelete = true;
      this.flagEdit = true;
    } else {
      this.flagDelete = false;
      this.flagEdit = false;
    }
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

  closeModalScore(): void {
    this.viewScoreModal = false;
  }


}
