import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Profile, ResponseValue } from '@app/shared/models';
import { ShippingTaskAttachFile } from '@app/shared/models/transports/shipping-task-attach-file';
import { ShippingTask } from '@app/shared/models/transports/shipping-task.model';
import { AuthService, NotificationService } from '@app/shared/services';
import { DownloadFileService } from '@app/shared/services/download-file.service';
import { ShippingTaskAttachFileService } from '@app/shared/services/transports/shipping-task-attach-file.service';
import { environment } from '@environments/environment';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'modal-shipping-task-attach-file',
  templateUrl: './modal-shipping-task-attach-file.component.html',
  styleUrls: ['./modal-shipping-task-attach-file.component.css']
})
export class ModalShippingTaskAttachFileComponent implements OnInit {

  public listFiles:ShippingTaskAttachFile[]=[];
  public listFilesFirstLoad:ShippingTaskAttachFile[]=[];
  public _shippingTaskId?:number;
  public userLoged:Profile;
  public isLock:boolean=false;
  public item: ShippingTaskAttachFile;

  @ViewChild('modalShippingTaskAttachFile', { static: false }) modalShippingTaskAttachFile: ModalDirective;
  busy: any;
  constructor(private _notificationService: NotificationService
    , private _shippingTaskAttachFileervice: ShippingTaskAttachFileService
    ,private _authService:AuthService,private _download:DownloadFileService
  ) { }

  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
  }

  onFileChanged(event,item:ShippingTaskAttachFile) {
    if (event.target.files.length > 0) {
        const files: FileList = event.target.files;
        const fileArray: File[] = Array.from(files); // Convert FileList to an array
        fileArray.forEach(element => {
        const file = element;
        item.size=file.size;
        if(item.size>2048*1024){
          this._notificationService.printErrorMessage(MessageContstants.FILE_SIZE_BIGGER );
          return;
        }
        else{
          item.userId=this.userLoged.id
          if(item.id==undefined){
            this.busy = this._shippingTaskAttachFileervice.add(item,file).subscribe((res: ResponseValue<ShippingTaskAttachFile[]>) => {
                    if (res.code == '200' || res.code == '201') {
                      this.loadShippingTaskAttachFile(false);

                    }else{
                      this._notificationService.printErrorMessage(MessageContstants.CREATED_ERR_MSG + '\n' + res.code);
                    }
                  });
          }else{
            this.busy = this._shippingTaskAttachFileervice.update(item,file).subscribe((res: ResponseValue<ShippingTaskAttachFile[]>) => {
              if (res.code == '200' || res.code == '201') {
                this.loadShippingTaskAttachFile(false);
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
    let item:ShippingTaskAttachFile={
      shippingTaskId:this.item.id,
      checked:false
    }
    this.listFiles.push(item);
  }

  loadShippingTaskAttachFile(firstLoad:boolean) {
    this._shippingTaskAttachFileervice.getByShippingTask(this._shippingTaskId).subscribe((res: ResponseValue<ShippingTaskAttachFile[]>) => {
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
      } else {
        this.listFiles=[];
      }
    });
  }
  clickLink(item:ShippingTaskAttachFile){
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


  edit(id:number, flag:boolean) {
    this.isLock=flag;
    this._shippingTaskId=id;
    this.loadShippingTaskAttachFile(true);
    this.modalShippingTaskAttachFile.show();
  }


}
