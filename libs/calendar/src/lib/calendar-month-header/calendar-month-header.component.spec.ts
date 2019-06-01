import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Month } from 'date-utils';

import { CalendarMonthHeaderComponent } from './calendar-month-header.component';

type MonthStep = 'previous' | 'next';

describe('CalendarMonthHeaderComponent', () => {
  let component: CalendarMonthHeaderComponent;
  let fixture: ComponentFixture<CalendarMonthHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendarMonthHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarMonthHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the year and the name of the month received via input', () => {
    component.month = new Date(2019, Month.February);

    fixture.detectChanges();

    expect(getCaption()).toEqual('February, 2019');
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
      it('should default to LOCALE_ID before init', () => {
        fixture.detectChanges();
        expect(component.locale).toBe('en-US');
      });

      it('should default to LOCALE_ID after init', () => {
        expect(component.locale).toBe('en-US');
      });

      describe('monthCaptionPattern', () => {
        it('should default to long date format without days', () => {
          fixture.detectChanges();

          expect(component.monthCaptionPattern).toEqual('MMMM, y');
        });
      });
    });
  });

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
