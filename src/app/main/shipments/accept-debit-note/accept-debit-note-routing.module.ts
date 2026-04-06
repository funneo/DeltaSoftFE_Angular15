import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AcceptDebitNoteComponent } from './accept-debit-note.component';

const routes: Routes = [{
  path:'',component:AcceptDebitNoteComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcceptDebitNoteRoutingModule { }
