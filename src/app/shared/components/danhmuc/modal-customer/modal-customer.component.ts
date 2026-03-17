import { Accept } from './../../../pipes/accept.pipe';
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  Input,
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { MessageContstants } from "@app/shared/constants";
import {
  AuthService,
  BranchService,
  CountryService,
  CustomerService,
  EmployeeService,
  FeeService,
  NotificationService,
  OtherCategoriesService,
  UtilityService,
} from "@app/shared/services";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Subscription } from "rxjs";
import {
  Branch,
  Country,
  Customer,
  Employee,
  Fee,
  OtherCategories,
  Profile,
  Province,
  ResponseValue,
} from "@app/shared/models";
import { HttpParams } from "@angular/common/http";
import { ProvinceService } from "@app/shared/services/province.service";
import { CustomerLocations } from "@app/shared/models/danhmuc/customer-locations.model";
import { ModalCustomerLocationsComponent } from "../modal-customer-locations/modal-customer-locations.component";
import { ModalCustomerRoutesComponent } from "../modal-customer-routes/modal-customer-routes.component";
import { CustomerLocationsService } from "@app/shared/services/danhmuc/customer-locations.service";
import { CustomerRoutesService } from "@app/shared/services/danhmuc/customer-routes.service";
import { CustomerRoutes } from "@app/shared/models/danhmuc/customer-routes.model";
import { CustomerNormalRoutesService } from '@app/shared/services/danhmuc/customer-normal-routes.service';
import { CustomerNormalRoutes } from '@app/shared/models/danhmuc/customer-normal-routes.model';
import { ModalCustomerNormalRoutesComponent } from '../modal-customer-normal-routes/customer-normal-routes.component';
import { ModalCustomerTollRoutesComponent } from '../modal-customer-toll-routes/modal-customer-toll-routes.component';
import { CustomerTollRoutesService } from '@app/shared/services/danhmuc/customer-toll-routes.service';
import { CustomerTollRoutes } from '@app/shared/models/danhmuc/customer-toll-routes';
import { Ports } from '@app/shared/models/danhmuc/ports.model';
// import * as moment from 'moment';

@Component({
  selector: "modal-customer",
  templateUrl: "./modal-customer.component.html",
  styleUrls: ["./modal-customer.component.css"],
})
export class ModalCustomerComponent implements OnInit {
  public entity: Customer;
  public listBranch: Branch[];
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public busy: Subscription;
  public _accept: boolean = false;
  public _acceptOther: boolean = false;
  viewModal = false;
  listCountrys: Country[];
  listProvinces: Province[];
  listEmployees: Employee[];
  listLocations: CustomerLocations[] = [];
  listPorts: Ports[] = [];
  listTeam: OtherCategories[];
  userLoged?: Profile;
  updatePermission = false;
  updateLocationPermission = false;
  // public dateTimeOptions = this._utilityService.dateTimeOptionNoTimes;
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalAddEdit", { static: false }) modalAddEdit: ModalDirective;
  constructor(
    private _notificationService: NotificationService,
    private customerService: CustomerService,
    private _utilityService: UtilityService,
    private branchService: BranchService,
    private countryService: CountryService,
    private _authService: AuthService,
    private provinceService: ProvinceService,
    private employeeService: EmployeeService,
    private feeService: FeeService,
    private customerLocationsService: CustomerLocationsService,
    private customerRoutesServices: CustomerRoutesService,
    private csNormalRouteServies: CustomerNormalRoutesService,
    private otherService: OtherCategoriesService
  ) {
    this.userLoged = this._authService.getLoggedInUser();
    this._accept = this.userLoged.isAdmin || this.userLoged.employeeId == "21" || this.userLoged.employeeId == "369";
    this.updatePermission = _authService.hasPermission("CUSTOMER_UPDATE");
    this.updateLocationPermission = _authService.hasPermission("CUSTOMER_ACCOUNT");
    this._acceptOther = this.userLoged.isAdmin || _authService.hasPermission("CUSTOMER_ACCEPT");
  }

