import { EmployeeService } from '@app/shared/services/employee.service';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { MessageContstants } from '@app/shared/constants';
import { ContractCustomer, Customer, Employee, OtherCategories, Profile, ResponseValue } from '@app/shared/models';
import { ContractExtension } from '@app/shared/models/sales-marketing/contract-extension.model';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService, ContractCustomerService, CustomerService, NotificationService, OtherCategoriesService, UtilityService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HttpParams } from '@angular/common/http';
import * as moment from 'moment';
import { ContractExtensionService } from '@app/shared/services/sales-marketing/contract-extension.service';
import { FormatContstants } from '@app/shared/constants/format.constants';

@Component({
  selector: 'modal-contract-extension',
  templateUrl: './modal-contract-extension.component.html',
  styleUrls: ['./modal-contract-extension.component.css']
})
export class ModalContractExtensionComponent implements OnInit {
  entity: ContractExtension;
  listCustomers:Customer[];
  listEmployees:Employee[];
  flagXem: boolean = false;
  flagSave: boolean = false;
  busy: Subscription;
  viewModal = false;
  _branchId:number;
  _employeeId:number;
  _tuNgay:string;
  _denNgay:string;
  _customerId:number=0;
  _accept=false;
  userLoged?:Profile;
  isChuyenduyet=false;
  maskNumber = UtilityService.maskNumber;
  _ngay:string=moment(new Date()).format('DD/MM/YYYY');
  // dateTimeOptions = this._utilityService.dateTimeOptionNoTimes;
  dateTimeOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  listContracts:ContractCustomer[];

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService,
    private customerService: CustomerService, private contractCustomerService: ContractCustomerService,private ceService:ContractExtensionService,
    private _utilityService: UtilityService, private employeeService:EmployeeService, private otherCategoriesService:OtherCategoriesService,
   private authService:AuthService,) {
      this.userLoged = this.authService.getLoggedInUser();
      this._branchId=Number.parseInt(this.authService.getLoggedInUser().branchId);
      this._employeeId = Number.parseInt(this.userLoged.employeeId);
     }

  ngOnInit(): void {
    this.loadEmployee();
    this.loadCustomer();

  }


  loadCustomer() {
    const params = new HttpParams()
    .set('keyword', '');
    this.customerService.getAll(params).subscribe((res: ResponseValue<Customer[]>) => {
      this.listCustomers = res.data;
    });
  }
  listDuyet: OtherCategories[]=[];
  loadOtherCategory() {
    const params = new HttpParams()
      .set('type', null);
    this.otherCategoriesService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      this.listDuyet = res.data.filter(x => x.type === 'ACCEPTPERMISSION');
      debugger;
    });
  }

  loadEmployee() {
    const params = new HttpParams()
      .set('branchId', '');
    this.employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
      this.listEmployees = res.data;
    });
  }

  loadHopDong(): void {
    const params = new HttpParams()
      .set('customerId', this._customerId?.toString())
      .set('branchId', this._branchId.toString());
    this.contractCustomerService.getAllExpired(params).subscribe((res: ResponseValue<ContractCustomer[]>) => {
      this.listContracts = res.data;
    });
  }

  changedCustomer(item: Customer) {
    this._customerId = item.id;
    this.loadHopDong();
  }

  selectedDate(event) {
    this._ngay = moment(event.start).format('DD/MM/YYYY');
  }

  closedDate(event) {
    if (this._ngay == null)
      this._ngay = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  
  add() {
    const params = new HttpParams()
      .set('type', 'ACCEPTPERMISSION');
        this.otherCategoriesService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
          this.listDuyet = res.data;
          let idDuyet= this.listDuyet?.find(x => x.categoryName === this._branchId.toString())?.categoryCode;
          this.entity = {
            status: 0,
            branchId:this._branchId,
            newExpiryDate: moment(new Date()).format('DD/MM/YYYY'),
            // managerId: (this._branchId ==5 || this._branchId==9)? 369:21
            
            managerId: Number.parseInt(idDuyet)
          };
          this.flagXem = false;
          this.flagSave = false;
          this.modalAddEdit.show();
          });
  }

  edit(id: number, flag: boolean) {
    this.ceService.getDetail(id).subscribe((res: ResponseValue<ContractExtension>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;       
        console.log(this.entity);
        
        this.isChuyenduyet=this.entity.status>0;
        this._accept=(this.userLoged.isAdmin || this.entity?.managerId==this._employeeId);
        if (this.entity.newExpiryDate) {
          this.dateTimeOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.newExpiryDate, FormatContstants.DATEEN).format(FormatContstants.DATEEN))
          );
          this._ngay = moment(this.entity.newExpiryDate, FormatContstants.DATEEN).format(
            FormatContstants.DATEVN
          );
        }
        this._customerId=this.entity.customerId;
        this.loadHopDong();
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
    if (form.valid && !this.flagSave) {
      this.flagSave = true;
      if (this._ngay)
      this.entity.newExpiryDate = moment(this._ngay, FormatContstants.DATEVN).format(
        FormatContstants.DATEVN
      );
      this.entity.customerId=this._customerId;
      this.entity.status=this.isChuyenduyet?1:0;
      if (this.entity.id == undefined) {
        this.ceService.add(this.entity).subscribe((res: ResponseValue<any>) => {
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
        this.ceService.update(this.entity).subscribe((res: ResponseValue<any>) => {
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
  accept(flag:boolean){
    let item:ContractExtension={
      id:this.entity.id,
      status:flag?2:-1
    }
    this.ceService.updateStatus(item).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.modalAddEdit.hide();
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


  OnHidden() {
    this.CloseModal.emit();
  }

  closeModal(): void {
    this.viewModal = false;
  }


  viewAttachFiles:boolean;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;
  showFiles(){
    this.viewAttachFiles=true;
    let item:Attachfiles={
      frmName:'CE',
      functionName:'CE',
      refNo: this.entity.id.toString()
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item,this.entity.status>1);
    }, 50);
  }

  saveSuccessFile(event: any): void {
    console.log(event);
  }

  closeModalFile(){
    this.viewAttachFiles=false;
  }

}
