import { HttpParams } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { MessageContstants } from "@app/shared/constants";
import { Branch, Employee, Profile, ResponseValue } from "@app/shared/models";
import { TrainingDocumentsReport01 } from "@app/shared/models/hrm/training-documents-report01";
import { TrainingDocumentsReport02 } from "@app/shared/models/hrm/training-documents-report02";
import {
  AuthService,
  BranchService,
  EmployeeService,
  NotificationService,
  UtilityService,
} from "@app/shared/services";
import { TrainingDocumentManagmentService } from "@app/shared/services/hrm/training-document-managment/training-document-managment.service";
import * as moment from "moment";

@Component({
  selector: "app-report-training-documents",
  templateUrl: "./report-training-documents.component.html",
  styleUrls: ["./report-training-documents.component.css"],
})
export class ReportTrainingDocumentsComponent implements OnInit {
  // --- Report01 (tổng hợp) ---
  data: TrainingDocumentsReport02[] = [];
  visibleData: TrainingDocumentsReport02[] = [];
  pageIndex = 1;
  pageSize = 50;
  totalRows = 0;
  loading = false;
  listEmployee: Employee[] = [];
  userId?: number;
  userLoged?: Profile;
  // --- Report02 (chi tiết) ---
  data2: TrainingDocumentsReport01[] = [];
  visibleData2: TrainingDocumentsReport01[] = [];
  pageIndex2 = 1;
  pageSize2 = 50;
  totalRows2 = 0;
  loading2 = false;
  userIdSelected?: string;
  branchIdSelected?: number;
  listBranch:Branch[]=[];
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public ngayBatDau2: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc2: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(
    this.ngayBatDau,
    this.ngayKetThuc
  );
  public dateOptions2 = this._utilityService.dateOptionMultis(
    this.ngayBatDau2,
    this.ngayKetThuc2
  );
  
  constructor(
    private _notificationService: NotificationService,
    private _service: TrainingDocumentManagmentService,
    private _utilityService: UtilityService,private branchService: BranchService,
    private _employeeService: EmployeeService,private _authService: AuthService
  ) {}

