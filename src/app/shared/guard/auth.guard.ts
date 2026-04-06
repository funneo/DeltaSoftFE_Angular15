import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private authService: AuthService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = this.authService.getLoggedInUser();
    if (user) {
      const functionCode = route.data['functionCode'] as string;
      if (typeof (user.roles) == 'string') {
        if (user.roles == 'Admin') {
          return true;
        }
      }
      else {
        if (user.roles.findIndex(x => x == 'Admin') != -1) {
          return true;
        }
      }
      const permiss: string[] = typeof(user.permissions) == "string"? JSON.parse(user.permissions): user.permissions;
      if (user.permissions && permiss.findIndex(x => x === functionCode + '_VIEW') != -1) {
        return true;
      } else {
        this.router.navigate(['/login'], {
          queryParams: { redirect: state.url }
        });
        return false;
      }
    }
    this.router.navigate(['/login'], { queryParams: { redirect: state.url }, replaceUrl: true });
    return false;
  }

}
