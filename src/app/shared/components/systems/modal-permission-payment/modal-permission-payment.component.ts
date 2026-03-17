import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { PermissionPayment, Branch, User, PaymentFeeGroup, Customer, ResponseValue, Employee } from '@app/shared/models';
import { NotificationService, PermissionPaymentService, BranchService, UserService, PaymentFeeGroupService, CustomerService, EmployeeService } from '@app/shared/services';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { Observable, Observer, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'modal-permission-payment',
  templateUrl: './modal-permission-payment.component.html',
  styleUrls: ['./modal-permission-payment.component.css']
})
export class ModalPermissionPaymentComponent implements OnInit {

  public entity: PermissionPayment;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public busy: Subscription;
  listBranch: Branch[];
  listEmployee: Employee[];
  listPaymentGroup: PaymentFeeGroup[];
  listItems: number[];
  listNguoiThanhToan: number[];
  listType: any[] = [{ id: 0, name: 'Duyệt theo nhóm phí' }, { id: 1, name: 'Duyệt theo khách hàng' }];
  listCustomerSelect: Customer[] = [];
  typeaheadLoading: boolean = false;
  dataSource: Observable<Customer[]>;
  customerName: string;
  _branchId: number;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService, private permissionPaymentService: PermissionPaymentService,
    private branchService: BranchService, private userService: UserService, private paymentGroupService: PaymentFeeGroupService,
    private customerService: CustomerService, private employeeService: EmployeeService) {
    this.dataSource = new Observable((observer: Observer<string>) => {
      observer.next(this.customerName);
    }).pipe(switchMap((search: string) => this.LoadCustomerFind(search)));
  }

  LoadCustomerFind(search: string): Observable<any> {
    const params = new HttpParams().set('keyword', search);
    return this.customerService.getAll(params).pipe(map((response: ResponseValue<Customer[]>) => {
      return response.data;
    }));
  }

  typeaheadOnSelectCustomer(event) {
    let index = this.listCustomerSelect.findIndex(
      (x) => x.id == event.item.id
    );
    if (index == -1) {
      this.listCustomerSelect.push({
        id: event.item.id,
        customerCode: event.item.customerCode,
        customerName: event.item.customerName
      });
      this.customerName = '';
    } else {
    }
  }

  changeTypeaheadLoadingCustomer(event) {
    this.typeaheadLoading = event;
  }

  changeTypeaheadNoResultsCustomer(event) {
    // console.log(event);
  }

  ngOnInit(): void {
    this.loadChiNhanh();
    this.loadUser();
    this.loadEmployee();
    this.loadPhiThanhToan();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  loadEmployee() {
    const params = new HttpParams()
      .set('branchId', this._branchId?.toString());
    this.employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
      this.listEmployee = res.data;
    });
  }

  changedBranch(item: Branch) {
    this._branchId = item.id;
    this.loadEmployee();
  }

  listUser: User[];
  loadUser() {
    this.userService.getAll().subscribe((res: User[]) => {
      this.listUser = res;
    });
  }

  loadPhiThanhToan() {
    this.paymentGroupService.getAll().subscribe((res: ResponseValue<PaymentFeeGroup[]>) => {
      this.listPaymentGroup = res.data;
    });
  }

  add() {
    this.entity = {
      status: true,
      type: 0
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.permissionPaymentService.getDetail(id).subscribe((res: ResponseValue<PermissionPayment>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.listItems = [];
        this.listNguoiThanhToan = [];
        let lst = this.entity.listPaymentFeeGroupId?.split(',');
        lst?.forEach(element => {
          this.listItems.push(+element);
        });
        this.entity.listUserName?.split(',').forEach(x => {
          this.listNguoiThanhToan.push(+x);
        });
        this.listCustomerSelect = this.entity.customers;
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
      this.entity.listPaymentFeeGroupId = this.listItems?.join(',');
      this.entity.listUserName = this.listNguoiThanhToan?.join(',');
      let list: string[] = [];
      this.listCustomerSelect?.forEach(x => {
        list.push(x.id.toString());
      });
      this.entity.listCustomerId = list?.join(',');
      if (this.entity.id == undefined) {
        this.permissionPaymentService.add(this.entity).subscribe((res: ResponseValue<any>) => {
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
        this.permissionPaymentService.update(this.entity).subscribe((res: ResponseValue<any>) => {
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
    this.listCustomerSelect.splice(i, 1);
  }

  OnHidden() {
    this.CloseModal.emit();
  }

}
