import { Component, EventEmitter, Output, ViewChild } from "@angular/core";
import { ResponseValue } from "@app/shared/models";
import { DispatchOrderFcl, DispatchOrderFclHistory } from "@app/shared/models/fcl/dispatch-order-fcl";
import { NotificationService } from "@app/shared/services";
import { DispatchOrderFclService } from "@app/shared/services/fcl/dispatch-order-fcl.service";
import { ModalDirective } from "ngx-bootstrap/modal";

// Lịch sử đổi trạng thái (kể cả từ chối) của 1 lệnh FCL — đọc lại DispatchOrderFCLHistory
// (BE đã trả sẵn qua getbyrefno/GetByRefNoWithTO, FE trước giờ chưa hiển thị ở đâu, 2026-08-06).
@Component({
  selector: "modal-fcl-history",
  templateUrl: "./modal-fcl-history.component.html",
})
export class ModalFclHistoryComponent {
  refNo: string;
  listHistory: DispatchOrderFclHistory[] = [];
  busy: any;

  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalFclHistory", { static: false }) modalFclHistory: ModalDirective;

  constructor(
    private dispatchOrderFclService: DispatchOrderFclService,
    private notificationService: NotificationService
  ) {}

  show(refNo: string) {
    this.refNo = refNo;
    this.listHistory = [];
    this.modalFclHistory.show();
    this.loadData();
  }

  loadData() {
    if (!this.refNo) return;
    this.busy = this.dispatchOrderFclService.getDetail(this.refNo).subscribe(
      (res: ResponseValue<DispatchOrderFcl>) => {
        if (res.code == "200" || res.code == "201") {
          const list = res.data?.listHistory || [];
          // Mới nhất lên trên — xem nhanh lý do từ chối gần nhất trước tiên.
          this.listHistory = list.slice().sort(
            (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
          );
        } else {
          this.notificationService.printErrorMessage("Không tải được lịch sử lệnh.");
        }
      },
      () => this.notificationService.printErrorMessage("Không tải được lịch sử lệnh.")
    );
  }

  OnHidden() {
    this.CloseModal.emit();
  }
}
