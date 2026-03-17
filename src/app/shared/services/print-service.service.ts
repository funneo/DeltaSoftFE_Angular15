import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { UtilityService } from './utility.service';

@Injectable()
export class PrintService {

  constructor(private _utilityService: UtilityService) {

   }


  ReplaceNgayThang(value: string = ""): string {
    value = value.replace(/{Hien_Tai_Ngay}/gi, moment().date().toString());
    value = value.replace(/{Hien_Tai_Thang}/gi, (moment().month() + 1).toString());
    value = value.replace(/{Hien_Tai_Nam}/gi, moment().year().toString());
    value = value.replace(/{Hien_Tai_Gio}/gi, moment().hour().toString());
    value = value.replace(/{Hien_Tai_Phut}/gi, moment().minute().toString());
    return value;
  }

  PrintPhieuXuatNhaps(value: string = "", entity: any = {}): string {
    let result = this.GetVongLap(value, "{Ten_San_Pham}");
    value = this.ReplaceNgayThang(value);
    value = value.replace(/{Khach_Hang_Ten}/gi, entity.TenKhachHang);
    value = value.replace(/{Title}/gi, entity.LoaiPhieu == 1 ? "Phiếu Nhập Hàng" : "Phiếu Giao Hàng");
    value = value.replace(/{Dia_Chi}/gi, entity.DiaChi ? entity.DiaChi : "");
    value = value.replace(/{Ma_Don}/gi, entity.MaSoDonHang  ? entity.MaSoDonHang : "");
    value = value.replace(/{Ghi_Chu_Don}/gi, entity.GhiChu ? entity.GhiChu : "");
    if (result.length > 0) {
      let i: number = 0;
      let sumSoLuong: number = 0;
      let sumThanhTien: number = 0;
      let tempDonHang: string = "";
      for (let item of entity.XuatNhapChiTiets) {
        let temp = result;
        i++;
        temp = temp.replace(/{STT}/, i.toString());
        temp = temp.replace(/{Ten_San_Pham}/, item.TenSanPham);
        temp = temp.replace(/{Don_Vi_Tinh}/, item.DonViTinh ? item.DonViTinh : "");
        temp = temp.replace(/{So_Luong_Giao}/, this.VND(item.SoLuong));
        temp = temp.replace(/{So_Luong_Dat}/, this.VND(item.SoLuongDat));
        temp = temp.replace(/{Ma_Don_Hang}/, item.MaSoDonHang != null ? item.MaSoDonHang : "");
        temp = temp.replace(/{Ma_San_Pham}/, item.MaSanPham != null ? item.MaSanPham : "");
        temp = temp.replace(/{Don_Gia}/, this.VND(item.DonGia));
        temp = temp.replace(/{Thanh_Tien}/, this.VND(item.ThanhTien));
        temp = temp.replace(/{Ghi_Chu_Ct}/gi, item.GhiChu != null ? item.GhiChu : "");

        sumSoLuong = sumSoLuong + item.SoLuong;
        sumThanhTien = sumThanhTien + item.ThanhTien;
        tempDonHang = tempDonHang + temp;
      }
      value = value.replace(/{Sum_So_Luong}/, this.VND(sumSoLuong));
      value = value.replace(/{Sum_Thanh_Tien}/, this.VND(sumThanhTien));
      value = value.replace(/{Chiet_Khau}/, entity.ChietKhau);
      value = value.replace(/{Tien_Sau_Chiet_Khau}/, this.VND((sumThanhTien * entity.ChietKhau) / 100));
      value = value.replace(result, tempDonHang);
    }
    return value;
  }



  PrintThongKeDonHang(value: string = "", entity: any = {}): string {
    let result = this.GetVongLap(value, "{Ma_Don}");
    value = this.ReplaceNgayThang(value);
    value = value.replace(/{Tu_Ngay}/gi, entity.TuNgay);
    value = value.replace(/{Den_Ngay}/gi, entity.DenNgay);
    if (result.length > 0) {
      let i: number = 0;
      let sumTongTien: number = 0;
      let tempDonHang: string = "";
      for (let item of entity.Datas) {
        let temp = result;
        i++;
        temp = temp.replace(/{STT}/, i.toString());
        temp = temp.replace(/{Ma_Don}/, item.MaSoDonHang);
        temp = temp.replace(/{Ten}/, item.Ten);
        temp = temp.replace(/{Ngay_Lap}/, item.NgayLap);
        temp = temp.replace(/{Ngay_Giao_Hang}/, item.NgayGiaoHang);
        temp = temp.replace(/{Noi_Dung}/, item.NoiDung);
        temp = temp.replace(/{Tong_Tien}/, this.VND(item.TongTien));
        temp = temp.replace(/{Ghi_Chu}/, item.GhiChuDon);
        tempDonHang = tempDonHang + temp;
        sumTongTien = sumTongTien + item.TongTien;
      }

      value = value.replace(result, tempDonHang);
      value = value.replace(/{Sum_Tong_Tien}/, this.VND(sumTongTien));
    }
    return value;
  }

