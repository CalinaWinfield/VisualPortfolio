// frontend/src/app/components/dashboard/dashboard.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { DocumentService } from '../../services/document.service';
import { AuthService } from '../auth.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  const itemServiceStub = {
    getItems: jasmine.createSpy('getItems').and.returnValue(
      of([
        { _id: '1', itemTitle: 'Software Engineer', category: 'Work History', itemDate: '2023' },
        { _id: '2', itemTitle: 'B.S. Computer Science', category: 'Education', itemDate: '2022' }
      ])
    ),
    deleteItem: jasmine.createSpy('deleteItem').and.returnValue(of({}))
  };

  const documentServiceStub = {
    getDocuments: jasmine.createSpy('getDocuments').and.returnValue(
      of([
        { _id: 'doc-1', title: 'Resume 2026', date: '2026-09-01' },
        { _id: 'doc-2', title: 'Academic CV', date: '2026-08-15' }
      ])
    ),
    deleteDocument: jasmine.createSpy('deleteDocument').and.returnValue(of({}))
  };

  const authStub = {
    getUserEmail: jasmine.createSpy('getUserEmail').and.returnValue('test@example.com')
  };

  const routerStub = {
    navigate: jasmine.createSpy('navigate')
  };

  const locationStub = {
    back: jasmine.createSpy('back')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: ItemService, useValue: itemServiceStub },
        { provide: DocumentService, useValue: documentServiceStub },
        { provide: AuthService, useValue: authStub },
        { provide: Router, useValue: routerStub },
        { provide: Location, useValue: locationStub }
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should eager-load items and documents on init', () => {
    expect(component.documents.length).toBe(2);
    expect(component.totalItems).toBe(2);
    expect(component.itemsPreview.length).toBe(2);
    expect(component.categories).toContain('Work History');
    expect(component.categories).toContain('Education');
  });

  it('loadItemsPreview should populate itemsPreview with max 5 items', () => {
    component.loadItemsPreview();
    expect(component.itemsPreview.length).toBeLessThanOrEqual(5);
    expect(component.loadingItems).toBeFalse();
  });

  it('should filter documents and items when searchTerm is set', () => {
    component.searchTerm = 'Academic';
    expect(component.filteredDocuments.length).toBe(1);
    expect(component.filteredDocuments[0].title).toBe('Academic CV');

    component.searchTerm = 'Engineer';
    expect(component.filteredPagedItems.length).toBe(1);
    expect(component.filteredPagedItems[0].itemTitle).toBe('Software Engineer');

    component.clearSearch();
    expect(component.searchTerm).toBe('');
    expect(component.filteredDocuments.length).toBe(2);
  });

  it('should navigate to document builder on onCreateDocument and onCopyTemplate', () => {
    component.onCreateDocument();
    expect(routerStub.navigate).toHaveBeenCalledWith(['/documents']);

    component.onCopyTemplate();
    expect(routerStub.navigate).toHaveBeenCalledWith(['/documents'], { queryParams: { mode: 'template' } });
  });

  it('should open and confirm delete modal for documents', () => {
    const fakeEvent = { stopPropagation: jasmine.createSpy('stopPropagation') } as any;
    const doc = { _id: 'doc-1', title: 'Resume 2026' };

    component.openDeleteModal(doc, 'document', fakeEvent);
    expect(component.showDeleteModal).toBeTrue();
    expect(component.entityToDelete._id).toBe('doc-1');
    expect(component.deleteType).toBe('document');
    expect(fakeEvent.stopPropagation).toHaveBeenCalled();

    component.confirmDelete();
    expect(documentServiceStub.deleteDocument).toHaveBeenCalledWith('doc-1');
    expect(component.showDeleteModal).toBeFalse();
  });

  it('should open and confirm delete modal for items', () => {
    const fakeEvent = { stopPropagation: jasmine.createSpy('stopPropagation') } as any;
    const item = { _id: '1', itemTitle: 'Software Engineer' };

    component.openDeleteModal(item, 'item', fakeEvent);
    expect(component.showDeleteModal).toBeTrue();
    expect(component.deleteType).toBe('item');

    component.confirmDelete();
    expect(itemServiceStub.deleteItem).toHaveBeenCalledWith('1');
    expect(component.showDeleteModal).toBeFalse();
  });
});
