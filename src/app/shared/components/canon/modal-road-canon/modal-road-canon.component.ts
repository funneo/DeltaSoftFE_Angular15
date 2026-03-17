import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output,  ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { CanonRoad, Customer, ResponseValue } from '@app/shared/models';
import { NotificationService, CanonRoadService, CustomerService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { InteractivityChecker } from '@angular/cdk/a11y';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'modal-road-canon',
  templateUrl: './modal-road-canon.component.html',
  styleUrls: ['./modal-road-canon.component.css']
})
export class ModalRoadCanonComponent implements OnInit {

  public entity: CanonRoad;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public busy: Subscription;
  listCustomers:Customer[];
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;

  @ViewChild('aForm') aForm: ElementRef;
  @ViewChild('addEditForm') f: NgForm;
  @HostListener('keyup', ['$event'])
  keyevent(event) {
    if (event.keyCode === 38) {
      this.setPrevFocus(event.target.name);
    }
    if (event.keyCode === 40) {
      //this.setValue(event);
      this.setNextFocus(event.target.name);
    }
  }
  constructor(private _notificationService: NotificationService, private canonRoadService: CanonRoadService,
    private interactivityChecker: InteractivityChecker,private customerService:CustomerService) { }

  ngOnInit(): void {
    this.loadCustomer()
  }

  loadCustomer() {
    const params = new HttpParams()
      .set('keyword', '')
    this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      this.listCustomers = res.data;
    });
  }

  setFocus(name) {
    const ele = this.aForm.nativeElement[name];
    if (ele) {
      ele.focus();
    }
  }

  onShow() {
    this.setFocus("groupfeename");
  }

  setPrevFocus(currentId) {
    const ctrls = Object.keys(this.f.controls);
    for (let key = ctrls.indexOf(currentId) - 1; key >= 0; key--) {
      const control = this.aForm.nativeElement[ctrls[key]];
      if (control && this.interactivityChecker.isFocusable(control)) {
        control.focus();
        control.select();
        break;
      }
    }
  }

  setNextFocus(currentId) {
    const ctrls = Object.keys(this.f.controls);
    for (let key = ctrls.indexOf(currentId) + 1; key < ctrls.length; key++) {
      const control = this.aForm.nativeElement[ctrls[key]];
      if (control && this.interactivityChecker.isFocusable(control)) {
        control.focus();
        control.select();
        break;
      }
    }
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
    this.canonRoadService.getDetail(id).subscribe((res: ResponseValue<CanonRoad>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
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
      if (this.entity.id == undefined) {
        this.canonRoadService.add(this.entity).subscribe((res: number) => {
          this.modalAddEdit.hide();
          form.resetForm();
          this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
          this.SaveSuccess.emit(res);
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.canonRoadService.update(this.entity).subscribe((res: number) => {
          this.modalAddEdit.hide();
          form.resetForm();
          this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
          this.SaveSuccess.emit(res);
        }, () => {
          this.flagSave = false;
        });
      }
    }
  }

  onHidden() {
    this.CloseModal.emit();
  }

}
