import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateItemComponent } from './create-item.component';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { ItemService } from '../../services/item.service';
import { AuthService } from '../../auth.service';

describe('CreateItemComponent', () => {
  let component: CreateItemComponent;
  let fixture: ComponentFixture<CreateItemComponent>;

  const itemServiceStub = {
    getItems: jasmine.createSpy('getItems').and.returnValue(of([])),
    getItem: jasmine.createSpy('getItem').and.returnValue(of({ _id: '123', itemTitle: 'Fetched Item' })),
    createItem: jasmine.createSpy('createItem').and.callFake((p: any) => of({ ...p, _id: 'new-id' })),
    updateItem: jasmine.createSpy('updateItem').and.callFake((id: string, p: any) => of({ ...p, _id: id })),
    deleteItem: jasmine.createSpy('deleteItem').and.returnValue(of({})),
  };

  const authStub = {
    getUserEmail: jasmine.createSpy('getUserEmail').and.returnValue('test@test.com'),
    getAccessToken: jasmine.createSpy('getAccessToken').and.returnValue('test-token')
  };

  beforeEach(async () => {
    itemServiceStub.getItems.calls.reset();
    itemServiceStub.getItem.calls.reset();
    itemServiceStub.createItem.calls.reset();
    itemServiceStub.updateItem.calls.reset();
    itemServiceStub.deleteItem.calls.reset();
    authStub.getUserEmail.calls.reset();
    authStub.getUserEmail.and.returnValue('test@test.com');

    await TestBed.configureTestingModule({
      imports: [CreateItemComponent],
      providers: [
        FormBuilder,
        { provide: ItemService, useValue: itemServiceStub },
        { provide: AuthService, useValue: authStub }
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(CreateItemComponent as any, { set: { template: '<div></div>' } })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with logged in user email', () => {
    expect(component.form).toBeDefined();
    expect(component.form.get('userEmail')?.value).toBe('test@test.com');
  });

  it('should include required category options in default list', () => {
    const requiredCategories = ['education', 'work history', 'projects', 'skills', 'certificates'];
    const optionsLower = component.categoryOptions.map(c => c.toLowerCase());
    for (const cat of requiredCategories) {
      expect(optionsLower).toContain(cat);
    }
  });

  it('openForm should show form', () => {
    component.showForm = false;
    component.openForm();
    expect(component.showForm).toBeTrue();
  });

  it('fetchItems should load items and set loading false', () => {
    component.fetchItems();
    expect(component.loading).toBeFalse();
    expect(component.items).toBeDefined();
    expect(itemServiceStub.getItems).toHaveBeenCalledWith('test@test.com');
  });

  it('should populate form when prefillData is passed via ngOnChanges', () => {
    const mockItem = {
      _id: 'item-99',
      itemTitle: 'Senior Software Engineer',
      category: 'Work History',
      itemDate: '2024-03-15T00:00:00.000Z',
      itemDescription: 'Lead architect for portfolio platform',
      userEmail: 'dev@example.com'
    };

    component.prefillData = mockItem;
    component.ngOnChanges({
      prefillData: new SimpleChange(null, mockItem, true)
    });

    expect(component.selectedItem).toEqual(mockItem);
    expect(component.form.get('itemTitle')?.value).toBe('Senior Software Engineer');
    expect(component.form.get('category')?.value).toBe('Work History');
    expect(component.form.get('itemDate')?.value).toBe('2024-03-15');
    expect(component.form.get('itemDescription')?.value).toBe('Lead architect for portfolio platform');
    expect(component.form.get('userEmail')?.value).toBe('dev@example.com');
  });

  it('should match category case-insensitively and normalize to standard casing', () => {
    const mockItem = {
      _id: 'item-100',
      itemTitle: 'B.S. in Computer Science',
      category: 'education',
      itemDate: '2020-05-20',
      itemDescription: 'Graduated summa cum laude'
    };

    component.populateForm(mockItem);
    expect(component.form.get('category')?.value).toBe('Education');
    expect(component.form.get('userEmail')?.value).toBe('test@test.com');
  });

  it('should include custom category in categoryOptions if item has non-default category', () => {
    const mockItem = {
      _id: 'item-101',
      itemTitle: 'Open Source Contributor',
      category: 'Volunteering',
      itemDate: '2023-01-01',
      itemDescription: 'Active contributor to OSS'
    };

    component.populateForm(mockItem);
    expect(component.form.get('category')?.value).toBe('Volunteering');
    expect(component.categoryOptions).toContain('Volunteering');
  });

  it('should correctly format dates for HTML5 date input', () => {
    expect(component.formatDateForInput('2025-11-04')).toBe('2025-11-04');
    expect(component.formatDateForInput('2025-11-04T14:30:00.000Z')).toBe('2025-11-04');
    expect(component.formatDateForInput('05/12/2023')).toBe('2023-05-12');
    expect(component.formatDateForInput('2022')).toBe('2022-01-01');
    expect(component.formatDateForInput('')).toBe('');
  });

  it('save() should call createItem when there is no selectedItem', () => {
    component.selectedItem = null;
    component.form.setValue({
      category: 'Projects',
      itemTitle: 'New Project',
      itemDate: '2026-01-01',
      itemDescription: 'Built an Angular app',
      userEmail: 'test@test.com'
    });

    spyOn(component.itemCreated, 'emit');
    component.save();

    expect(itemServiceStub.createItem).toHaveBeenCalled();
    const payload = itemServiceStub.createItem.calls.mostRecent().args[0];
    expect(payload.itemTitle).toBe('New Project');
    expect(payload.category).toBe('Projects');
    expect(payload.userEmail).toBe('test@test.com');
    expect(component.itemCreated.emit).toHaveBeenCalled();
  });

  it('save() should call updateItem when selectedItem._id exists', () => {
    component.selectedItem = { _id: 'item-123', itemTitle: 'Old Title' };
    component.form.setValue({
      category: 'Skills',
      itemTitle: 'Updated Skills',
      itemDate: '2026-02-01',
      itemDescription: 'TypeScript, Angular, Node',
      userEmail: 'test@test.com'
    });

    spyOn(component.itemCreated, 'emit');
    component.save();

    expect(itemServiceStub.updateItem).toHaveBeenCalledWith(
      'item-123',
      jasmine.objectContaining({
        itemTitle: 'Updated Skills',
        category: 'Skills',
        userEmail: 'test@test.com'
      })
    );
    expect(component.itemCreated.emit).toHaveBeenCalled();
  });

  it('resetForm() should reset form fields and retain logged-in user email', () => {
    component.selectedItem = { _id: 'item-123' };
    component.form.patchValue({
      itemTitle: 'Some Title',
      category: 'Projects'
    });

    component.resetForm();

    expect(component.selectedItem).toBeNull();
    expect(component.form.get('itemTitle')?.value).toBe('');
    expect(component.form.get('category')?.value).toBe('');
    expect(component.form.get('userEmail')?.value).toBe('test@test.com');
  });

  it('remove() should call deleteItem and remove item from local array', () => {
    component.items = [
      { _id: '1', itemTitle: 'Item 1' } as any,
      { _id: '2', itemTitle: 'Item 2' } as any
    ];

    component.remove('1');

    expect(itemServiceStub.deleteItem).toHaveBeenCalledWith('1');
    expect(component.items.length).toBe(1);
    expect(component.items[0]._id).toBe('2');
  });
});
