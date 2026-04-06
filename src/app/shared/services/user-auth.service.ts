import { Injectable } from "@angular/core";
import { Profile } from "../models";
import { AuthService } from "./auth.service";

@Injectable()
export class UserAuthService {
_user: Profile;
  constructor(authService: AuthService) {
    this._user = authService.getLoggedInUser();
  }

 GetEmployeeId = (): number => {

  return this._user.employeeId? 0: Number.parseInt(this._user.employeeId);

  }
}
