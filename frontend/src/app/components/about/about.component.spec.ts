import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutComponent } from './about.component';
import { Location } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [AboutComponent],
      providers: [{ provide: Location, useValue: { back: () => {} } }],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.overrideComponent(AboutComponent as any, { set: { template: '<div></div>' } });
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have team members defined on component', () => {
    expect(component.teamMembers.map(m => m.name)).toContain('Calina Winfield');
  });

  it('should have development team roles formatted without emojis and with ampersands', () => {
    const rolesMap = new Map(component.teamMembers.map(m => [m.name, m.role]));
    expect(rolesMap.get('Calina Winfield')).toBe('Data Modeler & Documentation Lead');
    expect(rolesMap.get('Aaron Matthews')).toBe('Code Architecture & Lead Programmer');
    expect(rolesMap.get('Erick Vale')).toBe('Testing Lead & Project Manager');
    expect(rolesMap.get('Whitney Branch')).toBe('UI/UX Designer & Client Liaison');
  });

  it('should set currentYear', () => {
    expect(component.currentYear).toBeGreaterThan(2000);
  });
});
