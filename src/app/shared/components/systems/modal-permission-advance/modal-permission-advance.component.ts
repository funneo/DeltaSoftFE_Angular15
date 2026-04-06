import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { PermissionAdvance, Branch, User, AdvanceGroup, ResponseValue } from '@app/shared/models';
import { NotificationService, PermissionAdvanceService, BranchService, UserService, AdvanceGroupService } from '@app/shared/services';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-permission-advance',
  templateUrl: './modal-permission-advance.component.html',
  styleUrls: ['./modal-permission-advance.component.css']
})
export class ModalPermissionAdvanceComponent implements OnInit {
  public entity: PermissionAdvance;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public busy: Subscription;
  listBranch: Branch[];
  listUser:User[];
  listAdvanceGroup:AdvanceGroup[];
  listItems: number[];
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService, private permissionAdvanceService: PermissionAdvanceService,
    private branchService:BranchService, private userService: UserService, private advanceGroupService: AdvanceGroupService) {
     }

  ngOnInit(): void {
    this.loadChiNhanh();
    this.loadUser();
    this.loadLoaiTamUng();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  loadUser() {
    this.userService.getAll().subscribe((res: User[]) => {
      this.listUser = res;
    });
  }

  loadLoaiTamUng(){
    this.advanceGroupService.getAll().subscribe((res: ResponseValue<AdvanceGroup[]>) => {
      this.listAdvanceGroup = res.data;
    });
  }

  add() {
    this.entity = {
      status: true
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.permissionAdvanceService.getDetail(id).subscribe((res: ResponseValue<PermissionAdvance>) => {
      if (res.code == '200' || res.code == '201') {
      this.entity = res.data;
      this.listItems=[];
      let lst=this.entity.listAdvanceGroupId?.split(',');
      lst?.forEach(element => {
        this.listItems.push(+element);
      });
      this.flagXem = flag;
      this.flagSave = false;
      this.modalAddEdit.show();
    }
    else {
      this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
    }
    });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      this.entity.listAdvanceGroupId=this.listItems?.join(',');
      if (this.entity.id == undefined) {
        this.permissionAdvanceService.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
          this.modalAddEdit.hide();
          form.resetForm();
          this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
          this.SaveSuccess.emit(res);
        }
        else {
          this._notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG);
          this.flagSave = false;
        }
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.permissionAdvanceService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
          this.modalAddEdit.hide();
          form.resetForm();
          this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
          this.SaveSuccess.emit(res);
        }
        else {
          this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
          this.flagSave = false;
        }
        }, () => {
          this.flagSave = false;
        });
      }
    }
  }

  OnHidden() {
    this.CloseModal.emit();
  }

}
