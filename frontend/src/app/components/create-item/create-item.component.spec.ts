import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateItemComponent } from './create-item.component';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ItemService } from '../../services/item.service';

describe('CreateItemComponent', () => {
  let component: CreateItemComponent;
  let fixture: ComponentFixture<CreateItemComponent>;
  const itemServiceStub = {
    getItems: () => of([]),
    createItem: (p: any) => of({ ...p, _id: '1' }),
    deleteItem: (id: string) => of({}),
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [CreateItemComponent],
      providers: [FormBuilder, { provide: ItemService, useValue: itemServiceStub }],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.overrideComponent(CreateItemComponent as any, { set: { template: '<div></div>' } });
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('openForm should show form', () => {
    component.showForm = false;
    component.openForm();
    expect(component.showForm).toBeTrue();
  });

  it('fetchItems should load items and set loading false', () => {
    component.fetchItems();
    expect(component.loading).toBeFalse();
    expect(component.items).toBeDefined();
  });
});
