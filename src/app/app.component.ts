import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { setTheme } from 'ngx-bootstrap/utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  private routerSub?: Subscription;

  constructor(private router: Router) {
    setTheme('bs3' as any);
  }

  ngOnInit(): void {
    // SAFETY NET: scrub stuck modal-backdrop / body.modal-open khi route change.
    // ngx-bootstrap modal nested (FCL v2 → AddExtra → Vietmap/Compare) có thể
    // leak DOM nếu host *ngIf destroy modal cha lúc con đang shown. Stuck
    // backdrop sống ở <body> Angular root → xuyên route → cả app "đơ phải F5".
    // Lớp này dọn an toàn: chỉ scrub khi không có modal nào shown thật sự.
    this.routerSub = this.router.events.subscribe(ev => {
      if (ev instanceof NavigationEnd) {
        setTimeout(() => {
          if (typeof document === 'undefined') return;
          const visible = document.querySelectorAll('.modal.in, .modal.show').length;
          if (visible === 0) {
            const backdrops = document.querySelectorAll('.modal-backdrop');
            if (backdrops.length > 0) {
              backdrops.forEach(el => el.remove());
            }
            if (document.body.classList.contains('modal-open')) {
              document.body.classList.remove('modal-open');
              document.body.style.removeProperty('padding-right');
              document.body.style.removeProperty('overflow');
            }
          }
        }, 50);
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }
}
