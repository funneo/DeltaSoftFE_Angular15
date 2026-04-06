import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Branch, User, PaymentFeeGroup, Customer, ResponseValue, PermissionCS } from '@app/shared/models';
import { NotificationService, PermissionCSService, BranchService, UserService, CustomerService } from '@app/shared/services';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { Observable, Observer, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'modal-permission-cs',
  templateUrl: './modal-permission-cs.component.html',
  styleUrls: ['./modal-permission-cs.component.css']
})
export class ModalPermissionCsComponent implements OnInit {
  public entity: PermissionCS;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public busy: Subscription;
  listBranch: Branch[];
  listCustomer: Customer[];
  listPermissionCS: PermissionCS[] = [];
  typeaheadLoading: boolean = false;
  dataSource: Observable<any[]>;
  userName: string;
  listType: any[] = [{ id: 0, text: 'Theo khách hàng' }, { id: 1, text: 'Theo CS' }];
  _type = 0;
  _customerId: number;
  _userName: string;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService, private permissionCSService: PermissionCSService,
    private branchService: BranchService, private userService: UserService,
    private customerService: CustomerService) {
    this.dataSource = new Observable((observer: Observer<string>) => {
      observer.next(this.userName);
    }).pipe(switchMap((search: string) => this.LoadUserFind(search)));
  }

  LoadUserFind(search: string): Observable<any> {
    const params = new HttpParams().set('keyword', search);
    if(this._type==0){
      return this.userService.getByFind(params).pipe(map((response: User[]) => {
        return response;
      }));
    }
    else{
      return this.customerService.getAll(params).pipe(map((response: ResponseValue<Customer[]>) => {
        return response.data;
      }));
    }
  }

  typeaheadOnSelectUser(event: any) {
    let index = this.listPermissionCS.findIndex(
      (x) => x.id == event.item.id
    );
    if (index == -1) {
      this.listPermissionCS.push({
        id: event.item.id,
        customerId: this._customerId,
        userName: event.item.userName,
        isCS: false,
        isOpenJob: false,
        isOpenDebit: false,
        isAcceptDebit: false,
        status: true
      });
      this.userName = '';
    }
  }

  typeaheadOnSelectCustomer(event: any) {
    let index = this.listPermissionCS.findIndex(
      (x) => x.id == event.item.id
    );
    if (index == -1) {
      this.listPermissionCS.push({
        id: event.item.id,
        customerId:event.item.id,
        customerCode: event.item.customerCode,
        customerName:event.item.customerName,
        userName: this._userName,
        isCS: false,
        isOpenJob: false,
        isOpenDebit: false,
        isAcceptDebit: false,
        status: true
      });
      this.userName = '';
    }
  }

  changeTypeaheadLoadingUser(event: any) {
    this.typeaheadLoading = event;
  }

  changeTypeaheadNoResultsUser(event: any) {
    // console.log(event);
  }

  ngOnInit(): void {
    this.loadChiNhanh();
    this.loadCustomer();
    this.loadUser();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  listUser: User[];
  loadUser() {
    this.userService.getAll().subscribe((res: User[]) => {
      this.listUser = res;
    });
  }

  loadCustomer() {
    const params = new HttpParams();
    this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      this.listCustomer = res.data;
    });
  }

  changedType() {
    if (this._type == 0)
      this._userName = null;
    else this._customerId = null;
    this.listPermissionCS=[];
  }

  add() {
    this.entity = {
      status: true,
      branchId: null
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.permissionCSService.getDetail(id).subscribe((res: ResponseValue<PermissionCS>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.flagXem = flag;
        this.flagSave = false;
        this._customerId = this.entity.customerId;
        this._userName=this.entity.userName;
        this._type = 0;
        this.listPermissionCS.push({
          customerId: this._customerId,
          id: this.entity.id,
          userName: this.entity.userName,
          isCS: this.entity.isCS,
          isOpenJob: this.entity.isOpenJob,
          isOpenDebit: this.entity.isOpenDebit,
          isAcceptDebit: this.entity.isAcceptDebit,
          isClosingDebit:this.entity.isClosingDebit,
          status: this.entity.status
        });
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
      this.entity.userName=this._userName;
      this.entity.customerId=this._customerId;

      this.entity.listItem = this.listPermissionCS;

      if (this.entity.id == undefined) {
        this.permissionCSService.add(this.entity).subscribe((res: ResponseValue<any>) => {
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
        this.permissionCSService.update(this.entity).subscribe((res: ResponseValue<any>) => {
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

  removeItem(i: number) {
    this.listPermissionCS.splice(i, 1);
  }

  clickRow1(item: PermissionCS) {
    item.isCS = !item.isCS;
    let index = this.listPermissionCS.findIndex((x) => x == item);
    if (index == -1) return;
    this.listPermissionCS[index].isCS = item.isCS;
  }

  clickRow2(item: PermissionCS) {
    item.isOpenJob = !item.isOpenJob;
    let index = this.listPermissionCS.findIndex((x) => x == item);
    if (index == -1) return;
    this.listPermissionCS[index].isOpenJob = item.isOpenJob;
  }

  clickRow3(item: PermissionCS) {
    item.isAcceptDebit = !item.isAcceptDebit;
    let index = this.listPermissionCS.findIndex((x) => x == item);
    if (index == -1) return;
    this.listPermissionCS[index].isAcceptDebit = item.isAcceptDebit;
  }

  clickRow4(item: PermissionCS) {
    item.isOpenDebit = !item.isOpenDebit;
    let index = this.listPermissionCS.findIndex((x) => x == item);
    if (index == -1) return;
    this.listPermissionCS[index].isOpenDebit = item.isOpenDebit;
  }
  clickRow5(item: PermissionCS) {
    item.isClosingDebit = !item.isClosingDebit;
    let index = this.listPermissionCS.findIndex((x) => x == item);
    if (index == -1) return;
    this.listPermissionCS[index].isClosingDebit = item.isClosingDebit;
  }

  OnHidden() {
    this.CloseModal.emit();
  }

}
