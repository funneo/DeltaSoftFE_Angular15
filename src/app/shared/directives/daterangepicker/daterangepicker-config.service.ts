import { Injectable } from '@angular/core';

/**
 * Cấu hình mặc định dùng chung cho directive [daterangepicker].
 * Clone từ ng2-daterangepicker (DaterangepickerConfig) để vendorize:
 * gỡ phụ thuộc package khoá peer @angular/core ^9 (chặn nâng Angular >=16),
 * giữ NGUYÊN API template ([options]/(selected)/...).
 */
@Injectable({ providedIn: 'root' })
export class DaterangepickerConfig {
  public settings: any = {};
}
