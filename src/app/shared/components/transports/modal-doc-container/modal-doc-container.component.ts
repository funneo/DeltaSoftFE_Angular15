import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GeminiAiService, ContainerExtractionResult } from '@app/shared/services/gemini-ai.service';

interface PickedImage {
  file: File;
  previewUrl: string;
}

// Đọc số container bằng Gemini AI từ NHIỀU ảnh của CÙNG 1 container (góc/khoảng cách khác nhau).
// Component DÙNG CHUNG (picker-style, theo khuôn deltasoft-picker): không lưu DB, chỉ đọc rồi
// emit SelectItem về form cha — nơi nào cần điền "Số container" đều nhúng được component này.
@Component({
  selector: 'modal-doc-container',
  templateUrl: './modal-doc-container.component.html',
  styleUrls: ['./modal-doc-container.component.css'],
})
export class ModalDocContainerComponent {
  images: PickedImage[] = [];
  result: ContainerExtractionResult;
  containerNoEdit = '';
  loading = false;
  errorMsg: string;

  @Output() SelectItem: EventEmitter<string> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild('modalDocContainer', { static: false }) modalDocContainer: ModalDirective;

  constructor(private _geminiAiService: GeminiAiService) {}

  show() {
    this.images.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    this.images = [];
    this.result = null;
    this.containerNoEdit = '';
    this.loading = false;
    this.errorMsg = null;
    this.modalDocContainer.show();
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    for (const f of files) {
      if (this.images.length >= 6) break; // đủ nhiều góc, tránh lạm dụng
      this.images.push({ file: f, previewUrl: URL.createObjectURL(f) });
    }
    input.value = ''; // cho phép chọn lại đúng file vừa xóa
  }

  removeImage(idx: number) {
    URL.revokeObjectURL(this.images[idx].previewUrl);
    this.images.splice(idx, 1);
  }

  get canRead(): boolean {
    return this.images.length > 0 && !this.loading;
  }

  read() {
    if (!this.canRead) return;
    this.loading = true;
    this.errorMsg = null;
    this.result = null;
    this._geminiAiService.extractContainer(this.images.map((i) => i.file)).subscribe(
      (res) => {
        this.loading = false;
        this.result = res;
        if (res?.error) {
          this.errorMsg = res.error;
          this.containerNoEdit = res.containerNo || '';
          return;
        }
        this.containerNoEdit = res.containerNo || '';
      },
      () => {
        this.loading = false;
        this.errorMsg = 'Không gọi được API đọc container. Vui lòng thử lại.';
      }
    );
  }

  get containerNoValid(): boolean {
    return /^[A-Z]{4}[0-9]{7}$/.test((this.containerNoEdit || '').toUpperCase());
  }

  confirm() {
    const value = (this.containerNoEdit || '').toUpperCase().replace(/\s/g, '');
    if (!value) return;
    this.SelectItem.emit(value);
    this.modalDocContainer.hide();
  }

  close() {
    this.modalDocContainer.hide();
  }

  OnHidden() {
    this.images.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    this.CloseModal.emit();
  }
}
