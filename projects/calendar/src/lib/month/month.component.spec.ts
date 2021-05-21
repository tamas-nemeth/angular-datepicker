import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { formatDate } from '@angular/common';

import { getDaysOfMonth, Month } from 'date-utils';

import { MonthComponent } from './month.component';

describe('MonthComponent', () => {
  const valentinesDay = new Date(2019, Month.February, 14);
  const selectedModifierClass = 'month__date--selected';
  const disabledModifierClass = 'month__date--disabled';
  let component: MonthComponent;
  let fixture: ComponentFixture<MonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MonthComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display the days of the month received via input', () => {
    component.month = new Date(2019, Month.February);
    const daysInFebruary = 28;
    const rangeFrom1To28 = Array.from({length: daysInFebruary}, (_, index) => `${index + 1}`);

    fixture.detectChanges();

    expect(getDates()).toEqual(rangeFrom1To28);
  });

  it('should display the days with the proper datetime attributes', () => {
    component.month = new Date(2019, Month.February);
    const daysInFebruary = 28;
    const isoDatesInFebruary = Array.from({length: daysInFebruary}, (_, index) => `2019-02-${(index + 1).toString().padStart(2, '0')}`);

    fixture.detectChanges();

    expect(getDayDateTimeProperties()).toEqual(isoDatesInFebruary);
  });

  it('should display the days with the proper ARIA labels', () => {
    component.month = new Date(2019, Month.February);
    const ariaLabelsInFebruary = getDaysOfMonth(component.month).map((date) => formatDate(date, 'fullDate', 'en-US'));
    fixture.detectChanges();

    expect(getDateAriaLabels()).toEqual(ariaLabelsInFebruary);
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

    expect(getMonthDebugElement().classes['month--first-day-friday']).toBe(true);
  });

  it('should emit the selected date', () => {
    component.month = new Date(2019, Month.February);
    fixture.detectChanges();
    spyOn(component.selectedDateChange, 'emit');

    clickDay(14);

    expect(component.selectedDateChange.emit).toHaveBeenCalledWith(valentinesDay);
  });

  it('should NOT emit selectedDateChange when empty cell is clicked', () => {
    component.month = new Date(2019, Month.February);
    fixture.detectChanges();
    spyOn(component.selectedDateChange, 'emit');

    clickOnMonthElement();

    expect(component.selectedDateChange.emit).not.toHaveBeenCalled();
  });

  it('should add --selected class to selected day element', () => {
    component.month = new Date(2019, Month.February);
    component.selectedDate = valentinesDay;
    fixture.detectChanges();

    expect(getDayDebugElement(14)!.classes[selectedModifierClass]).toBe(true);
  });

  it('should add --disabled class to a day earlier than minimum date', () => {
    component.month = new Date(2019, Month.February);
    component.min = new Date(2019, Month.February, 3);
    fixture.detectChanges();

    expect(getDayDebugElement(1)!.classes[disabledModifierClass]).toBe(true);
    expect(getDayDebugElement(2)!.classes[disabledModifierClass]).toBe(true);
  });

  it('should NOT add --disabled class to minimum date', () => {
    component.month = new Date(2019, Month.February);
    component.min = new Date(2019, Month.February, 3);
    fixture.detectChanges();

    expect(getDayDebugElement(3)!.classes[disabledModifierClass]).toBeUndefined();
  });

  it('should NOT add --disabled class to a day later than minimum date', () => {
    component.month = new Date(2019, Month.February);
    component.min = new Date(2019, Month.February, 3);
    fixture.detectChanges();

    expect(getDayDebugElement(4)!.classes[disabledModifierClass]).toBeUndefined();
  });

  it('should NOT select disabled date', () => {
    component.month = new Date(2019, Month.February);
    component.min = new Date(2019, Month.February, 3);
    fixture.detectChanges();
    spyOn(component.selectedDateChange, 'emit');

    clickDay(2);

    expect(component.selectedDateChange.emit).not.toHaveBeenCalled();
  });

  it('should select minimum date', () => {
    component.month = new Date(2019, Month.February);
    component.min = new Date(2019, Month.February, 3);
    fixture.detectChanges();
    spyOn(component.selectedDateChange, 'emit');

    clickDay(3);

    expect(component.selectedDateChange.emit).toHaveBeenCalledWith(component.min);
  });

  it('should select day later than minimum date', () => {
    component.month = new Date(2019, Month.February);
    component.min = new Date(2019, Month.February, 3);
    fixture.detectChanges();
    spyOn(component.selectedDateChange, 'emit');

    clickDay(4);

    expect(component.selectedDateChange.emit).toHaveBeenCalledWith(new Date(2019, Month.February, 4));
  });

  it('should NOT select same date again', () => {
    component.month = new Date(2019, Month.February);
    component.selectedDate = valentinesDay;
    fixture.detectChanges();
    spyOn(component.selectedDateChange, 'emit');

    clickDay(14);

    expect(component.selectedDateChange.emit).not.toHaveBeenCalled();
  });

  it('should make all dates focusable programatically', () => {
    component.month = new Date(2019, Month.August);
    const daysInAugust = 31;
    fixture.detectChanges();

    expect(getDayTabIndexes()).toEqual(new Array(daysInAugust).fill(-1));
  });

  it('should put the active date in the tab order', () => {
    component.month = new Date(2019, Month.August);
    component.activeDate = new Date(2019, Month.August, 1);
    const daysInAugust = 31;
    fixture.detectChanges();

    expect(getDayTabIndexes()).toEqual([0].concat(new Array(daysInAugust - 1).fill(-1)));
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

  function getDates() {
    return getDayDebugElements()
      .map(dayOfWeekDebugElement => dayOfWeekDebugElement.nativeElement.textContent);
  }

  function getDateAriaLabels() {
    return getDayDebugElements().map(dayDebugElement => dayDebugElement.attributes['aria-label']);
  }

  function getDayDateTimeProperties() {
    return getDayDebugElements().map(dayDebugElement => dayDebugElement.properties.dateTime);
  }

  function getDayTabIndexes() {
    return getDayDebugElements().map(dayDebugElement => dayDebugElement.properties.tabIndex);
  }

  function getDayDebugElements() {
    return fixture.debugElement.queryAll(By.css('.month__date'));
  }

  function getMonthDebugElement() {
    return fixture.debugElement.query(By.css('.month'));
  }
});
