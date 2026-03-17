import { map } from 'rxjs/operators';
import { HttpClient, HttpParams } from "@angular/common/http";
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { MessageContstants } from "@app/shared/constants";
import {
  Branch,
  DebitNoteDetail,
  ExportInvoiceDetail,
  Fee,
  PaymentDetail,
  ResponseValue,
} from "@app/shared/models";
import {
  FeeService,
  NotificationService,
  UtilityService,
} from "@app/shared/services";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Observable, Subscription } from "rxjs";
import * as XLSX from "xlsx";
import { RemoteConfigService } from '@app/shared/services/systems/remote-config.service';

@Component({
  selector: "modal-import-excel",
  templateUrl: "./modal-import-excel.component.html",
  styleUrls: ["./modal-import-excel.component.css"],
})
export class ModalImportExcelComponent implements OnInit {
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public listPaymentDetails: PaymentDetail[] = [];
  public listDebitNoteDetails: DebitNoteDetail[] = [];
  public listInvoiceDetails: ExportInvoiceDetail[] = [];
  public templateDebit: any[] = [];
  public busy: Subscription;
  sheets: string[] = []; // Danh sách các sheets
  selectedSheet: string = ""; // Sheet được chọn
  data: any[] = []; // Dữ liệu từ sheet
  workbook: XLSX.WorkBook | null = null; // Lưu workbook sau khi đọc file
  selectedColumns: any[] = []; // Các cột cần lấy dữ liệu
  _sheetSelected: string = "";
  public type = 0;
  _startRow = 1;
  listFee: Fee[] = [];
  listBranch: Branch[] = [];
  mask0 = UtilityService.mask0;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalAddEdit", { static: false }) modalAddEdit: ModalDirective;
  constructor(
    private _notificationService: NotificationService,
    private http: HttpClient,
    private feeService: FeeService,
    private remoteConfigService: RemoteConfigService
  ) { }

  ngOnInit(): void {
    this.loadFee();
    this.loadFeePayment();
    this.getBranch().subscribe((data) => {
      this.listBranch = data.listBranch.map((x) => {
        return {
          id: x.id,
          branchCode: x.code,
          branchName: x.branchName,
          status: x.status,
        };
      });
    });
  }
  public getBranch(): Observable<any> {
    return this.http.get("./assets/data/branch.json");
  }
  loadFee(): void {
    const params = new HttpParams();
    this.feeService.getAll(params).subscribe((res: ResponseValue<Fee[]>) => {
      const filtered = res.data?.filter(
        (_) =>
          _.groupCode == "DT01" ||
          _.groupCode == "CP03" ||
          _.groupCode == "DT03"
      ) || [];
      // Create a new array with copied objects to prevent cache mutation
      this.listFee = filtered.map(fee => ({
        ...fee,
        feeName: fee.feeCode + "-" + fee.feeName
      }));
    });
  }

  listFeePayment: Fee[] = [];

  loadFeePayment(): void {
    const params = new HttpParams();
    this.feeService.getAll(params).subscribe((res: ResponseValue<Fee[]>) => {
      const filtered = res.data?.filter(
        (_) =>
          _.groupCode == "CP01" ||
          _.groupCode == "CP03" ||
          _.groupCode == "CP02"
      ) || [];
      // Create a new array with copied objects to prevent cache mutation
      this.listFeePayment = filtered.map(fee => ({
        ...fee,
        feeName: fee.feeCode + "-" + fee.feeName
      }));
    });
  }
  public getDebit(): Observable<any> {
    return this.http.get("./assets/data/importdebitnotetemplate.json");
  }
  public getPayment(): Observable<any> {
    return this.http.get("./assets/data/importpaymenttemplate.json");
  }
  public getInvoice(): Observable<any> {
    return this.http.get("./assets/data/importinvoicetemplate.json");
  }

