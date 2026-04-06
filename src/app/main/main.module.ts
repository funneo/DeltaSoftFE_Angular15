import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { HeaderComponent } from '@app/shared/components/header/header.component';
import { LeftComponent } from '@app/shared/components/left/left.component';
import { FooterComponent } from '@app/shared/components/footer/footer.component';


@NgModule({
  declarations: [MainComponent, HeaderComponent, LeftComponent, FooterComponent,],
  imports: [
    CommonModule,
    MainRoutingModule,
    ModalModule.forRoot(),
    FormsModule
  ]
})
export class MainModule { }
