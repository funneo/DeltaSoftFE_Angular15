import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { ResponseValue } from '@app/shared/models';
import { TransportCategory } from '@app/shared/models/danhmuc/transport-category.model';
import { SalesMarketingSublist } from '@app/shared/models/sales-marketing/sales-marketing-sublist.model';
import { NotificationService, UtilityService } from '@app/shared/services';
import { SalesSublistService } from '@app/shared/services/sales-marketing/sales-sublist.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal-view-sublist',
  templateUrl: './modal-view-sublist.component.html',
  styleUrls: ['./modal-view-sublist.component.css']
})
export class ModalViewSublistComponent implements OnInit {


  data:SalesMarketingSublist[]=[];
  filterName: string = ''; // Giá trị filter cho cột tên
  filterDescription: string = ''; // Giá trị filter cho cột mô tả
  filteredData: SalesMarketingSublist[] = []; // Dữ liệu sau khi lọc
  sortDirection: boolean = true; // Hướng sắp xếp (true: tăng dần, false: giảm dần)
  listType:any[]=UtilityService.listQuotationSublist();
  listLanguages:any[]=UtilityService.listLanguages();
  _type=1;
  _languages='VN'
  busy:Subscription;
  listData:SalesMarketingSublist[]=[];
  isChecked=false;
  filterColumns: { [key: string]: string } = {};

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(
    private _notificationService: NotificationService,
    private _salesMarketingSublistService: SalesSublistService,

    
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Đổi ngôn ngữ
   * @throws Error Method not implemented
   */
  changeLanguage() {
    this.loadData();
  }
  clickRow(event:SalesMarketingSublist){
    event.checked = !event.checked;
    this.isChecked=this.icheck();
  }
  icheck():boolean{
      return this.filteredData.some(x => x.checked);
  }

  view(type:number){
    this._type=type;
    this.modalAddEdit.show();
  }

  loadData(): void {
    const params = new HttpParams()
      .set('type', this._type.toString())
      .set('languages', this._languages)
            this.busy = this._salesMarketingSublistService.getAll(params).subscribe((res: ResponseValue<TransportCategory[]>) => {
        if (res.code == '200' || res.code == '201' || res.code == '204') {
          this.listData = res.data;
          this.filterData();
        }
        else {
          this._notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }
    // Lọc dữ liệu theo tên và mô tả
    filterData() {
      this.filteredData = this.listData.filter((item) => {
        return Object.keys(this.filterColumns).every((key) => {
          const filterValue = this.filterColumns[key].toString().toLowerCase();
          const itemValue =String(item[key]).toLowerCase();
          return itemValue.includes(filterValue);
        });
      });
    }  
    // Sắp xếp dữ liệu theo cột
    sortData(column: string) {
      this.sortDirection = !this.sortDirection; // Đổi chiều sắp xếp
      this.filteredData.sort((a, b) => {
        if (a[column] < b[column]) {
          return this.sortDirection ? -1 : 1;
        } else if (a[column] > b[column]) {
          return this.sortDirection ? 1 : -1;
        } else {
          return 0;
        }
      });
    }
    selectedItemsText?:string;
    confirmSelection() {
      // Lọc các mục đã được chọn
      const selectedItems = this.filteredData.filter(item => item.checked);
      if (selectedItems.length > 0) {
        // Tạo chuỗi các tên đã được chọn, mỗi tên trên một dòng
        this.selectedItemsText = selectedItems.map(item => item.name).join('\n - ');
      } else {
        this.selectedItemsText = '';
      }
      this.selectedItemsText = this.selectedItemsText ? ` - ${this.selectedItemsText}` : '';
      // Ẩn modal
      this.modalAddEdit.hide();
      this.SaveSuccess.emit(this.selectedItemsText);
    }
  
  OnHidden() {
    this.CloseModal.emit();
  }
  ngOnDestroy(): void {
    if (this.busy) {
      this.busy.unsubscribe();
    }
  }
}
