import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { ResponseValue } from '@app/shared/models';
import { DispatchOrderFcl } from '@app/shared/models/fcl/dispatch-order-fcl';
import { NotificationService } from '@app/shared/services';
import { DispatchOrderFclService } from '@app/shared/services/fcl/dispatch-order-fcl.service';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'modal-closing-fcl-process',
  templateUrl: './modal-closing-fcl-process.component.html',
  styleUrls: ['./modal-closing-fcl-process.component.css']
})
export class ModalClosingFclProcessComponent implements OnInit {
  public listFcl: DispatchOrderFcl[] = [];
  isDone:number=0;
  isFail:number=0;
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modaProgress', { static: false }) modaProgress: ModalDirective;
  constructor(private _service: DispatchOrderFclService, private notificationService: NotificationService) { }

  view(listFcl:DispatchOrderFcl[]) {
    this.listFcl = listFcl;
    this.modaProgress.show();
    setTimeout(() => {
      this.processListFcl(); // Gọi sau khi modal đã show
    }, 500);
  }

  ngOnInit(): void {

  }
  async processListFcl() {
    this.isDone = 0;
    for (let i = 0; i < this.listFcl.length; i++) {
      let item = this.listFcl[i];
      item.status = 6;
  
      // Chờ 500ms trước khi gọi API
      await this.delay(1000);

      // Gọi API và chờ phản hồi
      await this.updateItemState(item);
    }
  
    // Khi tất cả đã xong:
    this.notificationService.printSuccessMessage("Đã chốt toàn bộ lệnh FCL đã chọn!");
    this.CloseModal.emit(); // hoặc thao tác tiếp
  }
  
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  updateItemState(item: DispatchOrderFcl): Promise<void> {
    return new Promise((resolve, reject) => {
      this._service.updateState(item, false, 0).subscribe({
        next: (res: ResponseValue<DispatchOrderFcl>) => {
          if (res.code === "200" || res.code === "201") {
            this.isDone++;
            resolve();
          } else {
            this.isFail++;
            this.notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
            );
            resolve(); // Không reject để không chặn vòng for
          }
        },
        error: (err) => {
          this.notificationService.printErrorMessage("Lỗi khi chốt lệnh FCL: " + err.message);
          resolve(); // vẫn tiếp tục vòng for
        }
      });
    });
  }
}
