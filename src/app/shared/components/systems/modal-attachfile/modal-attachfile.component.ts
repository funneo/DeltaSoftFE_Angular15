import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Profile, ResponseValue } from '@app/shared/models';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { AuthService, NotificationService } from '@app/shared/services';
import { AttachfilesService } from '@app/shared/services/attachfiles.service';
import { DownloadFileService } from '@app/shared/services/download-file.service';
import { environment } from '@environments/environment';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'modal-attachfile',
  templateUrl: './modal-attachfile.component.html',
  styleUrls: ['./modal-attachfile.component.css']
})
export class ModalAttachfileComponent implements OnInit {
  public listFiles:Attachfiles[]=[];
  public listFilesFirstLoad:Attachfiles[]=[];
  public userLoged:Profile;
  public isLock:boolean=false;
  public item: Attachfiles;
  
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAttachFiles', { static: false }) modalAttachFiles: ModalDirective;
  busy: any;
  constructor(private _notificationService: NotificationService
    , private attachFileService: AttachfilesService
    ,private _authService:AuthService,private _download:DownloadFileService
  ) { }

  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
  }

  onFileChanged(event,item:Attachfiles) {
    if (event.target.files.length > 0) {
        const files: FileList = event.target.files;
        const fileArray: File[] = Array.from(files); // Convert FileList to an array
        fileArray.forEach(element => {
        const file = element;
        item.size=file.size;
        if(item.size>2048*1024 && item.frmName!="TRAINING_DOCUMENTS"){
          this._notificationService.printErrorMessage(MessageContstants.FILE_SIZE_BIGGER );
          return;
        }
        else{
          item.userId=this.userLoged.id
          if(item.id==undefined){
            this.busy = this.attachFileService.add(item,file).subscribe((res: ResponseValue<Attachfiles[]>) => {
                    if (res.code == '200' || res.code == '201') {
                      this.loadAttachFiles(false);

                    }else{
                      this._notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG + '\n' + res.code);
                    }
                  });
          }else{
            this.busy = this.attachFileService.update(item,file).subscribe((res: ResponseValue<Attachfiles[]>) => {
              if (res.code == '200' || res.code == '201') {
                this.loadAttachFiles(false);
              }else{
                this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG + '\n' + res.code);
              }
            });
          }
        }
        }); 
    }
  }
  newAttachFile(){
    let item:Attachfiles={
      functionName:this.item.functionName,
      refNo:this.item.refNo,
      frmName:this.item.frmName,
      checked:false
    }
    this.listFiles.push(item);
  }

  loadAttachFiles(firstLoad:boolean) {
    const params = new HttpParams()
    .set('frmname',this.item.frmName)
    .set('functionname',this.item.functionName)
    .set('refno',this.item.refNo)
    this.attachFileService.getAll(params).subscribe((res: ResponseValue<Attachfiles[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listFiles = res.data;
        if(firstLoad)
        {
          this.listFilesFirstLoad=res.data;
          this.listFiles.forEach(item=>{item.checked=true;})
        }else{
          for(var i=0;i<this.listFiles.length;i++){
            for(var j=0;j<this.listFilesFirstLoad.length;j++){
              if(this.listFiles[i].id==this.listFilesFirstLoad[j].id){
                this.listFiles[i].checked=true;
              }
            }
          }
        }
        //Kiểm tra nếu là Nhân viên và hồ sơ phương tiện thì cho phép thêm mới, cập nhật, xóa nếu có quyền Sửa Nhân viên hoặc phương tiện
        if(this.item.functionName=='EMPLOYEE')this.listFiles.forEach(it=>it.checked=false);
      } else {
        this.listFiles=[];
      }
    });
  }
  clickLink(item:Attachfiles){
    //Kiểm tra nếu là .txt file thì sau khi download về thì đổi tên file thành msg
    if(item.pathFile.substring(item.pathFile.length - 3)=='txt'){
      let  url=environment.apiUrl+item.pathFile.replace('~','');
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
    }else{
      let url=environment.apiUrl+item.pathFile.replace('~','');
      window.open(url, "_blank");
    }
  }

  deleteFile(item:Attachfiles){
    // this.attachFileService.delete(item).subscribe((res: ResponseValue<Attachfiles[]>) => {
    //   if (res.code == '200' || res.code == '201') {
    //     this._notificationService.printSuccessMessage(MessageContstants.DELETED_OK_MSG);
    //     this.loadAttachFiles(false);
    //   } else {
    //     this._notificationService.printErrorMessage(MessageContstants.UPDATED_ERR_MSG +res.code);
    //   }
    // });
  }

  edit(item:Attachfiles, flag:boolean) {
    this.isLock=flag;
    this.item=item;
    this.loadAttachFiles(true);
    this.modalAttachFiles.show();
  }

  OnHidden() {
    this.CloseModal.emit();
  }
}
