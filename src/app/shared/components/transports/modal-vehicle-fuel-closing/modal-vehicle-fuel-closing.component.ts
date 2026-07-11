import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { Profile, ResponseValue } from '@app/shared/models';
import { Vihicle } from '@app/shared/models/vihicle';
import { Employee } from '@app/shared/models/employee.model';
import { AuthService } from '@app/shared/services/auth.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { UtilityService } from '@app/shared/services/utility.service';
import { VihicleService } from '@app/shared/services/vihicle.service';
import { EmployeeService } from '@app/shared/services/employee.service';
import { DriverFuelClosingService } from '@app/shared/services/transports/driver-fuel-closing.service';
import { DriverFuelClosing, DriverFuelClosingDetail } from '@app/shared/models/transports/driver-fuel-closing.model';
import { MessageContstants } from '@app/shared/constants';

/**
 * Modal Chốt dầu lái xe — chốt theo XE.
 * Công thức: NetLiters = TopUpLiters - Q3 - Q2 - Q1
 * NetAmount = ABS(NetLiters) * OilPrice (luôn trừ lương).
 */
@Component({
  selector: 'modal-vehicle-fuel-closing',
  templateUrl: './modal-vehicle-fuel-closing.component.html',
  styleUrls: ['./modal-vehicle-fuel-closing.component.css']
})
export class ModalVehicleFuelClosingComponent implements OnInit {
  public entity: DriverFuelClosing = {};
  public flagXem: boolean = false;
  public flagNew: boolean = true;
  public flagSave: boolean = false;
  public title: string = '';
  public viewModal?: boolean = false;
  public busy: Subscription;

  listVihicle: Vihicle[] = [];
  listDriver: Employee[] = [];

  closeReasons = [
    { value: 1, text: 'Cuối tháng' },
    { value: 2, text: 'Tài nghỉ giữa kỳ' },
    { value: 3, text: 'Đổi xe' },
    { value: 9, text: 'Khác' }
  ];

  ngayBatDau: Date;
  ngayKetThuc: Date;
  dateOptions: any;

  public userLoged: Profile;
  maskNumber = UtilityService.maskNumber;
  mask0 = UtilityService.mask0;

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  @ViewChild('f', { static: false }) ngFormRef: NgForm;