  PrintPhieuThu(value: string = "", entity: any = {}): string {
    value = this.ReplaceNgayThang(value);
    value = value.replace(/{Ten_Cong_Ty}/gi, this.VND(entity.TenCongTy));
    value = value.replace(/{Dia_Chi_Cong_Ty}/gi, this.VND(entity.DiaChiCongTy));
    value = value.replace(/{Dien_Thoai_Cong_Ty}/gi, this.VND(entity.DienThoaiCongTy));
    value = value.replace(/{Tong_Tien}/gi, this.VND(entity.TongTien));
    value = value.replace(/{Ten_Khach_Hang}/gi, entity.TenKhachHang);
    value = value.replace(/{Dia_Chi}/gi, entity.DiaChi==null?'':entity.DiaChi);
    value = value.replace(/{Dien_Thoai}/gi, entity.DienThoai==null?'':entity.DienThoai);
    value = value.replace(/{Noi_Dung}/gi, entity.TenThuChi);
    value = value.replace(/{So_Phieu}/gi, entity.SoPhieu);
    value = value.replace(/{Ngay_Thu_Chi}/gi, entity.NgayThuChi);
    value = value.replace(/{Nguoi_Thu_Chi}/gi, entity.NguoiDoiUng);
    value = value.replace(/{Chung_Tu_So}/gi, entity.ChungTuSo==null?'':entity.ChungTuSo);
    value = value.replace(/{Ghi_Chu}/gi, entity.GhiChu==null?"":entity.GhiChu);
    value = value.replace(/{Ten_Quy}/gi, entity.TenQuy);
    value = value.replace(/{Bang_Chu}/gi, this._utilityService.ReadNumber(entity.TongTien));
    return value;
  }

  PrintPhieuChi(value: string = "", entity: any = {}): string {
    value = this.ReplaceNgayThang(value);
    value = value.replace(/{Tong_Tien}/gi, this.VND(entity.TongTien));
    value = value.replace(/{Ten_Khach_Hang}/gi, entity.TenKhachHang);
    value = value.replace(/{Dia_Chi}/gi, entity.DiaChi==null?'':entity.DiaChi);
    value = value.replace(/{Dien_Thoai}/gi, entity.DienThoai==null?'':entity.DienThoai);
    value = value.replace(/{Noi_Dung}/gi, entity.TenThuChi);
    value = value.replace(/{So_Phieu}/gi, entity.SoPhieu);
    value = value.replace(/{Ngay_Thu_Chi}/gi, entity.NgayThuChi);
    value = value.replace(/{Nguoi_Thu_Chi}/gi, entity.NguoiDoiUng);
    value = value.replace(/{Chung_Tu_So}/gi, entity.ChungTuSo==null?'':entity.ChungTuSo);
    value = value.replace(/{Ghi_Chu}/gi, entity.GhiChu==null?"":entity.GhiChu);
    value = value.replace(/{Ten_Quy}/gi, entity.TenQuy);
    value = value.replace(/{Bang_Chu}/gi, this._utilityService.ReadNumber(entity.TongTien));
    return value;
  }


