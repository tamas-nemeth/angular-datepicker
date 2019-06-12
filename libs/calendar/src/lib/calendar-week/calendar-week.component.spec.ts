import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import HungarianLocale from '@angular/common/locales/hu';
import { By } from '@angular/platform-browser';

import { CalendarWeekComponent } from './calendar-week.component';

describe('CalendarWeekComponent', () => {
  let component: CalendarWeekComponent;
  let fixture: ComponentFixture<CalendarWeekComponent>;

  describe('', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [CalendarWeekComponent]
      })
        .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(CalendarWeekComponent);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      fixture.detectChanges();

      expect(component).toBeTruthy();
    });

    it('should display the 7 days of the week', () => {
      const narrowDaysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

      fixture.detectChanges();

      expect(getDaysOfWeek()).toEqual(narrowDaysOfWeek);
    });

    it('should display the 7 days of the week with the proper attributes', () => {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      fixture.detectChanges();

      expect(getDayOfWeekTitles()).toEqual(daysOfWeek);
      expect(getDayOfWeekAriaLabels()).toEqual(daysOfWeek);
    });

    it('should display the 7 days of the week n Hungarian if locale is set to hu', () => {
      registerLocaleData(HungarianLocale);
      const daysOfWeek = ['V', 'H', 'K', 'Sz', 'Cs', 'P', 'Sz'];
      component.locale = 'hu';

      fixture.detectChanges();

      expect(getDaysOfWeek()).toEqual(daysOfWeek);
    });
  });

  describe('localisation', () => {
    let localeId = 'en-US';

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [CalendarWeekComponent],
        providers: [
          {provide: LOCALE_ID, useFactory: () => localeId}
        ]
      })
        .compileComponents();
    }));

    beforeEach(() => {
      registerLocaleData(HungarianLocale);
      localeId = 'hu';

      fixture = TestBed.createComponent(CalendarWeekComponent);
      component = fixture.componentInstance;
    });

    it('should display the 7 days of the week in Hungarian if locale is set to hu', () => {
      const daysOfWeek = ['V', 'H', 'K', 'Sz', 'Cs', 'P', 'Sz'];
      fixture.detectChanges();

      expect(getDaysOfWeek()).toEqual(daysOfWeek);
    });

    describe('locale', () => {
      it('should default to LOCALE_ID after init', () => {
        fixture.detectChanges();
        expect(component.locale).toBe('hu');
      });

      it('should default to LOCALE_ID when set back to default', () => {
        component.locale = 'en-GB';
        fixture.detectChanges();

        component.locale = undefined as string | undefined;

        expect(component.locale).toBe('hu');
      });
    });
  });

  function getDayOfWeekTitles() {
    return getDayOfWeekDebugElements()
      .map(dayOfWeekDebugElement => dayOfWeekDebugElement.properties.title);
  }

  function getDayOfWeekAriaLabels() {
    return getDayOfWeekDebugElements()
      .map(dayOfWeekDebugElement => dayOfWeekDebugElement.attributes['aria-label']);
  }

  function getDaysOfWeek() {
    return getDayOfWeekDebugElements()
      .map(dayOfWeekDebugElement => dayOfWeekDebugElement.nativeElement.textContent);
  }

  function getDayOfWeekDebugElements() {
    return fixture.debugElement.queryAll(By.css('.calendar-week__day'));
  }
});
