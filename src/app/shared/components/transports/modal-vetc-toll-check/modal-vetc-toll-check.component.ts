import { Component, EventEmitter, Output, ViewChild } from "@angular/core";
import { VetcApiService } from "@app/shared/services/transports/vetc-api.service";
import { ModalDirective } from "ngx-bootstrap/modal";

interface VetcEstimated {
  tollStationName?: string;
  totalCost?: number;
  isPassed?: boolean;
}
interface VetcCloseStage {
  stageName?: string;
  priceAmount?: number;
}
interface VetcCloseTrip {
  fromToll?: string;
  toToll?: string;
  checkinDatetime?: string;
  checkoutDatetime?: string;
  totalAmount?: number;
  chargeStatus?: string;
  stages?: VetcCloseStage[];
}
interface VetcOpenTrip {
  tollName?: string;
  transportDateTime?: string;
  priceAmount?: number;
  chargeStatus?: string;
}
interface VetcCompareResult {
  refNo?: string;
  vehiclePlate?: string;
  periodFrom?: string;
  periodTo?: string;
  estimated?: VetcEstimated[];
  actualClose?: VetcCloseTrip[];
  actualOpen?: VetcOpenTrip[];
}

// Đối chiếu ETC thực tế VETC (Phase 1, 2026-09-25) — modal inline, cùng khuôn với modal-eup-toll-check.
// Chỉ gọi BE VetcApiController.CompareByRefNo bằng RefNo; BE tự tra biển số + khung thời gian lệnh.
@Component({
  selector: "modal-vetc-toll-check",
  templateUrl: "./modal-vetc-toll-check.component.html",
  styleUrls: ["./modal-vetc-toll-check.component.css"],
})
export class ModalVetcTollCheckComponent {
  refNo: string;
  result: VetcCompareResult = null;
  errorMsg: string;
  loaded = false;
  busy: any;

  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalVetcTollCheck", { static: false }) modalVetcTollCheck: ModalDirective;

  constructor(private _service: VetcApiService) {}

  show(refNo: string) {
    this.refNo = refNo;
    this.result = null;
    this.errorMsg = null;
    this.loaded = false;
    this.modalVetcTollCheck.show();
    this.loadData();
  }

  get totalActualClose(): number {
    return (this.result?.actualClose || []).reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  }

  get totalActualOpen(): number {
    return (this.result?.actualOpen || []).reduce((sum, t) => sum + (t.priceAmount || 0), 0);
  }

  loadData() {
    if (!this.refNo) {
      this.errorMsg = "Lệnh chưa có số lệnh (RefNo).";
      this.loaded = true;
      return;
    }
    this.busy = this._service.compareByRefNo(this.refNo).subscribe(
      (res: any) => {
        this.loaded = true;
        if (!res || res.code === "204") {
          this.errorMsg = "Không tìm thấy lệnh với RefNo này.";
          return;
        }
        if (res.code !== "200") {
          this.errorMsg = res.message || "Không lấy được dữ liệu từ VETC.";
          return;
        }
        this.result = res.data;
      },
      () => {
        this.loaded = true;
        this.errorMsg = "Không lấy được dữ liệu từ VETC.";
      }
    );
  }

  OnHidden() {
    this.CloseModal.emit();
  }
}