  constructor(
    private _authService: AuthService,
    private _notificationService: NotificationService,
    private _utilityService: UtilityService,
    private vihicleService: VihicleService,
    private employeeService: EmployeeService,
    private driverFuelClosingService: DriverFuelClosingService
  ) {}

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.ngayBatDau = moment().startOf('month').toDate();
    this.ngayKetThuc = moment().endOf('month').toDate();
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.loadVihicle();
    this.loadDriver();
  }

  loadVihicle() {
    const params = new HttpParams()
      .set('branchid', this.userLoged.branchId.toString())
      .set('vihicletype', '0');
    this.busy = this.vihicleService.getAll(params).subscribe((res: ResponseValue<Vihicle[]>) => {
      if (res.code == '200' || res.code == '201') this.listVihicle = res.data ?? [];
    });
  }

  loadDriver() {
    const params = new HttpParams().set('branchId', this.userLoged.branchId.toString());
    this.busy = this.employeeService.getByBranch(params).subscribe((res: ResponseValue<Employee[]>) => {
      if (res.code == '200' || res.code == '201') this.listDriver = res.data ?? [];
    });
  }

  // ====== Open modal ======
  add(): void {
    this.flagNew = true;
    this.flagXem = false;
    this.flagSave = false;
    this.title = 'Thêm phiếu chốt dầu';
    const fromD = moment().startOf('month').toDate();
    const toD = moment().endOf('month').toDate();
    this.entity = {
      branchId: Number.parseInt(this.userLoged.branchId),
      fromDate: moment(fromD).format('YYYY-MM-DD'),
      toDate: moment(toD).format('YYYY-MM-DD'),
      closeReason: 1,
      oilPrice: 0,
      supplyOperQty: 0, demandOperQty: 0, netOperLiters: 0, netOperAmount: 0,
      supplyGenQty: 0, demandGenQty: 0, netGenLiters: 0, netGenAmount: 0,
      leftoverQty: 0,
      netLiters: 0,
      netAmount: 0,
      status: 0,
      detaileds: []
    };
    this.ngayBatDau = fromD;
    this.ngayKetThuc = toD;
    this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
    this.modalAddEdit?.show();
  }

  edit(id: number, flagXem: boolean): void {
    this.flagNew = false;
    this.flagXem = flagXem;
    this.flagSave = false;
    this.title = flagXem ? 'Xem phiếu chốt dầu' : 'Sửa phiếu chốt dầu';
    this.busy = this.driverFuelClosingService.getById(id).subscribe((res: ResponseValue<DriverFuelClosing>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data ?? {};
        this.entity.detaileds = (this.entity.detaileds ?? []).map(d => ({ ...d, checked: true }));
        this.ngayBatDau = this.entity.fromDate ? new Date(this.entity.fromDate) : moment().startOf('month').toDate();
        this.ngayKetThuc = this.entity.toDate ? new Date(this.entity.toDate) : moment().endOf('month').toDate();
        this.dateOptions = this._utilityService.dateOptionMultis(this.ngayBatDau, this.ngayKetThuc);
        this.recalcSummary();
        this.modalAddEdit?.show();
      } else {
        this._notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG);
      }
    });
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.entity.fromDate = moment(this.ngayBatDau).format('YYYY-MM-DD');
    this.entity.toDate = moment(this.ngayKetThuc).format('YYYY-MM-DD');
  }

  vihicleChanged(v: Vihicle) {
    this.entity.vihicleId = v?.id;
    this.entity.vihicleLicensePlate = v?.licensePlates;
    if (this.flagNew) {
      this.entity.detaileds = [];
      this.recalcSummary();
    }
  }

  driverChanged(d: Employee) {
    this.entity.driverId = d?.id;
    this.entity.driverName = d?.employeeFullName;
  }

  // ====== Tải dữ liệu ứng viên ======
  loadCandidates() {
    if (!this.entity.vihicleId) {
      this._notificationService.printErrorMessage('Vui lòng chọn xe.');
      return;
    }
    if (!this.entity.fromDate || !this.entity.toDate) {
      this._notificationService.printErrorMessage('Vui lòng chọn kỳ chốt.');
      return;
    }
    this.busy = this.driverFuelClosingService
      .getCandidates(
        this.entity.branchId,
        this.entity.vihicleId,
        moment(this.ngayBatDau).format('YYYYMMDD'),
        moment(this.ngayKetThuc).format('YYYYMMDD')
      )
      .subscribe((res: ResponseValue<DriverFuelClosingDetail[]>) => {
        if (res.code == '200' || res.code == '201') {
          const rows = (res.data ?? []).map(x => ({ ...x, checked: true }));
          this.entity.detaileds = rows;
          this.recalcSummary();
          if (rows.length === 0) {
            this._notificationService.printSuccessMessage('Không có dữ liệu trong kỳ.');
          }
        } else {
          this._notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG);
        }
      });
  }

  // ====== Compute summary — NET = B + C − A (net CÓ DẤU) ======
  // A = cấp dầu xe nhà (Type=0, source 1) ; B = dầu còn thừa cấp theo lệnh (Type=2, source 6)
  // C = định mức lệnh (source 2/3/4 vận hành, 5 máy phát). NET<0 → thu tiền lái xe, >0 → chi.
  recalcSummary() {
    const list = (this.entity.detaileds ?? []).filter(x => x.checked !== false);
    const price = +(this.entity.oilPrice ?? 0);

    // Bucket VẬN HÀNH: cấp A = source 1 bucket 1 ; định mức C = source 2/3/4
    const supOper = this.sumBy(list, d => d.source === 1 && (d.bucket ?? 1) === 1);
    const demOper = this.sumBy(list, d => d.source === 2 || d.source === 3 || d.source === 4);
    this.entity.supplyOperQty = supOper;
    this.entity.demandOperQty = demOper;
    this.entity.netOperLiters = +(demOper - supOper).toFixed(3); // C − A (re-sign)
    this.entity.netOperAmount = +(this.entity.netOperLiters * price).toFixed(2);

    // Bucket MÁY PHÁT: cấp A = source 1 bucket 2 ; định mức C = source 5
    const supGen = this.sumBy(list, d => d.source === 1 && d.bucket === 2);
    const demGen = this.sumBy(list, d => d.source === 5);
    this.entity.supplyGenQty = supGen;
    this.entity.demandGenQty = demGen;
    this.entity.netGenLiters = +(demGen - supGen).toFixed(3); // C − A (re-sign)
    this.entity.netGenAmount = +(this.entity.netGenLiters * price).toFixed(2);

    // B = dầu còn thừa cấp theo lệnh (source 6) — chỉ tính tổng, không bucket
    const leftover = this.sumBy(list, d => d.source === 6);
    this.entity.leftoverQty = leftover;

    // TỔNG = (C − A) + B = B + C − A. NET<0 → thu tiền lái xe ; >0 → chi cho lái xe.
    this.entity.netLiters = +(this.entity.netOperLiters + this.entity.netGenLiters + leftover).toFixed(3);
    this.entity.netAmount = +(this.entity.netLiters * price).toFixed(2);
  }

  private sumBy(list: DriverFuelClosingDetail[], pred: (x: DriverFuelClosingDetail) => boolean): number {
    return +list.filter(pred).reduce((s, x) => s + (+x.quantity || 0), 0).toFixed(3);
  }

  removeRow(d: DriverFuelClosingDetail) {
    this.entity.detaileds = (this.entity.detaileds ?? []).filter(x => x !== d);
    this.recalcSummary();
  }

  filterBySource(src: number): DriverFuelClosingDetail[] {
    return (this.entity.detaileds ?? []).filter(x => x.source === src);
  }

  amountInWords(): string {
    // Chi cho lái xe (net>0) → đọc theo TIỀN ĐƯỢC HƯỞNG (90%); thu tiền lái xe (net≤0) → NetAmount gộp.
    const amount = Math.round(this.entitledAmount() ?? Math.abs(+(this.entity.netAmount ?? 0)));
    if (!amount) return '';
    const words = this._utilityService.docso(amount);
    return this._utilityService.capitalizeFirstLetter((words || '').trim()) + ' đồng';
  }

  directionLabel(): string {
    const n = +(this.entity.netLiters ?? 0);
    if (n < 0) return 'Thu tiền lái xe';
    if (n > 0) return 'Chi tiền cho lái xe';
    return '';
  }

  // Khi PHẢI CHI tiền cho lái xe (net > 0), lái xe chỉ được hưởng 90% (giữ lại 10%).
  readonly driverEntitledRate = 0.9;

  /** Tiền lái xe THỰC ĐƯỢC HƯỞNG khi net > 0: 90% NetAmount.
   *  Net ≤ 0 (thu tiền lái xe) → không áp tỷ lệ, trả null để ẩn dòng. */
  entitledAmount(): number | null {
    const n = +(this.entity.netLiters ?? 0);
    if (n <= 0) return null;
    return +(Math.abs(+(this.entity.netAmount ?? 0)) * this.driverEntitledRate).toFixed(0);
  }

  sourceLabel(s: number): string {
    switch (s) {
      case 1: return 'Cấp dầu xe nhà — tạm ứng (A)';
      case 2: return 'Định mức lệnh DispatchOrder (C)';
      case 3: return 'Định mức lệnh FCL (C)';
      case 4: return 'Phát sinh (C)';
      case 5: return 'Dầu máy phát FCL (C)';
      case 6: return 'Dầu còn thừa — cấp theo lệnh (B)';
      default: return '?';
    }
  }

  bucketLabel(b: number): string {
    return b === 2 ? 'Máy phát' : 'Vận hành';
  }

  // ====== Save ======
  saveChange(form: NgForm, andApprove: boolean = false) {
    if (this.flagSave) return;
    const f = form || this.ngFormRef;
    if (!f || !f.valid) {
      this._notificationService.printErrorMessage('Vui lòng nhập đủ thông tin bắt buộc.');
      return;
    }
    if (!this.entity.detaileds || this.entity.detaileds.length === 0) {
      this._notificationService.printErrorMessage('Chưa có chi tiết — vui lòng tải dữ liệu trước.');
      return;
    }
    this.entity.fromDate = moment(this.ngayBatDau).format('YYYY-MM-DD');
    this.entity.toDate = moment(this.ngayKetThuc).format('YYYY-MM-DD');
    const payload: DriverFuelClosing = {
      ...this.entity,
      detaileds: (this.entity.detaileds ?? []).filter(x => x.checked !== false)
    };
    this.flagSave = true;
    const obs = this.flagNew
      ? this.driverFuelClosingService.add(payload)
      : this.driverFuelClosingService.update(payload);
    this.busy = obs.subscribe((res: ResponseValue<any>) => {
      this.flagSave = false;
      if (res.code == '200' || res.code == '201') {
        if (andApprove) {
          const id = this.flagNew ? (res.data?.Id ?? res.data?.id) : this.entity.id;
          if (id) this.approve(id, true);
          else this.finishSave();
        } else {
          this.finishSave();
        }
      } else {
        this._notificationService.printErrorMessage(res.message ?? MessageContstants.CREATED_ERR_MSG);
      }
    }, () => {
      this.flagSave = false;
      this._notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG);
    });
  }

  approve(id?: number, isFromSave: boolean = false) {
    const targetId = id ?? this.entity?.id;
    if (!targetId) return;
    this.busy = this.driverFuelClosingService.approve(targetId).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        if (isFromSave) this.finishSave();
        else {
          this._notificationService.printSuccessMessage('Đã duyệt phiếu.');
          this.close();
          this.SaveSuccess.emit(true);
        }
      } else {
        this._notificationService.printErrorMessage(res.message ?? 'Duyệt thất bại.');
      }
    });
  }

  private finishSave() {
    this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
    this.modalAddEdit?.hide();
    this.viewModal = false;
    this.SaveSuccess.emit(true);
  }

  close() {
    this.modalAddEdit?.hide();
    this.viewModal = false;
    this.CloseModal.emit(true);
  }
}
