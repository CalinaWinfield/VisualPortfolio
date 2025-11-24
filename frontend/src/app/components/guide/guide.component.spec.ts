import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GuideComponent } from './guide.component';
import { Location } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('GuideComponent', () => {
  let component: GuideComponent;
  let fixture: ComponentFixture<GuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuideComponent],
      providers: [{ provide: Location, useValue: { back: () => {} } }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should have currentYear defined', () => expect(component.currentYear).toBeGreaterThan(2000));
});
