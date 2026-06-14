import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NotificationService, AuthService } from '@app/shared/services';
import { EmployeeService } from '@app/shared/services/employee.service';
import { OfficeAttendanceService } from '@app/shared/services/hrm/office-attendance.service';
import {
  OfficeAttendancePreviewRow, OfficeAttendanceUnmatched, OfficeAttendanceImportResult
} from '@app/shared/models/hrm/office-attendance.model';

@Component({
  selector: 'modal-office-attendance-import',
  templateUrl: './modal-office-attendance-import.component.html',
  styleUrls: ['./modal-office-attendance-import.component.css']
})
export class ModalOfficeAttendanceImportComponent {
  @ViewChild('modalImport', { static: false }) modal: ModalDirective;
  @Output() SaveSuccess = new EventEmitter<any>();
  @Output() CloseModal = new EventEmitter<any>();

  branchId: number; year: number; month: number;
  step: 'upload' | 'mapping' = 'upload';
  file: File = null;
  fileName = '';
  preview: OfficeAttendancePreviewRow[] = [];
  startRow = 4;
  cols = { colCode: 1, colName: 2, colDate: 3, colIn: 7, colOut: 8 };

  loading = false;
  importing = false;
  result: OfficeAttendanceImportResult = null;
  unmatched: OfficeAttendanceUnmatched[] = [];
  employees: any[] = [];

  constructor(
    private service: OfficeAttendanceService,
    private employeeService: EmployeeService,
    private notification: NotificationService,
    private authService: AuthService
  ) { }

  show(branchId: number, year: number, month: number) {
    this.branchId = branchId; this.year = year; this.month = month;
    this.reset();
    this.loadEmployees();
    this.modal.show();
  }

  reset() {
    this.step = 'upload'; this.file = null; this.fileName = '';
    this.preview = []; this.startRow = 4;
    this.cols = { colCode: 1, colName: 2, colDate: 3, colIn: 7, colOut: 8 };
    this.loading = false; this.importing = false; this.result = null; this.unmatched = [];
  }

  loadEmployees() {
    const params = new HttpParams().set('branchId', (this.branchId ?? '').toString());
    this.employeeService.getAll(params).subscribe((res: any) => {
      if (res?.code == '200' || res?.code == '201') this.employees = res.data || [];
    });
  }

  onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.file = input.files[0];
    this.fileName = this.file.name;
    input.value = '';
    this.loading = true;
    this.service.importPreview(this.file).subscribe(
      (res: any) => {
        this.loading = false;
        if (res?.code == '200') this.preview = res.data || [];
        else this.notification.printErrorMessage(res?.message || 'Không đọc được file.');
      },
      () => { this.loading = false; this.notification.printErrorMessage('Lỗi đọc file.'); }
    );
  }

  pickStartRow(r: number) { this.startRow = r; }

  doImport() {
    if (!this.file) { this.notification.printErrorMessage('Chưa chọn file.'); return; }
    this.importing = true;
    this.service.import(this.file, this.branchId, this.year, this.month, this.startRow, this.cols).subscribe(
      (res: any) => {
        this.importing = false;
        if (res?.code == '200') {
          this.result = res.data;
          this.unmatched = (res.data?.unmatched || []).map((x: OfficeAttendanceUnmatched) => ({ ...x, employeeId: null }));
          if (this.unmatched.length === 0) { this.done('Đã import + khớp toàn bộ.'); }
          else { this.step = 'mapping'; }
        } else {
          this.notification.printErrorMessage(res?.message || 'Import lỗi.');
        }
      },
      () => { this.importing = false; this.notification.printErrorMessage('Import lỗi.'); }
    );
  }

  saveMap(item: OfficeAttendanceUnmatched) {
    if (!item.employeeId) { this.notification.printErrorMessage('Chọn nhân viên để map.'); return; }
    this.service.nameMapSave({
      branchId: this.branchId,
      attendanceCode: item.attendanceCode,
      employeeName: item.employeeName,
      employeeId: item.employeeId
    }).subscribe((res: any) => {
      if (res?.code == '200') {
        this.service.reMatch({ branchId: this.branchId, year: this.year, month: this.month })
          .subscribe((r2: any) => {
            if (r2?.code == '200') {
              this.unmatched = (r2.data || []).map((x: OfficeAttendanceUnmatched) => ({ ...x, employeeId: null }));
              if (this.unmatched.length === 0) this.done('Đã map xong toàn bộ.');
            }
          });
      } else this.notification.printErrorMessage(res?.message || 'Lưu map lỗi.');
    });
  }

  get matchedDays(): number { return (this.result?.rowCount || 0) - (this.unmatched?.reduce((s, x) => s + (x.days || 0), 0) || 0); }

  done(msg: string) {
    this.notification.printSuccessMessage(msg);
    this.SaveSuccess.emit(true);
    this.modal.hide();
  }

  finishWithUnmatched() {
    // Cho phép đóng dù còn tên chưa map (những NV đó sẽ không có trong bảng tổng).
    this.SaveSuccess.emit(true);
    this.modal.hide();
  }

  close() { this.modal.hide(); this.CloseModal.emit(); }
}
