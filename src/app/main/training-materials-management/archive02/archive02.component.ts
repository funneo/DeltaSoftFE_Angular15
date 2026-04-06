import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalTrainingDocumentComponent } from '@app/shared/components/hrm/modal-training-document/modal-training-document.component';
import { ModalViewScopeComponent } from '@app/shared/components/hrm/modal-view-scope/modal-view-scope.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Employee, OtherCategories, Profile, ResponseValue } from '@app/shared/models';
import { TrainingDocuments } from '@app/shared/models/hrm/training-document-managment/training-documents';
import { NotificationService, AuthService, BranchService, UtilityService, EmployeeService, OtherCategoriesService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import { TrainingDocumentManagmentService } from '@app/shared/services/hrm/training-document-managment/training-document-managment.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-archive02',
  templateUrl: './archive02.component.html',
  styleUrls: ['./archive02.component.css']
})
export class Archive02Component implements OnInit {
  pageIndex = 1;
  pageSize = 50;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = "";
  listData: TrainingDocuments[] = [];
  listFilter: TrainingDocuments[] = [];
  listData1: TrainingDocuments[] = [];
  listFilter1: TrainingDocuments[] = [];
  listData2: TrainingDocuments[] = [];
  listFilter2: TrainingDocuments[] = [];
  _branchId?: number = 0;
  _branchId1?: number = 0;
  _branchId2?: number = 0;
  listBranch: Branch[] = [];
  userLoged?: Profile;
  supplierId?: number = 0;
  userId?:string;
  userId1?:string;
  userId2?:string;
  busy: Subscription;
  viewModal = false;
  adminPermission = false;
  _auth = 5;
  listEmployee:Employee[]=[];
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
    private _authService: AuthService,private _otherCategoryService:OtherCategoriesService,
    private branchService: BranchService,private exportService: ExportService,
    private _utilityService: UtilityService,private _employeeService: EmployeeService
  ) {}
  listNghiepvu:OtherCategories[]=[];
  loadEmployee() {
      const params = new HttpParams().set("branchid", "0");
      this._employeeService
        .getAll(params)
        .subscribe((res: ResponseValue<Employee[]>) => {
          if (res.code == "200" || res.code == "201") {
            this.listEmployee = res.data;
          } else {
            if (res.code == "204") {
              this.listEmployee = [];
              this.totalRows = 0;
            } else {
              this.notificationService.printErrorMessage(
                MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
              );
            }
          }
        });
    }
  // --- Paging & totals theo tab ---
  pageIndexArr = [1, 1, 1];
  itemsPerPage = 50;

  // --- Branch theo tab ---
  branchIds: number[] = [0, 0, 0];
  userIds: (string | null)[] = [null, null,null]; // employee theo tab
  employeeIds: number[] = [null, null,null];    
  listNghiepVuFilter:(string | null)[]=[];
  // --- Keyword theo tab ---
  keywordArr: string[] = ["", "", ""];

  // --- Filter-columns theo tab ---
  filterColumnsArr = [
    { documentCode:'', title:'', level:'', customerName:'', summary:'', createdByName:'', assigneeName:'', rStatus:'',groupL1Id:'',groupL2Id:'' },
    { documentCode:'', title:'', level:'', customerName:'', summary:'', createdByName:'', assigneeName:'', rStatus:'',groupL1Id:'',groupL2Id:'' },
    { documentCode:'', title:'', level:'', customerName:'', summary:'', createdByName:'', assigneeName:'', rStatus:'',groupL1Id:'',groupL2Id:'' },
  ];

 // Helper để pagination lấy totalItems
    getFilter(tab: number): TrainingDocuments[] {
      return tab === 0 ? this.listFilter : tab === 1 ? this.listFilter1 : this.listFilter2;
    }
  changedChiNhanh(tab: number): void {
  this.pageIndexArr[tab] = 1;
  this.loadData(tab);
}

  timKiem(tab: number): void {
    this.pageIndexArr[tab] = 1;
    this.loadData(tab);
  }

  pageChanged(event: PageChangedEvent, tab: number): void {
    this.pageIndexArr[tab] = event.page;
  }
  loadBranch(): void {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      if (res.code == "200" || res.code == "201") {
        this.listBranch = res.data;
        if (this._auth > 0) {
          this.listBranch = this.listBranch.filter(
            (x) => x.id == this._branchId
          );
        }
      } else {
        this.notificationService.printErrorMessage(
          MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
        );
      }
    });
  }
  loadTypeNghiepVu(): void {
      let params: HttpParams = new HttpParams();
      params = params.set("type", "TRDOCTYPE");
      this._otherCategoryService
        .getAll(params)
        .subscribe((res: ResponseValue<OtherCategories[]>) => {
          if (res.code == "200" || res.code == "201") {
             this.listNghiepvu = res.data;
          } else {
            if (res.code == "204") {
              this.listNghiepvu = [];
            } else {
              this.notificationService.printErrorMessage(
                MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
              );
            }
          }
        });
    }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    const defBranch = Number.parseInt(this.userLoged.branchId);
    this._branchId = Number.parseInt(this.userLoged.branchId);
    this._auth = Number.parseInt(this.userLoged.authorisationLevel);
    this.adminPermission = this.userLoged.isAdmin || this._auth < 1;
    this.branchIds = [defBranch, defBranch, defBranch];
    this.loadEmployee();
    this.loadData(0);
    this.loadData(1);
    this.loadData(2);
    this.loadBranch();
    this.loadTypeNghiepVu();
  }
    changedEmployee(event: any, tab: number): void {
      this.employeeIds[tab] = event ? event.id : 0;
      this.userIds[tab] = event?.userId;
      this.pageIndexArr[tab] = 1;
      this.loadData(tab);
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
  showModifiedModal(id:string) {
    this.viewModal = true;
    setTimeout(() => {
     this.modalAddEdit.edit(id, true, false);
    }, 50);
  }
  loadData(tab: number): void {
  const params = new HttpParams()
    .set("keyword", this.keywordArr[tab] || "")
    .set("branchId", (this.branchIds[tab] ?? 0).toString())
    .set("departmentId", "0")
    .set("userId", this.userIds[tab] ?? "00000000-0000-0000-0000-000000000000")
    .set("type", tab.toString());

  this.busy = this._sevice.getArchive2(params)
    .subscribe((res: ResponseValue<TrainingDocuments[]>) => {
      if (res.code === "200" || res.code === "201") {
        if (tab === 0) this.listData = res.data;
        else if (tab === 1) this.listData1 = res.data;
        else this.listData2 = res.data;
        this.filterData(tab);
      } else if (res.code === "204") {
        if (tab === 0) { this.listData = []; this.listFilter = []; }
        else if (tab === 1) { this.listData1 = []; this.listFilter1 = []; }
        else { this.listData2 = []; this.listFilter2 = []; }
      } else {
        this.notificationService.printErrorMessage(
          MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
        );
      }
    });
}
get visibleData(): any[] {
  const startIndex = (this.pageIndex - 1) * 50;
  const endIndex = startIndex + 50;
  return this.listFilter?.slice(startIndex, endIndex);
}

get visibleData1(): any[] {
  const startIndex = (this.pageIndex - 1) * 50;
  const endIndex = startIndex + 50;
  return this.listFilter1?.slice(startIndex, endIndex);
}

get visibleData2(): any[] {
  const startIndex = (this.pageIndex - 1) * 50;
  const endIndex = startIndex + 50;
  return this.listFilter2?.slice(startIndex, endIndex);
}


  viewScoreModal=false;
 @ViewChild(ModalViewScopeComponent, { static: false })  modalViewScore: ModalViewScopeComponent;
  openScoreDetails(item: TrainingDocuments, steps: number): void {
    this.viewScoreModal = true;
    setTimeout(() => {
      this.modalViewScore.view(item.id, steps);
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

  
filterData(tab: number): void {
  const filters = this.filterColumnsArr[tab];

  const apply = (arr: TrainingDocuments[]) =>
    (arr ?? []).filter(item =>
      Object.keys(filters).every((key) => {
        const fv = (filters as any)[key];
        if (!fv) return true;
        const filterValue = fv.toString().toLowerCase();
        const itemValue = String((item as any)[key] ?? "").toLowerCase();
        return itemValue.includes(filterValue);
      })
    );

  if (tab === 0) this.listFilter = apply(this.listData);
  else if (tab === 1) this.listFilter1 = apply(this.listData1);
  else this.listFilter2 = apply(this.listData2);
}

  saveSuccess(): void {
    this.loadData(0);
    this.loadData(1);
    this.loadData(2);
  }

  closeModal(): void {
    this.viewModal = false;
  }

  closeModalScore(): void {
    this.viewScoreModal = false;
  }


}
