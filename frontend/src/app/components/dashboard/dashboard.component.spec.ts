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
    getUserEmail: jasmine.createSpy('getUserEmail').and.returnValue('test@example.com'),
    getUserName: jasmine.createSpy('getUserName').and.returnValue('Test User'),
    setUserName: jasmine.createSpy('setUserName'),
    getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue(
      of({ name: 'Test User', email: 'test@example.com', role: 'user' })
    )
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
    authStub.getUserEmail.and.returnValue('test@example.com');
    authStub.getUserName.and.returnValue('Test User');
    authStub.getCurrentUser.and.returnValue(
      of({ name: 'Test User', email: 'test@example.com', role: 'user' })
    );
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

  it('should navigate to document builder on onCreateDocument', () => {
    component.onCreateDocument();
    expect(routerStub.navigate).toHaveBeenCalledWith(['/documents']);
  });

  it('openViewTemplates and onCopyTemplate should show templates section without navigating away', () => {
    routerStub.navigate.calls.reset();
    component.openViewTemplates('all');
    expect(component.viewTemplatesMode).toBeTrue();
    expect(component.viewDocumentsMode).toBeFalse();
    expect(component.viewItemsMode).toBeFalse();
    expect(component.selectedTemplateCategory).toBe('all');
    expect(routerStub.navigate).not.toHaveBeenCalled();

    component.closeViewTemplates();
    expect(component.viewTemplatesMode).toBeFalse();

    component.onCopyTemplate();
    expect(component.viewTemplatesMode).toBeTrue();
    expect(routerStub.navigate).not.toHaveBeenCalled();
  });

  it('filteredTemplates should filter templates by selectedTemplateCategory', () => {
    component.selectedTemplateCategory = 'all';
    expect(component.filteredTemplates.length).toBe(component.starterTemplates.length);

    component.selectedTemplateCategory = 'resume';
    expect(component.filteredTemplates.every(t => t.type === 'resume')).toBeTrue();
    expect(component.filteredTemplates.length).toBe(component.resumeTemplatesCount);

    component.selectedTemplateCategory = 'cover-letter';
    expect(component.filteredTemplates.every(t => t.type === 'cover-letter')).toBeTrue();
    expect(component.filteredTemplates.length).toBe(component.coverLetterTemplatesCount);
  });

  it('useTemplate should navigate to template route with queryParams', () => {
    const resumeTpl = component.starterTemplates.find(t => t.id === 'standard')!;
    component.useTemplate(resumeTpl);
    expect(routerStub.navigate).toHaveBeenCalledWith(['/documents'], { queryParams: { mode: 'template', template: 'standard' } });

    const coverTpl = component.starterTemplates.find(t => t.id === 'cover-1')!;
    component.useTemplate(coverTpl);
    expect(routerStub.navigate).toHaveBeenCalledWith(['/cover-letter'], { queryParams: { template: 1 } });
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

  it('should return correct status via getDocStatus', () => {
    expect(component.getDocStatus({ status: 'done' })).toBe('done');
    expect(component.getDocStatus({ status: 'Done' })).toBe('done');
    expect(component.getDocStatus({ formData: { status: 'done' } })).toBe('done');
    expect(component.getDocStatus({ status: 'in-progress' })).toBe('in-progress');
    expect(component.getDocStatus({ status: '' })).toBe('in-progress');
    expect(component.getDocStatus(null)).toBe('in-progress');
  });

  it('should identify cover letters and return labels correctly', () => {
    expect(component.isCoverLetter({ docType: 'cover-letter' })).toBeTrue();
    expect(component.isCoverLetter({ formData: { docType: 'cover-letter' } })).toBeTrue();
    expect(component.isCoverLetter({ title: 'My Cover Letter' })).toBeTrue();
    expect(component.isCoverLetter({ docType: 'resume' })).toBeFalse();
    expect(component.isCoverLetter(null)).toBeFalse();

    expect(component.getDocTypeLabel({ docType: 'cover-letter' })).toBe('Cover Letter');
    expect(component.getDocTypeLabel({ docType: 'resume' })).toBe('Resume');
  });

  it('onCreateCoverLetter should navigate to /cover-letter', () => {
    component.onCreateCoverLetter();
    expect(routerStub.navigate).toHaveBeenCalledWith(['/cover-letter']);
  });

  it('should render stacked create buttons and not render browse resume templates in my documents card', () => {
    const docCard = fixture.nativeElement.querySelector('.action-card');
    expect(docCard).toBeTruthy();
    const buttons = docCard.querySelectorAll('.action-buttons-group > button');
    expect(buttons.length).toBe(3);
    expect(buttons[0].textContent).toContain('Create Resume');
    expect(buttons[1].textContent).toContain('Create Cover Letter');
    expect(buttons[2].textContent).toContain('View Saved Documents');
    expect(docCard.textContent).not.toContain('Browse Resume Templates');
  });

  it('editDocument should navigate to /cover-letter for cover letter and /documents for resume', () => {
    component.editDocument({ _id: 'cl-1', docType: 'cover-letter' });
    expect(routerStub.navigate).toHaveBeenCalledWith(['/cover-letter'], { queryParams: { id: 'cl-1' } });

    component.editDocument({ _id: 'res-1', docType: 'resume' });
    expect(routerStub.navigate).toHaveBeenCalledWith(['/documents'], { queryParams: { id: 'res-1' } });
  });

  it('should greet the user with their name when available', () => {
    expect(component.userName).toBe('Test User');
    const heading = fixture.nativeElement.querySelector('.hero-title');
    expect(heading.textContent).toContain('Welcome back, Test User!');
  });

  it('should not use username or email prefix as greeting name', () => {
    authStub.getUserName.and.returnValue('alex');
    authStub.getCurrentUser.and.returnValue(of(null));
    authStub.getUserEmail.and.returnValue('alex@example.com');
    component.initUserGreeting();
    fixture.detectChanges();
    expect(component.userName).toBe('');
    const heading = fixture.nativeElement.querySelector('.hero-title');
    expect(heading.textContent).toContain('Portfolio Dashboard');
  });

  it('should greet user with their full name from user profile', () => {
    authStub.getUserName.and.returnValue(null);
    authStub.getCurrentUser.and.returnValue(of({ user: { name: 'Calina Winfield' } }));
    authStub.getUserEmail.and.returnValue('cwinfield1@ggc.edu');
    component.initUserGreeting();
    fixture.detectChanges();
    expect(component.userName).toBe('Calina Winfield');
    const heading = fixture.nativeElement.querySelector('.hero-title');
    expect(heading.textContent).toContain('Welcome back, Calina Winfield!');
  });
});
