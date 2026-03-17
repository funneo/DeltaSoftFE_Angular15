import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { PermissionCS, PermissionPayment, ResponseValue } from '@app/shared/models';
import { AuthService, PermissionCSService, PermissionPaymentService, SignalRService } from '@app/shared/services';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  _userName: string;
  _branchId: number;
  constructor(
    private permissionCSService: PermissionCSService,
    private authService: AuthService,
    private permissionPaymentService: PermissionPaymentService,
    private signalRService: SignalRService
  ) {
    let user = this.authService.getLoggedInUser();
    this._userName = user.userName;
    this._branchId = parseInt(user.branchId);
  }

  ngOnInit(): void {
    let body = document.getElementsByTagName('body')[0];
    body.classList.add("sidebar-mini");
    body.classList.add("wysihtml5-supported");
    body.classList.add("skin-blue-light");
    body.classList.add("fixed");
    body.classList.remove("hold-transition");
    body.classList.remove("login-page");
    this.setPermissionCS();
    this.setPermissionPM();
    // Start SignalR connection to listen for cache updates
    this.signalRService.startConnection();
  }

  setPermissionCS() {
    const params = new HttpParams()
      .set('userName', this._userName)
      .set('branchId', this._branchId.toString());
    this.permissionCSService.getAll(params).subscribe((res: ResponseValue<PermissionCS[]>) => {
      this.permissionCSService.setPermissionCS(res.data)
    });
  }

  setPermissionPM() {
    const params = new HttpParams()
      .set('userName', this._userName)
      .set('branchId', this._branchId.toString());
    this.permissionPaymentService.getAll(params).subscribe((res: ResponseValue<PermissionPayment[]>) => {
      // console.log(res.data);
      this.permissionPaymentService.setPermissionPM(res.data);
    });
  }

}
