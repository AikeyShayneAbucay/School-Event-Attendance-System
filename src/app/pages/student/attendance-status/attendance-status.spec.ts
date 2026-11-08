import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceStatus } from './attendance-status';

describe('AttendanceStatus', () => {
  let component: AttendanceStatus;
  let fixture: ComponentFixture<AttendanceStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceStatus],
    }).compileComponents();

    fixture = TestBed.createComponent(AttendanceStatus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