  PrintNhapSanPham(value: string = "", entity: any = {}): string {
    let result = this.GetVongLap(value, "{Thuoc_Ten}");
    // value = this.ReplaceChiNhanh(value);
    value = this.ReplaceNgayThang(value);
    if (entity.DonViCungCap && entity.DonViCungCap.TenDonViCungCap) {
      value = value.replace(/{Don_Vi_Ten}/, entity.DonViCungCap.TenDonViCungCap == null ? "" : entity.DonViCungCap.TenDonViCungCap);
      value = value.replace(/{Don_Vi_Dien_Thoai}/, entity.DonViCungCap.SoDienThoai == null ? "" : entity.DonViCungCap.SoDienThoai);
      value = value.replace(/{Don_Vi_Nguoi_Dai_Dien}/, entity.DonViCungCap.NguoiDaiDien == null ? "" : entity.DonViCungCap.NguoiDaiDien);
      value = value.replace(/{Don_Vi_Dia_Chi}/, entity.DonViCungCap.DiaChi == null ? "" : entity.DonViCungCap.DiaChi);
    }
    value = value.replace(/{Tong_Tien}/gi, this.VND(entity.TongTien));
    value = value.replace(/{Tong_Tien_Khuyen_Mai}/gi, this.VND(entity.TongTienKhuyenMai));
    value = value.replace(/{Thuc_Thu}/gi, this.VND(entity.ThucThu));
    value = value.replace(/{Da_Thu}/gi, this.VND(entity.DaThu));
    value = value.replace(/{Cong_No}/gi, this.VND(entity.CongNo));
    value = value.replace(/{Nhan_Vien_Nhap}/gi, entity.TenNhanVienNhap == null ? "" : entity.TenNhanVienNhap);
    value = value.replace(/{Ghi_Chu}/, entity.GhiChu == null ? "" : entity.GhiChu);
    if (result.length > 0) {
      let i: number = 0;
      let tempThuoc: string = "";
      for (let item of entity.PhieuNhapSanPhamChiTiets) {
        let temp = result;
        i++;
        temp = temp.replace(/{STT}/, i.toString());
        temp = temp.replace(/{Thuoc_Ma}/, item.MaSanPham);
        temp = temp.replace(/{Thuoc_Ten}/, item.TenSanPham);
        temp = temp.replace(/{Thuoc_Ten_Don_Vi_Tinh}/, item.TenDonViTinh == null ? "" : item.TenDonViTinh);
        temp = temp.replace(/{Thuoc_So_Luong}/, this.VND(item.SoLuong));
        temp = temp.replace(/{Thuoc_Don_Gia}/, this.VND(item.DonGia));
        temp = temp.replace(/{Thuoc_Giam_Gia}/, this.VND(item.GiamGia));
        temp = temp.replace(/{Thuoc_Thanh_Tien}/, this.VND(item.ThanhTien));
        temp = temp.replace(/{Thuoc_Lieu_Dung}/, item.LieuDung == null ? "" : item.LieuDung);
        temp = temp.replace(/{Thuoc_Ghi_Chu}/, item.GhiChu == null ? "" : item.GhiChu);
        tempThuoc = tempThuoc + temp;
      }
      value = value.replace(result, tempThuoc);
    }
    return value;
  }

  VND(valuenumber: number = 0,
    currencySign: string = '',//tên tiền tệ
    decimalLength: number = 2,
    chunkDelimiter: string = '.',
    decimalDelimiter: string = ',',
    chunkLength: number = 3): string {
    // debugger
    // console.log(value);
    if (valuenumber) {
      if (valuenumber != null) {
        // let valueString = value.toString().replace(/[.]+/g, '');
        let valueString = valuenumber.toString();
        valuenumber = parseFloat(valueString.replace(/[,]+/g, '.'));
      }
      //value /= 100;
      let result = '\\d(?=(\\d{' + chunkLength + '})+' + (decimalLength > 0 ? '\\D' : '$') + ')'
      let num = valuenumber.toFixed(Math.max(0, ~~decimalLength));
      let so = currencySign + (decimalDelimiter ? num.replace('.', decimalDelimiter) : num).replace(new RegExp(result, 'g'), '$&' + chunkDelimiter);
      return so.replace(',00', '');
    }
    return "0";
  }

  GetIndexTr(value: string = "", token: string): string {
    let result: string = "";
    let index = value.indexOf(token);
    if (index != -1) {
      let str = value.substring(0, index);
      let indexBegin = str.lastIndexOf("<tr");
      let tempBegin = str.substring(indexBegin);
      str = value.substring(index);
      let indexEnd = str.indexOf("</tbody");
      let tempEnd = str.substring(0, indexEnd);
      result = tempBegin + tempEnd;
    }
    return result;
  }

  GetVongLap(value: string = "", token: string): string {
    let result: string = "";
    let index = value.indexOf(token);
    if (index != -1) {
      let str = value.substring(0, index);
      let indexBegin = str.lastIndexOf("<tr");
      let tempBegin = str.substring(indexBegin);
      str = value.substring(index);
      let indexEnd = str.indexOf("</tbody");
      let tempEnd = str.substring(0, indexEnd);
      result = tempBegin + tempEnd;
    }
    return result;
  }

}
