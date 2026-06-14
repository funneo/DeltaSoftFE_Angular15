import { HttpParams } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NotificationService } from '@app/shared/services';
import { EmployeeService } from '@app/shared/services/employee.service';
import { OfficeAttendanceService } from '@app/shared/services/hrm/office-attendance.service';
import { OfficeHoliday, OfficeAttendanceOpening } from '@app/shared/models/hrm/office-attendance.model';

@Component({
  selector: 'modal-office-attendance-config',
  templateUrl: './modal-office-attendance-config.component.html',
  styleUrls: ['./modal-office-attendance-config.component.css']
})
export class ModalOfficeAttendanceConfigComponent {
  @ViewChild('modalCfg', { static: false }) modal: ModalDirective;
  branchId: number; year: number;
  tab: 'holiday' | 'opening' = 'holiday';

  holidays: OfficeHoliday[] = [];
  newHoliday: OfficeHoliday = {};

  openings: OfficeAttendanceOpening[] = [];
  employees: any[] = [];
  newOpening: OfficeAttendanceOpening = {};

  constructor(
    private service: OfficeAttendanceService,
    private employeeService: EmployeeService,
    private notification: NotificationService
  ) { }

  show(branchId: number, year: number) {
    this.branchId = branchId; this.year = year; this.tab = 'holiday';
    this.newHoliday = { branchId, name: '' };
    this.newOpening = { branchId, year, leaveValidOpening: 0, onlineValidOpening: 0 };
    this.loadHolidays(); this.loadOpenings(); this.loadEmployees();
    this.modal.show();
  }

  // ---- Holiday ----
  loadHolidays() {
    this.service.holidayGetAll(this.branchId, this.year).subscribe((r: any) => {
      if (r?.code == '200') this.holidays = r.data || [];
    });
  }
  addHoliday() {
    if (!this.newHoliday.holidayDate) { this.notification.printErrorMessage('Chọn ngày lễ.'); return; }
    this.service.holidaySave({ ...this.newHoliday, id: 0, branchId: this.branchId }).subscribe((r: any) => {
      if (r?.code == '200') { this.newHoliday = { branchId: this.branchId, name: '' }; this.loadHolidays(); }
      else this.notification.printErrorMessage(r?.message);
    });
  }
  delHoliday(h: OfficeHoliday) {
    this.notification.printConfirmationDialog('Xóa ngày lễ này?', () =>
      this.service.holidayDelete(h.id).subscribe((r: any) => { if (r?.code == '200') this.loadHolidays(); }));
  }

  // ---- Opening ----
  loadEmployees() {
    const params = new HttpParams().set('branchId', (this.branchId ?? '').toString());
    this.employeeService.getAll(params).subscribe((res: any) => { if (res?.code == '200') this.employees = res.data || []; });
  }
  loadOpenings() {
    this.service.openingGetAll(this.branchId, this.year).subscribe((r: any) => { if (r?.code == '200') this.openings = r.data || []; });
  }
  addOpening() {
    if (!this.newOpening.employeeId) { this.notification.printErrorMessage('Chọn nhân viên.'); return; }
    this.service.openingUpsert({ ...this.newOpening, branchId: this.branchId, year: this.year }).subscribe((r: any) => {
      if (r?.code == '200') { this.newOpening = { branchId: this.branchId, year: this.year, leaveValidOpening: 0, onlineValidOpening: 0 }; this.loadOpenings(); }
      else this.notification.printErrorMessage(r?.message);
    });
  }
  saveOpening(o: OfficeAttendanceOpening) {
    this.service.openingUpsert({ ...o, branchId: this.branchId, year: this.year }).subscribe((r: any) => {
      if (r?.code == '200') this.notification.printSuccessMessage('Đã lưu.');
    });
  }

  close() { this.modal.hide(); }
}
