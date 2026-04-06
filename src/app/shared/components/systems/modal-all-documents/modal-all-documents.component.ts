import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Profile, ResponseValue, Shipment, Workflow } from '@app/shared/models';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { DispatchOrderAttachfiles } from '@app/shared/models/transports/dispatchorders/dispatch-order-attachfiles';
import { WorkflowAttackFiles } from '@app/shared/models/workflows/workflow-attack-files.model';
import { AuthService, WorkflowsService, NotificationService } from '@app/shared/services';
import { AttachfilesService } from '@app/shared/services/attachfiles.service';
import { DispatchordersService } from '@app/shared/services/transports/dispatchorders.service';
import { DownloadFileService } from '@app/shared/services/download-file.service';
import { environment } from '@environments/environment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';
import { forkJoin } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'modal-all-documents',
  templateUrl: './modal-all-documents.component.html',
  styleUrls: ['./modal-all-documents.component.css']
})
export class ModalAllDocumentsComponent implements OnInit {

  public shipmentId: number;
  public listFiles: Attachfiles[] = [];
  public listPaymen: Attachfiles[] = [];
  public listWorkflowAttachFile: WorkflowAttackFiles[] = [];
  public listVantai: DispatchOrderAttachfiles[] = [];

  public userLoged: Profile;
  public isLock: boolean = false;
  public item: Attachfiles;
  public activeTab: number = 0; // 0: Thanh toán, 1: Công việc, 2: Vận tải

  filterColumns: { [key: string]: string } = {};
  filterWorkflowColumns: { [key: string]: string } = {};
  filterVantaiColumns: { [key: string]: string } = {};

  dateTimeFields: string[] = ['createdDate'];

  filteredAttachFiles: any[] = [];
  filteredWorkflowAttachFiles: any[] = [];
  filteredVantai: any[] = [];

  @ViewChild('modalAttachFiles', { static: false }) modalAttachFiles: ModalDirective;
  busy: any;
  constructor(
    private http: HttpClient,
    private attachFileService: AttachfilesService,
    private wService: WorkflowsService,
    private dService: DispatchordersService, public datePipe: DatePipe,
    private _notificationService: NotificationService
    , private _authService: AuthService, private _download: DownloadFileService
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
  }
  clickRow(item: any) {
    item.checked = !item.checked;
  }

  icheck(): boolean {
    if (this.activeTab === 0) return this.filteredAttachFiles && this.filteredAttachFiles.some(_ => _.checked);
    if (this.activeTab === 1) return this.filteredWorkflowAttachFiles && this.filteredWorkflowAttachFiles.some(_ => _.checked);
    if (this.activeTab === 2) return this.filteredVantai && this.filteredVantai.some(_ => _.checked);
    return false;
  }
  isAllChecked(): boolean {
    let list = [];
    if (this.activeTab === 0) list = this.filteredAttachFiles;
    else if (this.activeTab === 1) list = this.filteredWorkflowAttachFiles;
    else if (this.activeTab === 2) list = this.filteredVantai;

    if (list && list.length > 0)
      return list.every(_ => _.checked);
    else
      return false;
  }
  checkAll(ev) {
    let list = [];
    if (this.activeTab === 0) list = this.filteredAttachFiles;
    else if (this.activeTab === 1) list = this.filteredWorkflowAttachFiles;
    else if (this.activeTab === 2) list = this.filteredVantai;

    if (list) {
      list.forEach(x => x.checked = ev.target.checked);
    }
  }

  isAllWorkflowChecked(): boolean {
    if (this.filteredWorkflowAttachFiles && this.filteredWorkflowAttachFiles.length > 0)
      return this.filteredWorkflowAttachFiles.every(_ => _.checked);
    else
      return false;
  }
  checkAllWorkflow(ev) {
    if (this.filteredWorkflowAttachFiles) {
      this.filteredWorkflowAttachFiles.forEach(x => x.checked = ev.target.checked);
    }
  }

