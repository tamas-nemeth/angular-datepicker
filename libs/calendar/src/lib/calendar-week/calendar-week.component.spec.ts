import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeHu from '@angular/common/locales/hu';

import { CalendarWeekComponent } from './calendar-week.component';

describe('CalendarWeekComponent', () => {
  let component: CalendarWeekComponent;
  let fixture: ComponentFixture<CalendarWeekComponent>;

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
    expect(component).toBeTruthy();
  });

  it('should display the 7 days of the week', () => {
    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    fixture.detectChanges();

    expect(getDaysOfWeek()).toEqual(daysOfWeek);
  });

  it('should display the 7 days of the week in Hungarian if locale is set to hu', () => {
    registerLocaleData(localeHu);
    const daysOfWeek = ['V', 'H', 'K', 'Sz', 'Cs', 'P', 'Sz'];
    component.locale = 'hu';

    fixture.detectChanges();

    expect(getDaysOfWeek()).toEqual(daysOfWeek);
  });

  function getDaysOfWeek() {
    return fixture.debugElement.queryAll(By.css('.calendar-week__day'))
      .map(dayOfWeekDebugElement => dayOfWeekDebugElement.nativeElement.textContent);
  }
});
