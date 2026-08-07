import { HttpClient } from "@angular/common/http";
import { Component, EventEmitter, Output, ViewChild } from "@angular/core";
import { ResponseValue } from "@app/shared/models";
import { environment } from "@environments/environment";
import * as moment from "moment";
import { ModalDirective } from "ngx-bootstrap/modal";
import { of } from "rxjs";
import { catchError } from "rxjs/operators";

interface EupTollDetail {
  startId?: number;
  startName?: string;
  startTime?: string;
  endId?: number;
  endName?: string;
  endTime?: string;
  cost?: number;
  vehicleNo?: string;
}

interface EupTollResult {
  vehicleNo?: string;
  startTime?: string;
  endTime?: string;
  details?: EupTollDetail[];
  resultCode?: number;
  resultMsg?: string;
}

// Đối chiếu phí cầu đường qua EUP (GetTollFee) cho 1 lệnh FCL đã có đủ T/g bắt đầu + kết thúc —
// gọi từ list dispatch-order-fcl-new và từ phần ETC trong modal-dispatch-order-fcl-v2 (2026-08-07).
@Component({
  selector: "modal-eup-toll-check",
  templateUrl: "./modal-eup-toll-check.component.html",
  styleUrls: ["./modal-eup-toll-check.component.css"],
})
export class ModalEupTollCheckComponent {
  vehiclePlate: string;
  startedDate: any;
  finishedDate: any;
  listDetails: EupTollDetail[] = [];
  errorMsg: string;
  loaded = false;
  busy: any;

  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalEupTollCheck", { static: false }) modalEupTollCheck: ModalDirective;

  constructor(private _http: HttpClient) {}

  show(vehiclePlate: string, startedDate: any, finishedDate: any) {
    this.vehiclePlate = vehiclePlate;
    this.startedDate = startedDate;
    this.finishedDate = finishedDate;
    this.listDetails = [];
    this.errorMsg = null;
    this.loaded = false;
    this.modalEupTollCheck.show();
    this.loadData();
  }

  get totalCost(): number {
    return (this.listDetails || []).reduce((sum, d) => sum + (d.cost || 0), 0);
  }

  loadData() {
    if (!this.vehiclePlate) {
      this.errorMsg = "Lệnh chưa có biển số xe.";
      this.loaded = true;
      return;
    }
    const startTime = moment(this.startedDate).format("YYYY-MM-DD HH:mm:ss");
    const endTime = moment(this.finishedDate).format("YYYY-MM-DD HH:mm:ss");
    this.busy = this._http
      .post<ResponseValue<EupTollResult[]>>(`${environment.apiUrl}/api/Eupfin/GetTollFee`, {
        carNumbers: [this.vehiclePlate],
        startTime,
        endTime,
      })
      .pipe(catchError(() => of(null)))
      .subscribe((res) => {
        this.loaded = true;
        if (!res || res.code !== "200") {
          this.errorMsg = res?.message || "Không lấy được dữ liệu từ EUP.";
          return;
        }
        const item = (res.data || [])[0];
        if (!item || item.resultCode !== 0) {
          this.errorMsg = item?.resultMsg || "Không tìm thấy dữ liệu qua trạm của xe này trong khoảng thời gian đã chọn.";
          return;
        }
        this.listDetails = item.details || [];
      });
  }

  OnHidden() {
    this.CloseModal.emit();
  }
}
