import { Component, EventEmitter, OnInit, Output, ViewChild, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { AuthService, BranchService,  CountryService,  EmployeeService,  NotificationService, OtherCategoriesService, PotentialCustomerService, UtilityService, } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { Branch, Country, Employee, OtherCategories, PotentialCustomer, Province, ResponseValue } from '@app/shared/models';
import { ProvinceService } from '@app/shared/services/province.service';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'modal-potential-customer',
  templateUrl: './modal-potential-customer.component.html',
  styleUrls: ['./modal-potential-customer.component.css']
})
export class ModalPotentialCustomerComponent implements OnInit {
  entity: PotentialCustomer;
  listBranch: Branch[];
  listTypes:OtherCategories[];
  listCountrys: Country[];
  listProvinces:Province[];
  flagXem: boolean = false;
  flagSave: boolean = false;
  busy: Subscription;
  viewModal = false;
  _branchId:number;
  _employeeId:number;
  listEmployees:Employee[];
  // dateTimeOptions = this._utilityService.dateTimeOptionNoTimes;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService,
    private customerService: PotentialCustomerService,
    private _utilityService: UtilityService, private branchService: BranchService,
    private countryService: CountryService,private provinceService: ProvinceService,private otherCategoriesService: OtherCategoriesService,
   private authService:AuthService,private employeeService:EmployeeService) {
      let user = this.authService.getLoggedInUser();
      this._branchId = Number.parseInt(user.branchId);
      this._employeeId = Number.parseInt(user.employeeId);
     }

  ngOnInit(): void {
    this.loadChiNhanh();
    this.loadCountry();
    this.loadProvince();
    this.loadOtherCategory();
    this.loadEmployee();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  loadEmployee() {
    const params = new HttpParams()
      .set('branchId', '');
    this.employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
      this.listEmployees = res.data;
    });
  }

  loadCountry() {
    this.countryService.getAll().subscribe((res: ResponseValue<Country[]>) => {
      this.listCountrys = res.data;
    });
  }

  loadProvince() {
    const params = new HttpParams();
    this.provinceService.getAll(params).subscribe((res: ResponseValue<Province[]>) => {
      this.listProvinces = res.data;
    });
  }

  loadOtherCategory() {
    const params = new HttpParams()
      .set('type', 'POTENTIAL-CUSTOMER');
    this.otherCategoriesService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      this.listTypes = res.data;
    });
  }

  add() {
    this.entity = {
      status: false,
      branchId:this._branchId,
      employeeId:this._employeeId
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.customerService.getDetail(id).subscribe((res: ResponseValue<PotentialCustomer>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.flagXem = flag;
        this.flagSave = false;
        this.modalAddEdit.show();
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG);
      }
    });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      if (this.entity.id == undefined) {

        this.customerService.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
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
        this.customerService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
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

  closeModal(): void {
    this.viewModal = false;
  }

}
