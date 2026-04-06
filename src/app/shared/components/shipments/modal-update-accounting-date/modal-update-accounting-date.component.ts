import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { UtilityService } from "@app/shared/services";
import * as moment from "moment";
import { ModalDirective } from "ngx-bootstrap/modal";

@Component({
  selector: "modal-update-accounting-date",
  templateUrl: "./modal-update-accounting-date.component.html",
  styleUrls: ["./modal-update-accounting-date.component.css"],
})
export class ModalUpdateAccountingDateComponent implements OnInit {
  valueReturn?: number;
  public _type?: number = 0; // 0: Ngày doanh thu, 1: Ngày vận hành
  public _ngayHachtoan: string = moment(new Date()).format("DD/MM/YYYY");
  public dateTimeOptions2 = this._utilityService.dateTimeOptionDays(new Date(), false);
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalConfirm", { static: false }) modalConfirm: ModalDirective;
  constructor(
    private _utilityService: UtilityService,
  ) {}

  ngOnInit(): void {}

  view(type:number) {
    this._type = type;
    this._ngayHachtoan = "";
    this.modalConfirm.show();
  }
  selectedNgayHachtoan(event) {
    this._ngayHachtoan = moment(event.start).format("DD/MM/YYYY");
  }
  closedNgayHachtoan(event) {
      if (this._ngayHachtoan == null || this._ngayHachtoan?.length < 1)
        this._ngayHachtoan = moment(event.oldStartDate).format("DD/MM/YYYY");
    }
  click() {
    if (this._ngayHachtoan?.length < 1) return;
    this.SaveSuccess.emit(this._ngayHachtoan);
    this.modalConfirm.hide();
  }
}
