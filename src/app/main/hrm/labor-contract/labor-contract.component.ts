import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalEmployeeHrComponent } from '@app/shared/components/danhmuc/modal-employee-hr/modal-employee-hr.component';
import { MessageContstants } from '@app/shared/constants';
import { Branch, OtherCategories, ResponseValue } from '@app/shared/models';
import { EmployeeContract } from '@app/shared/models/employee-contract.model';
import { NotificationService, BranchService, AuthService, OtherCategoriesService } from '@app/shared/services';
import { EmployeeContractService } from '@app/shared/services/employee-contract.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-labor-contract',
  templateUrl: './labor-contract.component.html',
  styleUrls: ['./labor-contract.component.css']
})
export class LaborContractComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  keyword = '';
  _branchId: number = null;
  contractTypeId: number = null;
  year: number = null;
  expiringInDays: number = 0;     // 0 = tất cả
  onlyActive = true;

  listBranch: Branch[] = [];
  listContractType: OtherCategories[] = [];
  listYear: number[] = [];
  listExpiring = [
    { id: 0, name: 'Tất cả' },
    { id: 10, name: 'Còn ≤ 10 ngày (cảnh báo)' },
    { id: 30, name: 'Còn ≤ 30 ngày' },
    { id: 60, name: 'Còn ≤ 60 ngày' },
    { id: 90, name: 'Còn ≤ 90 ngày' },
  ];
  listData: EmployeeContract[] = [];
  busy: Subscription;
  viewModalHr = false;
  @ViewChild(ModalEmployeeHrComponent, { static: false }) modalHr: ModalEmployeeHrComponent;

  constructor(private branchService: BranchService, private notificationService: NotificationService,
    private authService: AuthService, private otherCategoryService: OtherCategoriesService,
    private contractService: EmployeeContractService) {
    const user = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(user.branchId) || null;
    const y = new Date().getFullYear();
    for (let i = 0; i < 6; i++) this.listYear.push(y - i);
  }

  ngOnInit(): void {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => { this.listBranch = res.data; });
    this.otherCategoryService.getAll(new HttpParams().set('type', 'CONTRACT_TYPE'))
      .subscribe((res: ResponseValue<OtherCategories[]>) => { if (res.code == '200') this.listContractType = res.data; });
    this.loadData();
  }

  loadData(): void {
    this.busy = this.contractService.getPaging({
      keyword: this.keyword,
      branchId: this._branchId,
      contractTypeId: this.contractTypeId,
      year: this.year,
      expiringInDays: this.expiringInDays,
      onlyActive: this.onlyActive,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize
    }).subscribe((res: ResponseValue<{ items: EmployeeContract[], totalRows: number }>) => {
      if (res.code == '200' || res.code == '201') {
        this.listData = res.data?.items || [];
        this.totalRows = res.data?.totalRows || 0;
      } else {
        this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
      }
    });
  }

  timKiem(): void { this.pageIndex = 1; this.loadData(); }
  pageChanged(event: PageChangedEvent): void { this.pageIndex = event.page; this.loadData(); }

  rowClass(c: EmployeeContract): string {
    if (!c.endDate) return 'text-muted';
    if (c.daysToExpire != null && c.daysToExpire < 0) return 'label label-default';
    if (c.isExpiringSoon) return 'label label-danger';
    if (c.daysToExpire != null && c.daysToExpire <= 30) return 'label label-warning';
    if (c.daysToExpire != null && c.daysToExpire <= 60) return 'label label-info';
    return 'label label-success';
  }

  manage(c: EmployeeContract): void {
    this.viewModalHr = true;
    setTimeout(() => this.modalHr.edit(c.employeeId.toString(), false), 50);
  }

  saveSuccess(): void { this.loadData(); }
  closeModalHr(): void { this.viewModalHr = false; }
}
