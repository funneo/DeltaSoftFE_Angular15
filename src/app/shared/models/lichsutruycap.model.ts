export default interface LichSuTruyCap{
  id?: number;
  idNguoiDung?: string;
  thoiGian?: string;
  ip?: string;
  trinhDuyet?: string;
  ghiChu?:string;
  status?: boolean,
  checked?: boolean,
  delete?: boolean;
  //view model
  thoiGianViewModel?:string;
  fullName?:string;
}
