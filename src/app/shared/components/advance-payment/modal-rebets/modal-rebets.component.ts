import { formatNumber } from "@angular/common";
import { HttpParams } from "@angular/common/http";
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { MessageContstants } from "@app/shared/constants";
import {
  Rebets,
  Branch,
  User,
  Customer,
  Employee,
  ResponseValue,
  AdvanceGroup,
  PermissionAdvance,
  ContBets,
} from "@app/shared/models";
import {
  NotificationService,
  RebetsService,
  BranchService,
  CustomerService,
  AuthService,
  UtilityService,
  EmployeeService,
  AdvanceGroupService,
  PermissionAdvanceService,
  ContBetsService,
} from "@app/shared/services";
import {
  BsModalRef,
  BsModalService,
  ModalDirective,
} from "ngx-bootstrap/modal";
import { Subscription } from "rxjs";
import * as moment from "moment";
import { FormatContstants } from "@app/shared/constants/format.constants";
import { map } from "rxjs/operators";
import { SystemContstants } from "@app/shared/constants/SystemConstants";

@Component({
  selector: "modal-rebets",
  templateUrl: "./modal-rebets.component.html",
  styleUrls: ["./modal-rebets.component.css"],
})
export class ModalRebetsComponent implements OnInit {
  entity: Rebets;
  flagXem: boolean = false;
  flagSave: boolean = false;
  busy: Subscription;
  listBranch: Branch[];
  maskNumber = UtilityService.maskNumber;
  listEmployee: Employee[];
  listContBets: ContBets[];
  // _viewAll=2;
  _functionId = SystemContstants.BETS;
  _acc: boolean = false;
  _accept: boolean = false;
  _auth: number = 5;
  _employeeId: number;
  _branchId: number;
  isComplete: boolean = false;
  listType: any[] = [
    { id: 0, name: "Tiền mặt" },
    { id: 1, name: "Chuyển khoản" },
  ];
  dateTimeOptions = this._utilityService.dateTimeOptionDays(new Date(), false);
  dateTimeOptions2 = this._utilityService.dateTimeOptionDays(new Date(), true);
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalAddEdit", { static: false }) modalAddEdit: ModalDirective;
  constructor(
    private _notificationService: NotificationService,
    private rebetsService: RebetsService,
    private branchService: BranchService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private _utilityService: UtilityService,
    private contBetsService: ContBetsService
  ) {
    let user = this.authService.getLoggedInUser();
    this._auth = Number.parseInt(user.authorisationLevel);
    this._employeeId = Number.parseInt(user.employeeId);
    this._acc = this.authService.hasPermission("REBETS_ACCOUNT");
    this._accept = this.authService.hasPermission("REBETS_ACCEPT");
    this._branchId = Number.parseInt(user.branchId);

    // let list: any[] =UtilityService.getLocalParams(SystemContstants.APPSETTING);
    // let i=list?.findIndex(x=>x.id==this._functionId);
    // if(i!=-1){
    //   this._viewAll=list[i].value;
    // }
  }

  ngOnInit(): void {
    this.loadChiNhanh();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }

  loadEmployee() {
    const params = new HttpParams().set("branchId", this._branchId?.toString());
    this.employeeService
      .getAll(params)
      .subscribe((res: ResponseValue<Employee[]>) => {
        this.listEmployee = res.data;
      });
  }

  changedEmployee(event: any) {
    this._employeeId = event.id;
    this.loadContBets();
  }

  changedContBets(event: ContBets) {
    this.entity.amount = event.amount;
  }

  loadContBets(id: string = null) {
    const params = new HttpParams()
      .set("branchId", this._branchId.toString())
      .set("employeeId", this._employeeId.toString())
      .set("id", id);
    this.contBetsService
      .getAll(params)
      .subscribe((res: ResponseValue<ContBets[]>) => {
        this.listContBets = res.data;
      });
  }

  selectedDate(event) {
    this.entity.refDate = moment(event.start).format("DD/MM/YYYY");
  }

