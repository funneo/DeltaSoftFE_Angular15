import { Component, OnInit } from '@angular/core';
import { Functions } from '@app/shared/models';
import { PermissionService } from '@app/shared/services';

@Component({
  selector: 'app-left',
  templateUrl: './left.component.html',
  styleUrls: ['./left.component.css']
})
export class LeftComponent implements OnInit {

  public functions: any[];
  arrowIcon: boolean = false;
  constructor(private permissionService: PermissionService) { }
  ngOnInit() {
    this.loadMenu();
  }

  private loadMenu() {
    this.permissionService.getFunctions().subscribe((res: Functions[]) => {
      this.functions = res;
    });
  }
}
