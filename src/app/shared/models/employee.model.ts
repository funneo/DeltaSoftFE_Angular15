export interface Employee {
  id?: number;
  branchId?: number;
  employeeCode?: string;
  employeeFullName?: string;
  dateOfBirth?: string;
  sex?: boolean;
  idNumber?: string;
  issueedDate?: string;
  issueedPlace?: string;
  taxCode?: string;
  address?: string;
  telephone?: string;
  email?: string;
  departmentId?: number;
  departmentName?:string;
  titleName?:string;
  titleId?: number;
  accountNumber?: string;
  bank?: string;
  status?: boolean;
  startDate?: string;
  contractDate?: string;
  note?: string;
  imagePath?: string;
  checked?: boolean;
  userId?:string;
  paymentLevel?:number;
  // nhân thân / bảo hiểm (đã có trong DB, modal HR mới dùng)
  nationId?: number;
  religionId?: number;
  maritalStatusId?: boolean;
  socialInsurance?: string;
  healthInsurance?: string;
  // ===== Field MỚI module HR (Hồ sơ NV) =====
  placeOfBirth?: string;            // Nơi sinh
  homeTown?: string;                // Nguyên quán
  currentAddress?: string;          // Chỗ ở hiện tại (address = thường trú)
  nationality?: string;             // Quốc tịch
  idType?: number;                  // 1=CCCD, 2=Hộ chiếu, 3=CMND
  employeeStatusId?: number;        // Trạng thái NV (EMPLOYEE_STATUS)
  bankBranch?: string;              // Chi nhánh ngân hàng
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  personalEmail?: string;           // Email cá nhân (email = email công ty)
  workLocationId?: number;          // Địa điểm làm việc (WORK_LOCATION)
  isNursingChild?: boolean;         // Đang nuôi con < 12 tháng -> +60p/ngày (chấm công)
  childBirthDate?: string;          // Ngày sinh của con (dd/MM/yyyy)
  // tên hiển thị trả từ GetByIdHR
  branchCode?: string;
  branchName?: string;
  employeeStatusName?: string;
  workLocationName?: string;
}
