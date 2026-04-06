import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { Permissions } from '../models';
import { AuthService } from '../services';

@Directive({
  selector: '[appPermission]'
})
export class PermissionDirective implements OnInit {
  @Input() appFunction: string;
  @Input() appAction: string;

  constructor(private el: ElementRef, private authService: AuthService) {

  }
  ngOnInit() {
    const user = this.authService.getLoggedInUser();
    if (user) {
      if (typeof (user.roles) == 'string') {
        if (user.roles == 'Admin') {
          this.el.nativeElement.style.display = '';
          return;
        }
      }
      else {
        if (user.roles.findIndex(x => x == 'Admin') != -1) {
          this.el.nativeElement.style.display = '';
          return;
        }
      }
      const permiss: string[] = typeof(user.permissions) == "string"? JSON.parse(user.permissions): user.permissions;
      if (user.permissions && permiss.findIndex(x => x === this.appFunction + '_' + this.appAction) != -1) {
        this.el.nativeElement.style.display = '';
        return;
      } else {
        this.el.nativeElement.style.display = 'none';
      }
    } else {
      this.el.nativeElement.style.display = 'none';
    }
  }
}
