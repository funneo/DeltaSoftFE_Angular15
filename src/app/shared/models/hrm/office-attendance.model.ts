export interface OfficeAttendance {
  id?: number;
  branchId?: number;
  year?: number;
  month?: number;
  employeeId?: number;
  employeeName?: string;
  employeeCode?: string;
  standardDays?: number;
  workingDays?: number;
  penaltyLate?: number;
  penaltyEarly?: number;
  penaltyNoCheck?: number;
  penaltyExplain?: number;
  penaltyTotal?: number;
  unpaidLeaveDays?: number;
  leaveDaysMonth?: number;
  leaveValidPrev?: number;
  leaveValidThis?: number;
  onlineDaysMonth?: number;
  onlineValidPrev?: number;
  onlineValidThis?: number;
  lateCount?: number;
  earlyCount?: number;
  noCheckCount?: number;
  explainCount?: number;
  status?: number;
  note?: string;
  totalRows?: number;
  checked?: boolean;
}

export interface OfficeAttendanceDetail {
  id?: number;
  attendanceId?: number;
  workDate?: string;
  isSaturday?: boolean;
  timeIn?: string;
  timeOut?: string;
  lateMinutes?: number;
  earlyMinutes?: number;
  latePenalty?: number;
  earlyPenalty?: number;
  dayType?: number;     // 1 Làm / 2 Phép / 3 Online / 4 Vắng-KL / 5 Nghỉ
  workDayValue?: number;
  isExemptLate?: boolean;
  exemptLateRefId?: number;
  isExemptEarly?: boolean;
  exemptEarlyRefId?: number;
  noCheckIn?: boolean;
  noCheckOut?: boolean;
  leaveQty?: number;
  onlineQty?: number;
  note?: string;
}

export interface OfficeAttendanceDetailBundle {
  header?: OfficeAttendance;
  details?: OfficeAttendanceDetail[];
}

export interface OfficeAttendanceUnmatched {
  attendanceCode?: string;
  employeeName?: string;
  days?: number;
  employeeId?: number;   // FE state khi chọn map
}

export interface OfficeAttendanceImportResult {
  rowCount?: number;
  matchedRows?: number;
  unmatched?: OfficeAttendanceUnmatched[];
}

export interface OfficeHoliday {
  id?: number;
  branchId?: number;
  holidayDate?: string;
  name?: string;
}

export interface OfficeAttendanceOpening {
  id?: number;
  branchId?: number;
  year?: number;
  employeeId?: number;
  employeeFullName?: string;
  leaveValidOpening?: number;
  onlineValidOpening?: number;
  note?: string;
}

export interface OfficeAttendancePreviewRow {
  rowNumber?: number;
  cells?: string[];
}
