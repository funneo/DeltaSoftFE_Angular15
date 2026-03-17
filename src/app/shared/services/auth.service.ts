import { Injectable } from '@angular/core';
import { Login, Profile } from '../models';
import jwt_decode from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { JwtService } from './jwt.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: string;
  userLoged: Profile;
  constructor(
    private http: HttpClient,
    private jwtService: JwtService,
    private router: Router,
    private cacheService: CacheService
  ) {
    this.token = jwtService.getToken();
  }
  get authorizationHeaderValue(): string {
    if (this.token) {
      return 'Bearer ' + this.token;
    }
    return '';
  }

  login(model: Login): Observable<any> {
    return this.http
      .post(`${environment.apiUrl}/api/account/login`, model)
      .pipe(
        tap((res: any) => {
          this.token = res.token;
          this.jwtService.saveToken(this.token);
          // Clear all cache after login to ensure fresh data based on user permissions
          this.cacheService.clearAll();
        })
      );
  }

  getLoggedInUser(): Profile {
    const token = localStorage.getItem('TOKEN');
    if (token) {
      const user = jwt_decode(token) as Profile;
      if (typeof (user.permissions) == 'string') {
        user.permissions = JSON.parse(user.permissions);
      }
      if (typeof (user.userHandlingGroups) == 'string') {
        user.userHandlingGroups = JSON.parse(user.userHandlingGroups);
      }
      if (typeof (user.roles) == 'string') {
        if (user.roles == 'Admin') {
          user.isAdmin = true;
        }
      } else {
        if (user.roles.findIndex((x) => x == 'Admin') != -1) {
          user.isAdmin = true;
        }
      }
      return user;
    } else return null;
  }

  hasPermission(functionId: string): boolean {
    const user = this.getLoggedInUser();
    console.log(user);
    var result: boolean = false;
    if (typeof user.roles == 'string') {
      if (user.roles == 'Admin') {
        return true;
      }
    } else {
      if (user.roles.findIndex((x) => x == 'Admin') != -1) {
        return true;
      }
    }
    const permiss: string[] =
      typeof (user.permissions) == 'string'
        ? JSON.parse(user.permissions)
        : user.permissions;
    if (user.permissions && permiss.findIndex((x) => x === functionId) != -1) {
      result = true;
    } else {
      result = false;
    }
    return result;
  }

  logout() {
    // Clear all cache on logout
    this.cacheService.clearAll();
    this.router.navigateByUrl('/login');
  }
}
