import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { formatDate, registerLocaleData } from '@angular/common';
import HungarianLocale from '@angular/common/locales/hu';
import BritishLocale from '@angular/common/locales/en-GB';
import { By } from '@angular/platform-browser';

import { Month } from 'date-utils';

import { CalendarMonthHeaderComponent } from './calendar-month-header.component';

type MonthStep = 'previous' | 'next';

describe('CalendarMonthHeaderComponent', () => {
  const localeMonthCaptionPatterns = {
    'en-US': 'MMMM y',
    'en-GB': 'MMMM y',
    hu: 'y. MMMM',
  };
  let component: CalendarMonthHeaderComponent;
  let fixture: ComponentFixture<CalendarMonthHeaderComponent>;
  let mockDate: Date;

  beforeAll(() => {
    registerLocaleData(HungarianLocale);
    registerLocaleData(BritishLocale);

    mockDate = new Date(2019, Month.June);
    jasmine.clock().mockDate(mockDate);
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CalendarMonthHeaderComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarMonthHeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display the name of the current year and month by default', () => {
    fixture.detectChanges();

    expect(getCaption()).toEqual(formatMonth(mockDate, 'en-US'));
  });

  it('should display the year and the name of the month received via input', () => {
    const month = new Date(2019, Month.February);
	component.month = month;

    fixture.detectChanges();

    expect(getCaption()).toEqual(formatMonth(month, 'en-US'));
  });

  describe('month steppers', () => {
    it('should be visible if showMonthStepper is true', () => {
      component.showMonthStepper = true;

      fixture.detectChanges();

      expect(getMonthStepperButtons()).toBeTruthy();
    });

    it('should be hidden if showMonthStepper is false', () => {
      component.showMonthStepper = false;

      fixture.detectChanges();

      expect(getMonthStepperButtons()).toBeFalsy();
    });

    it('should emit monthStep on next month click', () => {
      component.showMonthStepper = true;
      spyOn(component.monthStep, 'emit');
      fixture.detectChanges();

      stepMonth('next');

      expect(component.monthStep.emit).toHaveBeenCalledWith(1);
    });

    it('should emit monthStep on previous month click', () => {
      component.showMonthStepper = true;
      spyOn(component.monthStep, 'emit');
      fixture.detectChanges();

      stepMonth('previous');

      expect(component.monthStep.emit).toHaveBeenCalledWith(-1);
    });
  });

  describe('localisation', () => {
    describe('locale', () => {
      it('should default to LOCALE_ID after init', () => {
        fixture.detectChanges();
        expect(component.locale).toBe('en-US');
      });

      it('should default to LOCALE_ID when set back to default', () => {
        component.locale = 'en-GB';
        fixture.detectChanges();

        component.locale = undefined as string | undefined;

        expect(component.locale).toBe('en-US');
      });

      it('should be settable before init', () => {
        component.locale = 'en-GB';
        fixture.detectChanges();

        expect(component.locale).toBe('en-GB');
      });

      it('should be settable after init', () => {
        fixture.detectChanges();
        component.locale = 'en-GB';

        expect(component.locale).toBe('en-GB');
      });

      it('should be re-settable after init', () => {
        component.locale = 'en-GB';
        fixture.detectChanges();

        component.locale = 'hu';

		triggerOnPushChangeDetection();
		fixture.detectChanges();
        expect(component.locale).toBe('hu');
		expect(getCaption()).toBe(formatMonth(mockDate, 'hu'));
      });
    });

    describe('monthAndYearFormat', () => {
	  it('should default to long date format without days when set to undefined', () => {
        component.monthAndYearFormat = 'MMM y';
        fixture.detectChanges();

        component.monthAndYearFormat = undefined as string | undefined;

        triggerOnPushChangeDetection();
        fixture.detectChanges();
        expect(getCaption()).toEqual(formatMonth(mockDate, 'en-US'));
      }); 
	});
  });

  afterAll(() => {
    jasmine.clock().uninstall();
  });

  function triggerOnPushChangeDetection() {
    stepMonth('next');
  }

  function formatMonth(date: Date, locale: keyof typeof localeMonthCaptionPatterns) {
    return formatDate(date, localeMonthCaptionPatterns[locale], locale);
  }

  function getCaption() {
    return fixture.debugElement.query(By.css('.calendar-month-header__caption')).nativeElement.textContent;
  }

  function stepMonth(monthStep: MonthStep) {
    return getMonthStepperButton(monthStep).triggerEventHandler('click', null);
  }

  function getMonthStepperButton(monthStep: MonthStep) {
    return fixture.debugElement.query(By.css(`.calendar-month-header__stepper--${monthStep}`));
  }

  function getMonthStepperButtons() {
    return fixture.debugElement.query(By.css('.calendar-month-header__stepper'));
  }
});
