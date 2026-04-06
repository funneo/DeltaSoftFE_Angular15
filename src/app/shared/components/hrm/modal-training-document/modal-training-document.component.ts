import { ModalAttachfileComponent } from "./../../systems/modal-attachfile/modal-attachfile.component";
import { MessageContstants } from "@app/shared/constants";
import { TrainingDocumentManagmentService } from "../../../services/hrm/training-document-managment/training-document-managment.service";
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { Customer, OtherCategories, Profile, ResponseValue } from "@app/shared/models";
import { TrainingDocuments } from "@app/shared/models/hrm/training-document-managment/training-documents";
import {
  AuthService,
  CustomerService,
  NotificationService,
  OtherCategoriesService,
  UtilityService,
} from "@app/shared/services";
import { ModalDirective } from "ngx-bootstrap/modal";
import { NgForm } from "@angular/forms";
import { TrainingTemplatesService } from "@app/shared/services/hrm/training-document-managment/training-templates.service";
import { TrainingTemplates } from "@app/shared/models/hrm/training-document-managment/training-templates";
import { ApproverPermissions } from "@app/shared/models/hrm/training-document-managment/approver-permissions";
import { TrainingDocumentContents } from "@app/shared/models/hrm/training-document-managment/training-document-contents";
import { HttpParams } from "@angular/common/http";
import { ApproverPermissionsService } from "@app/shared/services/hrm/training-document-managment/approver-permissions.service";
import { Attachfiles } from "@app/shared/models/attachfiles.models";
import { ModalTrainingDocumentAssigmentsComponent } from "../modal-training-document-assigments/modal-training-document-assigments.component";
import { ModalTrainingDocumentAcceptComponent } from "../modal-training-document-accept/modal-training-document-accept.component";

@Component({
  selector: "modal-training-document",
  templateUrl: "./modal-training-document.component.html",
  styleUrls: ["./modal-training-document.component.css"],
})
export class ModalTrainingDocumentComponent implements OnInit {
  public entity: TrainingDocuments;
  public flagXem: boolean = false;
  public flagSave: boolean = false;
  public flagNew: boolean = false;
  listTrainingTemplates: TrainingTemplates[] = [];
  listCustomer: Customer[] = [];
  listApproval: ApproverPermissions[] = [];
  viewAttachFiles: boolean = false;
  public userLoged: Profile;
  public viewModal?: boolean = false;
  isChuyenduyet: boolean = true;
  level?: number = 1;
  listNghiepvu: OtherCategories[] = [];
   groupL1Array: any[] = [{ id: 0, name: 'Lao động' }, { id: 1, name: 'Phần mềm' }, { id: 2, name: 'Nghiệp vụ '}];

