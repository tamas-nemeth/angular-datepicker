import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { MockComponent } from 'ng-mocks';

import { addMonths, Month, startOfMonth } from 'date-utils';

import { CalendarComponent } from './calendar.component';
import { CalendarWeekComponent } from './calendar-week/calendar-week.component';
import { CalendarMonthComponent } from './calendar-month/calendar-month.component';

const defaultDate = new Date(2019, Month.February, 10);

@Component({
  template: `
    <lib-calendar [min]="min"
                  [locale]="locale"
                  [monthCaptionPattern]="monthCaptionPattern"
                  [firstDayOfWeek]="firstDayOfWeek"
                  [formControl]="dateControl"
    ></lib-calendar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class CalendarWrapperComponent {
  min?: Date;
  locale?: string;
  monthCaptionPattern?: string;
  firstDayOfWeek?: 'MONDAY' | 'SUNDAY';
  @ViewChild(CalendarComponent) calendarComponent!: CalendarComponent;
  dateControl = new FormControl(defaultDate);
}

describe('CalendarComponent', () => {
  const valentinesDay = new Date(2019, Month.February, 14);
  const piDay = new Date(2019, Month.March, 14);
  let mockDate: Date;
  let monthOfMockDate: Date;

  beforeAll(() => {
    mockDate = valentinesDay;
    monthOfMockDate = startOfMonth(mockDate);
    jasmine.clock().mockDate(mockDate);
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule
      ],
      declarations: [
        CalendarWrapperComponent,
        CalendarComponent,
        MockComponent(CalendarWeekComponent),
        MockComponent(CalendarMonthComponent)
      ]
    })
      .compileComponents();
  }));

  describe('', () => {
    let component: CalendarComponent;
    let fixture: ComponentFixture<CalendarComponent>;

    beforeEach(() => {
      fixture = TestBed.createComponent(CalendarComponent);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should set value on monthcomponent select event', () => {
      fixture.detectChanges();

      selectDate(valentinesDay);
      fixture.detectChanges();

      // toBe() is used intentionally for checking reference equality
      expect(component.value).toBe(valentinesDay);
    });

    it('should emit a change on monthcomponent select event', () => {
      fixture.detectChanges();
      spyOn(component.change, 'emit');

      selectDate(valentinesDay);
      fixture.detectChanges();

      expect(component.change.emit).toHaveBeenCalledWith(valentinesDay);
    });

    it('should bind value input of monthcomponent to value', () => {
      fixture.detectChanges();

      selectDate(valentinesDay);
      fixture.detectChanges();

      // toBe() is used intentionally for checking reference equality
      expect(getMonthComponentDebugElement().componentInstance.selectedDate).toBe(component.value);
    });

    it('should have a class with the first day of week', () => {
      component.firstDayOfWeek = 'SUNDAY';

      fixture.detectChanges();

      expect(getCalendarDebugElement().classes['calendar--first-day-of-week-sunday']).toBe(true);
    });

    it('should add --disabled class when control is disabled', () => {
      component.disabled = true;
      fixture.detectChanges();

      expect(getCalendarDebugElement().classes['calendar--disabled']).toBe(true);
    });

    it('should not have --disabled class by default', () => {
      fixture.detectChanges();

      expect(getCalendarDebugElement().classes['calendar--disabled']).toBe(false);
    });

    it('should display one month component by default', () => {
      // component.numberOfMonths = undefined;
      component.firstMonth = new Date(2019, Month.February);

      fixture.detectChanges();

      expect(component.numberOfMonths).toBe(1);
      expect(getMonths()).toEqual([
        new Date(2019, Month.February),
      ]);
    });

    it('should display the first month in one-month view', () => {
      component.numberOfMonths = 1;
      component.firstMonth = new Date(2019, Month.February);
      fixture.detectChanges();

      expect(getMonths()).toEqual([new Date(2019, Month.February)]);
    });

    it('should display the current month in one-month view if firstMonth is not specified', () => {
      component.numberOfMonths = 1;
      // component.firstMonth = undefined;
      fixture.detectChanges();

      expect(getMonths()).toEqual([monthOfMockDate]);
    });

    it('should display as many month components as numberOfMonths', () => {
      component.firstMonth = new Date(2019, Month.February);
      component.numberOfMonths = 3;
      fixture.detectChanges();

      expect(getMonths()).toEqual([
        new Date(2019, Month.February),
        new Date(2019, Month.March),
        new Date(2019, Month.April),
      ]);
    });

    describe('month step', () => {
      it('should display next month', () => {
        component.numberOfMonths = 1;
        component.firstMonth = new Date(2019, Month.February);
        fixture.detectChanges();

        stepMonth(1);
        fixture.detectChanges();

        expect(getMonths()).toEqual([new Date(2019, Month.March)]);
      });

      it('should display month after current one if firstMonth is not specified', () => {
        component.numberOfMonths = 1;
        // component.firstMonth = undefined;
        fixture.detectChanges();

        stepMonth(1);
        fixture.detectChanges();

        expect(getMonths()).toEqual([addMonths(monthOfMockDate, 1)]);
      });

      it('should jump to the month of the selected date when switching back to one-month view', () => {
        component.numberOfMonths = 12;
        component.firstMonth = new Date(2019, Month.February);
        fixture.detectChanges();

        selectDate(piDay);
        component.numberOfMonths = 1;
        component.ngOnChanges({
          numberOfMonths: {
            firstChange: false,
            previousValue: 12,
            currentValue: component.numberOfMonths,
            isFirstChange() { return this.firstChange; }
          }
        });
        fixture.detectChanges();

        expect(getMonths()).toEqual([startOfMonth(piDay)]);

        stepMonth(1);
        fixture.detectChanges();

        expect(getMonths()).toEqual([new Date(2019, Month.April)]);

        stepMonth(1);
        fixture.detectChanges();

        expect(getMonths()).toEqual([new Date(2019, Month.May)]);
      });

      it('should start with the first month when changing to multi-month view, even after stepping', () => {
        component.numberOfMonths = 1;
        component.firstMonth = new Date(2019, Month.February);
        fixture.detectChanges();

        stepMonth(1);
        fixture.detectChanges();

        expect(getMonths()).toEqual([new Date(2019, Month.March)]);

        stepMonth(1);
        fixture.detectChanges();

        expect(getMonths()).toEqual([new Date(2019, Month.April)]);

        component.numberOfMonths = 3;
        component.ngOnChanges({
          numberOfMonths: {
            firstChange: false,
            previousValue: 1,
            currentValue: component.numberOfMonths,
            isFirstChange() { return this.firstChange; }
          }
        });
        // just trigger an event that triggers change detection
        // month won't be stepped in multi-month view
        stepMonth(1);
        fixture.detectChanges();

        expect(getMonths()).toEqual([
          new Date(2019, Month.February),
          new Date(2019, Month.March),
          new Date(2019, Month.April)
        ]);
      });
    });

    describe('ngOnChanges', () => {
      it('should regenerate months when firstMonth changes for NOT the first time', () => {
        component.numberOfMonths = 1;
        component.firstMonth = new Date(2019, Month.February);

        // call ngAfterViewInit
        fixture.detectChanges();

        component.firstMonth = new Date(2019, Month.March);
        component.ngOnChanges({
          firstMonth: {
            firstChange: false,
            previousValue: new Date(2019, Month.February),
            currentValue: component.firstMonth,
            isFirstChange() { return this.firstChange; }
          }
        });

        expect(component.months).toEqual([
          new Date(2019, Month.March),
        ]);
      });

      it('should NOT regenerate months when firstMonth changes for the first time', () => {
        component.firstMonth = new Date(2019, Month.March);
        component.ngOnChanges({
          firstMonth: {
            firstChange: true,
            previousValue: undefined,
            currentValue: component.firstMonth,
            isFirstChange() { return this.firstChange; }
          }
        });

        expect(component.months).not.toEqual([component.firstMonth]);
      });

      it('should regenerate months when numberOfMonths changes for NOT the first time', () => {
        component.firstMonth = new Date(2019, Month.February);
        component.numberOfMonths = 1;

        // call ngAfterViewInit
        fixture.detectChanges();

        component.numberOfMonths = 2;
        component.ngOnChanges({
          numberOfMonths: {
            firstChange: false,
            previousValue: 1,
            currentValue: component.numberOfMonths,
            isFirstChange() { return this.firstChange; }
          }
        });

        expect(component.months).toEqual([
          new Date(2019, Month.February),
          new Date(2019, Month.March),
        ]);
      });

      it('should NOT regenerate months when numberOfMonths changes for the first time', () => {
        component.firstMonth = new Date(2019, Month.March);
        component.numberOfMonths = 1;
        component.ngOnChanges({
          firstMonth: {
            firstChange: true,
            previousValue: undefined,
            currentValue: component.firstMonth,
            isFirstChange() { return this.firstChange; }
          }
        });

        expect(component.months).not.toEqual([component.firstMonth]);
      });
    });

    describe('showMonthStepper', () => {
      it('should be true by default (one-month view)', () => {
        component.firstMonth = new Date(2019, Month.February);
        fixture.detectChanges();

        expect(component.showMonthStepper).toBe(true);
      });

      it('should be true in one-month view', () => {
        component.firstMonth = new Date(2019, Month.February);
        component.numberOfMonths = 1;
        fixture.detectChanges();

        expect(component.showMonthStepper).toBe(true);
      });

      it('should be false in multi-month view', () => {
        component.firstMonth = new Date(2019, Month.February);
        component.numberOfMonths = 2;
        fixture.detectChanges();

        expect(component.showMonthStepper).toBe(false);
      });
    });

    function getMonths() {
      return getMonthComponentDebugElements().map(monthDebugElement => monthDebugElement.componentInstance.month);
    }

    function stepMonth(step: -1 | 1) {
      getMonthComponentDebugElement().triggerEventHandler('monthStep', step);
    }

    function selectDate(date: Date) {
      getMonthComponentDebugElement().triggerEventHandler('select', date);
    }

    function getCalendarDebugElement() {
      return fixture.debugElement.query(By.css('.calendar'));
    }

    function getMonthComponentDebugElement() {
      return getMonthComponentDebugElements()[0];
    }

    function getMonthComponentDebugElements() {
      return fixture.debugElement.queryAll(By.css('lib-calendar-month'));
    }
  });

  describe('form control', () => {
    let wrapperComponent: CalendarWrapperComponent;
    let fixture: ComponentFixture<CalendarWrapperComponent>;

    beforeEach(() => {
      fixture = TestBed.createComponent(CalendarWrapperComponent);
      wrapperComponent = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(wrapperComponent).toBeTruthy();
    });

    it('should set value to the date it is initialised with', () => {
      expect(wrapperComponent.calendarComponent.value).toEqual(defaultDate);
    });

    it('should set value when its value is set to a Date', () => {
      wrapperComponent.dateControl.setValue(valentinesDay);

      expect(wrapperComponent.calendarComponent.value).toEqual(valentinesDay);
    });

    it('should set value to undefined if set to a falsy value', () => {
      wrapperComponent.dateControl.setValue(null);

      expect(wrapperComponent.calendarComponent.value as any).toBeUndefined();
    });

    it('should set value to undefined if not a Date', () => {
      wrapperComponent.dateControl.setValue('2019-02-24');

      expect(wrapperComponent.calendarComponent.value as any).toBeUndefined();
    });

    it('should mark component for check if its value is set', () => {
      spyOn(wrapperComponent.calendarComponent.changeDetectorRef, 'markForCheck').and.callThrough();

      wrapperComponent.dateControl.setValue('2019-02-24');

      expect(wrapperComponent.calendarComponent.changeDetectorRef.markForCheck).toHaveBeenCalled();
    });

    it('should set its value on date select', () => {
      selectDate(valentinesDay);

      // toBe() is used intentionally for checking reference equality
      expect(wrapperComponent.dateControl.value).toBe(valentinesDay);
    });

    it('should become touched on date select', () => {
      expect(wrapperComponent.dateControl.touched).toBe(false);

      selectDate(valentinesDay);

      expect(wrapperComponent.dateControl.touched).toBe(true);
    });

    it('should set touched property to true on date select', () => {
      expect(wrapperComponent.calendarComponent.touched).toBe(false);

      selectDate(valentinesDay);

      expect(wrapperComponent.calendarComponent.touched).toBe(true);
    });

    it('should set disabled property on disable', () => {
      expect(wrapperComponent.calendarComponent.disabled).toBe(false);

      wrapperComponent.dateControl.disable();

      expect(wrapperComponent.calendarComponent.disabled).toBe(true);
    });

    it('should not select date when disabled', () => {
      spyOn(wrapperComponent.calendarComponent.change, 'emit');

      wrapperComponent.dateControl.disable();
      selectDate(valentinesDay);

      // toBe() is used intentionally for checking reference equality
      expect(wrapperComponent.calendarComponent.value).not.toBe(valentinesDay);
      expect(wrapperComponent.dateControl.value).not.toBe(valentinesDay);
      expect(wrapperComponent.calendarComponent.change.emit).not.toHaveBeenCalled();
    });

    it('should jump to the month of the selected date when switching back to one-month view', () => {
      wrapperComponent.dateControl.setValue(piDay);
      fixture.detectChanges();

      expect(getMonths()).toEqual([new Date(2019, Month.March)]);

      stepMonth(1);
      fixture.detectChanges();

      expect(getMonths()).toEqual([new Date(2019, Month.April)]);

      stepMonth(1);
      fixture.detectChanges();

      expect(getMonths()).toEqual([new Date(2019, Month.May)]);
    });

    function getMonths() {
      return getMonthComponentDebugElements().map(monthDebugElement => monthDebugElement.componentInstance.month);
    }

    function selectDate(date: Date) {
      getMonthComponentDebugElement().triggerEventHandler('select', date);
    }

    function stepMonth(step: -1 | 1) {
      getMonthComponentDebugElement().triggerEventHandler('monthStep', step);
    }

    function getMonthComponentDebugElement() {
      return getMonthComponentDebugElements()[0];
    }

    function getMonthComponentDebugElements() {
      return fixture.debugElement.queryAll(By.css('lib-calendar-month'));
    }
  });

  afterAll(() => {
    jasmine.clock().uninstall();
  });
});
