import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LockingDebitNoteComponent } from './locking-debit-note.component';

const routes: Routes = [{
  path:'',component:LockingDebitNoteComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LockingDebitNoteRoutingModule { }
