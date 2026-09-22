import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '@app/shared/services';
import { VetcApiService } from '@app/shared/services/transports/vetc-api.service';
import { MessageContstants } from '@app/shared/constants';
import { NgxSpinnerService } from 'ngx-spinner';

// Đối chiếu ETC thực tế (Phase 1, 2026-09-22): xem song song ETC ước tính của 1 lệnh FCL
// (DispatchOrderFCLEtc, sinh từ Vietmap) với giao dịch thực tế VETC ghi nhận theo biển số +
// khung thời gian lệnh chạy. Không tự động kết luận đúng/sai — người dùng tự đối chiếu bằng mắt.
@Component({
  selector: 'app-etc-reconciliation',
  templateUrl: './etc-reconciliation.component.html',
  styleUrls: ['./etc-reconciliation.component.scss']
})
export class EtcReconciliationComponent implements OnInit {
  refNoInput = '';
  result: any = null;
  searched = false;

  constructor(
    private _service: VetcApiService,
    private notificationService: NotificationService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params.refNo) {
        this.refNoInput = params.refNo;
        this.search();
      }
    });
  }

  search(): void {
    if (!this.refNoInput || !this.refNoInput.trim()) {
      this.notificationService.printErrorMessage('Nhập số lệnh (RefNo) cần đối chiếu.');
      return;
    }
    this.result = null;
    this.searched = true;
    this.spinner.show();
    this._service.compareByRefNo(this.refNoInput.trim()).subscribe((res: any) => {
      this.spinner.hide();
      if (res.code == '200') {
        this.result = res.data;
      } else if (res.code == '204') {
        this.notificationService.printErrorMessage('Không tìm thấy lệnh với RefNo này.');
      } else {
        this.notificationService.printErrorMessage((res.message || MessageContstants.GETDATA_ERR_MSG) + '\n' + res.code);
      }
    }, () => this.spinner.hide());
  }
}
