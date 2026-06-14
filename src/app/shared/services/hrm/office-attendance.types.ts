export interface OfficeAttendanceFilterLike {
  branchId?: number;
  year?: number;
  month?: number;
  keyword?: string;
  status?: number;
}

export interface OfficeAttendanceNameMapReq {
  branchId?: number;
  attendanceCode?: string;
  employeeName?: string;
  employeeId?: number;
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
  leaveValidOpening?: number;
  onlineValidOpening?: number;
  note?: string;
}
