import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Month } from 'date-utils';

import { CalendarMonthComponent } from './calendar-month.component';

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
    fixture.detectChanges();
    expect(component).toBeTruthy();
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

  it('should emit the selected date', () => {
    component.month = new Date(2019, Month.February);
    fixture.detectChanges();
    spyOn(component.select, 'emit');

    clickDay(14);

    expect(component.select.emit).toHaveBeenCalledWith(valentinesDay);
  });

  it('should NOT emit when empty cell is clicked', () => {
    component.month = new Date(2019, Month.February);
    fixture.detectChanges();
    spyOn(component.select, 'emit');

    clickOnMonthElement();

    expect(component.select.emit).not.toHaveBeenCalled();
  });

  it('should add --selected class to selected day element', () => {
    component.month = new Date(2019, Month.February);
    component.selectedDate = valentinesDay;
    fixture.detectChanges();

    expect(getDayDebugElement(14)!.classes['calendar-month__date--selected']).toBe(true);
  });

  it('should add --disabled class to a day earlier than minimum date', () => {
    component.month = new Date(2019, Month.February);
    component.min = new Date(2019, Month.February, 3);
    fixture.detectChanges();

    expect(getDayDebugElement(1)!.classes['calendar-month__date--disabled']).toBe(true);
    expect(getDayDebugElement(2)!.classes['calendar-month__date--disabled']).toBe(true);
  });

  it('should NOT add --disabled class to minimum date', () => {
    component.month = new Date(2019, Month.February);
    component.min = new Date(2019, Month.February, 3);
    fixture.detectChanges();

    expect(getDayDebugElement(3)!.classes['calendar-month__date--disabled']).toBe(false);
  });

  it('should NOT add --disabled class to a day later than minimum date', () => {
    component.month = new Date(2019, Month.February);
    component.min = new Date(2019, Month.February, 3);
    fixture.detectChanges();

    expect(getDayDebugElement(4)!.classes['calendar-month__date--disabled']).toBe(false);
  });

  it('should NOT select disabled date', () => {
    component.month = new Date(2019, Month.February);
    component.min = new Date(2019, Month.February, 3);
    fixture.detectChanges();
    spyOn(component.select, 'emit');

    clickDay(2);

    expect(component.select.emit).not.toHaveBeenCalled();
  });

  it('should select minimum date', () => {
    component.month = new Date(2019, Month.February);
    component.min = new Date(2019, Month.February, 3);
    fixture.detectChanges();
    spyOn(component.select, 'emit');

    clickDay(3);

    expect(component.select.emit).toHaveBeenCalledWith(component.min);
  });

  it('should select day later than minimum date', () => {
    component.month = new Date(2019, Month.February);
    component.min = new Date(2019, Month.February, 3);
    fixture.detectChanges();
    spyOn(component.select, 'emit');

    clickDay(4);

    expect(component.select.emit).toHaveBeenCalledWith(new Date(2019, Month.February, 4));
  });

  it('should NOT select same date again', () => {
    component.month = new Date(2019, Month.February);
    component.selectedDate = valentinesDay;
    fixture.detectChanges();
    spyOn(component.select, 'emit');

    clickDay(14);

    expect(component.select.emit).not.toHaveBeenCalled();
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
    return getDayDebugElements()
      .find(dayDebugElement => dayDebugElement.nativeElement.textContent === `${dayOfMonth}`);
  }

  function getDaysOfMonth() {
    return getDayDebugElements()
      .map(dayOfWeekDebugElement => dayOfWeekDebugElement.nativeElement.textContent);
  }

  function getDayDebugElements() {
    return fixture.debugElement.queryAll(By.css('.calendar-month__date'));
  }

  function getMonthDebugElement() {
    return fixture.debugElement.query(By.css('.calendar-month'));
  }
});
