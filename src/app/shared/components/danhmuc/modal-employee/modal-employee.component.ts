import { Component, EventEmitter, OnInit, Output, ViewChild, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { AuthService, BranchService, EmployeeService, NotificationService, OtherCategoriesService, UtilityService, } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { Branch, Employee, OtherCategories, ResponseValue, TapTin } from '@app/shared/models';
// import { HttpParams } from '@angular/common/http';
import { environment } from '@environments/environment';
import { HttpParams } from '@angular/common/http';
import * as moment from 'moment';
import { FormatContstants } from '@app/shared/constants/format.constants';
import { ModalAttachfileComponent } from '../../systems/modal-attachfile/modal-attachfile.component';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
// import * as moment from 'moment';

@Component({
  selector: 'modal-employee',
  templateUrl: './modal-employee.component.html',
  styleUrls: ['./modal-employee.component.css']
})
export class ModalEmployeeComponent implements OnInit {

  public entity: Employee;
  public listBranch: Branch[];
  listDepartment: OtherCategories[] = [];
  listTitle: OtherCategories[] = [];
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public busy: Subscription;
  listSex=[{id:false,name:"Nữ"},{id:true,name:"Nam"}];
  viewModal = false;
  viewAttachFiles=false;
  pathImage='';
  _hr=false;
  // public dateTimeOptions = this._utilityService.dateTimeOptionNoTimes;
  dateTimeOptions = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  ngaybatdauOption = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  ngayhoanthanhOption = this._utilityService.dateTimeOptionDays(
    new Date(),
    false
  );
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  @ViewChild(ModalAttachfileComponent, { static: false }) modalAttackFiles: ModalAttachfileComponent;
  constructor(private _notificationService: NotificationService, private authService: AuthService,
    private employeeService: EmployeeService,
    private otherCategoryService: OtherCategoriesService,
    private notificationService: NotificationService,
    private _utilityService: UtilityService, private branchService: BranchService) {
    let user = this.authService.getLoggedInUser();
    this._hr = this.authService.hasPermission('EMPLOYEE_HR');
     }

  ngOnInit(): void {
    this.loadChiNhanh();
    this.loadDepartment();
    this.loadTitle();
  }

  loadChiNhanh() {
    this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranch = res.data;
    });
  }
  
  showFiles(){
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: 'EMPLOYEE',
      functionName: 'EMPLOYEE',
      refNo: this.entity.id.toString()
    }
    setTimeout(() => {
      this.modalAttackFiles.edit(item,false);
    }, 50);
  }
  onFileChanged(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
        this.busy = this.employeeService.uploadImage(this.entity,file).subscribe((res: ResponseValue<Employee>) => {
          if (res.code == '200' || res.code == '201') {
            this.pathImage=environment.apiUrl + res.data.imagePath.replace('~','');
         }else{
         this.notificationService.printErrorMessage(MessageContstants.UPLOAD_ERR_MSG + '\n' + res.code);
       }
      });
    }
  }
  loadDepartment() {
    const params = new HttpParams()
      .set('type', 'DEPT')
    this.busy = this.otherCategoryService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listDepartment = res.data;
      }
      else {
        if (res.code == "204") {
          this.listDepartment = [];
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      }
    });
  }

  loadTitle() {
    const params = new HttpParams()
      .set('type', 'TITLES')
    this.busy = this.otherCategoryService.getAll(params).subscribe((res: ResponseValue<OtherCategories[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listTitle = res.data;
      }
      else {
        if (res.code == "204") {
          this.listTitle = [];
        } else {
          this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code);
        }
      }
    });
  }

  add() {
    this.entity = {
      status: true
    };
    this.flagXem = false;
    this.flagSave = false;
    this.modalAddEdit.show();
  }

  edit(id: string, flag: boolean) {
    this.employeeService.getDetail(id).subscribe((res: ResponseValue<Employee>) => {
      if (res.code == '200' || res.code == '201') {
        this.entity = res.data;
        this.pathImage=environment.apiUrl + res.data.imagePath?.toString().replace('~','');
        this.flagXem = flag;
        this.flagSave = false;
        if (this.entity.dateOfBirth) {
          this.dateTimeOptions = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.dateOfBirth, FormatContstants.DATEEN).format(FormatContstants.DATEEN)), false
          );
          this.entity.dateOfBirth = moment(this.entity.dateOfBirth, FormatContstants.DATEEN).format(
            FormatContstants.DATEVN
          );
        }
        if (this.entity.startDate) {
          this.ngaybatdauOption = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.startDate, FormatContstants.DATEEN).format(FormatContstants.DATEEN)), false
          );
          this.entity.startDate = moment(this.entity.startDate, FormatContstants.DATEEN).format(
            FormatContstants.DATEVN
          );
        }
        if (this.entity.contractDate) {
          this.ngayhoanthanhOption = this._utilityService.dateTimeOptionDays(
            new Date(moment(this.entity.contractDate, FormatContstants.DATEEN).format(FormatContstants.DATEEN)), false
          );
          this.entity.contractDate = moment(this.entity.contractDate, FormatContstants.DATEEN).format(
            FormatContstants.DATEVN
          );
        }
        this.modalAddEdit.show();
      }
      else {
        this._notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG);
      }
    });
  }

  viewVanBan(url: string) {
    window.open(`${environment.apiUrl}/${url}`);
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      if (this.entity.id == undefined) {
        this.employeeService.add(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
      else {
        this.employeeService.update(this.entity).subscribe((res: ResponseValue<any>) => {
          if (res.code == '200' || res.code == '201') {
            this.modalAddEdit.hide();
            form.resetForm();
            this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
            this.SaveSuccess.emit(res.data);
          }
          else {
            this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG);
            this.flagSave = false;
          }
        }, () => {
          this.flagSave = false;
        });
      }
    }
  }
  selectedNgaysinh(event) {
    this.entity.dateOfBirth = moment(event.start).format('DD/MM/YYYY');
  }
  closedNgaysinh(event) {
    if (this.entity.dateOfBirth == null)
      this.entity.dateOfBirth = moment(event.oldStartDate).format('DD/MM/YYYY');
  }
  selectedNgaybatdau(event) {
    this.entity.startDate = moment(event.start).format('DD/MM/YYYY');
  }
  closedNgaybatdau(event) {
    if (this.entity.startDate == null)
      this.entity.startDate = moment(event.oldStartDate).format('DD/MM/YYYY');
  }
  selectedNgayhoanthanh(event) {
    this.entity.contractDate = moment(event.start).format('DD/MM/YYYY');
  }
  closedNgayhoanthanh(event) {
    if (this.entity.contractDate == null)
      this.entity.contractDate = moment(event.oldStartDate).format('DD/MM/YYYY');
  }

  OnHidden() {
    this.CloseModal.emit();
  }

  closeModal(): void {
    this.viewModal = false;
  }
  saveSuccessFile(event: any): void {
    console.log(event);
  }

  closeModalFile() {
    this.viewAttachFiles = false;
  }
}
