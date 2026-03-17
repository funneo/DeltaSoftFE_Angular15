import { map } from 'rxjs/operators';
import { Component, OnInit, Output, ViewChild,EventEmitter} from '@angular/core';
import { PrintForm, Profile, ResponseValue } from '@app/shared/models';
import { Employee } from '@app/shared/models/employee.model';
import { Supplier } from '@app/shared/models/supplier';
import { GasSite } from '@app/shared/models/gas-site.model';
import { DriverFuelApproval } from '@app/shared/models/transports/driver-fuel-approval.model';
import { Vihicle } from '@app/shared/models/vihicle';
import { AuthService } from '@app/shared/services/auth.service';
import { EmployeeService } from '@app/shared/services/employee.service';
import { GasSiteService } from '@app/shared/services/gas-site.service';
import { IgasService } from '@app/shared/services/igas.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { SupplierService } from '@app/shared/services/supplier.service';
import { DriverFuelApprovalService } from '@app/shared/services/transports/driver-fuel-approval.service';
import { GasManagementService } from '@app/shared/services/transports/gas-management.service';
import { UtilityService } from '@app/shared/services/utility.service';
import { VihicleService } from '@app/shared/services/vihicle.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { MessageContstants } from '@app/shared/constants';
import { HttpParams } from '@angular/common/http';
import { FormatContstants } from '@app/shared/constants/format.constants';
import * as moment from 'moment';
import { GasManagement } from '@app/shared/models/transports/gas-management.model';
import { environment } from '@environments/environment';
import { SystemContstants } from '@app/shared/constants/SystemConstants';
import { NgForm } from '@angular/forms';
import { DispatchordersService } from '@app/shared/services/transports/dispatchorders.service';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { ExportService } from '@app/shared/services/export-excel.service';

@Component({
  selector: 'modal-fuel-summary',
  templateUrl: './modal-fuel-summary.component.html',
  styleUrls: ['./modal-fuel-summary.component.css']
})
export class ModalFuelSummaryComponent implements OnInit {
  public entity: DriverFuelApproval;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public flagNew: boolean = true;

  listDriver: Employee[] = [];
  listGasSite: GasSite[] = [];
  listSupplier: Supplier[] = [];
  listVihicle: Vihicle[] = [];
  driverName: string = '';
  vihicleName: string = '';
  title = '';
  gasValue = 0;
  apprved_permission: boolean = false;
  maskNumber = UtilityService.maskNumber;
  mask0 = UtilityService.mask0;
  permission: Permissions;
  public userLoged: Profile;
  public busy: Subscription;
  public viewModal?: boolean = false;
  ngaybatdauOption = this._utilityService.dateTimeOptionDays(new Date(), true);
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;

