import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  KeyValueDiffer,
  KeyValueDiffers,
  OnDestroy,
  Output,
} from '@angular/core';
import 'daterangepicker';
import $ from 'jquery';

import { DaterangepickerConfig } from './daterangepicker-config.service';

/**
 * Directive [daterangepicker] — vendorized clone của ng2-daterangepicker.
 *
 * Lý do: ng2-daterangepicker khoá peerDependency @angular/core ^9 nên chặn
 * nâng Angular >= 16. Bản thân plugin nền (jQuery `daterangepicker`) độc lập
 * framework, nên ta tự host lại lớp wrapper mỏng này, GIỮ NGUYÊN selector +
 * input [options] + các output ((selected),(applyDaterangepicker),...).
 * => 250 file template KHÔNG phải sửa, chỉ đổi import module.
 *
 * Hành vi sao y bản gốc: dùng KeyValueDiffers theo dõi `options` + config.settings
 * trong ngDoCheck, re-render khi đổi, giữ lại range đang chọn.
 */
@Directive({
  selector: '[daterangepicker]',
})
export class DaterangepickerDirective implements AfterViewInit, OnDestroy {
  @Input() options: any = {};

  @Output() selected = new EventEmitter<any>();
  @Output() cancelDaterangepicker = new EventEmitter<any>();
  @Output() applyDaterangepicker = new EventEmitter<any>();
  @Output() hideCalendarDaterangepicker = new EventEmitter<any>();
  @Output() showCalendarDaterangepicker = new EventEmitter<any>();
  @Output() hideDaterangepicker = new EventEmitter<any>();
  @Output() showDaterangepicker = new EventEmitter<any>();

  private targetOptions: any = {};
  private _differ: { [key: string]: KeyValueDiffer<any, any> } = {};
  private datePicker: any;
  private activeRange: { start: any; end: any; label: any };

  constructor(
    private input: ElementRef,
    private config: DaterangepickerConfig,
    private differs: KeyValueDiffers,
  ) {
    this._differ['options'] = this.differs.find(this.options).create();
    this._differ['settings'] = this.differs.find(this.config.settings).create();
  }

  ngAfterViewInit(): void {
    this.render();
    this.attachEvents();
  }

  ngDoCheck(): void {
    const optionsChanged = this._differ['options'].diff(this.options);
    const settingsChanged = this._differ['settings'].diff(this.config.settings);
    if (optionsChanged || settingsChanged) {
      this.render();
      this.attachEvents();
      if (this.activeRange && this.datePicker) {
        this.datePicker.setStartDate(this.activeRange.start);
        this.datePicker.setEndDate(this.activeRange.end);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroyPicker();
  }

  private render(): void {
    this.targetOptions = Object.assign({}, this.config.settings, this.options);
    $(this.input.nativeElement).daterangepicker(this.targetOptions, this.callback.bind(this));
    if (this.options.customClasses && this.options.customClasses.length) {
      for (const customClass of this.options.customClasses) {
        this.datePicker = $(this.input.nativeElement).data('daterangepicker').container.addClass(customClass);
      }
    } else {
      this.datePicker = $(this.input.nativeElement).data('daterangepicker');
    }
  }

  private callback(start: any, end: any, label: any): void {
    this.activeRange = { start, end, label };
    this.selected.emit(this.activeRange);
  }

  private destroyPicker(): void {
    try {
      $(this.input.nativeElement).data('daterangepicker').remove();
    } catch (e: any) {
      console.log(e?.message);
    }
  }

  private attachEvents(): void {
    const el = $(this.input.nativeElement);
    el.on('cancel.daterangepicker', (e: any, picker: any) =>
      this.cancelDaterangepicker.emit({ event: e, picker }));
    el.on('apply.daterangepicker', (e: any, picker: any) =>
      this.applyDaterangepicker.emit({ event: e, picker }));
    el.on('hideCalendar.daterangepicker', (e: any, picker: any) =>
      this.hideCalendarDaterangepicker.emit({ event: e, picker }));
    el.on('showCalendar.daterangepicker', (e: any, picker: any) =>
      this.showCalendarDaterangepicker.emit({ event: e, picker }));
    el.on('hide.daterangepicker', (e: any, picker: any) =>
      this.hideDaterangepicker.emit({ event: e, picker }));
    el.on('show.daterangepicker', (e: any, picker: any) =>
      this.showDaterangepicker.emit({ event: e, picker }));
  }
}
