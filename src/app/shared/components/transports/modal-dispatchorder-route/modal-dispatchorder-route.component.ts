import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Profile, ResponseValue, Route } from '@app/shared/models';
import { Dispatchorderroutes } from '@app/shared/models/transports/dispatchorders/dispatchorderroutes';
import { AuthService, NotificationService } from '@app/shared/services';
import { RouteService } from '@app/shared/services/route.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'modal-dispatchorder-route',
  templateUrl: './modal-dispatchorder-route.component.html',
  styleUrls: ['./modal-dispatchorder-route.component.css']
})
export class ModalDispatchorderRouteComponent implements OnInit {
  public busy: Subscription;
  public flagOk: boolean = false;
  public listRoute: Route[] = [];
  public filteredItems: Route[] = [];
  public paginatedItems: Route[] = [];
  public selectedList: Route[] = [];
  public userLoged: Profile;
  public codeSearch: String = '';
  public nameSearch: String = '';
  public allChecked: boolean = false;

  // Pagination properties
  public currentPage: number = 1;
  public pageSize: number = 20;
  public pageSizeOptions: number[] = [20, 50, 100];
  public totalPages: number = 1;

  @Output() SaveSuccess: EventEmitter<any> = new EventEmitter();
  @Output() CloseModal: EventEmitter<any> = new EventEmitter;
  @ViewChild('modalRoute', { static: false }) modalRoute: ModalDirective;
  constructor(private _notificationService: NotificationService
    , private routeService: RouteService
    , private _authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userLoged = this._authService.getLoggedInUser();
    this.loadRoute();

  }

  assignCopy() {
    if (this.codeSearch.length < 1 && this.nameSearch.length < 1) {
      this.filteredItems = Object.assign([], this.listRoute);
    }
    this.updatePagination();
  }

  filterCode(value) {
    if (!value) {
      this.assignCopy();
    } // when nothing has typed
    this.filteredItems = Object.assign([], this.listRoute).filter(
      item => item.routeCode.toLowerCase().indexOf(value.toLowerCase()) > -1
    );
    this.currentPage = 1;
    this.updatePagination();
  }

  filterName(value) {
    if (!value) {
      this.assignCopy();
    } // when nothing has typed
    this.filteredItems = Object.assign([], this.listRoute).filter(
      item => item.routeName.toLowerCase().indexOf(value.toLowerCase()) > -1
    );
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredItems.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedItems = this.filteredItems.slice(startIndex, endIndex);
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.updatePagination();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredItems.length);
  }

  getVisiblePages(): number[] {
    const maxVisible = 6;
    const pages: number[] = [];

    if (this.totalPages <= maxVisible) {
      // If total pages <= 6, show all pages
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show 6 pages centered around current page
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      let end = start + maxVisible - 1;

      if (end > this.totalPages) {
        end = this.totalPages;
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  loadRoute() {
    const params = new HttpParams()
      .set('branchid', this.userLoged.branchId.toString())
    this.routeService.getAll(params).subscribe((res: ResponseValue<Route[]>) => {
      if (res.code == '200' || res.code == '201') {
        this.listRoute = res.data;
        this.assignCopy();
      } else {
        this.listRoute = [];
      }
    });
  }

  add() {
    // Reset all checked states and clear selected list when opening modal
    this.selectedList = [];
    this.allChecked = false;
    if (this.listRoute && this.listRoute.length > 0) {
      this.listRoute.forEach(route => route.checked = false);
    }
    if (this.filteredItems && this.filteredItems.length > 0) {
      this.filteredItems.forEach(route => route.checked = false);
    }
    this.currentPage = 1;
    this.updatePagination();
    this.flagOk = false;
    this.modalRoute.show();
  }
  clickRow(item: Route) {
    item.checked = !item.checked;
    this.icheck();
  }

  icheck() {
    // Rebuild selectedList from scratch to avoid duplicates
    this.selectedList = this.listRoute.filter(x => x.checked);
    this.flagOk = this.selectedList.length > 0;
    // Update allChecked state
    this.allChecked = this.listRoute.length > 0 && this.selectedList.length === this.listRoute.length;
  }

  toggleAll() {
    this.allChecked = !this.allChecked;
    if (this.listRoute && this.listRoute.length > 0) {
      this.listRoute.forEach(route => route.checked = this.allChecked);
    }
    if (this.filteredItems && this.filteredItems.length > 0) {
      this.filteredItems.forEach(route => route.checked = this.allChecked);
    }
    this.icheck();
  }

  saveChange() {
    if (this.selectedList.length > 0) {
      this.modalRoute.hide();
      this.SaveSuccess.emit(this.selectedList);
    }
  }
  OnHidden() {
    this.CloseModal.emit();
  }
}
