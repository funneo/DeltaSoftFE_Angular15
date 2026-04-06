import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Profile, ResponseValue } from '@app/shared/models';
import { TimeKeeping } from '@app/shared/models/hrm/time-keeping.model';
import { AuthService, NotificationService } from '@app/shared/services';
import { TimeKeepingService } from '@app/shared/services/hrm/time-keeping.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-time-keeping',
  templateUrl: './modal-time-keeping.component.html',
  styleUrls: ['./modal-time-keeping.component.css']
})
export class ModalTimeKeepingComponent implements OnInit {
  type?:number;
  branchId?:number;
  title?:string='';
  note?:string='';
  public busy: Subscription;
  public userLoged: Profile;
  
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild('modaTimeKeeping', { static: false }) modaTimeKeeping: ModalDirective;
  constructor(
    private _notificationService: NotificationService,
    private timeKeepingService:TimeKeepingService,
    private _authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
  }

  view(type:number) {
    this.type=type;
    this.title=type==0?"CHẤM CÔNG ĐẾN":"CHẤM CÔNG VỀ";
    this.modaTimeKeeping.show();
  }

  saveChanged(form: NgForm){
    let item:TimeKeeping={
    }
    item.userName=this.userLoged.userName;
    if(this.type===0){
    item.commingNote=this.note;
    this.timeKeepingService.comming(item).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {  
        this.modaTimeKeeping.hide();
        form.resetForm();
        this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
        this.SaveSuccess.emit(true);
      }
        else {
          this._notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG + res.code);
        }
      }, () => {});
    }else{
      item.outgoingNote=this.note;
      this.timeKeepingService.outgoing(item).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {  
          this.modaTimeKeeping.hide();
          form.resetForm();
          this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
          this.SaveSuccess.emit(true);
        }
          else {
            this._notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG + res.code);
          }
        }, () => {});
    } 
  }
  OnHidden() {
    this.CloseModal.emit();
  }
}