  constructor(
    private _notificationService: NotificationService,
    private employeeService: EmployeeService,
    private driverFuelApprovalService: DriverFuelApprovalService,
    private _authService: AuthService,
    private gasSiteService: GasSiteService,
    private supplierService: SupplierService,
    private vihicleService: VihicleService,
    private _utilityService: UtilityService,
    private gasManagementService: GasManagementService,
    private _igasService: IgasService,
    private dispatchOrderService:DispatchordersService,
    private exprortExcelService:ExportService
  ) {}

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    const permiss: string[] =
      typeof this.userLoged.permissions == 'string'
        ? JSON.parse(this.userLoged.permissions)
        : this.userLoged.permissions;
    this.apprved_permission =
      permiss.findIndex((x) => x === 'DRIVERFUELAPPROVAL_ACCEPT') != -1 || this.userLoged.isAdmin;
    this.loadEmployee();
    this.loadGasSite();
    this.loadVihicle();
    this.loadSupplier();
  }
  loadGasSite() {
    this.busy = this.gasSiteService
      .getAll(0)
      .subscribe((res: ResponseValue<GasSite[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listGasSite = res.data;
        }
      });
  }
  chotPhieu() {
    if (!this.entity.refuelingTimeIgas || this.entity.quantityIgas == 0) return;
    this._notificationService.printConfirmationDialog(
      MessageContstants.CLOSING_FUEL_DRIVER,
      () => {
        this.driverFuelApprovalService.approved(this.entity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == '200' || res.code == '201') {
              this.modalAddEdit.hide();
              this._notificationService.printSuccessMessage(
                MessageContstants.UPDATED_OK_MSG
              );
              this.SaveSuccess.emit(true);
            } else {
              this._notificationService.printErrorMessage(
                MessageContstants.UPDATED_ERR_MSG + res.code
              );
              this.flagSave = false;
            }
          },
          () => {
            this.flagSave = false;
          }
        );
      }
    );
  }
  
  loadEmployee() {
    const params = new HttpParams().set(
      'branchId',
      this.userLoged.branchId.toString()
    );
    this.busy = this.employeeService
      .getByBranch(params)
      .subscribe((res: ResponseValue<Employee[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listDriver = res.data;
        }
      });
  }

  loadSupplier() {
    const params = new HttpParams().set(
      'branchid',
      this.userLoged.branchId.toString()
    );
    this.busy = this.supplierService
      .getAll(params)
      .subscribe((res: ResponseValue<Employee[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listSupplier = res.data;
        }
      });
  }
  loadVihicle() {
    const params = new HttpParams()
      .set('branchid', this.userLoged.branchId.toString())
      .set('vihicletype', '0');
    this.busy = this.vihicleService
      .getAll(params)
      .subscribe((res: ResponseValue<Vihicle[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listVihicle = res.data;
        }
      });
  }
    export() {
        this.exprortExcelService.exportExcel(this.entity.detaileds, "tong-ket-phieu-dau");   
    }

  add() {
    this.gasManagementService
      .getOldValue(this.userLoged.branchId)
      .subscribe((res: ResponseValue<GasManagement>) => {
        if (res.code == '200' || res.code == '201') {
          this.entity = {
            checked: false,
            quantity: 0,
            isLocal: true,
            type: 2,
            igasCode: '',
            status: 0,
            oilPrice: res.data.cost,isCbt:false,
          };
        } else {
          this.entity = {
            checked: false,
            quantity: 0,
            isLocal: true,
            type: 2,
            igasCode: '',
            status: 0,
            oilPrice: 0,isCbt:false,
          };
        }
      });
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }
  viewAttachFiles:boolean;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;
  showFiles(){
    this.viewAttachFiles=true;
    let item:Attachfiles={
      frmName:'DRIVERFUELAPPROVAL',
      functionName:'DRIVERFUELAPPROVAL',
      refNo: this.entity.id.toString()
    }
    debugger;
    setTimeout(() => {
      this.modalAttackFiles.edit(item,false);
    }, 50);
  }

  

  edit(id: number, flag: boolean, permission: boolean) {
    this.driverFuelApprovalService
      .getDetail2(id)
      .subscribe((res: ResponseValue<DriverFuelApproval>) => {
        if (res.code == '200' || res.code == '201') {
          this.entity = res.data;
          if (this.entity.supplierId == 0) this.entity.supplierId = null;
          if (this.entity.gasSiteId == 0) this.entity.gasSiteId = null;
          if (this.entity.refuelingTimeIgas) {
            this.ngaybatdauOption = this._utilityService.dateTimeOptionDays(
              new Date(
                moment(
                  this.entity.refuelingTimeIgas,
                  FormatContstants.DATETIMEEN
                ).format(FormatContstants.DATETIMEEN)
              ),
              true
            );
            this.entity.refuelingTimeIgas = moment(
              this.entity.refuelingTimeIgas,
              FormatContstants.DATETIMEEN
            ).format(FormatContstants.DATETIMEVN);
          }
          this.flagNew = false;
          this.flagXem = flag;
          this.flagSave = false;
          this.modalAddEdit.show();
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.SYSTEM_ERROR_MSG
          );
        }
      });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      this.entity.branchId = Number.parseInt(this.userLoged.branchId);
      this.entity.createdBy = this.userLoged.id;
      this.entity.driverName = this.driverName;
      this.entity.licensePlate = this.vihicleName;
      if (this.entity.id == undefined) {
        this.driverFuelApprovalService.add2(this.entity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == '200' || res.code == '201') {
              this.modalAddEdit.hide();
              form.resetForm();
              this._notificationService.printSuccessMessage(
                MessageContstants.CREATED_OK_MSG
              );
              this.SaveSuccess.emit(true);
            } else {
              if (res.message == 'OVER') {
                this._notificationService.printErrorMessage(
                  'Tạm ứng vượt hạn mức cho phép!'
                );
                this.flagSave = false;
              } else {
                this._notificationService.printErrorMessage(
                  MessageContstants.CREATED_ERR_MSG + res.code
                );
                this.flagSave = false;
              }
            }
          },
          () => {
            this.flagSave = false;
          }
        );
      } else {
        this.driverFuelApprovalService.update(this.entity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == '200' || res.code == '201') {
              this.modalAddEdit.hide();
              form.resetForm();
              this._notificationService.printSuccessMessage(
                MessageContstants.UPDATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data);
            } else {
              this._notificationService.printErrorMessage(
                MessageContstants.UPDATED_ERR_MSG + res.code
              );
              this.flagSave = false;
            }
          },
          () => {
            this.flagSave = false;
          }
        );
      }
    }
  }
  selectedNgaybatdau(event) {
    this.entity.refuelingTimeIgas = moment(event.start).format(
      'DD/MM/YYYY HH:mm:ss'
    );
  }
  closedNgaybatdau(event) {
    if (this.entity.refuelingTimeIgas == null)
      this.entity.refuelingTimeIgas = moment(event.oldStartDate).format(
        'DD/MM/YYYY HH:mm:ss'
      );
  }
  driverChanged(event: Employee) {
    if (event) this.driverName = event!.employeeFullName;
  }
  vihicleChanged(event: Vihicle) {
    this.entity.licensePlate = event!.licensePlates;
    this.entity.driverId=event!.employeeId;
    //Lấy thông tin toàn bộ các lệnh vận chuyển chưa được tổng kết dầu
    this.dispatchOrderService.getForSummary(event!.id).subscribe(
      (res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          let listData=res.data;
          this.entity.detaileds=listData.map(item=>({
            driverFuelApprovalId: 0,
            refNo: item.refNo,
            vehicleLicensePlates: item.vihicleLicensePlates, // Optional field
            driverName: item.driverName, // Optional field
            startVehicleOdor: item.startVehicleOdor, // Optional field
            finishVehicleOdor: item.finishVehicleOdor, // Optional field
            mergeJobId: item.mergeJobId, // Optional field
            createdDate: item.createdDate,// Optional field
            quantity: item.quantity // Optional field
          }))
          this.entity.quantity= this.entity.detaileds.reduce((accumulator, item) => accumulator + item.quantity, 0);
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.UPDATED_ERR_MSG + res.code
          );
          this.flagSave = false;
        }
      },
      () => {
        this.flagSave = false;
      }
    );
  }

  //Lấy mã Igas
  getIgasCode() {
    this._notificationService.printConfirmationDialog(
      "Truyền dữ liệu phiếu dầu ra IGAS hay không?",
      () => {
        let copy = Object.assign({}, this.entity);
        this._igasService.add(copy).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == '200' || res.code == '201') {
              this.entity.status = 1;
              this._notificationService.printSuccessMessage(
                MessageContstants.UPDATED_OK_MSG
              );
              this.modalAddEdit.hide();
              this.SaveSuccess.emit(true);
            } else {
              this._notificationService.printErrorMessage(
                MessageContstants.UPDATED_ERR_MSG + res.code+ ' - '+ res.message
              );
              this.flagSave = false;
            }
          },
          () => {
            this.flagSave = false;
          }
        );
      }
    );
  }
  xuatPhieu() {
    let copy = Object.assign({}, this.entity);
    copy.status = 1;
    this.driverFuelApprovalService.update(copy).subscribe(
      (res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.entity.status = 1;
          this._notificationService.printSuccessMessage(
            MessageContstants.UPDATED_OK_MSG
          );
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.UPDATED_ERR_MSG + res.code
          );
          this.flagSave = false;
        }
      },
      () => {
        this.flagSave = false;
      }
    );
  }
  huyPhieu() {
    this._notificationService.printConfirmationDialog("Bạn muốn hủy phiếu dầu này?", () => {
      let copy = Object.assign({}, this.entity);
      copy.status = -1;
      this.driverFuelApprovalService.update(copy).subscribe(
        (res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.entity.status = 1;
            this._notificationService.printSuccessMessage(
              MessageContstants.UPDATED_OK_MSG
            );
          } else {
            this._notificationService.printErrorMessage(
              MessageContstants.UPDATED_ERR_MSG + res.code
            );
            this.flagSave = false;
          }
        },
        () => {
          this.flagSave = false;
        }
      );
    });
  }
  updateIgas() {
    this.driverFuelApprovalService.updateRefuelingIgas(this.entity).subscribe(
      (res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          this.entity.status = 1;
          this._notificationService.printSuccessMessage(
            MessageContstants.UPDATED_OK_MSG
          );
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.UPDATED_ERR_MSG + res.code
          );
          this.flagSave = false;
        }
      },
      () => {
        this.flagSave = false;
      }
    );
  }

  inPhieu() {
    this.busy = this.driverFuelApprovalService
      .print(this.entity)
      .subscribe((res: ResponseValue<any>) => {
        if (res.code == '200' || res.code == '201') {
          var a = document.createElement('a');
          a.href = environment.apiUrl + res.data;
          a.download;
          a.click();
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.GETDATA_ERR_MSG + '\n' + res.code
          );
        }
      });
  }

  print(entity: DriverFuelApproval) {
    let _entity: any = {};
    console.log(entity);

    _entity.Ngay = moment(entity.createdDate, FormatContstants.DATEUTC).format(
      'DD/MM/YYYY'
    );
    _entity.Giatri = moment(entity.validTime, FormatContstants.DATEUTC).format(
      'DD/MM/YYYY HH:mm');
    _entity.TenKhachHang = entity.supplierName;
    _entity.Tenlaixe = entity.driverName ?? '';
    _entity.refNo = entity.refNo ?? '';
    _entity.Bks = entity.licensePlate ?? '';
    _entity.Soluong = entity.quantity;
    _entity.Dongia = entity.oilPrice ?? '';
    _entity.Thanhtien = entity.totalCost ?? '';
    _entity.Thanthoan = '';
    _entity.Gio=moment().format('DD/MM/YYYY HH:mm');
    _entity.Lapphieu = entity.createdByName ?? '';

    let printContents;
    let noiDung: string = "";
    let list = localStorage.getItem(SystemContstants.LISTMAUIN);
    if (list != null) {
      let listMauIn: PrintForm[] = JSON.parse(list);
      let index = listMauIn.findIndex(x => x.type == 5);
      if (index != -1)
        noiDung = listMauIn[index].content;
    }
    printContents = this._utilityService.printPhieudau(noiDung, _entity);
    printContents = '<div class="kho-giay page-a4">' + printContents + '</div>';
    var newWin = window.frames["printf"];
    newWin.document.write(`
      <html>
        <head>
          <title>---------------THANK YOU FOR DOING BUSINESS WITH US!--------------</title>
          <link rel="stylesheet" type="text/css" href="../../../assets/css/print.css" />
        </head>
        <body onload="window.print(); window.close()">${printContents}</body>
      </html>`
    );
    newWin.document.close();
  }

  closeModal(): void {
    this.viewModal = false;
  }
  closeModalFile(){
    this.viewAttachFiles=false;
  }

  OnHidden() {
    this.CloseModal.emit();
  }
}
