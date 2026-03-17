import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageContstants } from '@app/shared/constants';
import { Branch, Employee, Handlinggroup, ResponseValue, Role, User, UserHandlingGroup, UserRole } from '@app/shared/models';
import { BranchService, EmployeeService, HandlinggroupService, NotificationService, RolesService, UserService } from '@app/shared/services';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { forkJoin, Subscription } from 'rxjs';

@Component({
  selector: 'app-modal-user',
  templateUrl: './modal-user.component.html',
  styleUrls: ['./modal-user.component.css']
})
export class ModalUserComponent implements OnInit {

  entity: User;
  flagXem: boolean = false;
  flagSave: boolean = false;
  busy: Subscription;
  listRoles: Role[];
  listEmployees: any[] = [];
  listUserRoles: UserRole[];
  listBranchs: Branch[];
  listHandlinggroup: Handlinggroup[];
  listUserHandlingGroup: UserHandlingGroup[];

  @Output() SaveSuccess = new EventEmitter<User>();
  @Output() CloseModal = new EventEmitter<User>();
  @ViewChild('modalAddEdit', { static: false }) modalAddEdit: ModalDirective;
  constructor(private _notificationService: NotificationService, private userService: UserService, private roleService: RolesService,
    private employeeService: EmployeeService, private branchService: BranchService, private handlinggroupService: HandlinggroupService) { }

  ngOnInit() {
    this.loadRole();
    // this.loadHandlinggroup();
  }

