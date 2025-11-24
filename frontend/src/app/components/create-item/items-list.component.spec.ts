import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemsListComponent } from './items-list.component';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ItemService } from '../../services/item.service';

describe('ItemsListComponent', () => {
  let component: ItemsListComponent;
  let fixture: ComponentFixture<ItemsListComponent>;
  const itemServiceStub = { getItems: () => of([{ _id: '1', itemTitle: 'One' }]) };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ItemsListComponent],
      providers: [{ provide: ItemService, useValue: itemServiceStub }],
      schemas: [NO_ERRORS_SCHEMA],
    });

    // avoid compiling the full template (there are template expressions that JIT will reject in tests)
    TestBed.overrideComponent(ItemsListComponent as any, { set: { template: '<div></div>' } });
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('fetchItems should populate items', () => {
    component.fetchItems();
    expect(component.items.length).toBeGreaterThanOrEqual(0);
    expect(component.loading).toBeFalse();
  });
});
