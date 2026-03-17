import { HttpParams } from "@angular/common/http";
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { MessageContstants } from "@app/shared/constants";
import { ResponseValue } from "@app/shared/models";
import { ApproverPermissions } from "@app/shared/models/hrm/training-document-managment/approver-permissions";
import { TrainingDocumentCriteria } from "@app/shared/models/hrm/training-document-managment/training-document-criteria";
import { TrainingDocuments } from "@app/shared/models/hrm/training-document-managment/training-documents";
import { NotificationService, UtilityService } from "@app/shared/services";
import { ApproverPermissionsService } from "@app/shared/services/hrm/training-document-managment/approver-permissions.service";
import { TrainingDocumentManagmentService } from "@app/shared/services/hrm/training-document-managment/training-document-managment.service";
import { ModalDirective } from "ngx-bootstrap/modal";
import { forkJoin } from "rxjs";

@Component({
  selector: "modal-training-document-accept",
  templateUrl: "./modal-training-document-accept.component.html",
  styleUrls: ["./modal-training-document-accept.component.css"],
})
export class ModalTrainingDocumentAcceptComponent implements OnInit {
  public entity: TrainingDocuments;
  public flagSave = false;
  comments?: string;
  listCriteria: TrainingDocumentCriteria[] = [];
  maskNumber = UtilityService.maskNumber;
  score: number = 10; // Tổng điểm
  public viewModal?: boolean = false;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalAddEdit", { static: false }) modalAddEdit: ModalDirective;
  constructor(
    private _notificationService: NotificationService,
    private _service: TrainingDocumentManagmentService,
    private _serviceApprover: ApproverPermissionsService
  ) {}

  ngOnInit(): void {}

  view(id: string) {
    forkJoin({
      criteria: this._service.getCritera(),
      detail: this._service.getDetail(id),
    }).subscribe(({ criteria, detail }) => {
      // 1. Gán danh sách tiêu chí
      this.listCriteria = criteria.data;

      // 2. Gán thông tin chi tiết tài liệu
      if (detail.code == "200" || detail.code == "201") {
        this.entity = detail.data;

        this.listCriteria.forEach((c) => {
          const existing = this.entity.socreDetails.find(
            (s) => s.criteriaId === c.id
          );

          this.entity.socreDetails.push({
            criteriaId: c.id,
            criteriaName: c.name,
            criteriaNotes: c.notes,
            weight: c.weight,
            score: 10, // Điểm tối đa nếu có thể gán mặc định
            assigneeScore: 0, // Điểm người chấm thực tế
          });
        });
        this.score = this.calculateTotalScore(this.entity.socreDetails);
        this.entity.contents.forEach((content) => {
          content.isExpanded = content.contents?.length > 0;
        });

        this.modalAddEdit.show();
      } else {
        this._notificationService.printErrorMessage(
          MessageContstants.SYSTEM_ERROR_MSG
        );
      }
    });
  }
  changeScore(item: any) {
    if (item.score < 0) {
      item.score = 0;
    } else if (item.score > 10) {
      item.score = 10;
    }
    this.score = this.calculateTotalScore(this.entity.socreDetails);
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      this._service.accept(this.entity).subscribe(
        (res: ResponseValue<any>) => {
          if (res.code == "200" || res.code == "201") {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(
              MessageContstants.UPDATED_OK_MSG
            );
            this.SaveSuccess.emit(true);
          } else {
            this._notificationService.printErrorMessage(
              MessageContstants.UPDATED_ERR_MSG + res.code
            );
            this.flagSave = false;
          }
        },
        () => {
          this.flagSave = false;
        }
      );
    }
  }

    calculateTotalScore([]): number {
      const total = this.entity.socreDetails.reduce((sum, item) => {
        const weight = item.weight ?? 0;
        const assigneeScore = item.score ?? 0;
        return sum + (assigneeScore * weight / 100);
      }, 0);
      return Math.round(total * 100) / 100; // Làm tròn 2 chữ số
    }
  chuyenduyet() {
    let copy = Object.assign({}, this.entity);
    copy.status = 1; // Cập nhật trạng thái thành "Đã duyệt"
    this._service.update(copy).subscribe(
      (res: ResponseValue<any>) => {
        if (res.code == "200" || res.code == "201") {
          this.modalAddEdit.hide();
          this._notificationService.printSuccessMessage(
            MessageContstants.UPDATED_OK_MSG
          );
          this.SaveSuccess.emit(res.data);
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.UPDATED_ERR_MSG + res.code
          );
          this.flagSave = false;
        }
      },
      () => {
        this.flagSave = false;
      }
    );
  }
  //Chuyển duyệt
  approved() {
    let copy = Object.assign({}, this.entity);
    this._service.accept(copy).subscribe((res: ResponseValue<any>) => {
      if (res.code == "200" || res.code == "201") {
        this.SaveSuccess.emit(true);
        this.modalAddEdit.hide();
      } else {
        this._notificationService.printErrorMessage(
          MessageContstants.SYSTEM_ERROR_MSG
        );
      }
    });
  }

  closeModal(): void {
    this.viewModal = false;
  }

  OnHidden() {
    this.CloseModal.emit();
  }
}
