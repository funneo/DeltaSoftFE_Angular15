import { NgModule } from '@angular/core';
import { Accept } from './accept.pipe';
import { FileName } from './file.pipe';
import { List } from './list.pipe';
import { Status } from './status.pipe';
import { VNDFormat } from './vnd.pipe';
import { FinishStatusPipe } from './finish-status.pipe';
@NgModule({
  imports: [
  ],
  declarations: [FileName,Status,VNDFormat,Accept,List, FinishStatusPipe],
  exports: [FileName,Status,VNDFormat,Accept,List,FinishStatusPipe],
})
export class PipeSharedModule { }
