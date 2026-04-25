import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemsListComponent } from './items-list.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ItemsListComponent', () => {
  let component: ItemsListComponent;
  let fixture: ComponentFixture<ItemsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemsListComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should paginate items correctly', () => {
    component.items = [
      { itemTitle: 'A' } as any,
      { itemTitle: 'B' } as any,
      { itemTitle: 'C' } as any,
      { itemTitle: 'D' } as any,
      { itemTitle: 'E' } as any,
      { itemTitle: 'F' } as any,
    ];

    component.itemsPerPage = 3;
    component.currentPage = 1;

    expect(component.paginatedItems.length).toBe(3);

    component.nextPage();
    expect(component.paginatedItems.length).toBe(3);
  });
});