  ngOnInit(): void {
    this.loadChiNhanh();
    this.loadCountry();
    this.loadEmployee();
    this.loadProvince();
    this.loadFee();
    this.loadTeam();
  }
  loadTeam() {
    const params = new HttpParams()
      .set('type', 'TEAM')
    this.busy = this.otherService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listTeam = res.data
      }
    });
  }
  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  loadLocations() {
    this.customerLocationsService
      .getAll(this.entity?.id, false)
      .subscribe((res: ResponseValue<CustomerLocations[]>) => {
        if (res.code == "200" || res.code == "201" || res.code == "204") {
          this.entity.listLocations = res.data;
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG
          );
        }
      });
  }

  loadRoutes() {
    this.customerRoutesServices
      .getAll(this.entity?.id, false)
      .subscribe((res: ResponseValue<CustomerRoutes[]>) => {
        if (res.code == "200" || res.code == "201" || res.code == "204") {
          this.entity.listRoutes = res.data;
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG
          );
        }
      });
  }

  loadNormalRoutes() {
    this.csNormalRouteServies
      .getAll(this.entity.id)
      .subscribe((res: ResponseValue<CustomerNormalRoutes[]>) => {
        if (res.code == "200" || res.code == "201" || res.code == "204") {
          this.entity.listNormalRoute = res.data;
        } else {
          this.entity.listNormalRoute = [];
          this._notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG
          );
        }
      });
  }

  loadEmployee() {
    const params = new HttpParams().set("branchId", "");
    this.employeeService
      .getAll(params)
      .subscribe((res: ResponseValue<Employee[]>) => {
        this.listEmployees = res.data;
      });
  }

  locked(flag: boolean) {
    if (!this.flagSave) {
      this.flagSave = true;
      let item: Customer = {
        id: this.entity.id,
        locked: flag,
      };
      let _ok = false;
      let retVal = prompt(
        !flag ? "Lý do khóa khách hàng" : "Lý do mở khóa khách hàng",
        ""
      );
      if (retVal) {
        _ok = true;
      }
      item.reason = retVal ?? "";
      if (_ok) {
        this.customerService
          .locked(item)
          .subscribe((res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              this.flagSave = false;
              this.modalAddEdit.hide();
              this._notificationService.printSuccessMessage(
                MessageContstants.CREATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data);
            } else {
              this._notificationService.printErrorMessage(
                MessageContstants.UPDATED_ERR_MSG
              );
              this.flagSave = false;
            }
          });
      }
    }
  }

  loadCountry() {
    this.countryService.getAll().subscribe((res: ResponseValue<Country[]>) => {
      this.listCountrys = res.data;
    });
  }

  loadProvince() {
    const params = new HttpParams();
    this.provinceService
      .getAll(params)
      .subscribe((res: ResponseValue<Province[]>) => {
        this.listProvinces = res.data;
      });
  }

  listFee: Fee[];
  listItems: number[];
  loadFee() {
    const params = new HttpParams();
    this.feeService.getAll(params).subscribe((res: ResponseValue<Fee[]>) => {
      const filtered = res.data?.filter(
        (_) => _.groupCode == "DT01" || _.groupCode == "CP03"
      ) || [];
      // Create a new array with copied objects to prevent cache mutation
      this.listFee = filtered.map(fee => ({
        ...fee,
        feeName: fee.feeCode + "-" + fee.feeName
      }));
    });
  }

  add() {
    this.entity = {
      status: false,
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.customerService
      .getDetail(id)
      .subscribe((res: ResponseValue<Customer>) => {
        if (res.code == "200" || res.code == "201") {
          this.entity = res.data;
          this.listItems = [];
          let lst = this.entity.listFee?.split(",");
          lst?.forEach((element) => {
            this.listItems.push(+element);
          });
          this.loadLocations();
          this.loadRoutes();
          this.loadNormalRoutes();
          this.flagXem = flag;
          if (!this._accept && this.entity.status) this.flagXem = true;
          this.flagSave = false;
          this.modalAddEdit.show();
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG
          );
        }
      });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      this.entity.listFee = this.listItems?.join(",");
      if (this.entity.id == undefined) {
        this.customerService.add(this.entity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              this.modalAddEdit.hide();
              form.resetForm();
              this._notificationService.printSuccessMessage(
                MessageContstants.CREATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data);
            } else {
              this._notificationService.printErrorMessage(
                MessageContstants.CREATED_ERR_MSG
              );
              this.flagSave = false;
            }
          },
          () => {
            this.flagSave = false;
          }
        );
      } else {
        this.customerService.update(this.entity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              this.modalAddEdit.hide();
              form.resetForm();
              this._notificationService.printSuccessMessage(
                MessageContstants.UPDATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data);
            } else {
              this._notificationService.printErrorMessage(
                MessageContstants.UPDATED_ERR_MSG
              );
              this.flagSave = false;
            }
          },
          () => {
            this.flagSave = false;
          }
        );
      }
    }
  }

  viewLocations = false;
  @ViewChild(ModalCustomerLocationsComponent, { static: false }) modalLocations: ModalCustomerLocationsComponent
  newLocation(customerId: number) {
    this.viewLocations = true;
    setTimeout(() => {
      this.modalLocations.add(customerId);
    }, 50);
  }

  viewRoutes = false;
  @ViewChild(ModalCustomerRoutesComponent, { static: false }) modalRoutes: ModalCustomerRoutesComponent
  newRoute(customerId: number) {
    this.viewRoutes = true;
    setTimeout(() => {
      this.modalRoutes.add(customerId);
    }, 50);
  }

  viewNormalRoutes = false;
  @ViewChild(ModalCustomerNormalRoutesComponent, { static: false }) modalNormalRoutes: ModalCustomerNormalRoutesComponent
  newNormalRoute(customerId: number) {
    this.viewNormalRoutes = true;
    setTimeout(() => {
      this.modalNormalRoutes.add(customerId);
    }, 50);
  }

  update(id: number) {
    this.viewLocations = true;
    setTimeout(() => {
      this.modalLocations.edit(id, false);
    }, 50);
  }
  deleteConfirm(id: number): void {
    this._notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(id));
  }

  delete(id: number) {
    this.customerLocationsService
      .delete(id)
      .subscribe((res: ResponseValue<CustomerLocations>) => {
        if (res.code == "200" || res.code == "201" || res.code == "204") {
          this.loadLocations();
          this._notificationService.printSuccessMessage(
            MessageContstants.DELETED_OK_MSG
          );
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG
          );
        }
      });
  }


  acceptCustomer(b: boolean) {
    if (b) {
      const params = new HttpParams()
        .set('id', this.entity.id.toString())
        .set('reason', 'Ok');
      this.customerService.accept(params).subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.modalAddEdit.hide();
          this._notificationService.printSuccessMessage(
            MessageContstants.APPROVED_SUCCESS
          );
          this.SaveSuccess.emit(res.data);
        }
        else {
          this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
        }
      }, () => {
        this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
      });
    }
    else {
      var retVal = prompt("Lý do từ chối", "Lý do từ chối");
      if (retVal) {
        const params = new HttpParams()
          .set('id', this.entity.id.toString())
          .set('reason', retVal);
        this.customerService.accept(params).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            this._notificationService.printSuccessMessage(
              MessageContstants.DENY_SUCCESS
            );
            this.SaveSuccess.emit(res.data);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
          }
        }, () => {
          this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
        });
      }
    }

  }
  accept(id: number, flag: boolean) {
    this.customerLocationsService
      .accept(id, flag)
      .subscribe((res: ResponseValue<CustomerLocations[]>) => {
        if (res.code == "200" || res.code == "201" || res.code == "204") {
          this.loadLocations();
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG
          );
        }
      });
  }
  updateRoutes(id: number) {
    this.viewRoutes = true;
    setTimeout(() => {
      this.modalRoutes.edit(id, false);
    }, 50);
  }
  confirmDeleteRoutes(id: number): void {
    this._notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.deleteRoutes(id));
  }
  confirmDeleteNormalRoutes(id: number): void {
    this._notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.deleteNormalRoutes(id));
  }

  deleteRoutes(id: number) {
    this.customerRoutesServices
      .delete(id)
      .subscribe((res: ResponseValue<CustomerLocations>) => {
        if (res.code == "200" || res.code == "201" || res.code == "204") {
          this.loadRoutes();
          this._notificationService.printSuccessMessage(
            MessageContstants.DELETED_OK_MSG
          );
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG
          );
        }
      });
  }

  deleteNormalRoutes(id: number) {
    this.csNormalRouteServies
      .delete(id)
      .subscribe((res: ResponseValue<CustomerNormalRoutes>) => {
        if (res.code == "200" || res.code == "201" || res.code == "204") {
          this.loadNormalRoutes();
          this._notificationService.printSuccessMessage(
            MessageContstants.DELETED_OK_MSG
          );
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG
          );
        }
      });
  }

  acceptRoutes(id: number, flag: boolean) {
    this.customerRoutesServices
      .accept(id, flag)
      .subscribe((res: ResponseValue<CustomerLocations[]>) => {
        if (res.code == "200" || res.code == "201" || res.code == "204") {
          this.loadRoutes();
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG
          );
        }
      });
  }

  OnHidden() {
    this.CloseModal.emit();
  }

  closeModal(): void {
    this.viewModal = false;
  }
  saveSuccessLocations() {
    this.loadLocations();
  }

  closeModalLocations() {
    this.viewLocations = false;
  }
  saveSuccessRoutes() {
    this.loadRoutes();
  }
  saveSuccessNormalRoutes() {
    this.loadNormalRoutes();
  }

  closeModalRoutes() {
    this.viewRoutes = false;
  }
}
