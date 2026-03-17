
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MessageContstants } from '@app/shared/constants';
import { Profile, ResponseValue } from '@app/shared/models';
import { AuthService, NotificationService, UserService, UtilityService } from '@app/shared/services';
import { environment } from '@environments/environment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FirebaseNotificationService } from '@app/shared/services/systems/notification.service';
import { FirebaseNotification } from '@app/shared/models/systems/notification.model';
import * as moment from 'moment';
import { HttpParams } from '@angular/common/http';
import { GlobalVariableService } from '@app/shared/services/systems/global-variable.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {

  public user: Profile;
  public entity: any;
  public functions: any[];
  public listCoSos: any[];
  public viewModalChonCuaHang: boolean = false;
  modalRef: BsModalRef;
  modalList:BsModalRef;
  branchName?:string='';
  avatar: string = 'assets/img/avatar.png';
  totalNew?:number=0;
  public listNotification: FirebaseNotification[] = [];

  public ngayBatDau: Date = this._utilityService.ngayBanDau;
  public ngayKetThuc: Date = this._utilityService.ngayKetThuc;
  public dateOptions = this._utilityService.dateOptionMultis(
    this.ngayBatDau,
    this.ngayKetThuc
  );
  constructor( private authService: AuthService, private _notificationService: NotificationService, private router: Router, private userService: UserService,
    private modalService: BsModalService, private service:FirebaseNotificationService, private _utilityService: UtilityService,
    private globalVar:GlobalVariableService
  ) {

  }

  ngOnInit() {
    this.user = this.authService.getLoggedInUser();
    this.branchName=this.user.branchName;
    if(this.user.avatar != null && this.user.avatar.trim() != ""){
      this.avatar = environment.apiUrl + this.user.avatar;
    }
    this.globalVar.totalNew$.subscribe(totalNew => this.totalNew = totalNew);
    this.loadData();
  }
  elem=document.documentElement;
  fullScreen(){
    if(this.elem.requestFullscreen){
      this.elem.requestFullscreen();
    }
  }
  
  logout() {
    this.userService.logout().subscribe(()=>{
      this.router.navigateByUrl('/login');
    })
  }
  setRead():void{
    this.service
      .setRead(0,true)
      .subscribe((res: ResponseValue<FirebaseNotification[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.loadData();
        } else {
        }
      });
  }

  showEditPassModal(template: TemplateRef<any>) {
    this.entity = {};
    this.entity.userName=this.user.userName;
    this.modalRef = this.modalService.show(template);
  }
  showListNotification(template: TemplateRef<any>) {
    this.modalList = this.modalService.show(template);
  }

  saveChangePass(valid: boolean) {
    if (valid) {
      this.userService.changedPass(this.entity).subscribe(
          () => {
          this.modalRef.hide();
          this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
        },(err)=> {
          console.log(err);
          this._notificationService.printErrorMessage(err);
       });
    }
  }

  selectedDate(event) {
    this.ngayBatDau = new Date(event.start);
    this.ngayKetThuc = new Date(event.end);
    this.loadData();
  }
  markAsRead(item: FirebaseNotification) {
    debugger;
    this.service
      .setRead(item.id,false)
      .subscribe((res: ResponseValue<FirebaseNotification[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.loadData();
          } else {
        }
      });
  }

  deleteNotification (item: FirebaseNotification) {
    
  }



  loadData(): void {
    let tuNgay = moment(this.ngayBatDau).format("YYYYMMDD");
    let denNgay = moment(this.ngayKetThuc).format("YYYYMMDD");
    const params = new HttpParams()
      .set("fromDate", tuNgay)
      .set("toDate", denNgay)
    // .set('usergroupid')
    this.service
      .getAll(params)
      .subscribe((res: ResponseValue<FirebaseNotification[]>) => {
        if (res.code == "200" || res.code == "201") {
          this.listNotification = res.data;
          this.totalNew=this.listNotification.filter(x=>x.isNew).length;
        } else {
        }
      });
  }


}
