import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeHu from '@angular/common/locales/hu';
import { ReactiveFormsModule } from '@angular/forms';

import { CalendarModule } from 'calendar';
import { ModalModule } from 'modal';

import { AppComponent } from './app.component';

registerLocaleData(localeHu);

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    CalendarModule,
    ModalModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
