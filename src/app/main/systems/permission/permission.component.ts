import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MessageContstants } from '@app/shared/constants';
import { Functions, Role, Action, Permissions, ActionFunction } from '@app/shared/models';
import { NotificationService, PermissionService, RolesService } from '@app/shared/services';
import { combineLatest, forkJoin, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.css']
})
export class PermissionComponent implements OnInit {

  listRoles: Role[];
  roleId: string;
  listFunctions: Functions[];
  functions: Functions[];
  busy: Subscription;
  constructor(private rolesService: RolesService, private permissionService: PermissionService, private _notificationService: NotificationService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.busy = this.rolesService.getAll().pipe(switchMap((roles: Role[]) => {
      this.listRoles = roles;
      if (roles.length == 0) {
        return combineLatest([this.permissionService.getFunctionAction(), of([])])
      }
      this.roleId = roles[0].id;
      return combineLatest([this.permissionService.getFunctionAction(), this.permissionService.getPermissionByRole(roles[0].id)])
    })).subscribe(([funcs, permissions]: [Functions[], Permissions[]]) => {
      funcs.forEach(item => {
        const pers = permissions.filter(x => x.functionId == item.id);
        item.actions.forEach(ac => {
          ac.checked = pers.findIndex(x => x.actionId == ac.id) != -1;
        });
        item.checked = (item.actions.length == item.actions.filter(x => x.checked).length && item.actions.length > 0);
        if(item.children != null){
          item.children.forEach(child => {
            const persChild = permissions.filter(x => x.functionId == item.id);
            child.actions.forEach(ac => {
              ac.checked = persChild.findIndex(x => x.actionId == ac.id) != -1;
            });
            child.checked = (child.actions.length == child.actions.filter(x => x.checked).length && child.actions.length > 0);
          });
        }
      });
      this.functions = funcs;
      this.listFunctions = this.permissionService.buildTree(funcs);

    });
  }

  onChangeRole(role: Role): void {
    this.busy = this.permissionService.getPermissionByRole(role.id).subscribe((permissions: Permissions[]) => {
      this.functions.forEach(item => {
        const pers = permissions.filter(x => x.functionId == item.id);
        item.actions.forEach(ac => {
          ac.checked = pers.findIndex(x => x.actionId == ac.id) != -1;
        });
        item.checked = (item.actions.length == item.actions.filter(x => x.checked).length && item.actions.length > 0);
      });
    });
  }

  clickFunction(func: Functions): void {
    func.checked = !func.checked;
    func.children.forEach(item => {
      item.checked = func.checked;
      item.actions.forEach(ac => {
        ac.checked = func.checked;
      })
    })
    func.actions.forEach(item => {
      item.checked = func.checked;
    });
  }

  clickAction(action: Action): void {
    action.checked = !action.checked;
  }

  saveData(): void {
    let listActionFunctions: ActionFunction[] = [];
    this.functions.forEach(item => {
      item.children.forEach(child => {
        child.actions.forEach(ac => {
          if (ac.checked) {
            if(listActionFunctions.findIndex(x=>x.actionId == ac.id && x.functionId == child.id) == -1){
              listActionFunctions.push({
                functionId: child.id,
                actionId: ac.id
              });
            }
          }
        })
      })
      item.actions.forEach(ac => {
        if (ac.checked && listActionFunctions.findIndex(x=>x.actionId == ac.id && x.functionId == item.id) == -1) {
          listActionFunctions.push({
            functionId: item.id,
            actionId: ac.id
          });
        }
      });
    });
    this.busy = this.permissionService.updatePermission(this.roleId, listActionFunctions).subscribe(() => {
      this._notificationService.printSuccessMessage(MessageContstants.UPDATED_OK_MSG);
    });
  }

}
