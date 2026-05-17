import { UtilityService } from "./../shared/services/utility.service";
import { HttpClient } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { SystemContstants } from "@app/shared/constants/SystemConstants";
import { Login, Profile } from "@app/shared/models";
import { AuthService, NotificationService } from "@app/shared/services";
import { RateExchangeService } from "@app/shared/services/categories/rate-exchange.service";
import { Observable } from "rxjs";

const REMEMBER_KEY = "DELTA_LOGIN_REMEMBER";

interface Quote { text: string; author: string; }

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit, OnDestroy {
  user: Login = {
    branchId: null,
  };
  loading = false;
  listBranch: any[];
  userLoged: Profile;
  showPassword = false;
  rememberMe = false;

  quotes: Quote[] = [
    { text: "Mỗi chuyến đi là một cam kết — đúng giờ, an toàn, trọn niềm tin.", author: "DeltaJSC" },
    { text: "Hàng hoá đến đích, uy tín ở lại.", author: "Triết lý vận tải" },
    { text: "Đường xa không ngại, chỉ ngại sai hẹn.", author: "Ngạn ngữ nghề" },
    { text: "Logistics tốt là khi khách hàng quên rằng họ đã từng giao hàng.", author: "Peter Drucker (phỏng theo)" },
    { text: "Không có cung đường nào quá dài nếu đi cùng đồng đội.", author: "DeltaJSC" },
    { text: "Tốc độ làm nên ấn tượng, chất lượng tạo nên thương hiệu.", author: "Vô danh" },
  ];
  quoteIndex = 0;
  private _quoteTimer: any = null;

  constructor(
    private authService: AuthService,
    private rateExchangeService: RateExchangeService,
    private router: Router,
    private _notificationService: NotificationService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    const remembered = this._loadRemembered();
    if (remembered) {
      this.rememberMe = true;
      if (remembered.userName) this.user.userName = remembered.userName;
      if (remembered.passWord) this.user.passWord = remembered.passWord;
    }
    this.getBranch().subscribe((data) => {
      this.listBranch = data.listBranch;
      if (remembered?.branchId && this.listBranch.some((x) => x.id === remembered.branchId)) {
        this.user.branchId = remembered.branchId;
      } else {
        const i = this.listBranch.findIndex((x) => x.status);
        if (i > -1) this.user.branchId = this.listBranch[i].id;
      }
    });

    this.quoteIndex = Math.floor(Math.random() * this.quotes.length);
    this._quoteTimer = setInterval(() => {
      this.quoteIndex = (this.quoteIndex + 1) % this.quotes.length;
    }, 6000);
  }

  ngOnDestroy(): void {
    if (this._quoteTimer) {
      clearInterval(this._quoteTimer);
      this._quoteTimer = null;
    }
  }

  goToQuote(i: number): void {
    this.quoteIndex = i;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    this.loading = true;
    this.authService.login(this.user).subscribe(
      () => {
        this._persistRemembered();
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

  private _loadRemembered(): { userName?: string; passWord?: string; branchId?: number } | null {
    try {
      const raw = localStorage.getItem(REMEMBER_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") return null;
      if (data.passWord) {
        try { data.passWord = atob(data.passWord); } catch { data.passWord = ""; }
      }
      return data;
    } catch {
      return null;
    }
  }

  private _persistRemembered(): void {
    if (this.rememberMe) {
      const payload = {
        userName: this.user.userName,
        passWord: this.user.passWord ? btoa(this.user.passWord) : "",
        branchId: this.user.branchId,
      };
      localStorage.setItem(REMEMBER_KEY, JSON.stringify(payload));
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }
  }
}