  view(type: number) {
    this.type = type;
    const importDebit = localStorage.getItem('IDEBIT');
    const importPayment = localStorage.getItem('IPAYMENT');
    const importInvoice = localStorage.getItem('INVOICE');
    console.log(importInvoice);

    if (type == 0) {
      //Kiểm tra xem trong localstorage có không
      if (!importDebit)
        //Nếu là debit
        this.getDebit().subscribe((data) => {
          this.templateDebit = data.list;
        }); else {
        this.templateDebit = JSON.parse(importDebit);
      }

    } else if (type == 1) {
      if (!importPayment)
        this.getPayment().subscribe((data) => {
          this.templateDebit = data.list;
        }); else {
        this.templateDebit = JSON.parse(importPayment);
      }
    } else if (type == 2) {
      if (!importInvoice || importInvoice == 'undefined')
        this.getInvoice().subscribe((data) => {
          this.templateDebit = data.list;
        }); else {
        this.templateDebit = JSON.parse(importInvoice);
      }
    }
    this.modalAddEdit.show();
  }

  onFileChange(event: any): void {
    const target: DataTransfer = <DataTransfer>event.target;

    if (target.files.length !== 1) {
      console.error("Chỉ chọn 1 file");
      return;
    }

    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      /* Đọc dữ liệu từ file */
      const bstr: string = e.target.result;
      this.workbook = XLSX.read(bstr, { type: "binary" });

      /* Lấy danh sách các sheets */
      this.sheets = this.workbook.SheetNames;
      if (this.sheets?.length > 0) this._sheetSelected = this.sheets[0];
    };

