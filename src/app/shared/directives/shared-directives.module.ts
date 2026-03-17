import { NgModule } from '@angular/core';
import { PermissionDirective } from './permission.directive';
import { BlockCopyPasteDirective } from './block-copy-paste.directive';

@NgModule({
    imports: [],
    declarations: [PermissionDirective, BlockCopyPasteDirective],
    exports: [PermissionDirective]
})
export class SharedDirectivesModule {

}