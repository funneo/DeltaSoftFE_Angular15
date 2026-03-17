import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './shared/interceptors/auth.interceptor';
import { NotificationService, UtilityService } from './shared/services';
import { AuthGuard } from './shared/guard/auth.guard';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ModalGetDbsShipmentComponent } from './shared/components/dbs/modal-get-dbs-shipment/modal-get-dbs-shipment.component';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from '@environments/environment';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    AppComponent,
    ModalGetDbsShipmentComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireMessagingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgChartsModule.forRoot()
  ],
  providers: [
    NotificationService,
    AuthGuard,
    NgxSpinnerModule,
    UtilityService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
