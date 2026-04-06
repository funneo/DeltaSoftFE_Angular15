import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalChucNangComponent } from '@app/shared/components/systems/modal-chuc-nang/modal-chuc-nang.component';
import { MessageContstants } from '@app/shared/constants';
import { Pagination, Functions } from '@app/shared/models';
import { FunctionService, NotificationService, UtilityService } from '@app/shared/services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chucnang',
  templateUrl: './chucnang.component.html',
  styleUrls: ['./chucnang.component.css']
})

export class ChucnangComponent implements OnInit {
  pageIndex = 1;
  pageSize = 2000;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listChucNangs: Functions[];
  busy: Subscription;
  viewModal = false;
  public maskNumber = UtilityService.maskNumber;

  @ViewChild(ModalChucNangComponent) public modalAddEdit: ModalChucNangComponent;
  constructor(private functionService: FunctionService, private notificationService: NotificationService, private _utilityService: UtilityService) { }

  ngOnInit(): void {
    this.loadChucNang();
  }

  loadChucNang(refresh: boolean = false): void {
    const params = new HttpParams()
      .set('pageIndex', this.pageIndex.toString())
      .set('pageSize', this.pageSize.toString())
      .set('keyword', this.keyword);
    this.busy = this.functionService.getAllPaging(params).subscribe((res: Pagination<Functions>) => {
      this.flagEdit = false;
      this.flagDelete = false;
      // this.listChucNangs = res.items;
      this.listChucNangs = this.BuildTree(res.items);
      this.totalRows = res.totalRows;
    });
  }

  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add();
    }, 50);
  }

  edit(flag: boolean): void {
    const index = this.listChucNangs.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listChucNangs[index].id, flag);
    }, 50);
  }

  deleteConfirm(): void {
    const listId = this.listChucNangs.filter(x => x.checked).map(x => x.id).join(",");
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(listId));
  }

  delete(listId: string): void {
    this.functionService.delete(listId).subscribe(() => {
      this.loadChucNang(true);
    });
  }

  clickRow(item: Functions): void {
    this.listChucNangs.forEach(x => x.checked = false)
    item.checked = true;
    this.icheck();
  }

  timKiem(): void {
    this.loadChucNang();
  }

  checkAll(ev) {
    // this.listChucNangs.forEach(x => x.checked = ev.target.checked)
    // this.icheck();
  }

  isAllChecked() {
    if (this.listChucNangs)
      return this.listChucNangs.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listChucNangs.filter(x => x.checked);
    if (checks.length == 1) {
      this.flagDelete = true;
      this.flagEdit = true;
    }
    else if (checks.length > 1) {
      this.flagDelete = true;
      this.flagEdit = false;
    }
    else {
      this.flagDelete = false;
      this.flagEdit = false;
    }
  }

  saveSuccess(): void {
    this.loadChucNang(true);
  }

  closeModal(): void {
    this.viewModal = false;
  }

  ngOnDestroy(): void {
    this.busy.unsubscribe();
  }

  BuildTree = (arr: any[]): any[] => {
    let roots: any[] = [];
    let parent = arr.filter(x => x.parentId == null).sort((a, b) => a.sortOrder - b.sortOrder);
    for (var i = 0; i < parent.length; i++) {
      parent[i].expanded = true;
      parent[i].level = 0;
      roots.push(parent[i]);
      this.Tree(arr, parent[i], parent[i].level, roots);
    }
    return roots;
  }
  Tree(arr: any[], list: any, level: number, roots: any[]) {
    let childs = arr.filter(x => x.parentId == list.id).sort((a, b) => a.sortOrder - b.sortOrder);
    if (childs.length > 0) {
      list.isChildren = true;
      list.parentExpanded = true;
      for (var i = 0; i < childs.length; i++) {
        childs[i].expanded = true;
        childs[i].level = level + 25;
        roots.push(childs[i]);
        this.Tree(arr, childs[i], childs[i].level, roots);
      }
    }
  }
  expanded(event, item: Functions) {
    debugger;
    event.stopPropagation();
    item.parentExpanded = !item.parentExpanded;
    this.expandedBotton(this.listChucNangs, item.id, !item.parentExpanded)
  }

  expandedBotton(arr: Functions[], id: string, expanded: boolean) {
    let childs = arr.filter(x => x.parentId == id);
    for (let child of childs) {
      child.expanded = !expanded;
      child.parentExpanded = true;
      this.expandedBotton(arr, child.id, expanded);
    }
    // console.log(childs);
  }
}