  closedDate(event) {
    if (this.entity.refDate == null)
      this.entity.refDate = moment(event.oldStartDate).format("DD/MM/YYYY");
  }

  selectedContainerDate(event) {
    this.entity.containerDropDate = moment(event.start).format(
      "DD/MM/YYYY HH:mm:ss"
    );
  }

  closedContainerDate(event) {
    if (this.entity.containerDropDate == null)
      this.entity.containerDropDate = moment(event.oldStartDate).format(
        "DD/MM/YYYY HH:mm:ss"
      );
  }

  add(type: number) {
    //this.advanceGroupService.getAll().subscribe((res: ResponseValue<AdvanceGroup[]>) => {
    this.entity = {
      status: true,
      branchId: this._branchId,
      employeeId: this._employeeId,
      type: type,
      isComplete: false,
      refDate: moment(new Date()).format("DD/MM/YYYY"),
    };
    this.loadEmployee();
    this.loadContBets();
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
    // });
  }

  edit(id: string, flag: boolean) {
    this.rebetsService.getDetail(id).subscribe((res: ResponseValue<Rebets>) => {
      if (res.code == "200" || res.code == "201") {
        this.entity = res.data;
        if (this.entity.refDate) {
          this.dateTimeOptions = this._utilityService.dateTimeOptionDays(
            new Date(
              moment(this.entity.refDate, FormatContstants.DATEEN).format(
                FormatContstants.DATEEN
              )
            )
          );
          this.entity.refDate = moment(
            this.entity.refDate,
            FormatContstants.DATEEN
          ).format(FormatContstants.DATEVN);
        }
        if (this.entity.containerDropDate) {
          this.dateTimeOptions2 = this._utilityService.dateTimeOptionDays(
            new Date(
              moment(
                this.entity.containerDropDate,
                FormatContstants.DATETIMEEN
              ).format(FormatContstants.DATETIMEVN)
            ),
            true
          );
          this.entity.containerDropDate = moment(
            this.entity.containerDropDate,
            FormatContstants.DATETIMEEN
          ).format(FormatContstants.DATETIMEVN);
        }
        this.isComplete = this.entity.isComplete;
        this._employeeId = this.entity.employeeId;
        this._branchId = this.entity.branchId;
        this.loadEmployee();
        this.loadContBets(this.entity.contBetsId.toString());
        this.flagXem = flag || this.isComplete;
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
      if (this.entity.refDate)
        this.entity.refDate = moment(
          this.entity.refDate,
          FormatContstants.DATEVN
        ).format(FormatContstants.CLIENTDATE);
      if (this.entity.id == undefined) {
        this.rebetsService.add(this.entity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              this.modalAddEdit.hide();
              form.resetForm();
              this._notificationService.printSuccessMessage(
                MessageContstants.CREATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data);
            } else {
              this._notificationService.printErrorMessage(
                MessageContstants.CREATED_ERR_MSG
              );
              this.flagSave = false;
            }
          },
          () => {
            this.flagSave = false;
          }
        );
      } else {
        this.rebetsService.update(this.entity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              this.modalAddEdit.hide();
              form.resetForm();
              this._notificationService.printSuccessMessage(
                MessageContstants.UPDATED_OK_MSG
              );
              this.SaveSuccess.emit(res.data);
            } else {
              this._notificationService.printErrorMessage(
                MessageContstants.UPDATED_ERR_MSG
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

  changedAccept(event: boolean) {
    let item: Rebets = {
      id: this.entity.id,
      status: event,
    };
    this.flagSave = true;
    this.rebetsService.accept(item).subscribe(
      (res: ResponseValue<any>) => {
        if (res.code == "200" || res.code == "201") {
          this.modalAddEdit.hide();
          this.SaveSuccess.emit(res.data);
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.UPDATED_ERR_MSG
          );
          this.flagSave = false;
        }
      },
      () => {
        this._notificationService.printErrorMessage(
          MessageContstants.UPDATED_ERR_MSG
        );
        this.flagSave = false;
      }
    );
  }

  OnHidden() {
    this.CloseModal.emit();
  }
}
