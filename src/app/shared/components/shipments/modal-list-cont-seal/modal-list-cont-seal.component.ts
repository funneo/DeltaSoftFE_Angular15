import { HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { OtherCategories, ResponseValue, Shipment, ShipmentContSeal } from '@app/shared/models';
import { OtherCategoriesService, ShipmentService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'modal-list-cont-seal',
  templateUrl: './modal-list-cont-seal.component.html',
  styleUrls: ['./modal-list-cont-seal.component.css']
})
export class ModalListContSealComponent implements OnInit {
  entity:Shipment
  isSelected = false;
  selectedContSeal?:ShipmentContSeal={};
  listFilter?:ShipmentContSeal[]=[];
  listContTypes:OtherCategories[]=[];

  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalListShipmentContSeals', { static: false }) modalListShipmentContSeals: ModalDirective;
  
  filterColumns = {
    contType: '',
    contNo: '',
    sealNo: '',
    gw: ''
  };

  constructor( private otherCategoriesService:OtherCategoriesService, private shipmentService:ShipmentService,private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadOtherCategory();
  }

  loadOtherCategory() {
    const params = new HttpParams()
      .set('type', null);
    this.otherCategoriesService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      this.listContTypes = res.data.filter(x => x.type === 'SHIPMENT_T04');
    });
  }
  filterData(): void {
  this.listFilter = [...this.entity.shipmentContSeals];

  this.listFilter = this.listFilter.filter((item) => {
    return Object.keys(this.filterColumns).every((key) => {
      const rawFilter = this.filterColumns[key];
      if (!rawFilter) return true; // Bỏ qua nếu chưa nhập gìá trị lọc
      const filterValue = rawFilter.toLowerCase();
      const itemValue = String(item[key] ?? '').toLowerCase();
      return itemValue.includes(filterValue);
    });
  });

  this.cdr.detectChanges();
}


  view(id: number) {
    this.shipmentService.getDetail(id.toString()).subscribe((res: ResponseValue<Shipment>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.filterData();
        this.modalListShipmentContSeals.show();
      }});
  }

  clickRow(item:ShipmentContSeal){
    if(item!=null){
      this.isSelected=true;
      this.selectedContSeal=item;
    }
  }
  
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  saveChange() {
     this.SaveSuccess.emit(this.selectedContSeal);
     this.modalListShipmentContSeals.hide();
  }

  OnHidden() {
    this.CloseModal.emit();
  }
}