  ngOnInit(): void {
    this.ngayBatDau = new Date(
      moment().hours(0).minutes(0).seconds(0).startOf("month").toString()
    );

    this.ngayKetThuc = new Date(
      moment().hours(23).minutes(59).seconds(59).toString() // hôm nay 23:59:59
    );
    this.ngayBatDau2 = new Date(
      moment().hours(0).minutes(0).seconds(0).startOf("month").toString()
    );

    this.ngayKetThuc2 = new Date(
      moment().hours(23).minutes(59).seconds(59).toString() // hôm nay 23:59:59
    );
    this.dateOptions = this._utilityService.dateOptionMultis(
      this.ngayBatDau,
      this.ngayKetThuc
    );
    this.dateOptions2 = this._utilityService.dateOptionMultis(
      this.ngayBatDau2,
      this.ngayKetThuc2
    );
    this.userLoged = this._authService.getLoggedInUser();
    this.branchIdSelected= Number.parseInt(this.userLoged.branchId);
    this.loadBranch();
    this.loadEmployee();
    this.loadData();
  }
    loadApprroval
    changedChiNhanh(): void {
      this.loadData();
    }
    loadBranch(): void {
      this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listBranch = res.data;
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
          );
        }
      });
    }
  
  
  loadEmployee() {
    let tuNgay = moment(this.ngayBatDau2).format("YYYYMMDD");
    let denNgay = moment(this.ngayKetThuc2).format("YYYYMMDD");
    const params = new HttpParams()
      .set("fromDate", tuNgay)
      .set("toDate", denNgay);
    this._service
      .loadEmployee(params)
      .subscribe((res: ResponseValue<Employee[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listEmployee = res.data;
        } else {
          if (res.code == "204") {
            this.listEmployee = [];
            this.totalRows = 0;
          } else {
            this._notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
            );
          }
        }
      });
  }

  changedEmployee(event) {
    this.userId = event;
    this.loadData2();
  }

  // ===== Report01 =====
  loadData(): void {
    let tuNgay = moment(this.ngayBatDau2).format("YYYYMMDD");
    let denNgay = moment(this.ngayKetThuc2).format("YYYYMMDD");
    const params = new HttpParams()
      .set("fromDate", tuNgay)
      .set("toDate", denNgay)
      .set("branchId", (this.branchIdSelected ?? 0).toString());
    this.loading = true;
    this._service
      .report01(params)
      .subscribe((res: ResponseValue<TrainingDocumentsReport02[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.data = res.data;
          this.applyPaging();
          this.loading = false;
        } else {
          if (res.code == "204") {
            this.data2 = [];
            this.totalRows = 0;
            this.loading = false;
          } else {
            this.loading = false;
            this._notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
            );
          }
        }
      });
  }
  exportExcelReport01(): void {

    let tuNgay = moment(this.ngayBatDau2).format("YYYYMMDD");
    let denNgay = moment(this.ngayKetThuc2).format("YYYYMMDD");
    const params = new HttpParams()
      .set("fromDate", tuNgay)
      .set("toDate", denNgay)
      .set("branchId", (this.branchIdSelected ?? 0).toString());
      
  this.loading2 = true;
  this._service.exportReport01(params).subscribe({
    next: (res) => {
      const blob = res.body!;
      let filename = 'BaoCao-DaoTao-TongHop.xlsx';
      const cd = res.headers.get('content-disposition') || '';
      const m = /filename\*?=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd);
      if (m) filename = decodeURIComponent(m[1] || m[2]);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
    error: (err) => {
      this._notificationService.printErrorMessage('Xuất Excel thất bại');
      console.error(err);
      this.loading2 = false;
    }
  });
  this.loading2 = false;
}
  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData2();
  }

  selectedDate2(event) {
    this.ngayBatDau2 = new Date(event.start);
    this.ngayKetThuc2 = new Date(event.end);
    this.loadData();
  }

  pageChanged(e: { page: number; itemsPerPage: number }): void {
    this.pageIndex = e.page;
    this.pageSize = e.itemsPerPage;
    this.applyPaging();
  }

  private applyPaging(): void {
    const start = (this.pageIndex - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.visibleData = this.data.slice(start, end);
  }
  trackByCode = (_: number, item: TrainingDocumentsReport01) =>
    item.documentCode;

  // ===== Report02 =====
  loadData2(): void {
    if (
      !this.userIdSelected ||
      this.userIdSelected == "" ||
      this.userIdSelected == "00000000-0000-0000-0000-000000000000"
    ) {
      this._notificationService.printAlert(
        "Lỗi nhập li",
        "Vui lòng chọn nhân viên"
      );
      return;
    }
    this.loading=true;
    let tuNgay2 = moment(this.ngayBatDau).format("YYYYMMDD");
    let denNgay2 = moment(this.ngayKetThuc).format("YYYYMMDD");
    const params = new HttpParams()
      .set("fromDate", tuNgay2)
      .set("toDate", denNgay2)
      .set("employeeId", this.userIdSelected);
    this.loading = true;
    this._service
      .report02(params)
      .subscribe((res: ResponseValue<TrainingDocumentsReport01[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.data2 = res.data;
          this.applyPaging2();
        } else {
          if (res.code == "204") {
            this.data2 = [];
            this.totalRows = 0;
          } else {
            this._notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
            );
          }
        }
        this.loading = false;
      });
  }

  exportExcelReport02(): void {
  if (
      !this.userIdSelected ||
      this.userIdSelected == "" ||
      this.userIdSelected == "00000000-0000-0000-0000-000000000000"
    ) {
      this._notificationService.printAlert(
        "Lỗi nhập li",
        "Vui lòng chọn nhân viên"
      );
      return;
    }
    
    let tuNgay2 = moment(this.ngayBatDau).format("YYYYMMDD");
    let denNgay2 = moment(this.ngayKetThuc).format("YYYYMMDD");
    const params = new HttpParams()
      .set("fromDate", tuNgay2)
      .set("toDate", denNgay2)
      .set("employeeId", this.userIdSelected);
    this.loading = true;
  this._service.exportReport02(params).subscribe({
    next: (res) => {
      const blob = res.body!;
      let filename = 'BaoCao-DaoTao-TongHop.xlsx';
      const cd = res.headers.get('content-disposition') || '';
      const m = /filename\*?=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd);
      if (m) filename = decodeURIComponent(m[1] || m[2]);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
    error: (err) => {
      this._notificationService.printErrorMessage('Xuất Excel thất bại');
      console.error(err);
      this.loading = false;
    }
  });
  this.loading = false;
}

  pageChanged2(e: { page: number; itemsPerPage: number }): void {
    this.pageIndex2 = e.page;
    this.pageSize2 = e.itemsPerPage;
    this.applyPaging2();
  }

  private applyPaging2(): void {
    const start = (this.pageIndex2 - 1) * this.pageSize2;
    const end = start + this.pageSize2;
    this.visibleData2 = this.data2.slice(start, end);
  }

  trackByEmp = (_: number, item: TrainingDocumentsReport02) =>
    item.employeeCode;
}
