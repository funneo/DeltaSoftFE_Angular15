import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DebtInventory, ResponseValue, EmployeeDebit } from '@app/shared/models';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { EmployeeDebitService } from '@app/shared/services/employee-debit.service';

@Component({
  selector: 'modal-select-employee-debit',
  templateUrl: './modal-select-employee-debit.component.html',
  styleUrls: ['./modal-select-employee-debit.component.css']
})
export class ModalSelectEmployeeDebitComponent implements OnInit {
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  listData: EmployeeDebit[];
  flagSave = false;
  flagOk = false;
  flagReadOnly = false;
  loai: number;

  constructor(private employeeDebitService: EmployeeDebitService) { }

  ngOnInit(): void {

  }

  show(item: any) {
    let _employeeId = item.employeeId;
    let _toDate = item.toDate;
    let _id = item.id;
    this.loai = item.loai;
    let listId: string[] = [];
    this.flagReadOnly = item.isComplete;
    const params = new HttpParams()
      .set('employeeId', _employeeId?.toString())
      .set('toDate', _toDate?.toString())
      .set('debtInventoryId', _id?.toString())
    this.employeeDebitService.getAll(params).subscribe((res: ResponseValue<DebtInventory[]>) => {
      this.listData = res.data;
      if (this.loai == 0) {
        this.listData = [...this.listData.filter(x => x.type == 'TAM_UNG')];
        listId = item.listAdvanceId?.split(',');
      }
      else {
        this.listData = [...this.listData.filter(x => x.type == 'THANH_TOAN')];
        listId = item.listPaymentId?.split(',')
      }
      this.listData.forEach(x => {
        if (listId?.length > 0) {
          if (listId.findIndex(z => z == x.id.toString()) != -1)
            x.checked = true;
        }
      });

      this.modalAddEdit.show();
    });
  }

  checkAll(ev) {
    this.listData.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listData)
      return this.listData.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listData.filter(x => x.checked);
    if (checks.length > 0) {
      this.flagOk = true
    }
    else {
      this.flagOk = false;
    }
  }

  clickRow(item: DebtInventory): void {
    item.checked = !item.checked;
    this.icheck();
  }

  OnHidden() {
    this.CloseModal.emit();
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.SaveSuccess.emit(this.listData.filter(x => x.checked));
      this.modalAddEdit.hide();
    }
  }
}
