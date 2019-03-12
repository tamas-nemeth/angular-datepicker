import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Month } from 'date-utils';

import { CalendarMonthComponent } from './calendar-month.component';

type MonthStep = 'previous' | 'next';

describe('CalendarMonthComponent', () => {
  const valentinesDay = new Date(2019, Month.February, 14);
  let component: CalendarMonthComponent;
  let fixture: ComponentFixture<CalendarMonthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CalendarMonthComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarMonthComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the year and the name of the month received via input', () => {
    component.month = new Date(2019, Month.February);

    fixture.detectChanges();

    expect(getCaption()).toEqual('February 2019');
  });

  it('should display the days of the month received via input', () => {
    component.month = new Date(2019, Month.February);
    const daysInFebruary = 28;
    const rangeFrom1To31 = Array.from({length: daysInFebruary}, (_, index) => `${index + 1}`);

    fixture.detectChanges();

    expect(getDaysOfMonth()).toEqual(rangeFrom1To31);
  });

  it('should NOT recreate daysOfMonth when a date from the same month is passed as an input', () => {
    const february = new Date(2019, Month.February);
    component.month = february;
    const daysOfMonth = component.daysOfMonth;

    component.month = new Date(2019, Month.February, 14);

    // toBe() is used intentionally for checking reference equality
    expect(component.month).toBe(february);
    expect(component.daysOfMonth).toBe(daysOfMonth);
  });

  describe('month steppers', () => {
    it('should be visible if displayMonthSteppers is true', () => {
      component.displayMonthStepper = true;

      fixture.detectChanges();

      expect(getMonthStepperButtons()).toBeTruthy();
    });

    it('should be hidden if displayMonthSteppers is false', () => {
      component.displayMonthStepper = false;

      fixture.detectChanges();

      expect(getMonthStepperButtons()).toBeFalsy();
    });

    it('should emit monthStep on next month click', () => {
      component.displayMonthStepper = true;
      spyOn(component.monthStep, 'emit');
      fixture.detectChanges();

      stepMonth('next');

      expect(component.monthStep.emit).toHaveBeenCalledWith(1);
    });

    it('should emit monthStep on previous month click', () => {
      component.displayMonthStepper = true;
      spyOn(component.monthStep, 'emit');
      fixture.detectChanges();

      stepMonth('previous');

      expect(component.monthStep.emit).toHaveBeenCalledWith(-1);
    });
  });

  describe('monthCaptionPattern', () => {
    it('should have a default when overwritten by undefined', () => {
      component.monthCaptionPattern = undefined;

      expect(component.monthCaptionPattern as string | undefined).toEqual('MMMM y');
    });
  });

  describe('afterViewInit', () => {
    it('should detach changeDetectorRef', () => {
      spyOn(component.changeDetectorRef, 'detach');
      expect(component.changeDetectorRef.detach).not.toHaveBeenCalled();

      fixture.detectChanges();
      expect(component.changeDetectorRef.detach).toHaveBeenCalled();
    });
  });

  describe('onChanges', () => {
    it('should NOT detect changes when all changes are first changes or month changes', () => {
      spyOn(component.changeDetectorRef, 'detectChanges');

      component.ngOnChanges({
        month: {
          firstChange: false,
          previousValue: new Date(),
          currentValue: new Date(),
          isFirstChange() { return this.firstChange; }
        },
        min: {
          firstChange: true,
          previousValue: new Date(),
          currentValue: new Date(),
          isFirstChange() { return this.firstChange; }
        }
      });

      expect(component.changeDetectorRef.detectChanges).not.toHaveBeenCalled();
    });

    it('should detect changes when there is a non-first change', () => {
      spyOn(component.changeDetectorRef, 'detectChanges');

      component.ngOnChanges({
        month: {
          firstChange: false,
          previousValue: new Date(),
          currentValue: new Date(),
          isFirstChange() { return this.firstChange; }
        },
        min: {
          firstChange: false,
          previousValue: new Date(),
          currentValue: new Date(),
          isFirstChange() { return this.firstChange; }
        }
      });

      expect(component.changeDetectorRef.detectChanges).toHaveBeenCalled();
    });
  });


  it('should have a class with the first day of month', () => {
    component.month = new Date(2019, Month.February, 17);

    fixture.detectChanges();

    expect(getMonthDebugElement().classes['calendar-month--first-day-friday']).toBe(true);
  });

  it('should emit the picked date', () => {
    component.month = new Date(2019, Month.February);
    fixture.detectChanges();
    spyOn(component.pick, 'emit');

    clickDay(14);

    expect(component.pick.emit).toHaveBeenCalledWith(valentinesDay);
  });

  it('should NOT emit a picked date when empty cell is clicked', () => {
    component.month = new Date(2019, Month.February);
    fixture.detectChanges();
    spyOn(component.pick, 'emit');

    clickOnMonthElement();

    expect(component.pick.emit).not.toHaveBeenCalled();
  });

  it('should add --selected class to selected day element', () => {
    component.month = new Date(2019, Month.February);
    component.selectedDate = valentinesDay;
    fixture.detectChanges();

    expect(getDayDebugElement(14)!.classes['calendar-month__day--selected']).toBe(true);
  });

  it('should add --disabled class to a day earlier than minimum date', () => {
    component.month = new Date(2019, Month.February);
    component.min = new Date(2019, Month.February, 3);
    fixture.detectChanges();

    expect(getDayDebugElement(1)!.classes['calendar-month__day--disabled']).toBe(true);
    expect(getDayDebugElement(2)!.classes['calendar-month__day--disabled']).toBe(true);
  });

  it('should NOT add --disabled class to minimum date', () => {
    component.month = new Date(2019, Month.February);
    component.min = new Date(2019, Month.February, 3);
    fixture.detectChanges();

    expect(getDayDebugElement(3)!.classes['calendar-month__day--disabled']).toBe(false);
  });

  it('should NOT add --disabled class to a day later than minimum date', () => {
    component.month = new Date(2019, Month.February);
    component.min = new Date(2019, Month.February, 3);
    fixture.detectChanges();

    expect(getDayDebugElement(4)!.classes['calendar-month__day--disabled']).toBe(false);
  });

  it('should NOT pick disabled date', () => {
    component.month = new Date(2019, Month.February);
    component.min = new Date(2019, Month.February, 3);
    fixture.detectChanges();
    spyOn(component.pick, 'emit');

    clickDay(2);

    expect(component.pick.emit).not.toHaveBeenCalled();
  });

  it('should pick minimum date', () => {
    component.month = new Date(2019, Month.February);
    component.min = new Date(2019, Month.February, 3);
    fixture.detectChanges();
    spyOn(component.pick, 'emit');

    clickDay(3);

    expect(component.pick.emit).toHaveBeenCalledWith(component.min);
  });

  it('should pick day later than minimum date', () => {
    component.month = new Date(2019, Month.February);
    component.min = new Date(2019, Month.February, 3);
    fixture.detectChanges();
    spyOn(component.pick, 'emit');

    clickDay(4);

    expect(component.pick.emit).toHaveBeenCalledWith(new Date(2019, Month.February, 4));
  });

  it('should NOT pick same date again', () => {
    component.month = new Date(2019, Month.February);
    component.selectedDate = valentinesDay;
    fixture.detectChanges();
    spyOn(component.pick, 'emit');

    clickDay(14);

    expect(component.pick.emit).not.toHaveBeenCalled();
  });

  function clickDay(dayOfMonth: number) {
    const dayDebugElement = getDayDebugElement(dayOfMonth);

    if (dayDebugElement) {
      dayDebugElement.nativeElement.click();
    } else {
      throw new Error(`day ${dayOfMonth} element not found`);
    }
  }

  function clickOnMonthElement() {
    getMonthDebugElement().triggerEventHandler('click', {target: getMonthDebugElement().nativeElement});
  }

  function getDayDebugElement(dayOfMonth: number) {
    return fixture.debugElement.queryAll(By.css('.calendar-month__day'))
      .find(dayDebugElement => dayDebugElement.nativeElement.textContent === `${dayOfMonth}`);
  }

  function getDaysOfMonth() {
    return fixture.debugElement.queryAll(By.css('.calendar-month__day'))
      .map(dayOfWeekDebugElement => dayOfWeekDebugElement.nativeElement.textContent);
  }

  function getMonthDebugElement() {
    return fixture.debugElement.query(By.css('.calendar-month'));
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