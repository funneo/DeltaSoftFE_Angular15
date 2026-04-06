import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Country, Employee, OtherCategories, Profile, Province, ResponseValue } from '@app/shared/models';
import { SalesCustomer } from '@app/shared/models/sales-marketing/sales-customer.model';
import { AuthService, BranchService, CountryService, EmployeeService, NotificationService, OtherCategoriesService, UtilityService } from '@app/shared/services';
import { ProvinceService } from '@app/shared/services/province.service';
import { SalesCustomerService } from '@app/shared/services/sales-marketing/sales-customer.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { userInfo } from 'os';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-sales-customer',
  templateUrl: './modal-sales-customer.component.html',
  styleUrls: ['./modal-sales-customer.component.css']
})
export class ModalSalesCustomerComponent implements OnInit {
  entity: SalesCustomer;
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
  _accept:boolean=false;
  userLoged:Profile;
  // dateTimeOptions = this._utilityService.dateTimeOptionNoTimes;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService,
    private customerService: SalesCustomerService,
    private _utilityService: UtilityService, private branchService: BranchService,
    private countryService: CountryService,private provinceService: ProvinceService,private otherCategoriesService: OtherCategoriesService,
    private authService:AuthService,private employeeService:EmployeeService) {
      this.userLoged = this.authService.getLoggedInUser();
      this._branchId = Number.parseInt(this.userLoged.branchId);
      this._employeeId = Number.parseInt(this.userLoged.employeeId);
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
      .set('type', 'FOA');
    this.otherCategoriesService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      this.listTypes = res.data;
    });
  }

  add() {
    this.entity = {
      branchId:this._branchId,
      salesId:this._employeeId,
      customerType:0,
      managerSalesId: (this._branchId == 5 || this._branchId==9)? 369:21
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: number, flag: boolean) {
    this.customerService.getDetail(id).subscribe((res: ResponseValue<SalesCustomer>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.flagXem = flag;
        this.flagSave = false;
        this._accept=(this.userLoged.employeeId===this.entity.managerSalesId.toString()) || this.userLoged.isAdmin;
        console.log(this._accept);

        if(this.entity.salesId.toString()!=this.userLoged.employeeId)this.flagXem=true;
        //if(this._accept)this.flagXem=false;
        if(this.entity.lock || this.entity.ok)this.flagXem=true;
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
      if (this.entity.customerId == undefined) {

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

  acceptdk05(event:boolean){
    this.flagSave=true;
    this.customerService.exportDk05(this.entity.customerId).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.modalAddEdit.hide();
        this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
        this.SaveSuccess.emit(res.data);
        this.flagSave=false;
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
        this.flagSave = false;
      }
    }, () => {
      this.flagSave = false;
    });
  }

  accept(){
    this.flagSave=true;
    this.customerService.accept(this.entity.customerId).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.modalAddEdit.hide();
        this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
        this.SaveSuccess.emit(res.data);
        this.flagSave=false;
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
        this.flagSave=false;
      }
    }, () => {
      this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
      this.flagSave=false;
    });
  }

  lock(){
    this.customerService.lock(this.entity.customerId,true).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.modalAddEdit.hide();
        this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
        this.SaveSuccess.emit(res.data);
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
      }
    }, () => {
      this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
    });
  }

  OnHidden() {
    this.CloseModal.emit();
  }

  closeModal(): void {
    this.viewModal = false;
  }

}
