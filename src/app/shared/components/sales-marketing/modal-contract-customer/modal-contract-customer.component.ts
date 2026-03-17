import { Component, EventEmitter, OnInit, Output, ViewChild, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { AuthService, BranchService,  CountryService,  CustomerService,  EmployeeService,  FeeService,  NotificationService, OtherCategoriesService, PotentialCustomerService, UtilityService, } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { Branch, ContractCustomer, ContractCustomerDetail, Country, Customer, Employee, Fee, OtherCategories, PotentialCustomer, Profile, Province, ResponseValue } from '@app/shared/models';
import { ProvinceService } from '@app/shared/services/province.service';
import { HttpParams } from '@angular/common/http';
import * as moment from 'moment';
import { ContractCustomerService } from '@app/shared/services/sales-marketing/contract-customer.service';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';
import { Attachfiles } from '@app/shared/models/attachfiles.models';

@Component({
  selector: 'modal-contract-customer',
  templateUrl: './modal-contract-customer.component.html',
  styleUrls: ['./modal-contract-customer.component.css']
})
export class ModalContractCustomerComponent implements OnInit {
  entity: ContractCustomer;
  listBranch: Branch[];
  listEmployees:Employee[];
  listCustomers:Customer[];
  listDetails:ContractCustomerDetail[]=[];
  listFees:Fee[];
  flagXem: boolean = false;
  flagSave: boolean = false;
  busy: Subscription;
  viewModal = false;
  _branchId:number;
  _employeeId:number;
  _tuNgay:string;
  _denNgay:string;
  _customerId:number;
  _accept=false;
  userLoged?:Profile;
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
    private customerService: CustomerService, private contractCustomerService: ContractCustomerService,
    private _utilityService: UtilityService, private branchService: BranchService, private otherCategoriesService: OtherCategoriesService,
   private authService:AuthService,private employeeService:EmployeeService,private feeService:FeeService) {
      this.userLoged = this.authService.getLoggedInUser();
      this._branchId = Number.parseInt(this.userLoged.branchId);
      this._employeeId = Number.parseInt(this.userLoged.employeeId);
     }

  ngOnInit(): void {
    this.loadChiNhanh();
    this.loadEmployee();
    this.loadCustomer();
    this.loadFee();
    this.loadOtherCategory();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
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

  loadFee() {
    const params = new HttpParams()
    // .set('groupFeeId', '')
    // .set('paymentFeeGroupId', '')
    // .set('revenueFeeGroupId', '');
    this.feeService.getAll(params).subscribe((res: ResponseValue<Fee[]>) => {
      this.listFees = res.data?.filter(_=>_.groupCode=='DT01');
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
      .set('customerId', this._customerId.toString())
      .set('branchId', this._branchId.toString());
    this.contractCustomerService.getAll(params).subscribe((res: ResponseValue<ContractCustomer[]>) => {
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

  selectedTuNgay(event) {
    this._tuNgay = moment(event.start).format('DD/MM/YYYY');
  }

  closedTuNgay(event) {
    if (this._tuNgay == null)
      this._tuNgay = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  selectedDenNgay(event) {
    this._denNgay = moment(event.start).format('DD/MM/YYYY');
  }

  closedDenNgay(event) {
    if (this._denNgay == null)
      this._denNgay = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  add() {
    const params = new HttpParams()
      .set('type', 'ACCEPTPERMISSION');
        this.otherCategoriesService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
          this.listDuyet = res.data;
          let idDuyet= this.listDuyet?.find(x => x.categoryName === this._branchId.toString())?.categoryCode;
          this.entity = {
                status: false,step:0,
                branchId:this._branchId,
                employeeId:this._employeeId,
                refDate: moment(new Date()).format('DD/MM/YYYY'),
                //managerId: (this._branchId ==5 || this._branchId==9)? 369:21
                managerId: Number.parseInt(idDuyet)
              };
              this.flagXem = false;
              this.flagSave = false;
              this.inputTen(1);
              this.modalAddEdit.show();
        });
  }

  edit(id: string, flag: boolean) {
    this.contractCustomerService.getDetail(id).subscribe((res: ResponseValue<ContractCustomer>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this._accept=(this.userLoged.isAdmin || this.entity?.managerId==this._employeeId);
        if (this.entity.refDate) {
          this.dateTimeOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.refDate, FormatContstants.DATEEN).format(FormatContstants.DATEEN))
          );
          this._ngay = moment(this.entity.refDate, FormatContstants.DATEEN).format(
            FormatContstants.DATEVN
          );
        }

        if (this.entity.sDate) {
          this.dateTimeOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.sDate, FormatContstants.DATEEN).format(FormatContstants.DATEEN))
          );
          this._tuNgay = moment(this.entity.sDate, FormatContstants.DATEEN).format(
            FormatContstants.DATEVN
          );
        }

        if (this.entity.fDate) {
          this.dateTimeOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.fDate, FormatContstants.DATEEN).format(FormatContstants.DATEEN))
          );
          this._denNgay = moment(this.entity.fDate, FormatContstants.DATEEN).format(
            FormatContstants.DATEVN
          );
        }
        this.listDetails = this.entity.contractCustomerDetails ?? [];
        if (this.listDetails && this.listDetails.length != 0) {
          this.listDetails.every(_ => _.tempId = _.id);
        }
        // console.log(this.listDetails);
        // console.log(this.entity);

        this._customerId=this.entity.customerId;
        this.loadHopDong();
        this.flagXem = flag;
        this.flagSave = false;
        //if(this._accept && (this.entity.step==2 || (this.entity.step==0&& this.entity.status) ))this.flagXem=false;
        if(this.entity.isDeny || this.entity.step==3)this.flagXem=true;
        if (!this.flagXem)
        this.inputTen(1);
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

      if (this._ngay)
      this.entity.refDate = moment(this._ngay, FormatContstants.DATEVN).format(
        FormatContstants.CLIENTDATE
      );

      if (this._tuNgay)
      this.entity.sDate = moment(this._tuNgay, FormatContstants.DATEVN).format(
        FormatContstants.CLIENTDATE
      );

      if (this._denNgay)
      this.entity.fDate = moment(this._denNgay, FormatContstants.DATEVN).format(
        FormatContstants.CLIENTDATE
      );
      this.entity.contractCustomerDetails = this.listDetails.filter(
        (x) => x.content != '' || x.feeId !=null
      );
      if (this.entity.id == undefined) {

        this.contractCustomerService.add(this.entity).subscribe((res: ResponseValue<any>) => {
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
        this.contractCustomerService.update(this.entity).subscribe((res: ResponseValue<any>) => {
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
  approve(){
    let item:ContractCustomer={
      id:this.entity.id,
      step:this.entity.step==0?1:2,
    }
    this.contractCustomerService.updateApprove(item).subscribe((res: ResponseValue<any>) => {
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
  accept(event:boolean){
    if(event)//Nếu duyệt thì kiểm tra xem duyệt bước 1 hay bước 2 để cấp số
    {
      let item:ContractCustomer={
        id:this.entity.id,
        customerId:this.entity.customerId,
        step:this.entity.step==0?1:2,
        status:true
      }
      this.contractCustomerService.acceptStep(item).subscribe((res: ResponseValue<any>) => {
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
    }else{
      let item:ContractCustomer={
        id:this.entity.id,
        customerId:this.entity.customerId,
        step:-1,
      }
      this.contractCustomerService.acceptStep(item).subscribe((res: ResponseValue<any>) => {
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
  }

  OnHidden() {
    this.CloseModal.emit();
  }

  closeModal(): void {
    this.viewModal = false;
  }

  inputTen(i: number) {
    if (this.listDetails?.length == 0) {
      let item: ContractCustomerDetail = {
        tempId: 1,
        content: '',
        amount: 0,
        notes: '',
        feeId: null
      };
      this.listDetails.push(item);
    } else {
      let arrayId = this.listDetails.map((x) => x.tempId);
      let maxId = arrayId.reduce((a, b) => {
        return Math.max(a, b);
      });


      let item = this.listDetails.find((x) => x.tempId == maxId);
      if (item && (item.content != '' || item.feeId)) {
        let item: ContractCustomerDetail = {
          tempId: maxId+1,
          content: '',
          amount: 0,
          notes: '',
          feeId: null
        };
        this.listDetails.push(item);
      }
    }
  }

  removeItem(i: number) {
    this.listDetails.splice(i, 1);
    this.listDetails=[...this.listDetails];
  }

  viewAttachFiles:boolean;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;
  showFiles(){
    this.viewAttachFiles=true;
    let item:Attachfiles={
      frmName:'CONTRACTCUSTOMER',
      functionName:'CONTRACTCUSTOMER',
      refNo: this.entity.id.toString()
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item,this.entity.step>2);
    }, 50);
  }

  saveSuccessFile(event: any): void {
    console.log(event);
  }

  closeModalFile(){
    this.viewAttachFiles=false;
  }

}
