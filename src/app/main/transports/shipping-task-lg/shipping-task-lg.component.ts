import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalAttachfileComponent } from '@app/shared/components/systems/modal-attachfile/modal-attachfile.component';
import { ModalDispatchOrderFclComponent } from '@app/shared/components/transports/modal-dispatch-order-fcl/modal-dispatch-order-fcl.component';
import { ModalShippingTaskCsComponent } from '@app/shared/components/transports/modal-shipping-task-cs/modal-shipping-task-cs.component';
import { ModalShippingTaskOpmanComponent } from '@app/shared/components/transports/modal-shipping-task-opman/modal-shipping-task-opman.component';
import { MessageContstants } from '@app/shared/constants';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { Customer, Branch, Profile, ResponseValue, OtherCategories } from '@app/shared/models';
import { ShippingTask } from '@app/shared/models/transports/shipping-task.model';
import { NotificationService, UtilityService, CustomerService, AuthService, BranchService, OtherCategoriesService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import { GetDayService } from '@app/shared/services/get-day.service';
import { ShippingTaskService } from '@app/shared/services/transports/shipping-task.service';
import * as moment from 'moment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription,interval } from 'rxjs';

@Component({
  selector: 'app-shipping-task-lg',
  templateUrl: './shipping-task-lg.component.html',
  styleUrls: ['./shipping-task-lg.component.css']
})
export class ShippingTaskLgComponent implements OnInit {
pageIndex=1;
  flagDelete = false;
  keyword = '';
  listWorkflow: ShippingTask[];
  filteredData:ShippingTask[];
  listNhanviec:ShippingTask[]=[];
  listCustomer: Customer[];
  listBranch:Branch[]=[];
  branchId?:number;
  userLoged?: Profile;
  busy: Subscription;
  viewModal = false;
  viewModalOpMan=false;
  viewGrade: boolean = false;
  viewAttachFile = false;
  currentDate: Date;
  day?:number;
  month: number;
  year: number;
  listDay:number[]=[];
  totalrows=0;
  selectedTypeCs=0;
  listGroup: number[] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
  selecteDate: string = moment(new Date()).format('DD/MM/YYYY');
  listShipmentType :any[];
  public flagLinkEdit: boolean = false;
  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
  viewModalDispatchOrder:boolean=false;
  filterColumns: { [key: string]: string } = {};

  maskNumber = UtilityService.maskNumber;
  
  @ViewChild(ModalDispatchOrderFclComponent, { static: false }) modalDispatchOrder: ModalDispatchOrderFclComponent
  @ViewChild(ModalShippingTaskCsComponent, { static: false }) modalAddEdit: ModalShippingTaskCsComponent
  @ViewChild(ModalShippingTaskOpmanComponent, { static: false }) modalOpManEdit: ModalShippingTaskOpmanComponent
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttachFile: ModalAttachfileComponent
  constructor(private service: ShippingTaskService,private spinner: NgxSpinnerService,
    private notificationService: NotificationService, private _utilityService: UtilityService, private customerService: CustomerService
    , private _authService: AuthService,private datePipe: DatePipe,private exportService:ExportService
    , private branchService:BranchService, private dayService:GetDayService,private otherCategoriesService:OtherCategoriesService
  ) { }


  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.branchId=Number.parseInt(this.userLoged.branchId);
    this.loadData();
    //this.loadReceiving();
    this.loadBranch();
    this.loadOtherCategory();
    // this.refreshSubscription = interval(5 * 60 * 1000).subscribe(() => {
    //   this.loadData();
    // });

  }
  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    //this.selecteDate= moment(this.ngayBatDau).format('DD/MM/YYYY');
    this.loadData();
  }
  exportExcel(){
    this.exportService.exportExcel(this.filteredData,'thuc-hien-cong-viec-vc');
  }
  loadBranch() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }
  changedBranch(event:Branch){
    this.branchId=event?.id;
    this.loadData();
  }

  loadOtherCategory() {
    const params = new HttpParams()
      .set('type', 'SHIPMENT_T02');
    this.otherCategoriesService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      this.listShipmentType=[];
       res.data.forEach(x=>this.listShipmentType.push({id:x.id.toString(),text:x.categoryCode,name:x.categoryName}));
    });
  }

  assign(flag:boolean){
    this.listNhanviec.forEach(it=>{
      if(it.checked){
        it.status=flag?2:-1;
        this.busy = this.service.setReceiving(it).subscribe((res: ResponseValue<ShippingTask[]>) => {
        if (res.code == '200' || res.code == '201') {
        
        }else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
        });
      }
    });
    this.loadData();
    //this.loadReceiving();
  }
  // Danh sách các cột chứa DateTime
  dateTimeFields: string[] = ['createdDate', 'pickupTime', 'cutOffTime', 'demurageTime', 'detentionTime'];
  filterData(): void {
      this.filteredData = this.listWorkflow.filter((item) => {
        return Object.keys(this.filterColumns).every((key) => {
          if (!this.filterColumns[key]) return true; // Nếu không nhập gì, bỏ qua filter
          const filterValue = this.filterColumns[key].toString().toLowerCase();
          const itemValue =
          this.dateTimeFields.includes(key) // Kiểm tra nếu key nằm trong danh sách DateTime
            ? this.datePipe.transform(item[key], "dd/MM/yyyy HH:mm").toLowerCase()
            : String(item[key]).toLowerCase();
          return itemValue.includes(filterValue);
        });
      });
    }
  loadData(): void {
    this.spinner.show('spinner1');
        let tuNgay = moment(this.ngayBatDau).format('YYYYMMDD');
        let denNgay = moment(this.ngayKetThuc).format('YYYYMMDD');
    const params = new HttpParams()
      .set('fromDate', tuNgay)
      .set('toDate', denNgay)
      .set('branchId', this.branchId?this.branchId.toString():'0')
      .set('keyword',this.keyword)
    this.busy = this.service.getAllByOpMan(params).subscribe((res: ResponseValue<ShippingTask[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listWorkflow = res.data;  
        this.spinner.hide('spinner1');
        this.filterData();
      }
      else {
        if (res.code == '204') {
          this.listWorkflow = [];
          this.spinner.hide('spinner1');
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
        this.spinner.hide('spinner1');
      }
    });
  } 

  updatePlanning(event:ShippingTask){
    this.service.updatePlanning(event).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
        this.loadData();
      }});
  }
  updateNote(event:ShippingTask){
    debugger;
    this.service.updateOpMan(event.id,2,false,event.opManNote).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
      }});
  }
  updateMinutes(event:ShippingTask){
    this.service.updateOpMan(event.id,0,event.hasMinutes,'').subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
      }});
  }
  updateOrders(event:ShippingTask){
    this.service.updateOpMan(event.id,1,event.hasOrders,'').subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
      }});
  }
  updateContainer(event:ShippingTask){
    this.service.updateContainer(event).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
        this.loadData();
      }});
  }
  updateWeight(event:ShippingTask){
    this.service.updateContainer(event).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
        this.loadData();
      }});
  }
  pageChanged(event: PageChangedEvent): void {
    this.pageIndex = event.page;
  }

  viewModalAttachFile(event:ShippingTask){

  }
  closeModalAttach(){
    this.viewAttachFile=false;
  }

  clickRowCongviec(item: ShippingTask): void {
    if(item.status<1 || item.refNo?.length>0)return;//Nếu chưa chuyển điều vận thì không được chọn
    item.checked = !item.checked;
    let listChecks = this.listWorkflow.filter(x => x.checked);
    this.flagDelete = listChecks.length > 0 && !listChecks.some(x => x.refNo?.length > 0);
  }

  async updateGroup(){
    if(this.listWorkflow.length<1)return;
    await this.updateGroupAsync(this.listWorkflow);
    this.loadData (); // Hàm khác được gọi sau khi createDebitNote hoàn tất
  }

    async updateGroupAsync(list:ShippingTask[] ): Promise<void> {
      if (list?.length > 0) {
        for (const item of list) {
          try {
            // Gọi API để lấy thông tin shipment
            debugger;
            const res = await this.service.updatePlanning(item).toPromise();
            if (res.code == "200" || res.code == "201") {
              console.log(res);
              
            }
          } catch (error) {
            console.error(`Error processing ShippingTask ID: ${item.id}`, error);
          }
        }
      }
    }

  timKiem(): void {
    this.loadData();
  }

  add(): void {
    let item:ShippingTask = {
      checked: false,
      status: 0,taskType:0
    };
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add(item,true);
    }, 50);
  }

  copy(item:ShippingTask): void {
    let copy = Object.assign({}, item);
    copy.status=0;
    copy.id=undefined;
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add(copy,false);
    }, 50);
  }


  edit(flag: boolean): void {
    const index = this.listWorkflow.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listWorkflow[index].id.toString(), flag || (this.userLoged.id != this.listWorkflow[index].createdBy));
    }, 50);
  }
  @ViewChild(ModalShippingTaskCsComponent, { static: false }) modalShippingTaskCs: ModalShippingTaskCsComponent

  showModal(event:ShippingTask){
    this.viewModal=true;
    setTimeout(() => {
      this.modalShippingTaskCs.edit(event.id.toString(), true);
    }, 50);
  }
  createDispatchOrder(): void {
    let listChecks = this.listWorkflow.filter(x => x.checked);
    this.viewModalDispatchOrder=true;
    setTimeout(() => {
      this.modalDispatchOrder.add(listChecks);
    }, 50);
  }

  delete(id: number): void {
    this.service.delete(id).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }

 



  saveSuccess(): void {
    this.loadData();
  }

  closeModal(): void {
    this.viewModal = false;
  }
  closeModalOpMan(): void {
    this.viewModalOpMan = false;
  }
  closeModalDispatchOrder(): void {
    this.viewModalDispatchOrder = false;
  }

}
