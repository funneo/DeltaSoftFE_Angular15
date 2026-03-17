import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Profile, ResponseValue } from '@app/shared/models';
import { OnleaveManagement } from '@app/shared/models/hrm/onleave-management.model';
import { AuthService, BranchService, NotificationService, UtilityService } from '@app/shared/services';
import { ExportService } from '@app/shared/services/export-excel.service';
import { OnleaveManagementService } from '@app/shared/services/hrm/onleave-management.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-onleave-management',
  templateUrl: './onleave-management.component.html',
  styleUrls: ['./onleave-management.component.css']
})
export class OnleaveManagementComponent implements OnInit {
  flagXem = false;
  listOnLeaveManagement: OnleaveManagement[]=[];
  listFilter:OnleaveManagement[]=[];
  listBranch:Branch[]=[];
  listYear:{id:number,year:number}[]=[]
  userLoged?:Profile;
  busy: Subscription;
  viewModal = false;
  adminPermission=false;
  branchId?:number=0;
  year?:number;
  maskNumber = UtilityService.maskNumber;
  nameSearch:string='';
  _auth=5;
  s1=false;
  s2=false;
  s3=false;
  s4=false;
  s5=false;
  s6=false;
  s7=false;
  s8=false;
  s9=false;
  s10=false;
  s11=false;
  s12=false;
  constructor(
    private onLeaveManagementService:OnleaveManagementService
    ,private notificationService: NotificationService, private _authService:AuthService
    ,private branchService:BranchService
    ,private _utilityService:UtilityService
    ,private _export:ExportService
  ) { }

  ngOnInit(): void {
    for(var i=0;i<20;i++){
      var item:{id:number,year:number}={id:i,year:2020+i+1};
      this.listYear.push(item);
    }
    this.year=(new Date()).getFullYear();
    this.userLoged=this._authService.getLoggedInUser();
    this.branchId=Number.parseInt(this.userLoged.branchId);
    this._auth = Number.parseInt(this.userLoged.authorisationLevel);
    this.adminPermission=this.userLoged.isAdmin|| this._auth<1;
    this.loadBranch();
    this.loadData();
  }

