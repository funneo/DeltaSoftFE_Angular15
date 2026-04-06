import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Profile, ResponseValue, User, Workflow } from '@app/shared/models';
import { AuthService, NotificationService, UserService, WorkflowsService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-opman-assigning-workflow',
  templateUrl: './modal-opman-assigning-workflow.component.html',
  styleUrls: ['./modal-opman-assigning-workflow.component.css']
})
export class ModalOpmanAssigningWorkflowComponent implements OnInit {

  public listUser: User[];
  userLoged?: Profile;
  public userId?: string;
  notes?:string='';
  listId?:string='';

  public busy: Subscription;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalOpManAssigning', { static: false }) modalOpManAssigning: ModalDirective;
  constructor(private notificationService: NotificationService, private workflowService: WorkflowsService
    , private _authService: AuthService
    , private userService: UserService
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
  }

  assigning(listid: string, handlingGroupId: number) {
    this.listId=listid; 
    this.loaUser(handlingGroupId);
    this.modalOpManAssigning.show();
  }


  loaUser(handlingGroupId: number): void {
    const params = new HttpParams()
      .set('id', handlingGroupId.toString())
    this.busy = this.userService.getByHandlingGroupId(params).subscribe((res: User[]) => {
      if (res.length > 0) {
        this.listUser = res
      }
    });

  }

  saveChange(form: NgForm) {
    if (form.valid) {
      const params = new HttpParams()
        .set('assigninguserid', this.userLoged.id)
        .set('assigneduserid', this.userId)
        .set('note', this.notes)
        .set('listid',this.listId)
        .set('isAssigning', "1")
      this.workflowService.setAssigning(params).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.modalOpManAssigning.hide();
          form.resetForm();
          this.notificationService.printSuccessMessage(MessageContstants.ASSIGNING_OK_MSG);
          this.SaveSuccess.emit(res.data);
        }
        else {
          this.notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + res.code);
        }
      }, () => {});
    }
  }
  hide() {
    this.CloseModal.emit();
  }
  OnHidden() {
    this.CloseModal.emit();
  }
}