    reader.readAsBinaryString(target.files[0]);
  }
  default() {
    if (this.type == 0) {
      localStorage.removeItem('IDEBIT');
      this.getDebit().subscribe((data) => {
        this.templateDebit = data.list;
      })
    } else if (this.type == 1) {
      localStorage.removeItem('IPAYMENT');
      this.getPayment().subscribe((data) => {
        this.templateDebit = data.list;
      })
    } else if (this.type == 2) {
      localStorage.removeItem('INVOICE');
      this.getDebit().subscribe((data) => {
        this.templateDebit = data.list;
      })
    }
  }

  import() {
    if (!this.workbook) {
      this._notificationService.printErrorMessage("Lỗi mở file excel!");
      return;
    } else {
      const ws: XLSX.WorkSheet = this.workbook.Sheets[this._sheetSelected];
      /* Chuyển đổi dữ liệu sang JSON */
      const data = <any>(
        XLSX.utils.sheet_to_json(ws, { header: 1 }).slice(this._startRow - 1).map((row: any[]) =>
          row.map((cell: any) => (cell === null || cell === undefined ? '' : cell))
        )
      );

      switch (this.type) {
        case 0: //Debit
          for (let i = 0; i < data.length; i++) {
            // Bỏ qua dòng tiêu đề
            const row = data[i];
            const debitNoteDetail: DebitNoteDetail = { tempId: i + 1 };
            // Duyệt qua cấu hình và ánh xạ gồm 14 cột
            for (let j = 0; j < 15; j++) {
              //Nếu giá trị cột được set tương ứng
              if (this.templateDebit[j]?.value?.trim().length > 0) {
                const columnIndex = XLSX.utils.decode_col(
                  this.templateDebit[j]?.value?.trim().toUpperCase()
                ); // Lấy chỉ số cột từ ký tự
                const columnValue = row[columnIndex] ?? ''; // Lấy giá trị tại cột tương ứng
                debitNoteDetail[this.templateDebit[j].code] = columnValue;
              }
            }
            if (debitNoteDetail.feeCode)
              this.listDebitNoteDetails.push(debitNoteDetail);
          }
          //thêm id phí vào tương ứng với mã phí
          this.listDebitNoteDetails.forEach((item) => {
            let feeid = this.listFee.find((x) => x.feeCode == item.feeCode)?.id;
            if (feeid) {
              item.feeId = feeid;
            }
            //Kiểm tra nếu tiền tệ trống thì tự điền VND
            if (!item.currency || item.currency?.length == 0) {
              item.currency = "VND";
            }
            //Nếu có số lượng và đơn giá thì tính luôn thành tiên
            if (item.quantity && item.price) {
              item.amount = item.quantity * item.price;
              if (item.rVat) {
                item.vat = (item.amount * item.rVat) / 100;
                item.amountAfterVAT = item.amount + item.vat;
              }
            } else {
              if (item.amount) {
                if (item.rVat) {
                  item.vat = (item.amount * item.rVat) / 100;
                  item.amountAfterVAT = item.amount + item.vat;
                }
              }
            }
          });
          localStorage.setItem('IDEBIT', JSON.stringify(this.templateDebit));
          this.SaveSuccess.emit(this.listDebitNoteDetails);
          this.modalAddEdit.hide();
          break;
        case 1: //Payment
          for (let i = 0; i < data.length; i++) {
            // Bỏ qua dòng tiêu đề
            const row = data[i];
            const paymentDetail: PaymentDetail = { tempId: i + 1 };
            // Duyệt qua cấu hình và ánh xạ gồm 14 cột
            for (let j = 0; j < 15; j++) {
              //Nếu giá trị cột được set tương ứng
              if (this.templateDebit[j]?.value?.trim().length > 0) {
                const columnIndex = XLSX.utils.decode_col(
                  this.templateDebit[j]?.value?.trim().toUpperCase()
                ); // Lấy chỉ số cột từ ký tự
                const columnValue = row[columnIndex] ?? ''; // Lấy giá trị tại cột tương ứng
                paymentDetail[this.templateDebit[j].code] = columnValue;
              }
            }
            if (paymentDetail.feeCode)
              this.listPaymentDetails.push(paymentDetail);
          }
          //thêm id phí vào tương ứng với mã phí
          this.listPaymentDetails.forEach((item) => {
            let feeid = this.listFeePayment.find((x) => x.feeCode == item.feeCode)?.id;
            if (feeid) {
              item.feeId = feeid;
            }
            let branchId = this.listBranch.find((x) => x.branchCode == item.branchCode?.trim())?.id;
            if (branchId) {
              item.branchId = branchId;
            }
            item.hasInvoice = item.jobId === 'C' ? 1 : 0;
            //Kiểm tra nếu tiền tệ trống thì tự điền VND
            if (!item.currency || item.currency?.length == 0) {
              item.currency = "VND";
            }
            //Nếu có số tiền và VAT thì  và đơn giá thì tính luôn thành tiên
            if (item.amount) {
              if (item.vat) {
                item.amountAfterVAT = item.amount + item.vat;
              } else item.amountAfterVAT = item.amount;
            }
          });
          localStorage.setItem('IPAYMENT', JSON.stringify(this.templateDebit));
          this.SaveSuccess.emit(this.listPaymentDetails);
          this.modalAddEdit.hide();
          break;
        case 2: //Invoice

          for (let i = 0; i < data.length; i++) {
            // Bỏ qua dòng tiêu đề
            const row = data[i];
            const item: ExportInvoiceDetail = { tempId: i + 1 };
            // Duyệt qua cấu hình và ánh xạ gồm 14 cột
            for (let j = 0; j < this.templateDebit.length; j++) {
              //Nếu giá trị cột được set tương ứng
              if (this.templateDebit[j]?.value?.trim().length > 0) {
                const cellRef = this.templateDebit[j]?.value?.trim().toUpperCase();
                if (cellRef) {
                  let combinedValue = '';
                  // Nếu có nhiều cột ngăn cách bằng dấu ;
                  if (cellRef.includes(';')) {
                    const columns = cellRef.split(';');
                    combinedValue = columns.map(col => {
                      const colIndex = XLSX.utils.decode_col(col);
                      return row[colIndex] ?? '';
                    }).join(' - ');
                  } else {
                    // Nếu chỉ có 1 cột
                    const colIndex = XLSX.utils.decode_col(cellRef);
                    combinedValue = row[colIndex] ?? '';
                  }
                  // Gán vào field tương ứng
                  item[this.templateDebit[j].code] = combinedValue;
                }
              }
              item['tt'] = item.tempId.toString();
            }
            this.listInvoiceDetails.push(item);
          }
          localStorage.setItem('INVOICE', JSON.stringify(this.templateDebit));
          this.SaveSuccess.emit(this.listInvoiceDetails);
          this.modalAddEdit.hide();
          break;
      }
    }
  }

  OnHidden() {
    this.CloseModal.emit();
  }
}
