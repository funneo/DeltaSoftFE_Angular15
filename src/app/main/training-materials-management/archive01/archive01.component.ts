import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalTrainingDocumentComponent } from '@app/shared/components/hrm/modal-training-document/modal-training-document.component';
import { ModalViewScopeComponent } from '@app/shared/components/hrm/modal-view-scope/modal-view-scope.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Employee, Profile, ResponseValue } from '@app/shared/models';
import { TrainingDocuments } from '@app/shared/models/hrm/training-document-managment/training-documents';
import { NotificationService, AuthService, BranchService, UtilityService, EmployeeService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import { TrainingDocumentManagmentService } from '@app/shared/services/hrm/training-document-managment/training-document-managment.service';
import { group } from 'console';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-archive01',
  templateUrl: './archive01.component.html',
  styleUrls: ['./archive01.component.css']
})
export class Archive01Component implements OnInit {
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
  _branchId?: number = 0;
  _branchId1?: number = 0;
  listBranch: Branch[] = [];
  userLoged?: Profile;
  supplierId?: number = 0;
  userId?:string;
  userId1?:string;
  busy: Subscription;
  viewModal = false;
  adminPermission = false;
  listEmployee:Employee[]=[];
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
    private _utilityService: UtilityService, private _employeeService: EmployeeService
  ) {}

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
  // ---- fields ----
  pageIndexArr = [1, 1];                     // pageIndex cho mỗi tab
  branchIds: number[] = [0, 0];              // branch theo tab
  userIds: (string | null)[] = [null, null]; // employee theo tab
  employeeIds: number[] = [null, null];    
    // --- Keyword theo tab ---
  keywordArr: string[] = ["", ""];
  filterColumnsArr = [
    { documentCode:'', title:'', level:'', customerName:'', summary:'', createdByName:'', assigneeName:'', rStatus:'',groupL1Id:'',groupL2Id:'' },
    { documentCode:'', title:'', level:'', customerName:'', summary:'', createdByName:'', assigneeName:'', rStatus:'' ,groupL1Id:'',groupL2Id:'' }
  ];


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



  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    // default user cho cả 2 tab
    this._branchId = Number.parseInt(this.userLoged.branchId);
    this._auth = Number.parseInt(this.userLoged.authorisationLevel);
    this.adminPermission = this.userLoged.isAdmin || this._auth < 1;

    // default branch theo user hiện tại
    const defBranch = Number.parseInt(this.userLoged.branchId);
    this.branchIds = [defBranch, defBranch];

    this.loadEmployee();
    this.loadData(0);
    this.loadData(1);
    this.loadBranch();
  }

    changedChiNhanh(tab: number): void {
    this.pageIndexArr[tab] = 1;
    this.loadData(tab);
  }

  changedEmployee(event: any, tab: number): void {
    this.employeeIds[tab] = event ? event.id : 0;
    this.userIds[tab] = event?.userId;
    this.pageIndexArr[tab] = 1;
    this.loadData(tab);
  }

  // Tìm kiếm nên load cả 2 tab, hoặc bạn có activeTab thì chỉ load tab đang active
  timKiem(tab: number): void {
    this.pageIndexArr[tab] = 1;
    this.loadData(tab);
  }

  // Phân trang theo tab
  pageChanged(event: PageChangedEvent, tab: number): void {
    this.pageIndexArr[tab] = event.page;
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
  
  loadData(type?: number): void {
  const t = type ?? 0; // 0: tab 0, 1: tab 1
  const params = new HttpParams()
    .set("keyword", this.keywordArr[type]??'')
    .set("branchId", (this.branchIds[t] ?? 0).toString())
    .set("departmentId", "0")
    .set("userId", this.userIds[t] ?? "00000000-0000-0000-0000-000000000000")
    .set("type", t.toString()); // giữ semantics cũ: 0 cho tab 0, 1 cho tab 1
  this.busy = this._sevice.getArchive1(params)
    .subscribe((res: ResponseValue<TrainingDocuments[]>) => {
      if (res.code === "200" || res.code === "201") {
        if (t === 1) this.listData1 = res.data; else this.listData = res.data;
        this.filterData(t);
      } else if (res.code === "204") {
        if (t === 1) this.listData1 = []; else this.listData = [];
        if (t === 1) this.listFilter1 = []; else this.listFilter = [];
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


  viewScoreModal=false;
 @ViewChild(ModalViewScopeComponent, { static: false })  modalViewScore: ModalViewScopeComponent;
  openScoreDetails(item: TrainingDocuments, steps: number): void {
    this.viewScoreModal = true;
    setTimeout(() => {
      this.modalViewScore.view(item.id, steps);
    }, 50);
  }
  




  add(level:number): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add(level);
    }, 50);
  }

  
filterData(type?: number): void {
  const t = type ?? 0;
  const filters = this.filterColumnsArr[t];
  
  const apply = (arr: TrainingDocuments[]) =>
    arr?.filter(item =>
      Object.keys(filters).every((key) => {
        const fv = (filters as any)[key];
        if (!fv) return true;
        const filterValue = fv.toString().toLowerCase();
        const itemValue = String((item as any)[key] ?? "").toLowerCase();
        return itemValue.includes(filterValue);
      })
    ) ?? [];
  
  if (t === 1) {
    this.listFilter1 = apply(this.listData1);
  } else {
    this.listFilter = apply(this.listData);
  }
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
