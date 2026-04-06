import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Profile, ResponseValue } from '@app/shared/models';
import { Attachfiles } from '@app/shared/models/attachfiles.models';
import { AttachfilesService } from '@app/shared/services/attachfiles.service';
import { DownloadFileService } from '@app/shared/services/download-file.service';
import { environment } from '@environments/environment';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'modal-all-attach-file',
  templateUrl: './modal-all-attach-file.component.html',
  styleUrls: ['./modal-all-attach-file.component.css']
})
export class ModalAllAttachFileComponent implements OnInit {
  public listFiles:Attachfiles[]=[];
  public listFilesFirstLoad:Attachfiles[]=[];

  public userLoged:Profile;
  public isLock:boolean=false;
  public item: Attachfiles;
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalAttachFiles', { static: false }) modalAttachFiles: ModalDirective;
  busy: any;
  private _authService: any;
  constructor(
     private attachFileService: AttachfilesService
    ,private _download:DownloadFileService
  ) { }

  ngOnInit(): void {
    this.userLoged=this._authService.getLoggedInUser();
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
          console.log(this.listFiles);
        }
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