  add() {
    this.loadEmployee();
    this.entity = {
      status: true,isExternal:false,
      userRoles: []
    };

    this.busy = this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listUserRoles = [];
      let i = 0;
      this.listBranchs = res.data;
      this.listBranchs.forEach(x => {
        i++;
        let item: UserRole = {
          id: i,
          branchId: x.id,
          checked: false,
          authorisationLevel: 5,
          advanceConfirmLevel: 0,
          paymentConfirmLevel: 0,
          transportConfirmLevel:0,
        };
        this.listUserRoles.push(item);
      });

      this.handlinggroupService.getAll().subscribe((res: ResponseValue<Handlinggroup[]>) => {
        let i = 0;
        this.listHandlinggroup = res.data;
        this.listUserHandlingGroup = [];
        this.listHandlinggroup.forEach(x => {
          i++;
          //let index = this.entity?.userHandlingGroups?.findIndex(z => z.handlingGroupId == x.id)
          let item: UserHandlingGroup = {
            id: i,
            handlingGroupId: x.id,
            checked: false,
            isLeader: false,
            isManager: false,

          };
          this.listUserHandlingGroup.push(item);
        });
      });

      this.flagXem = false;
      this.flagSave = false;
      this.modalAddEdit.show();
    });

  }

  edit(id: string, flag: boolean) {
    this.busy = this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listUserRoles = [];
      let i = 0;
      this.listBranchs = res.data;
      this.busy = this.userService.getDetail(id)
        .subscribe((user: User) => {
          this.entity = user;
          this.loadEmployee();
          this.listBranchs.forEach(x => {
            i++;
            let index = user.userRoles.findIndex(z => z.branchId == x.id)
            let item: UserRole = {
              id: i,
              branchId: x.id,
              checked: index > -1 ? true : false,
              authorisationLevel: index > -1 ? user.userRoles[index].authorisationLevel : 5,
              advanceConfirmLevel: index > -1 ? user.userRoles[index].advanceConfirmLevel : 0,
              paymentConfirmLevel: index > -1 ? user.userRoles[index].paymentConfirmLevel : 0,
              transportConfirmLevel: index > -1 ? user.userRoles[index].transportConfirmLevel : 0,
              roleId: index > -1 ? user.userRoles[index].roleId : null,
            };
            this.listUserRoles.push(item);
          });

          this.busy = this.handlinggroupService.getAll().subscribe((res: ResponseValue<Handlinggroup[]>) => {
            let i = 0;
            this.listHandlinggroup = res.data;
            this.listUserHandlingGroup = [];
            this.listHandlinggroup.forEach(x => {
              i++;
              let index = this.entity?.userHandlingGroups?.findIndex(z => z.handlingGroupId == x.id)
              let item: UserHandlingGroup = {
                id: i,
                handlingGroupId: x.id,
                checked: index > -1 ? true : false,
                isLeader: index > -1 ? this.entity.userHandlingGroups[index].isLeader : false,
                isManager: index > -1 ? this.entity.userHandlingGroups[index].isManager : false,

              };
              this.listUserHandlingGroup.push(item);
            });
          });
        });
      // this.listUserHandlingGroup?.sort(function (x, y) {
      //   // true values first
      //   return (x.checked === y.checked) ? 0 : x.checked ? -1 : 1;
      //   // false values first
      //   // return (x === y)? 0 : x? 1 : -1;
      // });
      // this.listUserHandlingGroup = [...this.listUserHandlingGroup?.sort((a, b) => Number(a.checked) - Number(b.checked))];
      this.flagValid = true;
      this.flagXem = flag;
      this.flagSave = false;
      this.modalAddEdit.show();
    });
  }

  loadRole(): void {
    this.busy = this.roleService.getAll().subscribe((res: Role[]) => {
      this.listRoles = res;
    });
  }

  loadEmployee(): void {
    this.busy = this.userService.getEmployee(this.entity?.userName).subscribe((res: Employee[]) => {
      this.listEmployees = res;
    });
  }

  loadBranch(): void {
    this.busy = this.branchService.getAll().subscribe((res: ResponseValue<Branch[]>) => {
      this.listBranchs = res.data;
    });
  }

  loadHandlinggroup(): void {
    this.busy = this.handlinggroupService.getAll().subscribe((res: ResponseValue<Handlinggroup[]>) => {
      this.listHandlinggroup = res.data;
    });
  }

  saveChange(form: NgForm) {
    if (form.valid) {
      this.flagSave = true;
      this.entity.userRoles = this.listUserRoles.filter(x => x.roleId && x.checked);
      this.entity.userHandlingGroups = this.listUserHandlingGroup.filter(x => x.handlingGroupId && x.checked)
      if (this.entity.id == undefined) {
        this.userService.add(this.entity).subscribe((res: User) => {
          this.modalAddEdit.hide();
          form.resetForm();
          this._notificationService.printSuccessMessage(MessageContstants.CREATED_OK_MSG);
          this.SaveSuccess.emit(res);
        }, (err) => {
          this._notificationService.printErrorMessage(err);
          this.flagSave = false;
        });
      }
      else {
        this.userService.update(this.entity).subscribe((res: User) => {
          this.modalAddEdit.hide();
          form.resetForm();
          this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
          this.SaveSuccess.emit(res);
        }, (err) => {
          this._notificationService.printErrorMessage(err);
          this.flagSave = false;
        });
      }
    }
  }

  OnHidden() {
    this.CloseModal.emit();
  }

  flagValid = false;
  clickRow(item: UserRole) {
    item.checked = !item.checked;
    let index = this.listUserRoles.findIndex((x) => x == item);
    if (index == -1) return;
    this.listUserRoles[index].checked = item.checked;
    if (!item.checked)
      this.listUserRoles[index].roleId = null;
    if (this.listUserRoles.findIndex(_ => _.checked) == -1) {
      this.flagValid = false;
      return;
    }
    for (const x of this.listUserRoles) {
      this.flagValid = true;
      if (x.checked && !x.roleId) {
        this.flagValid = false;
        return;
      }
    };
  }

  changedRole(): void {
    for (const x of this.listUserRoles) {
      this.flagValid = true;
      if (x.checked && !x.roleId) {
        this.flagValid = false;
        return;
      }
    };
  }

  clickRow2(item: UserHandlingGroup) {
    item.checked = !item.checked;
    let index = this.listUserHandlingGroup.findIndex((x) => x == item);
    if (index == -1) return;
    this.listUserHandlingGroup[index].checked = item.checked;
  }

  clickRow3(item: UserHandlingGroup) {
    item.isLeader = !item.isLeader;
    let index = this.listUserHandlingGroup.findIndex((x) => x == item);
    if (index == -1) return;
    this.listUserHandlingGroup[index].isLeader = item.isLeader;
    if (item.isLeader)
      this.listUserHandlingGroup[index].checked = true;
  }

  clickRow4(item: UserHandlingGroup) {
    item.isManager = !item.isManager;
    let index = this.listUserHandlingGroup.findIndex((x) => x == item);
    if (index == -1) return;
    this.listUserHandlingGroup[index].isManager = item.isManager;
    if (item.isManager)
      this.listUserHandlingGroup[index].checked = true;
  }

  onSelect(event: any, tab: number) {
    console.log('Ok');
    if (event.active) {
      if (tab == 2) {
        alert('Ok');
      }
    }
    //this.tabIndex = tab;
  }
}
