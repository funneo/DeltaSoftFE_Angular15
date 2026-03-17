import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { ResponseValue } from '@app/shared/models';
import { TrainingDocumentCriteria } from '@app/shared/models/hrm/training-document-managment/training-document-criteria';
import { TrainingDocumentScoresDetails } from '@app/shared/models/hrm/training-document-managment/training-document-scores-details';
import { TrainingDocuments } from '@app/shared/models/hrm/training-document-managment/training-documents';
import { UtilityService, NotificationService } from '@app/shared/services';
import { ApproverPermissionsService } from '@app/shared/services/hrm/training-document-managment/approver-permissions.service';
import { TrainingDocumentManagmentService } from '@app/shared/services/hrm/training-document-managment/training-document-managment.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'modal-view-scope',
  templateUrl: './modal-view-scope.component.html',
  styleUrls: ['./modal-view-scope.component.css']
})
export class ModalViewScopeComponent implements OnInit {
  public flagSave = false;
  comments?: string;
  listScore: TrainingDocumentScoresDetails[] = [];
  maskNumber = UtilityService.maskNumber;
  public viewModal?: boolean = false;
  step=1;
  score: number = 0; // Tổng điểm
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalAddEdit", { static: false }) modalAddEdit: ModalDirective;
  constructor(
    private _notificationService: NotificationService,
    private _service: TrainingDocumentManagmentService,
    private _serviceApprover: ApproverPermissionsService
  ) {}

  ngOnInit(): void {}

  view(id: string,steps:number) {
    this._service.getScore(id,steps).subscribe(
        (res: ResponseValue<TrainingDocumentScoresDetails[]>) => {
          if (res.code == "200" || res.code == "201") {
            this.listScore = res.data;
            this.score = this.calculateTotalScore(this.listScore);
            this.modalAddEdit.show();
          }
        });
  }
  calculateTotalScore(items: TrainingDocumentScoresDetails[]): number {
  const total = items.reduce((sum, item) => {
    const weight = item.weight ?? 0;
    const assigneeScore = item.score ?? 0;
    return sum + (assigneeScore * weight / 100);
  }, 0);
  return Math.round(total * 100) / 100; // Làm tròn 2 chữ số
}

  //Chuyển duyệt
  closeModal(): void {
    this.viewModal = false;
  }

  OnHidden() {
    this.CloseModal.emit();
  }

}
