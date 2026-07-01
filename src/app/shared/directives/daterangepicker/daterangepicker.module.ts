import { NgModule } from '@angular/core';
import { DaterangepickerDirective } from './daterangepicker.directive';

/**
 * Module thay thế cho `Daterangepicker` của ng2-daterangepicker.
 * Cách dùng: ở feature module, đổi
 *    import { Daterangepicker } from 'ng2-daterangepicker';  ... imports: [Daterangepicker]
 * thành
 *    import { AppDaterangepickerModule } from '@app/shared/directives/daterangepicker/daterangepicker.module';
 *    ... imports: [AppDaterangepickerModule]
 * Template KHÔNG đổi (cùng selector [daterangepicker]).
 */
@NgModule({
  declarations: [DaterangepickerDirective],
  exports: [DaterangepickerDirective],
})
export class AppDaterangepickerModule {}
