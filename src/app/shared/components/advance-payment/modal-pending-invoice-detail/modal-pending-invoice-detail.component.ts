import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { environment } from '@environments/environment';
import { AuthService, NotificationService } from '@app/shared/services';
import { PendingInvoice, PendingInvoiceService } from '@app/shared/services/pending-invoice.service';

/** 1 dòng hàng hóa/dịch vụ (khớp lineItems của AI). */
interface InvoiceLineItem {
  description?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  amount?: number;
}

/**
 * Modal XEM + SỬA chi tiết hóa đơn đã đọc (PendingInvoice).
 * Dùng lại bố cục thẻ màu của modal "Đọc hóa đơn AI".
 * - Người TẠO (hoặc Admin) được bật chế độ Sửa khi hóa đơn còn Status=0.
 * - Lưu gọi /api/pendingInvoice/updateInvoice (BE chặn quyền + check trùng lại).
 */
@Component({
  selector: 'modal-pending-invoice-detail',
  templateUrl: './modal-pending-invoice-detail.component.html',
  styleUrls: ['./modal-pending-invoice-detail.component.css']
})
export class ModalPendingInvoiceDetailComponent {
  @ViewChild('modalDetail', { static: false }) modal: ModalDirective;
  @Output() CloseModal = new EventEmitter<any>();
  @Output() SaveSuccess = new EventEmitter<any>();

  entity: PendingInvoice = {};
  lineItems: InvoiceLineItem[] = [];
  editing = false;
  saving = false;
  canEdit = false;

  constructor(
    private service: PendingInvoiceService,
    private notificationService: NotificationService,
    private authService: AuthService,
  ) { }

  show(item: PendingInvoice) {
    this.entity = JSON.parse(JSON.stringify(item || {}));   // clone để hủy sửa không ảnh hưởng list
    this.lineItems = this.parseLineItems(this.entity.lineItemsJson);
    this.editing = false;
    this.saving = false;
    this.canEdit = this.computeCanEdit(item);
    this.modal.show();
  }

  /** Chỉ người tạo (hoặc admin) + hóa đơn còn ở trạng thái chờ (0) mới được sửa. */
  private computeCanEdit(item: PendingInvoice): boolean {
    if (!item || item.status !== 0 || item.usedByPaymentId) return false;
    const user = this.authService.getLoggedInUser();
    if (!user) return false;
    if (user.isAdmin) return true;
    const me = (user.id || '').toLowerCase();
    const owner = (item.createdBy || '').toLowerCase();
    return !!owner && owner === me;
  }

  private parseLineItems(json: string | undefined | null): InvoiceLineItem[] {
    if (!json) return [];
    try { const arr = JSON.parse(json); return Array.isArray(arr) ? arr : []; } catch { return []; }
  }

  get totalLineItems(): number {
    return this.lineItems.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  }

  startEdit() {
    if (!this.canEdit) return;
    this.editing = true;
  }

  cancelEdit() {
    // Khôi phục lại từ entity gốc (entity đang là bản clone của row list; reparse lineItems).
    this.lineItems = this.parseLineItems(this.entity.lineItemsJson);
    this.editing = false;
  }

  addLineItem() {
    this.lineItems.push({ description: '', quantity: null, unit: '', unitPrice: null, amount: null });
  }

  removeLineItem(i: number) {
    this.lineItems.splice(i, 1);
  }

  /** Tự tính thành tiền = SL × đơn giá khi sửa (nếu cả 2 có giá trị). */
  recalcLine(it: InvoiceLineItem) {
    const q = Number(it.quantity);
    const p = Number(it.unitPrice);
    if (!isNaN(q) && !isNaN(p)) it.amount = q * p;
  }

  save() {
    this.saving = true;
    this.entity.lineItemsJson = JSON.stringify(this.lineItems || []);
    this.service.update(this.entity).subscribe(
      (res: any) => {
        this.saving = false;
        if (res?.code == '200' || res?.code == '201') {
          this.notificationService.printSuccessMessage('Đã lưu thay đổi hóa đơn.');
          // Cập nhật lại entity từ row BE trả (đã snapshot trùng).
          const row = res.data?.row;
          if (row) {
            this.entity = row;
            this.lineItems = this.parseLineItems(row.lineItemsJson);
          }
          this.editing = false;
          this.SaveSuccess.emit(res.data);
        } else if (res?.code == '403') {
          this.notificationService.printErrorMessage(res.message || 'Chỉ người tạo mới được sửa.');
        } else {
          this.notificationService.printErrorMessage('Lưu thất bại: ' + (res?.message ?? ''));
        }
      },
      (err) => {
        this.saving = false;
        this.notificationService.printErrorMessage('Lưu lỗi: ' + (err?.message ?? err));
      }
    );
  }

  close() {
    this.modal.hide();
    this.CloseModal.emit();
  }

  /**
   * Link xem file gốc — ưu tiên S3 (public-read, xem được mọi nơi không cần server local public).
   * Fallback đường dẫn local chỉ khi chưa có key S3 (hóa đơn cũ / S3 upload lỗi).
   */
  get fileUrl(): string {
    const key = (this.entity?.pathFileS3 || '').trim();
    if (key) return environment.s3BaseUrl + key.replace(/^\/+/, '');
    const local = (this.entity?.pathFileLocal || '').trim();
    return local ? local.replace(/^~\//, '/') : '';
  }

  /** Nguồn file đang dùng để hiển thị nhãn (S3 / local). */
  get fileIsS3(): boolean { return !!(this.entity?.pathFileS3 || '').trim(); }
}
