import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentComponent } from './document.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ItemService } from '../../services/item.service';

describe('DocumentComponent', () => {
  let component: DocumentComponent;
  let fixture: ComponentFixture<DocumentComponent>;

  const items = [
    { _id: '1', userEmail: 'me@example.com', itemTitle: 'A' },
  ];

  const itemServiceStub = {
    getItems: () => ({ toPromise: () => Promise.resolve(items) }),
    deleteItem: (id: string) => ({ subscribe: (o: any) => o.next({}) }),
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [DocumentComponent],
      providers: [{ provide: ItemService, useValue: itemServiceStub }],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.overrideComponent(DocumentComponent as any, { set: { template: '<div></div>' } });
    await TestBed.compileComponents();
  });

  beforeEach(async () => {
    // ensure sessionStorage has a user
    sessionStorage.setItem('userEmail', 'me@example.com');
    fixture = TestBed.createComponent(DocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await component.loadItems();
  });

  afterEach(() => sessionStorage.removeItem('userEmail'));

  it('should create', () => expect(component).toBeTruthy());

  it('loadItems should populate items for session user', async () => {
    await component.loadItems();
    expect(component.items.length).toBeGreaterThanOrEqual(0);
  });
});