  isAllVantaiChecked(): boolean {
    if (this.filteredVantai && this.filteredVantai.length > 0)
      return this.filteredVantai.every(_ => _.checked);
    else
      return false;
  }
  checkAllVantai(ev) {
    if (this.filteredVantai) {
      this.filteredVantai.forEach(x => x.checked = ev.target.checked);
    }
  }
  downloadFile() {
    let fileUrls: { url: string; name: string }[] = [];
    let listToIterate = [];
    if (this.activeTab === 0) listToIterate = this.filteredAttachFiles;
    else if (this.activeTab === 1) listToIterate = this.filteredWorkflowAttachFiles;
    else if (this.activeTab === 2) listToIterate = this.filteredVantai;

    if (listToIterate) {
      listToIterate.forEach(element => {
        if (element.checked) {
          let url = environment.apiUrl + (element.pathFile || '').replace('~', '');
          fileUrls.push({ url: url, name: element.fileName });
        }
      });
    }

    if (fileUrls.length > 0) {
      this.downloadAndZipMultipleFiles(fileUrls, 'AttachFiles.zip');
    } else {
      this._notificationService.printErrorMessage('Vui lòng chọn ít nhất một tệp tin để tải về!');
    }
  }
  filterData(): void {
    this.filteredAttachFiles = this.listPaymen?.filter((item) => {
      return Object.keys(this.filterColumns).every((key) => {
        if (!this.filterColumns[key]) return true; // Nếu không nhập gì, bỏ qua filter
        const filterValue = this.filterColumns[key].toString().toLowerCase();
        const itemValue =
          this.dateTimeFields.includes(key) // Kiểm tra nếu key nằm trong danh sách DateTime
            ? (item[key] ? this.datePipe.transform(item[key], "dd/MM/yyyy HH:mm").toLowerCase() : '')
            : (item[key] != null ? String(item[key]).toLowerCase() : '');
        return itemValue.includes(filterValue);
      });
    });
  }

  filterWorkflowData(): void {
    this.filteredWorkflowAttachFiles = this.listWorkflowAttachFile?.filter((item) => {
      return Object.keys(this.filterWorkflowColumns).every((key) => {
        if (!this.filterWorkflowColumns[key]) return true;
        const filterValue = this.filterWorkflowColumns[key].toString().toLowerCase();
        const itemValue = item[key] != null ? String(item[key]).toLowerCase() : '';
        return itemValue.includes(filterValue);
      });
    });
  }

  filterVantaiData(): void {
    this.filteredVantai = this.listVantai?.filter((item) => {
      return Object.keys(this.filterVantaiColumns).every((key) => {
        if (!this.filterVantaiColumns[key]) return true;
        const filterValue = this.filterVantaiColumns[key].toString().toLowerCase();
        const itemValue = item[key] != null ? String(item[key]).toLowerCase() : '';
        return itemValue.includes(filterValue);
      });
    });
  }

  downloadAndZipMultipleFiles(fileUrls: { url: string; name: string }[], zipFileName: string) {
    const fileRequests = fileUrls.map(file =>
      this.http.get(file.url, { responseType: 'blob' }).pipe()
    );

    forkJoin(fileRequests).subscribe((fileBlobs) => {
      const zip = new JSZip();

      // Thêm từng file vào file ZIP với tên mới
      fileBlobs.forEach((fileBlob, index) => {
        const fileName = fileUrls[index].name;
        zip.file(fileName, fileBlob);
      });

      // Nén và lưu file ZIP
      zip.generateAsync({ type: 'blob' }).then(content => {
        saveAs(content, zipFileName);
      });
    }, (error) => {
      console.error('Lỗi khi tải tệp:', error);
      this._notificationService.printErrorMessage('Có lỗi xảy ra khi tải các tệp tin. Vui lòng kiểm tra lại kết nối hoặc file nguồn!');
    });
  }

