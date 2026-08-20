import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FclClosingScope, FclClosingScopeByUser } from '@app/shared/models/fcl/fcl-closing-scope';
import { FclClosingScopeService } from '@app/shared/services/fcl/fcl-closing-scope.service';
import { Customer } from '@app/shared/models/customer.model';
import { CustomerService } from '@app/shared/services/customer.service';
import { UserService } from '@app/shared/services/user.service';
import User from '@app/shared/models/user.model';
import { NotificationService } from '@app/shared/services';
import { ResponseValue } from '@app/shared/models';

@Component({
  selector: 'modal-fcl-closing-scope',
  templateUrl: './modal-fcl-closing-scope.component.html',
  styleUrls: ['./modal-fcl-closing-scope.component.css']
})
export class ModalFclClosingScopeComponent implements OnInit {
  listRaw: FclClosingScope[] = [];
  listByUser: FclClosingScopeByUser[] = [];
  listUser: User[] = [];
  listCustomer: Customer[] = [];

  // form gán/sửa 1 user
  selectedUserId: string = null;
  isAll = true;
  selectedCustomerIds: number[] = [];
  flagSave = false;
  busy = false;

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild('modalScope', { static: false }) modalScope: ModalDirective;

  constructor(
    private _scopeService: FclClosingScopeService,
    private _userService: UserService,
    private _customerService: CustomerService,
    private _notificationService: NotificationService,
  ) { }

  ngOnInit(): void { }

  show(): void {
    this.resetForm();
    this.loadLookups();
    this.loadAll();
    this.modalScope.show();
  }

  loadLookups(): void {
    this._userService.getAll().subscribe((res: User[]) => {
      this.listUser = res || [];
    });
    this._customerService.getAll(new HttpParams()).subscribe((res: ResponseValue<Customer[]>) => {
      this.listCustomer = res?.data || [];
    });
  }

  loadAll(): void {
    this.busy = true;
    this._scopeService.getAll().subscribe((res: ResponseValue<FclClosingScope[]>) => {
      this.busy = false;
      if (res?.code == '200') {
        this.listRaw = res.data || [];
        this.groupByUser();
      } else {
        this._notificationService.printErrorMessage(res?.message || 'Không tải được danh sách.');
      }
    }, () => { this.busy = false; });
  }

  private groupByUser(): void {
    const map = new Map<string, FclClosingScopeByUser>();
    for (const r of this.listRaw) {
      let g = map.get(r.userId);
      if (!g) {
        g = { userId: r.userId, userName: r.userName, isAll: false, customers: [] };
        map.set(r.userId, g);
      }
      if (r.customerId == null) g.isAll = true;
      else g.customers.push({ id: r.customerId, name: r.customerName });
    }
    this.listByUser = Array.from(map.values()).sort((a, b) => (a.userName || '').localeCompare(b.userName || ''));
  }

  resetForm(): void {
    this.selectedUserId = null;
    this.isAll = true;
    this.selectedCustomerIds = [];
    this.flagSave = false;
  }

  editRow(row: FclClosingScopeByUser): void {
    this.selectedUserId = row.userId;
    this.isAll = row.isAll;
    this.selectedCustomerIds = row.customers.map(c => c.id);
  }

  save(): void {
    if (!this.selectedUserId) {
      this._notificationService.printAlert('THÔNG BÁO', 'Chọn tài khoản trước.');
      return;
    }
    if (!this.isAll && (!this.selectedCustomerIds || this.selectedCustomerIds.length === 0)) {
      this._notificationService.printAlert('THÔNG BÁO', 'Chốt theo KH phải chọn ít nhất 1 khách hàng.');
      return;
    }
    this.flagSave = true;
    this._scopeService.saveForUser({
      userId: this.selectedUserId,
      isAll: this.isAll,
      customerIdsCsv: this.isAll ? null : this.selectedCustomerIds.join(','),
    }).subscribe((res: ResponseValue<any>) => {
      this.flagSave = false;
      if (res?.code == '200') {
        this._notificationService.printSuccessMessage('Đã lưu.');
        this.resetForm();
        this.loadAll();
        this.SaveSuccess.emit();
      } else {
        this._notificationService.printErrorMessage(res?.message || 'Lưu thất bại.');
      }
    }, () => { this.flagSave = false; });
  }

  removeUser(row: FclClosingScopeByUser): void {
    this._notificationService.printConfirmationDialog(
      `Gỡ toàn bộ quyền chốt lệnh của "${row.userName}"?`,
      () => {
        this._scopeService.deleteForUser(row.userId).subscribe((res: ResponseValue<any>) => {
          if (res?.code == '200') {
            this.loadAll();
          } else {
            this._notificationService.printErrorMessage(res?.message || 'Xóa thất bại.');
          }
        });
      });
  }

  OnHidden(): void {
    this.CloseModal.emit();
  }
}
