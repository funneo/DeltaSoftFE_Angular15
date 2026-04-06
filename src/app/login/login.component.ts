import { UtilityService } from "./../shared/services/utility.service";
import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { SystemContstants } from "@app/shared/constants/SystemConstants";
import { Login, Profile } from "@app/shared/models";
import { AuthService, NotificationService } from "@app/shared/services";
import { RateExchangeService } from "@app/shared/services/categories/rate-exchange.service";
import { Observable } from "rxjs";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  user: Login = {
    branchId: null,
  };
  loading = false;
  listBranch: any[];
  userLoged: Profile;
  constructor(
    private authService: AuthService,
    private rateExchangeService: RateExchangeService,
    private router: Router,
    private _notificationService: NotificationService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.getBranch().subscribe((data) => {
      this.listBranch = data.listBranch;
      let i = this.listBranch.findIndex((x) => x.status);
      if (i > -1) this.user.branchId = this.listBranch[i].id;
    });
  }

  login(): void {
    this.loading = true;
    this.authService.login(this.user).subscribe(
      () => {
        this.rateExchangeService.get().subscribe(
          () => {
            console.log("Get RateExchange Ok");
          },
          (error) => {
            console.log(error);
          }
        );
        this.router.navigateByUrl("/main");
        localStorage.removeItem("DELTACC");
        localStorage.removeItem("CS");
        localStorage.removeItem(SystemContstants.APPSETTING);
      },
      (err) => {
        console.log(err);
        this._notificationService.printErrorMessage(err.error.message);
        this.loading = false;
      }
    );
  }

  public getBranch(): Observable<any> {
    return this.http.get("./assets/data/branch.json");
  }
}
