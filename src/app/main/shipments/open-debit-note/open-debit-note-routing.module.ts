import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OpenDebitNoteComponent } from './open-debit-note.component';

const routes: Routes = [
  { path: '', component: OpenDebitNoteComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OpenDebitNoteRoutingModule { }
