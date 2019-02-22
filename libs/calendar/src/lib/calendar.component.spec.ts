import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { MockComponent } from 'ng-mocks';

import { Month } from 'date-utils';

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

    it('should set selectedDate on monthcomponent pick event', () => {
      fixture.detectChanges();

      pickDate(valentinesDay);
      fixture.detectChanges();

      // toBe() is used intentionally for checking reference equality
      expect(component.selectedDate).toBe(valentinesDay);
    });

    it('should bind selectedDate input of monthcomponent to selectedDate', () => {
      fixture.detectChanges();

      pickDate(valentinesDay);
      fixture.detectChanges();

      // toBe() is used intentionally for checking reference equality
      expect(getMonthComponentDebugElement().componentInstance.selectedDate).toBe(component.selectedDate);
    });

    it('should bind month input of first monthcomponent to firstMonth', () => {
      component.firstMonth = new Date(2019, Month.March);
      fixture.detectChanges();

      expect(getMonthComponentDebugElement().componentInstance.month).toEqual(component.firstMonth);
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

    it('should display as many month components as numberOfMonths', () => {
      component.numberOfMonths = 3;
      const expectedMonths = [
        new Date(2019, Month.February),
        new Date(2019, Month.March),
        new Date(2019, Month.April),
      ];
      fixture.detectChanges();

      expect(getMonths()).toEqual(expectedMonths);
    });

    describe('ngOnChanges', () => {
      it('should regenerate months when firstMonth changes for NOT the first time', () => {
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

        const expectedMonths = [
          new Date(2019, Month.March),
        ];
        expect(component.months).toEqual(expectedMonths);
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

        const expectedMonths = [
          new Date(2019, Month.February),
          new Date(2019, Month.March),
        ];
        expect(component.months).toEqual(expectedMonths);
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

    it('should display the month of the selected month in one-month view', () => {
      component.selectedDate = new Date(2019, Month.March, 3);
      fixture.detectChanges();

      expect(getMonths()).toEqual([new Date(2019, Month.March, 1)]);
    });

    function getMonths() {
      return getMonthComponentDebugElements().map(monthDebugElement => monthDebugElement.componentInstance.month);
    }

    function pickDate(date: Date) {
      getMonthComponentDebugElement().triggerEventHandler('pick', date);
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

    it('should set selectedDate to the date it is initialised with', () => {
      expect(wrapperComponent.calendarComponent.selectedDate).toEqual(defaultDate);
    });

    it('should set selectedDate when its value is set to a Date', () => {
      wrapperComponent.dateControl.setValue(valentinesDay);

      expect(wrapperComponent.calendarComponent.selectedDate).toEqual(valentinesDay);
    });

    it('should set selectedDate to undefined if set to a falsy value', () => {
      wrapperComponent.dateControl.setValue(null);

      expect(wrapperComponent.calendarComponent.selectedDate as any).toBeUndefined();
    });

    it('should set selectedDate to undefined if not a Date', () => {
      wrapperComponent.dateControl.setValue('2019-02-24');

      expect(wrapperComponent.calendarComponent.selectedDate as any).toBeUndefined();
    });

    it('should mark component for check if its value is set', () => {
      spyOn(wrapperComponent.calendarComponent.changeDetectorRef, 'markForCheck').and.callThrough();

      wrapperComponent.dateControl.setValue('2019-02-24');

      expect(wrapperComponent.calendarComponent.changeDetectorRef.markForCheck).toHaveBeenCalled();
    });

    it('should set its value on date pick', () => {
      pickDate(valentinesDay);

      // toBe() is used intentionally for checking reference equality
      expect(wrapperComponent.dateControl.value).toBe(valentinesDay);
    });

    it('should become touched on date pick', () => {
      expect(wrapperComponent.dateControl.touched).toBe(false);

      pickDate(valentinesDay);

      expect(wrapperComponent.dateControl.touched).toBe(true);
    });

    it('should set touched property to true on date pick', () => {
      expect(wrapperComponent.calendarComponent.touched).toBe(false);

      pickDate(valentinesDay);

      expect(wrapperComponent.calendarComponent.touched).toBe(true);
    });

    it('should set disabled property on disable', () => {
      expect(wrapperComponent.calendarComponent.disabled).toBe(false);

      wrapperComponent.dateControl.disable();

      expect(wrapperComponent.calendarComponent.disabled).toBe(true);
    });

    it('should not pick date when disabled', () => {
      wrapperComponent.dateControl.disable();
      pickDate(valentinesDay);

      // toBe() is used intentionally for checking reference equality
      expect(wrapperComponent.calendarComponent.selectedDate).not.toBe(valentinesDay);
    });

    function pickDate(date: Date) {
      getMonthComponentDebugElement().triggerEventHandler('pick', date);
    }

    function getMonthComponentDebugElement() {
      return fixture.debugElement.query(By.css('lib-calendar-month'));
    }
  });
});
