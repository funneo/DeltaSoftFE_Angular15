import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { OfficeAttendanceService } from '@app/shared/services/hrm/office-attendance.service';
import { OfficeAttendance, OfficeAttendanceDetail } from '@app/shared/models/hrm/office-attendance.model';

@Component({
  selector: 'modal-office-attendance-detail',
  templateUrl: './modal-office-attendance-detail.component.html',
  styleUrls: ['./modal-office-attendance-detail.component.css']
})
export class ModalOfficeAttendanceDetailComponent {
  @ViewChild('modalDetail', { static: false }) modal: ModalDirective;
  header: OfficeAttendance = {};
  details: OfficeAttendanceDetail[] = [];
  loading = false;

  constructor(private service: OfficeAttendanceService) { }

  show(id: number) {
    this.header = {}; this.details = []; this.loading = true;
    this.modal.show();
    this.service.getDetail(id).subscribe((res: any) => {
      this.loading = false;
      if (res?.code == '200') { this.header = res.data?.header || {}; this.details = res.data?.details || []; }
    }, () => this.loading = false);
  }

  dayTypeText(t: number): string {
    switch (t) {
      case 2: return 'Phép'; case 3: return 'Online';
      case 4: return 'Vắng (KL)'; case 5: return 'Nghỉ'; default: return 'Làm';
    }
  }
  dayTypeClass(t: number): string {
    switch (t) { case 2: return 'dt-leave'; case 3: return 'dt-online'; case 4: return 'dt-absent'; case 5: return 'dt-off'; default: return ''; }
  }
  close() { this.modal.hide(); }
}
