export default interface DatabaseBackup {
  id?: number;
  ten?: string;
  duongDan?: string;
  thaoTac?: string;
  ghiChu?: string;
  status?: boolean,
  checked?: boolean,
  createdDate?: string,
  //view model
  fullName?:string;
  tenFile?:string;
}