  loadData(): void {
    const params = new HttpParams()
      .set('branchid',this.branchId.toString())
      .set('year', this.year.toString())
      this.busy = this.onLeaveManagementService.get(params).subscribe((res: ResponseValue<OnleaveManagement[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listOnLeaveManagement = res?.data;
          this.filter()
        }
          else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }
  sortT1(){
    this.listFilter = Object.assign([], this.listOnLeaveManagement);
    this.s1=!this.s1
    if(this.s1){
      this.s2=false;
      this.listFilter=this.listFilter.filter((data)=>{
        return data.month01 >0;
      });
    }
  }
  sortT2(){
    this.listFilter = Object.assign([], this.listOnLeaveManagement);
    this.s2=!this.s2
    if(this.s2){
      this.s1=this.s3=this.s4=this.s5=this.s6=this.s7=this.s8=this.s9=this.s10=this.s11=this.s12=false;
      this.listFilter=this.listFilter.filter((data)=>{
        return data.month02 >0;
      });
    }
  }
  sortT3(){
    this.listFilter = Object.assign([], this.listOnLeaveManagement);
    this.s3=!this.s3
    if(this.s3){
      this.s1=this.s2=this.s4=this.s5=this.s6=this.s7=this.s8=this.s9=this.s10=this.s11=this.s12=false;
      this.listFilter=this.listFilter.filter((data)=>{
        return data.month03 >0;
      });
    }
  }
  sortT4(){
    this.listFilter = Object.assign([], this.listOnLeaveManagement);
    this.s4=!this.s4
    if(this.s4){
      this.s1=this.s2=this.s3=this.s5=this.s6=this.s7=this.s8=this.s9=this.s10=this.s11=this.s12=false;
      this.listFilter=this.listFilter.filter((data)=>{
        return data.month04 >0;
      });
    }
  }
  sortT5(){
    this.listFilter = Object.assign([], this.listOnLeaveManagement);
    this.s5=!this.s5
    if(this.s5){
      this.s1=this.s2=this.s3=this.s4=this.s6=this.s7=this.s8=this.s9=this.s10=this.s11=this.s12=false;
      this.listFilter=this.listFilter.filter((data)=>{
        return data.month05 >0;
      });
    }
  }
  sortT6(){
    this.listFilter = Object.assign([], this.listOnLeaveManagement);
    this.s6=!this.s6
    if(this.s6){
      this.s1=this.s2=this.s3=this.s4=this.s5=this.s7=this.s8=this.s9=this.s10=this.s11=this.s12=false;
      this.listFilter=this.listFilter.filter((data)=>{
        return data.month06 >0;
      });
    }
  }
  sortT7(){
    this.listFilter = Object.assign([], this.listOnLeaveManagement);
    this.s7=!this.s7
    if(this.s7){
      this.s1=this.s2=this.s3=this.s4=this.s5=this.s6=this.s8=this.s9=this.s10=this.s11=this.s12=false;
      this.listFilter=this.listFilter.filter((data)=>{
        return data.month07 >0;
      });
    }
  }
  sortT8(){
    this.listFilter = Object.assign([], this.listOnLeaveManagement);
    this.s8=!this.s8
    if(this.s8){
      this.s1=this.s2=this.s3=this.s4=this.s5=this.s6=this.s7=this.s9=this.s10=this.s11=this.s12=false;
      this.listFilter=this.listFilter.filter((data)=>{
        return data.month08 >0;
      });
    }
  }
  sortT9(){
    this.listFilter = Object.assign([], this.listOnLeaveManagement);
    this.s9=!this.s9
    if(this.s9){
      this.s1=this.s2=this.s3=this.s4=this.s5=this.s6=this.s7=this.s8=this.s10=this.s11=this.s12=false;
      this.listFilter=this.listFilter.filter((data)=>{
        return data.month09 >0;
      });
    }
  }
  sortT10(){
    this.listFilter = Object.assign([], this.listOnLeaveManagement);
    this.s10=!this.s10
    if(this.s10){
      this.s1=this.s2=this.s3=this.s4=this.s5=this.s6=this.s7=this.s8=this.s9=this.s11=this.s12=false;
      this.listFilter=this.listFilter.filter((data)=>{
        return data.month10 >0;
      });
    }
  }
  sortT11(){
    this.listFilter = Object.assign([], this.listOnLeaveManagement);
    this.s11=!this.s11
    if(this.s11){
      this.s1=this.s2=this.s3=this.s4=this.s5=this.s6=this.s7=this.s8=this.s9=this.s10=this.s12=false;
      this.listFilter=this.listFilter.filter((data)=>{
        return data.month11 >0;
      });
    }
  }
  sortT12(){
    this.listFilter = Object.assign([], this.listOnLeaveManagement);
    this.s12=!this.s12
    if(this.s12){
      this.s1=this.s2=this.s3=this.s4=this.s5=this.s6=this.s7=this.s8=this.s9=this.s10=this.s11=false;
      this.listFilter=this.listFilter.filter((data)=>{
        return data.month12 >0;
      });
    }
  }

  filter(){
    this.listFilter = Object.assign([], this.listOnLeaveManagement);
    if(this.nameSearch?.length>0)
    this.listFilter=this.listFilter.filter((data)=>{
      return data.employeeFullName.toString().toLowerCase().includes(this.nameSearch.trim().toLocaleLowerCase());
    });
  }

  exportExcel(): void {
    const params = new HttpParams()
      .set('branchid',this.branchId.toString())
      .set('year', this.year.toString())
      this.busy = this.onLeaveManagementService.get(params).subscribe((res: ResponseValue<OnleaveManagement[]>) => {
        if (res.code == '200' || res.code == '201') {
          let listData = res?.data;
          let print=listData.map(({ id,userId,isNew,branchId, ...item }) => item);
          this._export.exportExcel(listData,'tong-ket-phep-nam');
        }
          else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }



  loadBranch(): void {
      this.busy = this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
        if (res.code == '200' || res.code == '201') {
          this.listBranch = res.data;
        }
        else {
          if(res.code=='204'){
            this.listBranch =[];
          } else {
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
          }
        }
      });
  }

  changedBranch(event:Branch){
    this.branchId=event!.id;
    this.loadData();
  }
  changeAdjust(item:OnleaveManagement){
    item.remaining=item.numberOfLeaveDay-(item.month01+item.month02
      +item.month03+item.month04+item.month05+item.month06+item.month07
      +item.month08+item.month09+item.month10+item.month11+item.month12+item.adjust);
  }

  approvedConfirm(): void {
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.approved());
  }

  approved(): void {
    this.listOnLeaveManagement.forEach(item=>{
      this.onLeaveManagementService.add(item).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
    })

  }
  view(): void {
    this.loadData()
  }
}
