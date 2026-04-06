import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DebitNoteDetailComponent } from './debit-note-detail/debit-note-detail.component';
import { DebitNoteComponent } from './debit-note.component';

const routes: Routes = [
  { path: '', component: DebitNoteComponent },
  { path: 'detail', component: DebitNoteDetailComponent },
  { path: 'detail/:id', component: DebitNoteDetailComponent },
  { path: 'detail/:id/:flag', component: DebitNoteDetailComponent },
  { path: 'create/:type', component: DebitNoteDetailComponent },
  { path: 'create/:type/:shipmentId', component: DebitNoteDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DebitNoteRoutingModule { }
