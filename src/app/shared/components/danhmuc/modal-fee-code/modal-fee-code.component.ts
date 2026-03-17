import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { FeeCode, ResponseValue, PaymentFeeGroup, RevenueFeeGroup, Fee } from '@app/shared/models';
import { NotificationService, FeeCodeService, PaymentFeeGroupService, RevenueFeeGroupService, FeeService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-fee-code',
  templateUrl: './modal-fee-code.component.html',
  styleUrls: ['./modal-fee-code.component.css']
})
export class ModalFeeCodeComponent implements OnInit {
  public entity: FeeCode;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public busy: Subscription;
  public targetLevel: number = 1;
  
  public listParentLvl1: FeeCode[] = [];
  public listParentLvl2: FeeCode[] = [];
  public listGroupPayment: PaymentFeeGroup[] = [];
  public listGroupRevenue: RevenueFeeGroup[] = [];
  public listFeeOld: Fee[] = [];

  _selectedParentLvl1: number;
  _selectedParentLvl2: number;
  _selectedFeeOldIds: number[] = [];

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  @ViewChild('aForm') aForm: ElementRef;

  constructor(
    private _notificationService: NotificationService, 
    private feeCodeService: FeeCodeService,
    private paymentFeeGroupService: PaymentFeeGroupService,
    private revenueFeeGroupService: RevenueFeeGroupService,
    private feeService: FeeService
  ) { }

  ngOnInit(): void {
    this.loadParents();
    this.loadGroupPayment();
    this.loadGroupRevenue();
    this.loadFeeOld();
  }

  loadFeeOld() {
    this.feeService.getAll(new HttpParams()).subscribe((res: ResponseValue<Fee[]>) => {
      this.listFeeOld = res.data;
    });
  }

  customSearch(term: string, item: Fee) {
    term = term.toLowerCase();
    return item.feeCode?.toLowerCase().indexOf(term) > -1 || 
           item.feeName?.toLowerCase().indexOf(term) > -1;
  }

  loadParents() {
    this.feeCodeService.getAll(null, 1, 2).subscribe((res: ResponseValue<FeeCode[]>) => {
      this.listParentLvl1 = res.data;
    });
  }

  onParentLvl1Change(item: any) {
    const id = item?.id || item;
    const actualId = typeof id === 'object' ? null : id;
    this._selectedParentLvl1 = actualId;
    this._selectedParentLvl2 = null;
    this.listParentLvl2 = [];
    if (actualId) {
      this.feeCodeService.getAll(actualId, 2, 2).subscribe((res: ResponseValue<FeeCode[]>) => {
        this.listParentLvl2 = res.data;
      });
      // For Level 3 modal, selecting Lvl 1 is just a filter, entity.parentId will be Lvl 2
      this.entity.parentId = null; 
    } else {
      this.entity.parentId = null;
    }
  }

  onParentLvl2Change(item: any) {
    const id = item?.id || item;
    const actualId = typeof id === 'object' ? null : id;
    this._selectedParentLvl2 = actualId;
    if (actualId) {
      this.entity.parentId = actualId;
    } else {
      this.entity.parentId = null;
    }
  }

  loadGroupPayment() {
    this.paymentFeeGroupService.getAll().subscribe((res: ResponseValue<PaymentFeeGroup[]>) => {
      this.listGroupPayment = res.data;
    });
  }

  loadGroupRevenue() {
    this.revenueFeeGroupService.getAll().subscribe((res: ResponseValue<RevenueFeeGroup[]>) => {
      this.listGroupRevenue = res.data;
    });
  }

  add(lvl: number = 1) {
    this.targetLevel = lvl;
    this.entity = {
      level: lvl,
      status: 0
    };
    this._selectedParentLvl1 = null;
    this._selectedParentLvl2 = null;
    this._selectedFeeOldIds = [];
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.feeCodeService.getDetail(id).subscribe((res: ResponseValue<FeeCode>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.targetLevel = this.entity.level;
        this.flagXem = flag;
        this.flagSave = false;

        // Map old IDs from string to array
        if (this.entity.mappingFeeIds) {
          this._selectedFeeOldIds = this.entity.mappingFeeIds.split(',').map(x => +x);
        } else {
          this._selectedFeeOldIds = [];
        }
        
        // Handle parents for edit
        if (this.entity.level == 3) {
            // Need to find parent of parent
            this.feeCodeService.getDetail(this.entity.parentId.toString()).subscribe(p => {
                if (p.data) {
                    this._selectedParentLvl1 = p.data.parentId;
                    this._selectedParentLvl2 = this.entity.parentId;
                    // Load Level 2 list options based on parent Level 1
                    this.feeCodeService.getAll(this._selectedParentLvl1, 2, 2).subscribe(res2 => {
                        this.listParentLvl2 = res2.data;
                    });
                }
            });
        }

        this.modalAddEdit.show();
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.SYSTEM_ERROR_MSG);
      }
    });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      // Convert array to comma-separated string
      this.entity.mappingFeeIds = this._selectedFeeOldIds?.join(',');

      if (this.entity.id == undefined) {
        this.feeCodeService.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          } else {
            this._notificationService.printErrorMessage(res.message);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.feeCodeService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          this.modalAddEdit.hide();
          form.resetForm();
          this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
          this.SaveSuccess.emit(res.data);
        }, () => {
          this.flagSave = false;
        });
      }
    }
  }

  onHidden() {
    this.CloseModal.emit();
  }
}
