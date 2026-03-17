import { ModalViewSublistComponent } from './../modal-view-sublist/modal-view-sublist.component';
import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { QuotationCustomer, Branch, Employee, Customer, QuotationCustomerDetail, Fee, Profile, ContractCustomer, ResponseValue, OtherCategories } from '@app/shared/models';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { SalesCustomer } from '@app/shared/models/sales-marketing/sales-customer.model';
import { UtilityService, NotificationService, CustomerService, BranchService, AuthService, EmployeeService, FeeService, ContractCustomerService, PermissionCSService, PotentialCustomerService, OtherCategoriesService } from '@app/shared/services';
import { QuotationCustomerService } from '@app/shared/services/sales-marketing/quotation-customer.service';
import { SalesCustomerService } from '@app/shared/services/sales-marketing/sales-customer.service';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'modal-digitization-quotation-customer',
  templateUrl: './modal-digitization-quotation-customer.component.html',
  styleUrls: ['./modal-digitization-quotation-customer.component.css']
})
export class ModalDigitizationQuotationCustomerComponent implements OnInit {
  entity: QuotationCustomer;
  listBranch: Branch[];
  listEmployees: Employee[];
  listCustomers: Customer[];
  listSalesCustomer:SalesCustomer[]=[];
  listDetails: QuotationCustomerDetail[] = [];
  listFees: Fee[];
  flagXem: boolean = false;
  flagSave: boolean = false;
  isCapso=false;
  busy: Subscription;
  viewModal = false;
  _branchId: number;
  _employeeId: number;
  _tuNgay: string;
  _denNgay: string;
  _auth: number;
  _accept=false;
  viewSubList=false;
  maskNumber = UtilityService.maskNumber;
  userLoged?:Profile;
  _ngay: string = moment(new Date()).format('DD/MM/YYYY');
  // dateTimeOptions = this._utilityService.dateTimeOptionNoTimes;
  dateTimeOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  listContracts: ContractCustomer[];
  listBaoGias: QuotationCustomer[];
  listLanguages:any[]=UtilityService.listLanguages();
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();

  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService,
    private customerService: CustomerService, private quotationCustomerService: QuotationCustomerService,
    private saleCustomerService:SalesCustomerService,
    private _utilityService: UtilityService, private branchService: BranchService,
    private authService: AuthService, private employeeService: EmployeeService, private feeService: FeeService, private contractCustomerService: ContractCustomerService,
    private spinner: NgxSpinnerService,private otherCategoriesService: OtherCategoriesService) {
    this.userLoged = this.authService.getLoggedInUser();
    this._branchId = Number.parseInt(this.userLoged.branchId);
    this._employeeId = Number.parseInt(this.userLoged.employeeId);
    this._auth = Number.parseInt(this.userLoged.authorisationLevel);
  }

  ngOnInit(): void {
    this.loadChiNhanh();
    this.loadEmployee();
    // this.loadCustomer();
    this.loadFee();
    this.loadOtherCategory();
    this.loadSalesCustomer();
    // let list=this.permissionCSService.getPermissionCS();
    // console.log(list);

  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  /**
   * Load all customers
   */
  loadCustomer() {
    const params = new HttpParams()
      .set('keyword', '') // keyword search
      .set('employeeId', this._employeeId.toString()); // employee id
    this.customerService.getAll(params).subscribe(
      (res: ResponseValue<Customer[]>) => {
        // return list customers
        this.listCustomers = res.data;
        // set customerName as customerCode + ' - ' + customerName
        this.listCustomers.forEach(it => {
          it.customerName = it.customerCode + ' - ' + it.customerName;
        });
      }
    );
  }


  loadSalesCustomer() {
    const params = new HttpParams()
    .set('keyword', '')
    .set('branchId', this._branchId?.toString())
    .set('type', '1');
    this.busy = this.saleCustomerService.getAll(params).subscribe((res: ResponseValue<SalesCustomer[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listSalesCustomer = res.data;
        this.listSalesCustomer.forEach(it=>{
          it.customerName=it.customerCode + ' - ' + it.customerName;
        })
      }
    });
  }

  loadAllSalesCustomer() {
    const params = new HttpParams()
    .set('keyword', '')
    .set('branchId', this._branchId?.toString())
    .set('type', '3');
    this.busy = this.saleCustomerService.getAll(params).subscribe((res: ResponseValue<SalesCustomer[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listSalesCustomer = res.data;
        this.listSalesCustomer.forEach(it=>{
          it.customerName=it.customerCode + ' - ' + it.customerName;
        })
      }
    });
  }

  _customerId: number;
  loadHopDong(): void {
    const params = new HttpParams()
      .set('customerId', this._customerId?.toString())
      .set('branchId', this._branchId.toString());
    this.contractCustomerService.getAll(params).subscribe((res: ResponseValue<ContractCustomer[]>) => {
      this.listContracts = res.data;
    });
  }

  loadBaoGia(): void {
    const params = new HttpParams()
      .set('customerId', this._customerId?.toString())
      .set('branchId', this._branchId.toString());
    this.quotationCustomerService.getAll(params).subscribe((res: ResponseValue<QuotationCustomer[]>) => {
      this.listBaoGias = res.data;
    });
  }

  changedCustomer(item: Customer) {
    this._customerId = item.id;
    this.entity.customerId=item.id;
    this.loadHopDong();
    this.loadBaoGia();
  }

  loadFee() {
    const params = new HttpParams()
    this.feeService.getAll(params).subscribe((res: ResponseValue<Fee[]>) => {
      this.listFees = res.data?.filter(_ => _.groupCode == 'DT01');
    });
  }

  loadEmployee() {
    const params = new HttpParams()
      .set('branchId', '');
    this.employeeService.getAll(params).subscribe((res: ResponseValue<Employee[]>) => {
      this.listEmployees = res.data;
    });
  }

  listLoaiDichVus:OtherCategories[];
  listDVTs:OtherCategories[];
  listTienTes:OtherCategories[];
  loadOtherCategory() {
    const params = new HttpParams()
      .set('type', null);
    this.otherCategoriesService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      this.listLoaiDichVus = res.data.filter(x => x.type === 'SERVICE');
        this.listDVTs = res.data.filter(x => x.type === 'UNIT');
        this.listTienTes = res.data.filter(x => x.type === 'CURRENCY');
    });
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
    this.entity = {
      quotationNo:'',
      status: true,step:0,
      branchId: this._branchId,
      employeeId: this._employeeId,
      type: 2,
      refDate: moment(new Date()).format('DD/MM/YYYY'),
      managerId: (this._branchId ==5 || this._branchId==9)? 369:21
    };
    //Kiểm tra nếu là báo giá DK05 thì load dm KH chính thức, không thì load danh mục DK04

    this.loadCustomer();
    // if (_type == 0)
    //   this.loadCustomer();
    // else
    //   this.loadPotentialCustomer();
    this.flagXem = false;
    this.flagSave = false;
    this.inputTen(1);
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.quotationCustomerService.getDetail(id).subscribe((res: ResponseValue<QuotationCustomer>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        console.log(this.entity);
        
        if(this.entity.type==2 && this.entity.step==3)this.loadAllSalesCustomer();
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
        this.listDetails = this.entity.quotationCustomerDetails ?? [];
        if (this.listDetails && this.listDetails.length != 0) {
          this.listDetails.every(_ => _.tempId = _.id);
        }
        this.loadCustomer();
        // if (this.entity.type == 0)
        //   this.loadCustomer();
        // else
        //   this.loadPotentialCustomer();
        this._customerId = this.entity.customerId;
        this.loadHopDong();
        this.loadBaoGia();
        this.flagXem = flag;
        this.flagSave = false;
        //if(this._accept && (this.entity.step==2 || (this.entity.step==0&& this.entity.status)))this.flagXem=false;
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
    if (form.valid && !this.flagSave) {
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
      this.entity.quotationCustomerDetails = this.listDetails.filter(
        (x) => x.serviceId != null || x.feeId != null
      );
      let item = Object.assign({}, this.entity);
      if(this.isCapso) item.step=1;
      if (this.entity.id == undefined) {
        this.quotationCustomerService.add(item).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
            this.flagSave=false;
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
        this.quotationCustomerService.update(item).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
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
    }
  }
  approve(){
    let item:QuotationCustomer={
      id:this.entity.id,
      step:this.entity.step==0?1:2,
    }
    this.quotationCustomerService.updateApprove(item).subscribe((res: ResponseValue<any>) => {
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
      let item:QuotationCustomer={
        id:this.entity.id,
        branchId:this.entity.branchId,
        step:this.entity.step==0?1:2,
        status:true
      }
      this.quotationCustomerService.acceptStep(item).subscribe((res: ResponseValue<any>) => {
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
      let item:QuotationCustomer={
        id:this.entity.id,
        branchId:this._branchId,
        step:-1,
      }
      this.quotationCustomerService.acceptStep(item).subscribe((res: ResponseValue<any>) => {
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

  viewAttachFiles:boolean;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;
  showFiles(){
    this.viewAttachFiles=true;
    let item:Attachfiles={
      frmName:'QUOTATIONCUSTOMER',
      functionName:'QUOTATIONCUSTOMER',
      refNo: this.entity.id.toString()
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item,false);
    }, 50);
  }

  saveSuccessFile(event: any): void {
    console.log(event);
  }

  closeModalFile(){
    this.viewAttachFiles=false;
  }
  _type?:number;
  @ViewChild(ModalViewSublistComponent, { static: false }) modalViewSulbist: ModalViewSublistComponent;
  showViewSublist(type:number){
    this._type=type;
    this.viewSubList=true;
    setTimeout(() => {
      this.modalViewSulbist.view(type);
    }, 50);
  }

  saveSuccessSublist(event: any): void {
    switch (this._type) {
      case 1:
        this.entity.reference = event;
        break;
      case 2:
        this.entity.contents = event;
        break;
      case 3:
        this.entity.quotationConditions = event;
        break;
    }
  }

  closeModalSublist(){
    this.viewSubList=false;
  }

  inputTen(i: number) {
    if (this.listDetails?.length == 0) {
      let item: QuotationCustomerDetail = {
        tempId: 1,
        contents: '',
        amount: 0,
        notes: '',
        feeId: null,
        serviceId:null
      };
      this.listDetails.push(item);
    } else {
      let arrayId = this.listDetails.map((x) => x.tempId);
      let maxId = arrayId.reduce((a, b) => {
        return Math.max(a, b);
      });


      let item = this.listDetails.find((x) => x.tempId == maxId);
      if (item && (item.serviceId || item.feeId || item.serviceName)) {
        let item: QuotationCustomerDetail = {
          tempId: maxId + 1,
          contents: '',
          amount: 0,
          notes: '',
          feeId: null,
          serviceId:null
        };
        this.listDetails.push(item);
      }
    }
  }

  removeItem(i: number) {
    this.listDetails.splice(i, 1);
    this.listDetails = [...this.listDetails];
  }

}
