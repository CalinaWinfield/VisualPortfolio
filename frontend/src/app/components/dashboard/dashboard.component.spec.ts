// frontend/src/app/components/dashboard/dashboard.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ItemService } from '../../services/item.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  const itemServiceStub = { getItems: () => of([{ _id: '1', itemTitle: 'T' }, { _id: '2' }]) };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [{ provide: ItemService, useValue: itemServiceStub }],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.overrideComponent(DashboardComponent as any, { set: { template: '<div></div>' } });
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('loadItemsPreview should populate itemsPreview with max 5 items', () => {
    component.loadItemsPreview();
    expect(component.itemsPreview.length).toBeLessThanOrEqual(5);
    expect(component.loadingItems).toBeFalse();
  });
});
