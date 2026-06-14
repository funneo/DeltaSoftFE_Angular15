import { Component, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { Branch, Profile } from '@app/shared/models';
import { NotificationService, AuthService, BranchService } from '@app/shared/services';
import { OfficeAttendanceService } from '@app/shared/services/hrm/office-attendance.service';
import { OfficeAttendance } from '@app/shared/models/hrm/office-attendance.model';
import { ModalOfficeAttendanceImportComponent } from '@app/shared/components/hrm/modal-office-attendance-import/modal-office-attendance-import.component';
import { ModalOfficeAttendanceDetailComponent } from '@app/shared/components/hrm/modal-office-attendance-detail/modal-office-attendance-detail.component';
import { ModalOfficeAttendanceConfigComponent } from '@app/shared/components/hrm/modal-office-attendance-config/modal-office-attendance-config.component';

@Component({
  selector: 'app-office-attendance',
  templateUrl: './office-attendance.component.html',
  styleUrls: ['./office-attendance.component.css']
})
export class OfficeAttendanceComponent implements OnInit {
  userLoged?: Profile;
  branchId: number;
  year: number;
  month: number;
  keyword = '';
  list: OfficeAttendance[] = [];
  listBranch: Branch[] = [];
  months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  busy = false;

  @ViewChild(ModalOfficeAttendanceImportComponent, { static: false }) modalImport: ModalOfficeAttendanceImportComponent;
  @ViewChild(ModalOfficeAttendanceDetailComponent, { static: false }) modalDetail: ModalOfficeAttendanceDetailComponent;
  @ViewChild(ModalOfficeAttendanceConfigComponent, { static: false }) modalConfig: ModalOfficeAttendanceConfigComponent;

  constructor(
    private service: OfficeAttendanceService,
    private notification: NotificationService,
    private authService: AuthService,
    private branchService: BranchService
  ) { }

  ngOnInit(): void {
    this.userLoged = this.authService.getLoggedInUser();
    this.branchId = Number.parseInt(this.userLoged.branchId);
    this.year = moment().year();
    this.month = moment().month() + 1;
    this.loadBranch();
    this.loadData();
  }

  loadBranch() {
    this.branchService.getAll().subscribe((res: any) => {
      if (res?.code == '200' || res?.code == '201') this.listBranch = res.data || [];
    });
  }

  get filter() { return { branchId: this.branchId, year: this.year, month: this.month, keyword: this.keyword }; }

  loadData() {
    this.busy = true;
    this.service.getPaging(this.filter).subscribe((res: any) => {
      this.busy = false;
      this.list = (res?.code == '200') ? (res.data || []) : [];
    }, () => this.busy = false);
  }

  calculate() {
    this.notification.printConfirmationDialog(
      `Tính lại bảng công tháng ${this.month}/${this.year}? (ghi đè kết quả cũ của tháng này)`,
      () => {
        this.busy = true;
        this.service.calculate(this.filter).subscribe((res: any) => {
          this.busy = false;
          if (res?.code == '200') { this.list = res.data || []; this.notification.printSuccessMessage('Đã tính xong.'); }
          else this.notification.printErrorMessage(res?.message || 'Tính lỗi.');
        }, () => this.busy = false);
      });
  }

  openImport() { setTimeout(() => this.modalImport.show(this.branchId, this.year, this.month), 0); }
  onImported() { this.notification.printSuccessMessage('Import xong. Bấm "Tính" để cập nhật bảng công.'); }
  openDetail(item: OfficeAttendance) { setTimeout(() => this.modalDetail.show(item.id), 0); }
  openConfig() { setTimeout(() => this.modalConfig.show(this.branchId, this.year), 0); }

  changeBranch(b: Branch) { this.branchId = b?.id; this.loadData(); }

  exportExcel() {
    this.service.export(this.filter).subscribe((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `TongHopCong_${this.month}_${this.year}.xlsx`;
      a.click(); window.URL.revokeObjectURL(url);
    });
  }

  get sumPenalty(): number { return this.list.reduce((s, x) => s + (x.penaltyTotal || 0), 0); }
}
