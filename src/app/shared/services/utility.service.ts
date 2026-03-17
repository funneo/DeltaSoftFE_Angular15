import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { NgxMaskModule, IConfig } from 'ngx-mask'
import { FormatContstants } from '../constants/format.constants';

@Injectable()
export class UtilityService {
  private _router: Router;
  public ngayBanDau: Date = new Date(moment().hours(0).minutes(0).seconds(0).toString());
  public ngayKetThuc: Date = new Date(moment().hours(23).minutes(59).seconds(0).toString());

  constructor(router: Router) {
    this._router = router;
  }

  navigate(path: string) {
    this._router.navigate([path]);
  }
  public validateDebitNoteDate(inputDate: string): boolean {
    //Input string dạng dd/MM/yyyy
    // Kiểm tra định dạng chuỗi đầu vào
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(inputDate)) {
      console.log('Định dạng ngày không hợp lệ.');
      return false;
    }

    // Chuyển chuỗi sang Date
    const day = parseInt(inputDate.substring(0, 2), 10); // Lấy ngày
    const month = parseInt(inputDate.substring(3, 5), 10); // Lấy tháng
    const year = parseInt(inputDate.substring(6, 10), 10); // Lấy năm

    // Kiểm tra tính hợp lệ của ngày tháng
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() + 1 !== month ||
      date.getDate() !== day
    ) {
      return false;
    }
    // Lấy ngày hiện tại
    const now = new Date();
    const currentDay=now.getDate();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    if (currentDay > 13) {
      // Ngày lớn hơn 13, tháng phải là tháng hiện tại
      return year === currentYear && month === currentMonth;
    } else {
      // Ngày nhỏ hơn hoặc bằng 13, tháng có thể là hiện tại hoặc tháng trước
      const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      return (
        (year === currentYear && month === currentMonth) ||
        (year === previousYear && month === previousMonth)
      );
    }
  }

  public validateNgayHachtoanVsDoanhthu(_ngayHachtoan: string, _ngayDoanhThu: string): boolean {
  if (!_ngayHachtoan || !_ngayDoanhThu) return true;

  const hachtoanDate = moment(_ngayHachtoan, "DD/MM/YYYY");
  const doanhthuDate = moment(_ngayDoanhThu, "DD/MM/YYYY");

  if (
    hachtoanDate.year() < doanhthuDate.year() ||
    (hachtoanDate.year() === doanhthuDate.year() &&
      hachtoanDate.month() < doanhthuDate.month())
  ) {
    return false;
  }
  return true;
}

  public formatAndSetDateTime(entity: any, field: string, optionField: string) {
    if (entity[field]) {
      const formattedDate = moment(entity[field], FormatContstants.DATETIMEEN).format(FormatContstants.DATETIMEVN);
      entity[field] = formattedDate;
      this[optionField] = this.dateTimeOptionDays(new Date(formattedDate), true);
    }
  }

  public dateTimeOptionDays = (date: Date, hasTime: boolean = false): any => {
    return {
      "locale": {
        "format": "DD/MM/YYYY HH:mm:ss",
        "separator": " - ",
        "applyLabel": "Đồng ý",
        "cancelLabel": "Hủy",
        "fromLabel": "Từ",
        "toLabel": "Tới",
        "customRangeLabel": "Tùy chọn",
        "weekLabel": "T",
        "daysOfWeek": [
          "CN",
          "T2",
          "T3",
          "T4",
          "T5",
          "T6",
          "T7",
        ],
        "monthNames": [
          "Tháng 1",
          "Tháng 2",
          "Tháng 3",
          "Tháng 4",
          "Tháng 5",
          "Tháng 6",
          "Tháng 7",
          "Tháng 8",
          "Tháng 9",
          "Tháng 10",
          "Tháng 11",
          "Tháng 12"
        ],
        "firstDay": 1
      },
      startDate: date == null ? new Date(moment().toString()) : date,
      autoApply: true,
      alwaysShowCalendars: true,
      showDropdowns: true,
      singleDatePicker: true,
      timePicker: hasTime,
      timePicker24Hour: hasTime,
      timePickerIncrement:5,
      autoUpdateInput: false,
    }
  };
  public dateTimeOptionDaysUp = (date: Date, hasTime: boolean = false): any => {
    return {
      "locale": {
        "format": "DD/MM/YYYY HH:mm:ss",
        "separator": " - ",
        "applyLabel": "Đồng ý",
        "cancelLabel": "Hủy",
        "fromLabel": "Từ",
        "toLabel": "Tới",
        "customRangeLabel": "Tùy chọn",
        "weekLabel": "T",
        "daysOfWeek": [
          "CN",
          "T2",
          "T3",
          "T4",
          "T5",
          "T6",
          "T7",
        ],
        "monthNames": [
          "Tháng 1",
          "Tháng 2",
          "Tháng 3",
          "Tháng 4",
          "Tháng 5",
          "Tháng 6",
          "Tháng 7",
          "Tháng 8",
          "Tháng 9",
          "Tháng 10",
          "Tháng 11",
          "Tháng 12"
        ],
        "firstDay": 1
      },
      startDate: date == null ? new Date(moment().toString()) : date,
      autoApply: true,
      alwaysShowCalendars: true,
      showDropdowns: true,
      singleDatePicker: true,
      timePicker: hasTime,
      timePicker24Hour: hasTime,
      timePickerIncrement:5,
      autoUpdateInput: false,
      drops:'up',
    }
  };
  datepickerOpts = {
    startDate: new Date(1920, 1, 1),
    endDate: new Date(2050, 1, 1),
    autoclose: true,
    todayHighlight: true,
    assumeNearbyYear: true,
    format: 'dd/mm/yyyy',
    icon: 'fa fa-calendar',
    language: 'vi',
    placeholder: 'Chọn ngày',
    // orientation: 'bottom',
    enableOnReadonly: false
  }

  // public dateOptionMultis_new = (startDate: Date, endDate: Date): any => {
  //   return {
  //     "locale": {
  //       "format": "DD/MM/YYYY",
  //       "separator": " - ",
  //       "applyLabel": "Đồng ý",
  //       "cancelLabel": "Hủy",
  //       "fromLabel": "Từ",
  //       "toLabel": "Tới",
  //       "customRangeLabel": "Tùy chọn",
  //       "weekLabel": "T",
  //       "daysOfWeek": [
  //         "CN",
  //         "T2",
  //         "T3",
  //         "T4",
  //         "T5",
  //         "T6",
  //         "T7",
  //       ],
  //       "monthNames": [
  //         "Tháng 1",
  //         "Tháng 2",
  //         "Tháng 3",
  //         "Tháng 4",
  //         "Tháng 5",
  //         "Tháng 6",
  //         "Tháng 7",
  //         "Tháng 8",
  //         "Tháng 9",
  //         "Tháng 10",
  //         "Tháng 11",
  //         "Tháng 12"
  //       ],
  //       "firstDay": 1
  //     },
  //     "ranges": {
  //       /* 'Hôm nay': [moment().hours(0).minutes(0).seconds(0), moment().hours(23).minutes(59).seconds(59)],
  //       'Hôm qua': [moment().hours(0).minutes(0).seconds(0).subtract(1, 'days'), moment().hours(23).minutes(59).seconds(59).subtract(1, 'days')],
  //       '7 Ngày trước': [moment().hours(0).minutes(0).seconds(0).subtract(6, 'days'), moment().hours(23).minutes(59).seconds(59)],
  //       '30 Ngày trước': [moment().hours(0).minutes(0).seconds(0).subtract(29, 'days'), moment().hours(23).minutes(59).seconds(59)], */
  //       'Tháng hiện tại': [moment().hours(0).minutes(0).seconds(0).startOf('month'), moment().hours(23).minutes(59).seconds(59).endOf('month')],
  //       'Tháng trước': [moment().hours(0).minutes(0).seconds(0).subtract(1, 'month').startOf('month'), moment().hours(23).minutes(59).seconds(59).subtract(1, 'month').endOf('month')],
  //       'Năm nay': [moment([(new Date()).getFullYear(), 0, 1]).hours(0).minutes(0).seconds(0), moment().hours(0).minutes(0).seconds(0)],
  //       'Năm ngoái': [moment([(new Date()).getFullYear() - 1, 0, 1]).hours(0).minutes(0).seconds(0), moment([(new Date()).getFullYear() - 1, 11, new Date(((new Date()).getFullYear() - 1), 12, 0).getDate()]).hours(0).minutes(0).seconds(0)],
  //       'Tất cả thời gian': [moment([2022, 0, 1]).hours(0).minutes(0).seconds(0), moment().hours(23).minutes(59).seconds(59)]
  //     },
  //     autoApply: true,
  //     startDate: startDate == null ? new Date(moment().hours(0).minutes(0).toString()) : startDate,
  //     endDate: endDate == null ? new Date(moment().hours(23).minutes(59).toString()) : endDate,
  //     timePicker: true,
  //     timePicker24Hour: true,
  //   }
  //   // singleDatePicker: true,
  // }



  public dateOptionMultis = (startDate: Date, endDate: Date): any => {
    return {
      "locale": {
        "format": "DD/MM/YYYY",
        "separator": " - ",
        "applyLabel": "Đồng ý",
        "cancelLabel": "Hủy",
        "fromLabel": "Từ",
        "toLabel": "Tới",
        "customRangeLabel": "Tùy chọn",
        "weekLabel": "T",
        "daysOfWeek": [
          "CN",
          "T2",
          "T3",
          "T4",
          "T5",
          "T6",
          "T7",
        ],
        "monthNames": [
          "Tháng 1",
          "Tháng 2",
          "Tháng 3",
          "Tháng 4",
          "Tháng 5",
          "Tháng 6",
          "Tháng 7",
          "Tháng 8",
          "Tháng 9",
          "Tháng 10",
          "Tháng 11",
          "Tháng 12"
        ],
        "firstDay": 1
      },
      "ranges": {
        'Hôm nay': [moment().hours(0).minutes(0).seconds(0), moment().hours(23).minutes(59).seconds(59)],
        'Hôm qua': [moment().hours(0).minutes(0).seconds(0).subtract(1, 'days'), moment().hours(23).minutes(59).seconds(59).subtract(1, 'days')],
        '7 Ngày trước': [moment().hours(0).minutes(0).seconds(0).subtract(6, 'days'), moment().hours(23).minutes(59).seconds(59)],
        '30 Ngày trước': [moment().hours(0).minutes(0).seconds(0).subtract(29, 'days'), moment().hours(23).minutes(59).seconds(59)],
        'Tháng hiện tại': [moment().hours(0).minutes(0).seconds(0).startOf('month'), moment().hours(23).minutes(59).seconds(59).endOf('month')],
        'Tháng trước': [moment().hours(0).minutes(0).seconds(0).subtract(1, 'month').startOf('month'), moment().hours(23).minutes(59).seconds(59).subtract(1, 'month').endOf('month')],
        'Năm nay': [moment().hours(0).minutes(0).seconds(0).startOf('year'), moment().hours(23).minutes(59).seconds(59).endOf('year')],
        'Năm ngoái': [moment().hours(0).minutes(0).seconds(0).subtract(1, 'year').startOf('year'), moment().hours(23).minutes(59).seconds(59).subtract(1, 'year').endOf('year')],
        'Tất cả thời gian': [moment([2022, 0, 1]).hours(0).minutes(0).seconds(0), moment().hours(23).minutes(59).seconds(59)]
      },
      autoApply: true,
      startDate: startDate == null ? new Date(moment().hours(0).minutes(0).toString()) : startDate,
      endDate: endDate == null ? new Date(moment().hours(23).minutes(59).toString()) : endDate,
      timePicker: true,
      timePicker24Hour: true,
    }
  }

  public calendarOptionMultis = (startDate: Date, endDate: Date): any => {
    return {
      "locale": {
        "format": "DD/MM/YYYY",
        "separator": " - ",
        "applyLabel": "Đồng ý",
        "cancelLabel": "Hủy",
        "fromLabel": "Từ",
        "toLabel": "Tới",
        "customRangeLabel": "Tùy chọn",
        "weekLabel": "T",
        "daysOfWeek": [
          "CN",
          "T2",
          "T3",
          "T4",
          "T5",
          "T6",
          "T7",
        ],
        "monthNames": [
          "Tháng 1",
          "Tháng 2",
          "Tháng 3",
          "Tháng 4",
          "Tháng 5",
          "Tháng 6",
          "Tháng 7",
          "Tháng 8",
          "Tháng 9",
          "Tháng 10",
          "Tháng 11",
          "Tháng 12"
        ],
        "firstDay": 1
      },
      "ranges": {
        'Hôm nay': [moment().hours(0).minutes(0).seconds(0), moment().hours(23).minutes(59).seconds(59)],
        'Ngày mai': [moment().hours(0).minutes(0).seconds(0).add(1, 'days'), moment().hours(23).minutes(59).seconds(59).add(1, 'days')],
        'Tuần hiện tại': [moment().hours(0).minutes(0).seconds(0).weekday(1), moment().hours(23).minutes(59).seconds(59).weekday(7)],
        'Tuần sau': [moment().hours(0).minutes(0).seconds(0).weekday(8), moment().hours(23).minutes(59).seconds(59).weekday(14)],
        'Tuần trước': [moment().hours(0).minutes(0).seconds(0).weekday(-6), moment().hours(23).minutes(59).seconds(59).weekday(0)],
        'Tháng hiện tại': [moment().hours(0).minutes(0).seconds(0).startOf('month'), moment().hours(23).minutes(59).seconds(59).endOf('month')],
        'Tháng trước': [moment().hours(0).minutes(0).seconds(0).subtract(1, 'month').startOf('month'), moment().hours(23).minutes(59).seconds(59).subtract(1, 'month').endOf('month')],
        'Tất cả thời gian': [moment([2000, 0, 1]).hours(0).minutes(0).seconds(0), moment().hours(23).minutes(59).seconds(59)]
      },
      autoApply: true,
      startDate: startDate == null ? new Date(moment().hours(0).minutes(0).toString()) : startDate,
      endDate: endDate == null ? new Date(moment().hours(23).minutes(59).toString()) : endDate,
      timePicker: true,
      timePicker24Hour: true,
    }
  }
  public convertDateStringToYMD(date:string){
    return(date.substring(6)+date.substring(3,5)+ date.substring(0,2));
  }

 static ListGioiTinh = (): any[] => {
    let lstGioiTinh = [];
    lstGioiTinh.push({ id: "", text: "Giới tính" });
    lstGioiTinh.push({ id: "1", text: "Nam" });
    lstGioiTinh.push({ id: "0", text: "Nữ" });
    lstGioiTinh.push({ id: "2", text: "Khác" });
    return lstGioiTinh;
  }

 static listKhoGiay = (): any[] => {
    let listMayIns = [];
    listMayIns.push({ id: 'M1', text: 'Khổ M1' });
    listMayIns.push({ id: 'A4', text: 'Khổ A4' });
    listMayIns.push({ id: 'A5', text: 'Khổ A5' });
    listMayIns.push({ id: 'A4-N', text: 'Khổ A4 Ngang' });
    listMayIns.push({ id: 'A5-N', text: 'Khổ A5 Ngang' });
    return listMayIns;
  }

 static listKhoGiayHienThi = (): any[] => {
    let listMayIns = [];
    listMayIns.push({ id: 'M1', text: 'page m1' });
    listMayIns.push({ id: 'A4', text: 'page a4' });
    listMayIns.push({ id: 'A5', text: 'page a5' });
    listMayIns.push({ id: 'A4-N', text: 'page a4-ngang' });
    listMayIns.push({ id: 'A5-N', text: 'page a5-ngang' });
    return listMayIns;
  }

 static ListLoaiMauPhieu = (): any[] => {
    let listLoaiMauPhieus: any[] = [];
    listLoaiMauPhieus.push({ id: '1', text: 'Mẫu chung' });
    listLoaiMauPhieus.push({ id: '2', text: 'Phiếu nhập sản phẩm' });
    listLoaiMauPhieus.push({ id: '3', text: 'Phiếu xuất sản phẩm' });
    listLoaiMauPhieus.push({id: '30', text: 'Đơn đặt hàng'});
    listLoaiMauPhieus.push({id: '31', text: 'Phiếu nhập/ Giao hàng'});
    listLoaiMauPhieus.push({id: '32', text: 'Tồn kho sản phẩm'});
    listLoaiMauPhieus.push({ id:'33', text:'Thống kê đơn hàng' });
    listLoaiMauPhieus.push({ id:'34', text:'Thống kê chi tiết đơn hàng' });
    listLoaiMauPhieus.push({ id:'35', text:'Thống kê trạng thái sản xuất' });
    listLoaiMauPhieus.push({ id:'36', text:'Thống kê chi tiết đơn hàng theo giao hàng'});
    listLoaiMauPhieus.push({id:'37',text:'Phiếu mẫu xuất kho loại 2 '});
    listLoaiMauPhieus.push({ id: '38', text: 'Phiếu nhập/ giao hàng 2' });
    listLoaiMauPhieus.push({ id: '50', text: 'Phiếu thu' });
    listLoaiMauPhieus.push({ id: '51', text: 'Phiếu chi' });
    return listLoaiMauPhieus;
  }

  static ListNam = (): any[] => {
    let listNam: any[] = [];
    let nam = moment().get('year').toString();
    let n = Number.parseInt(nam);
    for (let i = 2012; i <= n + 10; i++) {
      listNam.push({ id: i, text: i.toString() });
    }
    return listNam;
  }

  static ListNamSinh = (): any[] => {
    let listNam: any[] = [];
    listNam.push({ id: 0, text: 'Năm..' });
    let nam = moment().get('year').toString();
    let n = Number.parseInt(nam);
    for (let i = n - 70; i <= n; i++) {
      listNam.push({ id: i, text: "" + i.toString() });
    }
    return listNam;
  }

  static ListThang = (): any[] => {
    let listThang: any[] = [];
    for (let i = 1; i <= 12; i++) {
      listThang.push({ id: i, text: i.toString() });
    }
    return listThang.sort(x => x.id);
  }

  static ListMonthName = (): any[] => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    let listThang: any[] = [];
    for (let i = 1; i <= 12; i++) {
      listThang.push({ id: i, text: monthNames[i - 1] });
    }
    return listThang.sort(x => x.id);
  }

  static ListNgay = (): any[] => {
    let listThang: any[] = [];
    for (let i = 1; i <= 31; i++) {
      listThang.push({ id: i.toString(), text: "" + i.toString() });
    }
    return listThang;
  }

  convertToRoman(num) {
    var roman = {
      M: 1000,
      CM: 900,
      D: 500,
      CD: 400,
      C: 100,
      XC: 90,
      L: 50,
      XL: 40,
      X: 10,
      IX: 9,
      V: 5,
      IV: 4,
      I: 1
    };
    var str = '';

    for (var i of Object.keys(roman)) {
      var q = Math.floor(num / roman[i]);
      num -= q * roman[i];
      str += i.repeat(q);
    }
    return str;
  }

  ReadNumber(num: number) {
    var arrNumber = [" không", " một", " hai", " ba", " bốn", " năm", " sáu", " bảy", " tám", " chín"];
    var temp = Math.floor(Math.abs(num));
    var result = "";
    if (Math.floor(num / 1000000000000) > 0)
      temp = num % 1000000000000;
    if (num == 0)
      result = arrNumber[0];
    while (temp > 0) {
      var arr = ["", " nghìn", " triệu", " tỷ"];
      var index = 0;
      while (temp > 0) {
        var block = temp % 1000;
        temp = Math.floor(temp / 1000);
        var str = "";
        if (block > 0) {
          var unit = block % 10;
          block = Math.floor(block / 10);
          var dozens = block % 10;
          block = Math.floor(block / 10);
          var hundreds = block % 10;
          block = Math.floor(block / 10);
          if (temp >= 1 || hundreds != 0)
            str += arrNumber[hundreds] + " trăm";
          if (dozens != 0 || unit != 0) {
            if (temp >= 1 || hundreds != 0 || dozens != 0) {
              if (dozens == 0)
                str += " lẻ";
              else if (dozens == 1)
                str += " mười";
              else
                str += arrNumber[dozens] + " mươi";
              if (unit == 4)
                if (dozens == 1)
                  str += arrNumber[unit];
                else
                  str += " tư";
              else if (unit == 5)
                str += " lăm";
              else if (unit == 1)
                if (dozens == 0 || dozens == 1)
                  str += arrNumber[unit];
                else
                  str += " mốt";
              else if (unit == 0)
                str += "";
              else
                str += arrNumber[unit];
            }
            else
              str += arrNumber[unit];
          }
          str += arr[index];
          result = str + result;
        }
        index++;
      }
      num = Math.floor(num / 1000000000000);
    }
    return result.trim().substring(0,1).toUpperCase() + result.trim().substring(1) + " đồng";
  }

  static listTrangThaiDuyets = (): any[] => {
    let listItems: any[] = [
      { id: "-2", text: "Từ chối B2" },
      { id: "-1", text: "Từ chối" },
      { id: "0", text: "Chuyển duyệt" },
      { id: "1", text: "Bước 1" },
      { id: "2", text: "Đã duyệt" },
      { id: "3", text: "Đã duyệt" },
      { id: "Locked", text: "Khóa" },
      { id: "Entity", text: "Khởi tạo" },
      { id: "Completed", text: "Đã chi" },
      { id: "Completed2", text: "Đã thu" },
      { id: "CHITIEN", text: "Đã chi" },
      { id: "THUTIEN", text: "Đã thu" },
      { id: "Chitien", text: "Đã chi" },
      { id: "Thutien", text: "Đã thu" },
      { id: "Paymented", text: "Thanh toán" },

    ];
    return listItems;
  }

  static listLableTrangThaiDuyets = (): any[] => {
    let listItems = [
      { id: "-2", text: "label label-danger" },
      { id: "-1", text: "label label-danger" },
      { id: "0", text: "label label-info" },
      { id: "1", text: "label label-warning" },
      { id: "2", text: "label label-success" },
      { id: "3", text: "label label-success" },
      { id: "Completed", text: "label label-primary" },
      { id: "Completed2", text: "label label-primary" },
      { id: "THUTIEN", text: "label label-primary" },
      { id: "CHITIEN", text: "label label-primary" },
      { id: "Thutien", text: "label label-primary" },
      { id: "Chitien", text: "label label-primary" },
      { id: "Paymented", text: "label label-success" },
      { id: "Locked", text: "label label-danger" },
      { id: "Entity", text: "label label-danger" },
    ];
    return listItems;
  }

  static listCurrencys = (): any[] => {
    let listItems = [
      { id: "VND", text: "VNĐ" },
      { id: "USD", text: "USD" },
      { id: "EUR", text: "EUR" },
      { id: "JPY", text: "JPY" },
      { id: "CNY", text: "CNY" },
      { id: "THB", text: "THB" }
    ];
    return listItems;
  }

  static listTypeTransportCategory = (): any[] => {
    let listType = [
      { id: 0, text: "Tất cả" },
      { id: 1, text: "Cảng/Bãi" },
    ];
    return listType;
  }
  
  static listTypePayment = (): any[] => {
    let listType = [
      { id: 0, text: "Có tạm ứng" },
      { id: 1, text: "Trực tiếp" },
    ];
    return listType;
  }
  
  static listLanguages = (): any[] => {
    let listType = [
      { id: 'ALL', text: "Tất cả" },
      { id: 'VN', text: "Tiếng Việt" },
      { id: 'EN', text: "English" },
    ];
    return listType;
  }

  static listQuotationSublist = (): any[] => {
    let listType = [
      { id: 0, text: "Tất cả" },
      { id: 1, text: "Về việc (Reference)" },
      { id: 2, text: "Nội dung" },
      { id: 3, text: "Điều khoản báo giá" },
      { id: 4, text: "Dịch vụ khác" },
      { id: 5, text: "Điều khoản dịch vụ" },
    ];
    return listType;
  }

  MaskTienTe = (Decimal: number): string => {
    if (Decimal != null) {
      return Decimal.toString().replace(/[.]+/g, '.');
    }
  }
  static mask0: string = "separator.0";
  static maskNumber: string = "separator.2";
  static mask3Number: string = "separator.3";

  static maskThapPhan: string = ".";

  static maskConfig: Partial<IConfig> = {
    validation: false,
    thousandSeparator: ',',
    allowNegativeNumbers: true,
  };

  UnMaskTienTe = (Decimal: string): number => {
    if (Decimal != null) {
      if (Decimal === "") {
        return null;
      }
      Decimal = Decimal.toString().replace(/[.]+/g, '');
      return parseFloat(Decimal.replace(/[,]+/g, '.'));
    }
    return null;
  }

  toDate(obj) {
    if (obj == null) {
      return null;
    }
    else {
      var str = obj.toString().trim();
      if (moment(str, 'D/M/YYYY', true).isValid() == true) {
        return str;
      }
      else {
        if (this.stringIsNumber(obj)) {
          var num = this.stringToNumber(obj);
          if (num > 25569) {
            return moment(new Date(Math.round((num - 25569) * 86400 * 1000))).format("DD/MM/YYYY");
          }
        }
        return "Invalid date";
      }
    }
  }

  toDateMonthYear(obj) {
    if (obj == null) {
      return null;
    }
    else {
      var str = obj.toString().trim();
      if (moment(str, 'M/YYYY', true).isValid() == true) {
        return str;
      }
      else {
        if (this.stringIsNumber(obj)) {
          var num = this.stringToNumber(obj);
          if (num > 25569) {
            return moment(new Date(Math.round((num - 25569) * 86400 * 1000))).format("MM/YYYY");
          }
        }
        return "Invalid date";
      }
    }
  }
  dateStringtoString(obj:string){
    if (obj == null) {
      return null;
    }
    var str=obj.substring(3,5)+'/'+obj.substring(0,2)+'/'+obj.substring(6,10);
    return str;
  }

  stringToNumber = (obj, allowNull = false): number => {
    if (allowNull && obj == null) {
      return null;
    }
    if (isNaN(obj)) {
      return 0;
    }
    return +obj;
  };

  stringIsNumber = (obj): boolean => {
    if (obj == null || obj == "") {
      return true;
    }
    obj = obj.toString().trim();
    if (isNaN(obj) || obj == "") {
      return false;
    }
    return true;
  };

  converTienTe = (value: number, oldTienTe: string, newTienTe: string): number => {
    let newValue: number = 0;
    if (value != null && value != 0) {
      if (oldTienTe == newTienTe) newValue = value;
      if (oldTienTe != newTienTe) {
        if (newTienTe == 'Dong') newValue = value * 1000000;
        if (newTienTe == 'Trieu') newValue = value / 1000000;
      }
    }
    return newValue;
  }

  valueIsNull = (obj): boolean => {
    if (obj == undefined || obj == null) {
      return true;
    }
    return false;
  }

  static setLocalParams(item: any,type:string='DELTACC'): void {
    localStorage.removeItem(type);
    localStorage.setItem(type, JSON.stringify(item));
  }

  static getLocalParams(type:string='DELTACC'): any {
      const cc = localStorage.getItem(type);
      if (cc != null) {
        return JSON.parse(cc);
      }
      return cc;
    }

    PrintPhieuThu(value: string = "", entity: any = {}): string {
      value = this.ReplaceNgayThang(value);
      value = value.replace(/{Ten_Cong_Ty}/gi, entity.TenCongTy);
      value = value.replace(/{Dia_Chi_Cong_Ty}/gi, entity.DiaChiCongTy);
      value = value.replace(/{Dien_Thoai_Cong_Ty}/gi, entity.DienThoaiCongTy);
      value = value.replace(/{Tong_Tien}/gi, this.VND(entity.TongTien));
      value = value.replace(/{Ten_Khach_Hang}/gi, entity.TenKhachHang);
      value = value.replace(/{Dia_Chi}/gi, entity.DiaChi==null?'':entity.DiaChi);
      value = value.replace(/{Dien_Thoai}/gi, entity.DienThoai==null?'':entity.DienThoai);
      value = value.replace(/{Noi_Dung}/gi, entity.NoiDung);
      value = value.replace(/{So_Phieu}/gi, entity.SoPhieu);
      value = value.replace(/{Ngay_Thu_Chi}/gi, entity.NgayThuChi);
      value = value.replace(/{Nguoi_Thu_Chi}/gi, entity.NguoiDoiUng);
      value = value.replace(/{Chung_Tu_So}/gi, entity.ChungTuSo==null?'':entity.ChungTuSo);
      value = value.replace(/{Ghi_Chu}/gi, entity.GhiChu==null?"":entity.GhiChu);
      value = value.replace(/{Ten_Quy}/gi, entity.TenQuy);
      value = value.replace(/{Tien_Te}/gi, entity.TienTe);
      value = value.replace(/{Thu_Quy}/gi, entity.ThuQuy);
      value = value.replace(/{Lap_Phieu}/gi, entity.LapPhieu);
      value = value.replace(/{Dai_Dien}/gi, entity.DaiDien);
      value = value.replace(/{Bang_Chu}/gi, this.ReadNumber(entity.TongTien));
      return value;
    }


    printDebitNote(value: string = "", entity: any = {}): string {
      let result = this.GetVongLap(value, "{Ten_Phi}");
      value = this.ReplaceNgayThang(value);
      value = value.replace(/{Ten_Cong_Ty}/gi, entity.TenCongTy);
      value = value.replace(/{Dia_Chi_Cong_Ty}/gi, entity.DiaChiCongTy);
      value = value.replace(/{MST_Cong_Ty}/gi, entity.MstCongty);
      value = value.replace(/{Accounts}/gi, entity.Accounts);
      value = value.replace(/{Bank}/gi, entity.Bank);
      value = value.replace(/{Dien_Thoai_CTy}/gi, entity.DienThoaiCongTy);
      value = value.replace(/{Fax_CTy}/gi, entity.FaxCongTy);
      value = value.replace(/{Ten_Khach_Hang}/gi, entity.TenKhachHang);
      value = value.replace(/{Dia_Chi_Khach_Hang}/gi, entity.DiaChiKhachHang??'');
      value = value.replace(/{Ma_So_Thue}/gi, entity.MaSoThue??'');
      value = value.replace(/{DebitNo}/gi, entity.DebitNo??'');
      value = value.replace(/{Ngay}/gi, entity.Ngay??'');
      value = value.replace(/{Loai_Hinh}/gi, entity.LoaiHinh??'');
      value = value.replace(/{HBill}/gi, entity.HBill??'');
      value = value.replace(/{Invoice_No}/gi, entity.InVoiceNo??'');
      value = value.replace(/{CDF_No}/gi, entity.CDFNo??'');
      value = value.replace(/{Luong_Hang}/gi, entity.LuongHang??'');
      value = value.replace(/{MBill}/gi, entity.MBill??'');
      value = value.replace(/{From}/gi, entity.From??'');
      value = value.replace(/{To}/gi, entity.To??'');
      value = value.replace(/{Hadg_Date}/gi, entity.HadgDate??'');
      value = value.replace(/{Ghi_Chu}/gi, entity.GhiChu??'');
      if (result.length > 0) {
        let i: number = 0;
        let sumVND: number = 0;
        let sumUSD: number = 0;
        let tempChiTiet: string = "";
        for (let item of entity.DebitChiTiets) {
          let temp = result;
          i++;
          temp = temp.replace(/{STT}/, i.toString());
          temp = temp.replace(/{Ten_Phi}/, item.TenPhi);
          temp = temp.replace(/{Don_Vi_Tinh}/, item.DonViTinh?? "");
          temp = temp.replace(/{So_Luong}/, item.SoLuong?? "");
          temp = temp.replace(/{Don_Gia}/, this.VND(item.DonGia));
          temp = temp.replace(/{So_Hoa_Don}/, item.SoHoaDon?? "");
          temp = temp.replace(/{So_Tien_VND}/, this.VND(item.VND));
          temp = temp.replace(/{So_Tien_USD}/, this.USD(item.USD));

          sumVND += item.VND;
          sumUSD += item.USD;
          tempChiTiet = tempChiTiet + temp;
        }
        value = value.replace(/{Tong_Tien}/gi, this.VND(sumVND));
        value = value.replace(/{Tong_Tien_USD}/gi, this.USD(sumUSD));
        if(sumUSD>0){
          const integerPart = Math.floor(sumUSD);
          const decimalPart = Math.round((sumUSD - integerPart) * 100);
          const integerWords = this.docso(integerPart);
          const decimalWords = this.docso(decimalPart);
          const tongbangchu=this.capitalizeFirstLetter(integerWords.trim())  + ' USD' + (decimalPart >0? decimalWords +' cents':'');
          value = value.replace(/{Bang_Chu}/gi, tongbangchu);
        }else{
          const integerWords = this.docso(sumVND);
          const tongbangchu=this.capitalizeFirstLetter(integerWords.trim()) +' đồng';
          value = value.replace(/{Bang_Chu}/gi, tongbangchu);
        }
        value = value.replace(result, tempChiTiet);
      }
      return value;
    }

    capitalizeFirstLetter(word: string): string {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }

    printPhieudau(value: string = "", entity: any = {}): string {
      value = value.replace(/{Ten_Khach_Hang}/gi, entity.TenKhachHang);
      value = value.replace(/{Ten_lai_xe}/gi, entity.Tenlaixe);
      value = value.replace(/{So_Phieu}/gi, entity.refNo);
      value = value.replace(/{Ngay}/gi, entity.Ngay);
      value = value.replace(/{Bks}/gi, entity.Bks);
      value = value.replace(/{So_Luong}/gi, entity.Soluong);
      value = value.replace(/{Don_gia}/gi, this.VND(entity.Dongia));
      value = value.replace(/{Thanh_tien}/gi, this.VND(entity.Thanhtien));
      value = value.replace(/{Ngay}/gi, entity.Ngay??'');
      value = value.replace(/{Thanh_toan}/gi, entity.Thanthoan??'');
      value = value.replace(/{Gia_tri}/gi, entity.Giatri??'');
      value = value.replace(/{Lap_phieu}/gi, entity.Lapphieu??'');
      value = value.replace(/{Gio}/gi, entity.Gio??'');
      return value;
    }


    ReplaceNgayThang(value: string = ""): string {
      value = value.replace(/{Hien_Tai_Ngay}/gi, moment().date().toString());
      value = value.replace(/{Hien_Tai_Thang}/gi, (moment().month() + 1).toString());
      value = value.replace(/{Hien_Tai_Nam}/gi, moment().year().toString());
      value = value.replace(/{Hien_Tai_Gio}/gi, moment().hour().toString());
      value = value.replace(/{Hien_Tai_Phut}/gi, moment().minute().toString());
      return value;
    }


    VND(valuenumber: number = 0,
      currencySign: string = '',//tên tiền tệ
      decimalLength: number = 2,
      chunkDelimiter: string = ',',
      decimalDelimiter: string = '.',
      chunkLength: number = 3): string {
      // debugger
      // console.log(value);
      if (valuenumber) {
        if (valuenumber != null) {
          // let valueString = value.toString().replace(/[.]+/g, '');
          let valueString = valuenumber.toString();
          valuenumber = parseFloat(valueString.replace(/[.]+/g, ','));
        }
        //value /= 100;
        let result = '\\d(?=(\\d{' + chunkLength + '})+' + (decimalLength > 0 ? '\\D' : '$') + ')'
        let num = valuenumber.toFixed(Math.max(0, ~~decimalLength));
        let so = currencySign + (decimalDelimiter ? num.replace(',', decimalDelimiter) : num).replace(new RegExp(result, 'g'), '$&' + chunkDelimiter);
        return so.replace('.00', '');
        // return so;
      }
      return "";
    }

    USD(valuenumber: number = 0,
      currencySign: string = '',//tên tiền tệ
      decimalLength: number = 2,
      chunkDelimiter: string = ',',
      decimalDelimiter: string = '.',
      chunkLength: number = 3): string {
      if (valuenumber) {
        if (valuenumber != null) {
          let valueString = valuenumber.toString();
          // valuenumber = parseFloat(valueString.replace(/[.]+/g, ','));
          valuenumber = parseFloat(valueString);
        }
        let result = '\\d(?=(\\d{' + chunkLength + '})+' + (decimalLength > 0 ? '\\D' : '$') + ')'
        let num = valuenumber.toFixed(Math.max(0, ~~decimalLength));
        let so = currencySign + (decimalDelimiter ? num.replace(',', decimalDelimiter) : num).replace(new RegExp(result, 'g'), '$&' + chunkDelimiter);
        // return so.replace('.00', '');
        return so;
      }
      return "";
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

    // Đoạn này sẽ dùng để đổi số thành chữ tiếng việt
    mangso: string[] = ['không','một','hai','ba','bốn','năm','sáu','bảy','tám','chín'];

     dochangchuc(so: number, daydu: boolean): string {
      let chuoi: string = "";
      const chuc: number = Math.floor(so/10);
      const donvi: number = so%10;
      
      if (chuc>1) {
        chuoi = " " + this.mangso[chuc] + " mươi";
        if (donvi==1) {
          chuoi += " mốt";
        }
      } else if (chuc==1) {
        chuoi = " mười";
        if (donvi==1) {
          chuoi += " một";
        }
      } else if (daydu && donvi>0) {
        chuoi = " lẻ";
      }
      
      if (donvi==5 && chuc>1) {
        chuoi += " lăm";
      } else if (donvi>1||(donvi==1&&chuc==0)) {
        chuoi += " " + this.mangso[donvi];
      }
      
      return chuoi;
    }
    
    docblock(so: number, daydu: boolean): string {
      let chuoi: string = "";
      const tram: number = Math.floor(so/100);
      so = so%100;
      
      if (daydu || tram>0) {
        chuoi = " " + this.mangso[tram] + " trăm";
        chuoi += this.dochangchuc(so,true);
      } else {
        chuoi = this.dochangchuc(so,false);
      }
      
      return chuoi;
    }
    
    dochangtrieu(so: number, daydu: boolean): string {
      let chuoi: string = "";
      const trieu: number = Math.floor(so/1000000);
      so = so%1000000;
      
      if (trieu>0) {
        chuoi = this.docblock(trieu,daydu) + " triệu";
        daydu = true;
      }
      
      const nghin: number = Math.floor(so/1000);
      so = so%1000;
      
      if (nghin>0) {
        chuoi += this.docblock(nghin,daydu) + " nghìn";
        daydu = true;
      }
      
      if (so>0) {
        chuoi += this.docblock(so,daydu);
      }
      return chuoi;
    }
    
    docso(so: number): string {
      if (so==0) return this.mangso[0];
      let chuoi: string = "";
      let hauto: string = "";
      
      do {
        const ty: number = so%1000000000;
        so = Math.floor(so/1000000000);
        
        if (so>0) {
          chuoi = this.dochangtrieu(ty,true) + hauto + chuoi;
        } else {
          chuoi = this.dochangtrieu(ty,false) + hauto + chuoi;
        }
        
        hauto = " tỷ";
      } while (so>0);
      
      return chuoi;
    }

 ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
 teens = ['', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
 tens = ['', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

convertToWords(number: number): string {
    if (number === 0) {
        return 'zero';
    }

    const integerPart = Math.floor(number);
    const decimalPart = Math.round((number - integerPart) * 100);
    const integerWords = this.convertNumber(integerPart);
    const decimalWords = this.convertNumber(decimalPart);

    let result = integerWords;
    result +=' USD'
    if (decimalPart > 0) {
        result += ` and ${decimalWords} cents`;
    }

    return result;
}

convertNumber(number: number): string {
    if (number < 10) {
        return this.ones[number];
    } else if (number >= 11 && number <= 19) {
        return this.teens[number - 10];
    } else if (number >= 10 && number % 10 === 0) {
        return this.tens[number / 10];
    } else if (number >= 20 && number <= 99) {
        return `${this.tens[Math.floor(number / 10)]} ${this.ones[number % 10]}`;
    } else if (number >= 100 && number <= 999) {
        return `${this.ones[Math.floor(number / 100)]} hundred ${this.convertNumber(number % 100)}`;
    } else if (number >= 1000 && number <= 999999) {
        return `${this.convertNumber(Math.floor(number / 1000))} thousand ${this.convertNumber(number % 1000)}`;
    } else {
        return 'Number out of range';
    }
  } 
  //Làm tròn 2 dấu thập phân
  round2(number:number):number{
    if(number!=0){
      return (Math.round(number*100))/100
    }
  }

  //Kiểm tra xem thời gian nhập vào có quá n ngày so với thời điểm hiện tại (không kể chủ nhật) không
  public checkWorkingDaysExceeded(inputDate: Date, n: number): boolean {
    const currentDate = new Date(); // Ngày hiện tại
    let workingDays = 0;
  
    let tempDate = new Date(inputDate);
  
    // Lặp qua từng ngày từ acceptedDate đến currentDate
    while (tempDate <= currentDate) {
      const dayOfWeek = tempDate.getDay();
  
      // Nếu không phải Chủ Nhật (dayOfWeek !== 0), tăng số ngày làm việc
      if (dayOfWeek !== 0) {
        workingDays++;
      }
  
      // Nếu số ngày làm việc > n, trả về true ngay lập tức
      if (workingDays > n) {
        return true;
      }
  
      // Chuyển sang ngày tiếp theo
      tempDate.setDate(tempDate.getDate() + 1);
    }
  
    // Sau khi kiểm tra, nếu số ngày làm việc <= n, trả về false
    return false;
  }

  public formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getFullYear()}`;
  }
  
  public roundNumber0(value: any): number {
    return value ? Math.round(Number(value)) : 0;
  }
  
}
