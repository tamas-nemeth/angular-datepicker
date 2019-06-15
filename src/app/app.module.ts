import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import HungarianLocale from '@angular/common/locales/hu';
import BritishLocale from '@angular/common/locales/en-GB';
import SpanishLocale from '@angular/common/locales/es';
import { ReactiveFormsModule } from '@angular/forms';

import { CalendarModule } from 'calendar';
import { ModalModule } from 'modal';

import { AppComponent } from './app.component';

registerLocaleData(HungarianLocale);
registerLocaleData(BritishLocale);
registerLocaleData(SpanishLocale);

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