  hasPermissionApproved = false;
  hasCSPermission = false;
  ngaybatdauOption = this._utilityService.dateTimeOptionDays(new Date(), false);
  l: Object[] = [];
  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalAddEdit", { static: false }) modalAddEdit: ModalDirective;
  constructor(
    private _notificationService: NotificationService,
    private _authService: AuthService,
    private _utilityService: UtilityService,
    private _service: TrainingDocumentManagmentService,
    private _serviceTrainingTemplate: TrainingTemplatesService,
    private _serviceCustomer: CustomerService,
    private _serviceApprover: ApproverPermissionsService,
    private _otherCategoryService: OtherCategoriesService
  ) {}

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.loadCustomer();
    this.loadTypeNghiepVu();
  }

   loadTypeNghiepVu(): void {
    let params: HttpParams = new HttpParams();
    params = params.set("type", "TRDOCTYPE");
    this._otherCategoryService
      .getAll(params)
      .subscribe((res: ResponseValue<OtherCategories[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listNghiepvu = res.data;
        } else {
          if (res.code == "204") {
            this.listNghiepvu = [];
          } else {
            this._notificationService.printErrorMessage(
              MessageContstants.GETDATA_ERR_MSG + "\n" + res.code
            );
          }
        }
      });
  }
  onChangeGroupL1(event) {  
    if(event){
      if(this.entity.groupL1Id<2){
        let item: ApproverPermissions = {step: this.entity.level, groupL1Id: this.entity.groupL1Id};
        this.entity.groupL2Id=0;
        this._serviceApprover.getApprover(item).subscribe((res: ResponseValue<ApproverPermissions[]>) => {
          if (res.code == "200" || res.code == "201") {
            this.listApproval = res.data;
          }
        }); 
      }
    }

  }

  loadCustomer() {
    const params = new HttpParams();
    this._serviceCustomer
      .getAll(params)
      .subscribe((res: ResponseValue<Customer[]>) => {
        this.listCustomer = res.data;
      });
  }

  loadContents() {
    this.entity.contents = this.listTrainingTemplates.map((tpl) => ({
      templateId: tpl.id,
      templateName: tpl.name,
      contents: "",
      templateNotes: "",
      isExpanded: false,
    }));
  }
  onChangeNghiepvu(event) {
    this.entity.groupL2Id = event.id;
    let item: ApproverPermissions = {step: 1, branchId:  Number.parseInt(this.userLoged.branchId), groupL1Id: this.entity.groupL1Id, groupL2Id: this.entity.groupL2Id};
    this._serviceApprover.getApprover(item).subscribe((res: ResponseValue<ApproverPermissions[]>) => {
      if (res.code == "200" || res.code == "201") {
        this.listApproval = res.data;
        // Nếu người tạo nằm trong danh sách người duyệt B1 => Nhập tắt
        const isShortInput = this.listApproval.some(x => x.userId == this.userLoged.id);
        if (isShortInput) {
          this.entity.steps = 1;
          this.entity.isShortInput = true;
          item.step = 2;
          // Load danh sách người duyệt bước 2
          this._serviceApprover.getApprover(item).subscribe((res2: ResponseValue<ApproverPermissions[]>) => {
            if (res2.code == "200" || res2.code == "201") {
              this.listApproval = res2.data;
              this.entity.assigneeId='56cbd385-beb0-459e-92df-3610849aa54e'; // Mặc định người duyệt B2 là sếp Nghĩa
            }
          });
        }
      }
    });
  
    this._serviceTrainingTemplate.getAll(this.entity.level, this.entity.groupL1Id, this.entity.groupL2Id).subscribe((res: ResponseValue<TrainingTemplates[]>) => {
      if (res.code == "200" || res.code == "201") {
        this.listTrainingTemplates = res.data;
        this.loadContents();
      } else {
        this._notificationService.printErrorMessage(
          MessageContstants.SYSTEM_ERROR_MSG
        );
      }
    });
  }
  loadApprover(level: number) {
    const params = new HttpParams();
    this._serviceApprover
      .getAll(level)
      .subscribe((res: ResponseValue<ApproverPermissions[]>) => {
        this.listApproval = res.data;
      });
  }
  add(level: number) {
      this.level = level;
      // Khởi tạo entity với steps = 0 (duyệt B1)
      this.entity = {
        level: level,
        checked: false,
        status: 0,
        steps: 0,
        isShortInput: false,
        groupL1Id:2,
        contents: this.listTrainingTemplates.map((tpl) => ({
          templateId: tpl.id,
          templateName: tpl.name,
          contents: "",
          templateNotes: "",
          isExpanded: false,
        })),
      };
              // Hiển thị form
              this.flagXem = false;
              this.flagSave = false;
              this.flagNew = true;
              this.modalAddEdit.show();
  }
  addNew(level: number) {

      // Khởi tạo entity với steps = 0 (duyệt B1)
      this.entity = {
        level: level,
        checked: false,
        status: 0,
        steps: 0,
        isShortInput: false,
        groupL1Id:2,
        contents: this.listTrainingTemplates.map((tpl) => ({
          templateId: tpl.id,
          templateName: tpl.name,
          contents: "",
          templateNotes: "",
          isExpanded: false,
        })),
      };
  }

  toggleGroup(group: TrainingDocumentContents) {
    group.isExpanded = !group.isExpanded;
  }

  public tinyMceInit = {
    base_url: "/tinymce",
    suffix: ".min",
    height: 500,
    menubar: false,
    plugins: "lists link image table",
    toolbar: "undo redo | bold italic | alignleft aligncenter alignright",
  };

  public tinyMceScriptSrc = "/tinymce/tinymce.min.js";
  editorConfig = {
    base_url: "/tinymce", // trỏ vào thư mục trong assets
    height: 250,
    menubar: false,
    plugins: [
      "advlist autolink lists link image charmap preview anchor",
      "searchreplace visualblocks code fullscreen",
      "insertdatetime media table paste help wordcount",
    ],
    toolbar:
      "undo redo | formatselect | bold italic underline backcolor | " +
      "alignleft aligncenter alignright alignjustify | " +
      "bullist numlist outdent indent | removeformat | table | help",
  };

  toggleEditorStates: { [key: number]: boolean } = {};

  toggleEditor(id: number): void {
    this.toggleEditorStates[id] = !this.toggleEditorStates[id];
  }

  hasPermissionStep2 = false;
  edit(id: string, flag: boolean, permission: boolean) {
    this._service
      .getDetail(id)
      .subscribe((res: ResponseValue<TrainingDocuments>) => {
        if (res.code == "200" || res.code == "201") {
          this.entity = res.data;
          this.loadApprover(this.entity.steps + 1);
          this.entity.contents.forEach((content) => {
            content.isExpanded = content.contents?.length > 0; // Mở rộng nếu có nội dung
          });
          this.level = this.entity.level;
          this.flagNew = false;
          this.flagXem = flag && !permission;
          this.flagSave = false;
          if (
            this.userLoged.id == this.entity.assigneeId &&
            this.entity.status == 1
          )
            this.hasPermissionApproved = true;
          if (
            this.userLoged.id == this.entity.createdBy &&
            this.entity.status == 0 &&
            this.entity.steps == 2
          )
            this.hasPermissionStep2 = true;
          if(this.level == 1 && (this.userLoged.id == this.entity.createdBy || this.userLoged.id == this.entity.assigneeId)|| this.userLoged.isAdmin || this.hasPermissionApproved) {
            this.hasCSPermission = true;
          }
          if( this.level == 2 && (this.userLoged.id == this.entity.createdBy || this.userLoged.id == this.entity.assigneeId) || this.userLoged.isAdmin || this.hasPermissionApproved || this.listCustomer.some(x => x.id == this.entity.customerId )) {
            this.hasCSPermission = true;
          }
          if(this.entity.isOfficialVersion && (this.userLoged.id== this.entity.parentCreatedBy || this.userLoged.id==this.entity.rootCreatedBy)) 
            this.hasCSPermission = true;
          this.modalAddEdit.show();
        } else {
          this._notificationService.printErrorMessage(
            MessageContstants.SYSTEM_ERROR_MSG
          );
        }
      });
  }

  download(type: number) {
    if (type == 1) {
      this.flagSave = true;
      this._service.downloadWord(this.entity.id).subscribe(
        (res: Blob) => {
          const blob = new Blob([res], {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${this.entity.documentCode}.docx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          this.flagSave = false;
        },
        (error) => {
          this.flagSave = false;
          this._notificationService.printErrorMessage(
            "Lỗi tải file: " + error.message
          );
        }
      );
    } else {
      this.flagSave = true;
      this._service.downloaPfd(this.entity.id).subscribe(
        (res: Blob) => {
          const blob = new Blob([res], { type: "application/pdf" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${this.entity.documentCode}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          this.flagSave = false;
        },
        (error) => {
          this.flagSave = false;
          this._notificationService.printErrorMessage(
            "Lỗi tải file: " + error.message
          );
        }
      );
    }
  }

  @ViewChild(ModalAttachfileComponent, { static: false })
  modalAttackFiles: ModalAttachfileComponent;
  showFiles() {
    this.viewAttachFiles = true;
    let item: Attachfiles = {
      frmName: "TRAINING_DOCUMENTS",
      functionName: "TRAINING_DOCUMENTS",
      refNo: this.entity.documentCode,
      jobId: this.entity.id,
    };
    setTimeout(() => {
      this.modalAttackFiles.edit(item, false);
    }, 50);
  }
  saveSuccessFile(event: any): void {
    console.log(event);
  }

  closeModalFile() {
    this.viewAttachFiles = false;
  }

  viewAssignment: boolean = false;
  @ViewChild(ModalTrainingDocumentAssigmentsComponent, { static: false })
  modalAssignment: ModalTrainingDocumentAssigmentsComponent;
  showAssignment() {
    this.viewAssignment = true;
    setTimeout(() => {
      this.modalAssignment.view(this.entity.id);
    }, 50);
  }
  saveSuccessAssignment(event: any): void {
    this.SaveSuccess.emit(true);
    this.modalAddEdit.hide();
  }
  saveSuccessAccept(event: any): void {
    this.SaveSuccess.emit(true);
    this.modalAddEdit.hide();
  }

  closeModalAssignment() {
    this.viewAssignment = false;
  }
  closeModalAccept() {
    this.viewAccept = false;
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      if(this.entity.steps < 2 && (this.entity.assigneeId == null || this.entity.assigneeId == "00000000-0000-0000-0000-000000000000")) {
          this._notificationService.printErrorMessage(
            "Vui lòng chọn người duyệt tài liệu."
          );
          this.flagSave = false;
          return;
        }
      this.flagSave = true;
      if (this.entity.id == undefined) {
        
        this._service.add(this.entity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              this.modalAddEdit.hide();
              form.resetForm();
              this._notificationService.printSuccessMessage(
                MessageContstants.CREATED_OK_MSG
              );
              this.SaveSuccess.emit(true);
            } else {
              this._notificationService.printErrorMessage(
                MessageContstants.CREATED_ERR_MSG + res.code
              );
              this.flagSave = false;
            }
          },
          () => {
            this.flagSave = false;
          }
        );
      } else {
        this._service.update(this.entity).subscribe(
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
  chuyenduyet() {
    if (
      this.entity.steps<2 &&(
      this.entity.assigneeId == null ||
      this.entity.assigneeId == "00000000-0000-0000-0000-000000000000")
    ) {
      this._notificationService.printErrorMessage(
        "Vui lòng chọn người duyệt tài liệu."
      );
      return;
    }
    let copy = Object.assign({}, this.entity);
    copy.status = 1; // Cập nhật trạng thái thành "Đã duyệt"
    this._service.update(copy).subscribe(
      (res: ResponseValue<any>) => {
        if (res.code == "200" || res.code == "201") {
          this.modalAddEdit.hide();
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
  //Chuyển duyệt
  approved() {
    if (
      this.entity.steps<2 &&(
      this.entity.assigneeId == null ||
      this.entity.assigneeId == "00000000-0000-0000-0000-000000000000")
    ) {
      this._notificationService.printErrorMessage(
        "Vui lòng chọn người duyệt tài liệu."
      );
      return;
    }
    this._service.update(this.entity).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              this.accept();
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
    
    // let copy = Object.assign({}, this.entity);
    // copy.status = type; // Cập nhật trạng thái thành "Đã duyệt" hoặc "Chờ duyệt"cop
    // this._service.update(copy).subscribe((res: ResponseValue<any>) => {
    //   if (res.code == "200" || res.code == "201") {
    //     this.SaveSuccess.emit(true);
    //     this.modalAddEdit.hide();
    //   } else {
    //     this._notificationService.printErrorMessage(
    //       MessageContstants.SYSTEM_ERROR_MSG
    //     );
    //   }
    // });
  }
  viewAccept: boolean = false;
  @ViewChild(ModalTrainingDocumentAcceptComponent, { static: false })
  modalAccept: ModalTrainingDocumentAcceptComponent;
  receiving(){
    this._notificationService.printConfirmationDialog(
    MessageContstants.CONFIRM_RECEIVING_TRAINING_MSG,
      () => {
        let copy = Object.assign({}, this.entity);
        this._service.receiving(copy).subscribe((res: ResponseValue<any>) => {
          if (res.code == "200" || res.code == "201") {
            this.SaveSuccess.emit(true);
            this.modalAddEdit.hide();
          } else {
            this._notificationService.printErrorMessage(
              MessageContstants.SYSTEM_ERROR_MSG
            );
          }
        });
      }
    );
  }
  accept() {
    this.viewAccept = true;
    setTimeout(() => {
      this.modalAccept.view(this.entity.id);
    }, 50);
  }
  acceptB2() {
    this._notificationService.printConfirmationDialog(
      MessageContstants.CONFIRM_ACCEPT_TRAINING_MSG,
      () => {
        let copy = Object.assign({}, this.entity);
        this._service.accept(copy).subscribe((res: ResponseValue<any>) => {
          if (res.code == "200" || res.code == "201") {
            this.SaveSuccess.emit(true);
            this.modalAddEdit.hide();
          } else {
            this._notificationService.printErrorMessage(
              MessageContstants.SYSTEM_ERROR_MSG
            );
          }
        });
      }
    );
  }

  modified() {
    this._notificationService.printConfirmationDialog(
      MessageContstants.CONFIRM_MODIFIED_TRAINING_MSG,
      () => {
        this._service.modified(this.entity.id).subscribe(
          (res: ResponseValue<any>) => {
            if (res.code == "200" || res.code == "201") {
              this._notificationService.printAlert("Thông báo","Đã cập nhật tài liệu bổ sung với mã tài liệu là: "+ res.data);
              this.SaveSuccess.emit(true);
              this.modalAddEdit.hide();
            }else {
              this._notificationService.printErrorMessage(
                MessageContstants.SYSTEM_ERROR_MSG
              );
            }
          });
      });
  }

  closeModal(): void {
    this.viewModal = false;
  }

  OnHidden() {
    this.CloseModal.emit();
  }
}
