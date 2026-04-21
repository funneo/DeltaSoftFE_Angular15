import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NotificationService } from '@app/shared/services';
import { GeminiAiService, InvoiceExtractionResult } from '@app/shared/services/gemini-ai.service';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'modal-doc-hoa-don',
  templateUrl: './modal-doc-hoa-don.component.html',
  styleUrls: ['./modal-doc-hoa-don.component.css']
})
export class ModalDocHoaDonComponent implements OnInit {
  @ViewChild('modalDocHoaDon', { static: false }) modal: ModalDirective;
  @Output() CloseModal = new EventEmitter<any>();

  loading = false;
  result: InvoiceExtractionResult = null;
  fileName = '';
  previewUrl: string = null;
  isImage = false;

  constructor(
    private geminiService: GeminiAiService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void { }

  show() {
    this.reset();
    this.modal.show();
  }

  close() {
    this.modal.hide();
    this.CloseModal.emit();
  }

  reset() {
    this.result = null;
    this.loading = false;
    this.fileName = '';
    this.previewUrl = null;
    this.isImage = false;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
      input.value = '';
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  private processFile(file: File) {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      this.notificationService.printErrorMessage('Chỉ hỗ trợ file ảnh (JPG, PNG, GIF, WEBP) và PDF');
      return;
    }
    this.fileName = file.name;
    this.result = null;
    this.loading = true;

    this.isImage = file.type.startsWith('image/');
    if (this.isImage) {
      const reader = new FileReader();
      reader.onload = (e) => { this.previewUrl = e.target.result as string; };
      reader.readAsDataURL(file);
    } else {
      this.previewUrl = null;
    }

    this.geminiService.extractInvoice(file).subscribe(
      (res: InvoiceExtractionResult) => {
        this.result = res;
        this.loading = false;
      },
      (err) => {
        this.loading = false;
        this.notificationService.printErrorMessage('Lỗi khi phân tích hóa đơn: ' + (err?.message ?? err));
      }
    );
  }

  get totalLineItems(): number {
    return this.result?.lineItems?.reduce((sum, i) => sum + (i.amount ?? 0), 0) ?? 0;
  }

  openWebLink() {
    if (this.result?.webLink) {
      window.open(this.result.webLink, '_blank');
    }
  }
}
