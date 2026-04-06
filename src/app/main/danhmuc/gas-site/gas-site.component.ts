import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalGasSiteComponent } from '@app/shared/components/danhmuc/modal-gas-site/modal-gas-site.component';
import { MessageContstants } from '@app/shared/constants';
import { ResponseValue } from '@app/shared/models';
import { GasSite } from '@app/shared/models/gas-site.model';
import { NotificationService } from '@app/shared/services';
import { GasSiteService } from '@app/shared/services/gas-site.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'gas-site',
  templateUrl: './gas-site.component.html',
  styleUrls: ['./gas-site.component.css']
})
export class GasSiteComponent implements OnInit {
  pageIndex = 1;
  pageSize = 20;
  totalRows = 0;
  flagEdit = false;
  flagDelete = false;
  keyword = '';
  listGasSite: GasSite[];
  busy: Subscription;
  viewModal = false;
  @ViewChild(ModalGasSiteComponent, { static: false }) modalAddEdit: ModalGasSiteComponent
  

  constructor(private gasSiteServices:GasSiteService, private notificationService: NotificationService) { }

  ngOnInit(): void {
this.loadData();
  }
  loadData(): void {
      this.busy = this.gasSiteServices.getAll(0).subscribe((res: ResponseValue<GasSite[]>) => {
        console.log(res);
        if (res.code == '200' || res.code == '201') {
          this.listGasSite = res.data
          this.totalRows = res.data?.length;
        }
        else {
          if(res.code == '204')
          {
            this.listGasSite=[];
            this.totalRows = 0;
          }
          else
            this.notificationService.printErrorMessage(MessageContstants.GETDATA_ERR_MSG + '\n' + res.code)
        }
      });
  }
  
  clickRow(item: GasSite): void {
    item.checked = !item.checked;
    this.icheck();
  }

  timKiem(): void {
    this.pageIndex = 1;
    this.loadData();
  }


  add(): void {
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.add();
    }, 50);
  }

  edit(flag: boolean): void {
    const index = this.listGasSite.findIndex(x => x.checked);
    this.viewModal = true;
    setTimeout(() => {
      this.modalAddEdit.edit(this.listGasSite[index].id, flag);
    }, 50);
  }

  deleteConfirm(): void {
    let listChecks = this.listGasSite.filter(x => x.checked);
    let checks: number[] = [];
    for (let items of listChecks) {
      checks.push(items.id)
    }
    this.notificationService.printConfirmationDialog(MessageContstants.CONFIRM_DELETE_MSG, () => this.delete(checks.join(',')));
  }

  delete(listIds: string): void {
    this.gasSiteServices.delete(listIds).subscribe((res: ResponseValue<any>) => {
      if (res.code == '200' || res.code == '201') {
        this.loadData();
      }
      else {
        this.notificationService.printErrorMessage(MessageContstants.DELETE_ERR_MSG + '\n' + res.code)
      }
    });
  }


  checkAll(ev) {
    this.listGasSite.forEach(x => x.checked = ev.target.checked)
    this.icheck();
  }

  isAllChecked() {
    if (this.listGasSite)
      return this.listGasSite.every(_ => _.checked);
  }

  icheck() {
    let checks = this.listGasSite.filter(x => x.checked);
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
    this.loadData();
  }

  closeModal(): void {
    this.viewModal = false;
  }

}
