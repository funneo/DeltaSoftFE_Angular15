export interface RequestNewEmployee {
  id?: number;
  garageEmployeeId?: string;
  employeeFullName?: string;
  dateOfBirth?: string;
  sex?: boolean | null;
  idNumber?: string;
  address?: string;
  telephone?: string;
  email?: string;
  note?: string;
  status?: number ;
  createdDate?: string | null;
  createdBy?: string | null;          // Guid bên C# → string bên Angular
  isDeny?: boolean;
  reason?: string;
  accepted?: boolean;
  acceptedBy?: string | null;         // Guid bên C# → string bên Angular
  acceptedDate?: string | null;
  deltaERP_EmployeeId?: number | null;
  deltaERP_Username?: string;
  deltaERP_UserId?: string | null;
  deltaERP_Password?: string;
  checked?: boolean;
  rStatus?: string;    // Guid bên C# → string bên Angular
}