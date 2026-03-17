import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { DebitNotes, ResponseValue, Shipment } from "@app/shared/models";
import {
  DebitNotesService,
  NotificationService,
  ShipmentService,
} from "@app/shared/services";
import { ModalDirective } from "ngx-bootstrap/modal";
import * as XLSX from "xlsx";
import * as moment from "moment";
@Component({
  selector: "modal-debit-note-zero",
  templateUrl: "./modal-debit-note-zero.component.html",
  styleUrls: ["./modal-debit-note-zero.component.css"],
})
export class ModalDebitNoteZeroComponent implements OnInit {
  public listFiles: {
    jobId: string;
    dk: string;
    id: number;
    branchId: number;
    isDebit: boolean;
    status: string;
  }[] = [];
  isFileSelected = false;
  fileSelected = "";
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalAttachFiles", { static: false })
  modalAttachFiles: ModalDirective;
  busy: any;
  constructor(
    private _notificationService: NotificationService,
    private debitNotesService: DebitNotesService,
    private shipmentService: ShipmentService
  ) {}

  ngOnInit(): void {}

  view() {
    this.modalAttachFiles.show();
  }

  data: any[] = []; // Array to store Excel data
  onFileChange(event: any): void {
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) {
      throw new Error("Cannot upload multiple files");
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: "binary" });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      this.data = XLSX.utils.sheet_to_json(ws, { range: 5 });
      this.data.forEach((item) => {
        this.listFiles.push({
          jobId: item["JobId"],
          dk: null,
          id: null,
          branchId: null,
          isDebit: null,
          status: "",
        });
      });
    };
    reader.readAsBinaryString(target.files[0]);
  }
  OnHidden() {
    this.CloseModal.emit();
  }
  _thongTinLoHang: string = "";
  _luongHang: string = "";

  getThongTinJob(item: Shipment): void {
    if (item) {
      this._thongTinLoHang = "";
      item.cdsNumber &&
        (this._thongTinLoHang +=
          (this._thongTinLoHang.length > 0 ? "--" : "") +
          "Tờ khai: " +
          item.cdsNumber);
      item.bookingNo &&
        (this._thongTinLoHang +=
          (this._thongTinLoHang.length > 0 ? "--" : "") +
          "Booking: " +
          item.bookingNo);
      item.hawB_HBL &&
        (this._thongTinLoHang +=
          (this._thongTinLoHang.length > 0 ? "--" : "") +
          "HBill: " +
          item.hawB_HBL);
      item.invoiceNo &&
        (this._thongTinLoHang +=
          (this._thongTinLoHang.length > 0 ? "--" : "") +
          "Invoice: " +
          item.invoiceNo);
      item.shipmentTypeName &&
        (this._thongTinLoHang +=
          (this._thongTinLoHang.length > 0 ? "--" : "") +
          "Loại hình: " +
          item.shipmentTypeName);
      this._luongHang = "";
      if (item.weight && item.weight > 0)
        this._luongHang += "GW: " + item.weight.toString();
      if (item.volume && item.volume > 0)
        this._luongHang +=
          (this._luongHang.length > 0 ? " -Cbm: " : "Cbm: ") +
          item.volume.toString();
      if (item.conts)
        this._luongHang +=
          (this._luongHang.length > 0 ? " -Cont: " : "Cont: ") + item.conts;
      if (item.cartons && item.cartons > 0)
        this._luongHang +=
          (this._luongHang.length > 0 ? " -Pkg: " : "Pkg: ") +
          item.cartons.toString();
      if (item.pallets && item.pallets > 0)
        this._luongHang +=
          (this._luongHang.length > 0 ? " -Plt: " : "Plt: ") +
          item.pallets.toString();
    }
  }
  createDebitNote(): void {
   // let isDone=true;
   // let i=0;
   // while (i<this.listFiles.length && isDone)
    if (this.listFiles?.length > 0) {
      this.listFiles.forEach((item) => {
        //get thông tin shipment
        this.shipmentService.getByJobId(item.jobId).subscribe((res:ResponseValue<Shipment>) => {
          if (res.code == "200" || res.code == "201") {
            let value = res.data;
            item.status = "";
            item.branchId = value.branchId;
            item.id = value.id;
            item.dk = value.customerCode;
            item.isDebit = value.isDebited;
            this.getThongTinJob(value);
            let entity: DebitNotes = {
              status: true,
              step: 1,
              branchId: item.branchId,
              debitBranchId: item.branchId,
              employeeId: value.employeeId,
              customerId: value.customerId,
              shipmentId: value.id,
              type: 0,
              refDate: moment(value.jobDate).format("YYYYMMDD"),
              debitDate: moment(value.jobDate).format("YYYYMMDD"),
              jobId: item.jobId,
              notes: "Debit = 0",
              totalAmount: 0,
              debitType: value.shipmentTypeName,
              quantityOfGgoods: this._luongHang,
              debitNoteDetails: [],createdBy: value.createdBy
            };
            entity.debitNoteDetails.push({
              feeId: 1115,
              contents: "Debit=0",
              amount: 0,
              vat: 0,
              amountAfterVAT: 0,
              tempId: 1,
              price: 0,
              rVat: 10,
              currency: "VND",
            });
            // debugger;
            if (!item.isDebit) {
              this.debitNotesService
                .add(entity)
                .subscribe((res: ResponseValue<any>) => {
                  if (res.code == "200" || res.code == "201") {
                    // frm.resetForm();
                    item.status = "Done";
                  } else {
                    item.status = "Eror";
                  }
                });
            }
          }
        });
      });
    }
  }
}
