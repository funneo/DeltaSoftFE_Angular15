import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class GlobalVariableService {
  // Biến toàn cục
  public totalNew: number = 0; // tổng số thông báo
  public isAuthenticated: boolean = false; // Biến trạng thái đăng nhập

  private totalNewSubject = new BehaviorSubject<number>(0); // Biến chủ đề
  public totalNew$ = this.totalNewSubject.asObservable(); // Observable

  setTotalNew(value: number): void {
    this.totalNewSubject.next(value);
  }
}