  loadAttachFiles() {
    const params = new HttpParams()
      .set('frmname', 'SHIPMENT')
      .set('functionname', 'SHIPMENT')
      .set('refno', this.shipmentId.toString())
    this.attachFileService.getAll(params).subscribe((res: ResponseValue<Attachfiles[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listFiles = res.data;
      } else {
        this.listFiles = [];
      }
    });
  }
  loadPaymentAttachFiles() {
    this.attachFileService.getByShipment(this.shipmentId).subscribe((res: ResponseValue<Attachfiles[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listPaymen = res.data;
      } else {
        this.listPaymen = [];
      }
      this.filterData();
    });
  }
  loadWorkflowAttachFiles() {
    let item: Workflow = {
      id: this.shipmentId
    }
    this.wService.attackfiles_getbyShipment(item).subscribe((res: ResponseValue<WorkflowAttackFiles[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listWorkflowAttachFile = res.data;
      } else {
        this.listWorkflowAttachFile = [];
      }
      this.filterWorkflowData();
    });
  }
  loadDispatchOrderAttachFiles() {
    let item: Shipment = {
      id: this.shipmentId
    }
    this.dService.getAttachFileByShipent(item).subscribe((res: ResponseValue<DispatchOrderAttachfiles[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listVantai = res.data;
      } else {
        this.listVantai = [];
      }
      this.filterVantaiData();
    });
  }
  clickLink(item: Attachfiles) {
    //Kiểm tra nếu là .txt file thì sau khi download về thì đổi tên file thành msg
    if (item.pathFile.substring(item.pathFile.length - 3) == 'txt') {
      let url = environment.apiUrl + item.pathFile.replace('~', '');
      this._download
        .download(url)
        .subscribe(blob => {
          const a = document.createElement('a')
          const objectUrl = URL.createObjectURL(blob)
          a.href = objectUrl
          a.download = item.fileName;
          a.click();
          URL.revokeObjectURL(objectUrl);
        })
    } else {
      let url = environment.apiUrl + item.pathFile.replace('~', '');
      window.open(url, "_blank");
    }
  }
  clickLinkWorkflow(item: WorkflowAttackFiles) {
    //Kiểm tra nếu là .txt file thì sau khi download về thì đổi tên file thành msg
    if (item.pathFile.substring(item.pathFile.length - 3) == 'txt') {
      let url = environment.apiUrl + item.pathFile.replace('~', '');
      this._download
        .download(url)
        .subscribe(blob => {
          const a = document.createElement('a')
          const objectUrl = URL.createObjectURL(blob)
          a.href = objectUrl
          a.download = item.fileName;
          a.click();
          URL.revokeObjectURL(objectUrl);
        })
    } else {
      let url = environment.apiUrl + item.pathFile.replace('~', '');
      window.open(url, "_blank");
    }
  }
  clickLinkDispatchOrder(item: DispatchOrderAttachfiles) {
    //Kiểm tra nếu là .txt file thì sau khi download về thì đổi tên file thành msg
    if (item.pathFile.substring(item.pathFile.length - 3) == 'txt') {
      let url = environment.apiUrl + item.pathFile.replace('~', '');
      this._download
        .download(url)
        .subscribe(blob => {
          const a = document.createElement('a')
          const objectUrl = URL.createObjectURL(blob)
          a.href = objectUrl
          a.download = item.fileName;
          a.click();
          URL.revokeObjectURL(objectUrl);
        })
    } else {
      let url = environment.apiUrl + item.pathFile.replace('~', '');
      window.open(url, "_blank");
    }
  }

  edit(id: number) {
    this.shipmentId = id;
    this.loadAttachFiles();
    this.loadPaymentAttachFiles();
    this.loadWorkflowAttachFiles();
    this.loadDispatchOrderAttachFiles();
    //this.loadAttachFiles(true);
    this.modalAttachFiles.show();
  }

  OnHidden() {
    this.modalAttachFiles.hide();
  }
}
