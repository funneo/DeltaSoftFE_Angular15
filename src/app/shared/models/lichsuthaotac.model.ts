export default interface LichSuThaoTac{
  id?: number;
  idNguoiDung?: string;
  thoiGian?: string;
  ip?: string;
  trinhDuyet?: string;
  idFunction?: string;
  thaoTac?: string;
  noiDungThaoTac?: string;
  ghiChu?:string;
  status?: boolean,
  checked?: boolean,
  delete?: boolean;
  idDuLieu?: string;
  //view model
  thoiGianViewModel?:string;
  fullName?:string;
  functionName?: string;
}
