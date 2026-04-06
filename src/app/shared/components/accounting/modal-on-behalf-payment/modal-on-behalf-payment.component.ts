import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { OnBehalfPayment, OnBehalfPaymentPayment, OnBehalfPaymentInvoice, OnBehalfPaymentRecovery, ResponseValue, Supplier, Fee } from '@app/shared/models';
import { OnBehalfPaymentService, NotificationService, VietQrService, UtilityService } from '@app/shared/services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-on-behalf-payment',
  templateUrl: './modal-on-behalf-payment.component.html',
  styleUrls: ['./modal-on-behalf-payment.component.css']
})
export class ModalOnBehalfPaymentComponent implements OnInit {
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  @Output() SaveSuccess = new EventEmitter();

  entity: OnBehalfPayment = new OnBehalfPayment();
  payments: OnBehalfPaymentPayment[] = [];
  invoices: OnBehalfPaymentInvoice[] = [];
  recoveries: OnBehalfPaymentRecovery[] = [];

  activeTab: string = 'general';
  busy: Subscription;
  isView: boolean = false;
  
  // For QR QR Scan
  qrData: any = null;
  newPayment: OnBehalfPaymentPayment = new OnBehalfPaymentPayment();

  constructor(
    private service: OnBehalfPaymentService,
    private notificationService: NotificationService,
    private vietQrService: VietQrService,
    private utilityService: UtilityService
  ) { }

  ngOnInit(): void {
  }

  show(id?: number) {
    this.activeTab = 'general';
    this.newPayment = new OnBehalfPaymentPayment();
    this.newPayment.paymentMethod = 2;
    this.newPayment.paymentDate = new Date();
    
    if (id) {
      this.isView = true;
      this.loadDetail(id);
    } else {
      this.isView = false;
      this.entity = new OnBehalfPayment();
      this.entity.currency = 'VND';
      this.payments = [];
      this.invoices = [];
      this.recoveries = [];
      this.modalAddEdit.show();
    }
  }

  loadDetail(id: number) {
    this.service.getById(id).subscribe((res: ResponseValue<OnBehalfPayment>) => {
      this.entity = res.data;
      this.loadSubData(id);
      this.modalAddEdit.show();
    });
  }

  loadSubData(id: number) {
    this.service.getPayments(id).subscribe(res => this.payments = res.data);
    this.service.getInvoices(id).subscribe(res => this.invoices = res.data);
    this.service.getRecoveries(id).subscribe(res => this.recoveries = res.data);
  }

  save() {
    if (this.entity.id) {
      this.service.update(this.entity).subscribe(res => {
        this.notificationService.printSuccessMessage("Cập nhật thành công");
        this.SaveSuccess.emit();
        this.modalAddEdit.hide();
      });
    } else {
      this.service.create(this.entity).subscribe(res => {
        this.notificationService.printSuccessMessage("Tạo mới thành công");
        this.SaveSuccess.emit();
        this.modalAddEdit.hide();
      });
    }
  }

  // QR Scanning Logic
  async onQrFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const result = await this.vietQrService.scanImage(file);
      if (result.isValid) {
        this.qrData = result;
        this.notificationService.printSuccessMessage("Đã đọc mã QR thành công");
        
        // Auto-fill payment data
        this.newPayment.amount = result.amount || 0;
        this.newPayment.bankTransactionId = result.accountNumber;
        this.newPayment.note = result.content;
        this.newPayment.paymentDate = new Date();
        this.newPayment.paymentMethod = 2; // Transfer
        
        // If we are creating a new OnBehalfPayment and haven't set estimated amount, 
        // maybe take it from QR too?
        if (!this.entity.id && !this.entity.estimatedAmount) {
            this.entity.estimatedAmount = result.amount;
            this.entity.description = result.content;
        }
      } else {
        this.notificationService.printErrorMessage("Không thể đọc được mã QR từ ảnh này");
      }
    }
  }

  addPayment() {
    if (!this.entity.id) {
        this.notificationService.printErrorMessage("Vui lòng lưu thông tin chung trước khi thêm thanh toán");
        return;
    }
    this.newPayment.paymentId = this.entity.id;
    this.service.addPayment(this.newPayment).subscribe(res => {
        this.notificationService.printSuccessMessage("Đã thêm thanh toán");
        this.loadSubData(this.entity.id);
        this.newPayment = new OnBehalfPaymentPayment();
        this.newPayment.paymentMethod = 2;
        this.qrData = null;
    });
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }
}
