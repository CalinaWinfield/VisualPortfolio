import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { Router } from '@angular/router';

import { FormBuilderComponent, ResumeSection, ResumeItem } from './form-builder.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth.service';
import { ItemService } from '../../services/item.service';
import { DocumentService } from '../../services/document.service';

describe('FormBuilderComponent', () => {
  let fixture: ComponentFixture<FormBuilderComponent>;
  let component: FormBuilderComponent;

  const httpStub = {
    post: jasmine.createSpy('post').and.returnValue(of({})),
    put: jasmine.createSpy('put').and.returnValue(of({})),
  };

  const authStub = {
    getUserEmail: jasmine.createSpy('getUserEmail').and.returnValue('user@example.com'),
  };

  const sampleItems = [
    { _id: 'item-1', itemTitle: 'Software Engineer', category: 'Work Experience', itemDate: '2022 - 2024', itemDescription: 'Developed web applications.' },
    { _id: 'item-2', itemTitle: 'B.S. Computer Science', category: 'Education', itemDate: '2018 - 2022', itemDescription: 'Graduated magna cum laude.' }
  ];

  const itemServiceStub = {
    getItems: jasmine.createSpy('getItems').and.returnValue(of(sampleItems)),
  };

  const documentServiceStub = {
    createDocument: jasmine.createSpy('createDocument').and.returnValue(of({ _id: 'new-doc-123', title: 'Test Document' })),
    updateDocument: jasmine.createSpy('updateDocument').and.returnValue(of({ _id: 'existing-doc-456', title: 'Updated Document' })),
    getDocumentById: jasmine.createSpy('getDocumentById').and.returnValue(of({})),
  };

  const routerStub = {
    navigate: jasmine.createSpy('navigate')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormBuilderComponent],
      providers: [
        { provide: HttpClient, useValue: httpStub },
        { provide: AuthService, useValue: authStub },
        { provide: ItemService, useValue: itemServiceStub },
        { provide: DocumentService, useValue: documentServiceStub },
        { provide: Router, useValue: routerStub }
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FormBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user catalog items on init', () => {
    expect(component.items.length).toBe(2);
    expect(component.categories).toContain('Work Experience');
    expect(component.categories).toContain('Education');
  });

  it('should apply templates correctly', () => {
    component.applyTemplate('academic', false);
    expect(component.documentTitle).toBe('Academic CV');
    expect(component.sections.length).toBeGreaterThan(3);
    const titles = component.sections.map(s => s.title);
    expect(titles).toContain('Publications & Presentations');
  });

  describe('template selection choices', () => {
    it('should prompt choice modal if document has existing content', () => {
      component.existingDocId = 'doc-123';
      component.onSelectTemplate('modern');
      expect(component.showTemplateChoiceModal).toBeTrue();
      expect(component.selectedTemplateKey).toBe('modern');
    });

    it('should apply directly without prompt if document has no existing content', () => {
      component.existingDocId = null;
      component.sections = [];
      component.documentHeader.summary = '';
      spyOn(component, 'applyTemplate');

      component.onSelectTemplate('standard');
      expect(component.showTemplateChoiceModal).toBeFalse();
      expect(component.applyTemplate).toHaveBeenCalledWith('standard', 'current');
    });

    it('should clear existingDocId and create new document when "new" mode is selected', () => {
      component.existingDocId = 'doc-123';
      component.applyTemplate('skills', 'new', false);

      expect(component.existingDocId).toBeNull();
      expect(component.documentTitle).toBe('Technical Resume');
      expect(component.showTemplateChoiceModal).toBeFalse();
      expect(component.showTemplateModal).toBeFalse();
    });

    it('should preserve existingDocId when "current" mode is selected', () => {
      component.existingDocId = 'doc-123';
      component.applyTemplate('skills', 'current', false);

      expect(component.existingDocId).toBe('doc-123');
      expect(component.documentTitle).toBe('Technical Resume');
      expect(component.showTemplateChoiceModal).toBeFalse();
    });
  });

  it('should add an item to a section', () => {
    const raw = { _id: 'raw-1', itemTitle: 'Research Assistant', category: 'Experience', itemDate: '2023', itemDescription: 'Assisted in lab.' };
    component.sections = [{ id: 'sec-1', title: 'Experience', items: [] }];

    component.addItemToSection('sec-1', raw);

    expect(component.sections[0].items.length).toBe(1);
    expect(component.sections[0].items[0].itemTitle).toBe('Research Assistant');
  });

  it('should reorder items within a section (moveItemUp and moveItemDown)', () => {
    const sec: ResumeSection = {
      id: 'sec-1',
      title: 'Experience',
      items: [
        { id: '1', itemTitle: 'First', itemDescription: '' },
        { id: '2', itemTitle: 'Second', itemDescription: '' }
      ]
    };
    component.sections = [sec];

    component.moveItemDown(sec, 0);
    expect(sec.items[0].itemTitle).toBe('Second');
    expect(sec.items[1].itemTitle).toBe('First');

    component.moveItemUp(sec, 1);
    expect(sec.items[0].itemTitle).toBe('First');
    expect(sec.items[1].itemTitle).toBe('Second');
  });

  it('should add a custom entry to a section', () => {
    const sec: ResumeSection = { id: 'sec-1', title: 'Projects', items: [] };
    component.sections = [sec];

    component.addCustomItem(sec);

    expect(sec.items.length).toBe(1);
    expect(sec.items[0].isCustom).toBeTrue();
  });

  it('should save a new document using DocumentService.createDocument', () => {
    component.existingDocId = null;
    component.documentTitle = 'New Test Resume';

    component.saveForm();

    expect(documentServiceStub.createDocument).toHaveBeenCalled();
  });

  it('should save a new document as in-progress', () => {
    component.existingDocId = null;
    component.documentTitle = 'In-Progress Resume';

    component.saveForm('in-progress');

    expect(component.documentStatus).toBe('in-progress');
    expect(documentServiceStub.createDocument).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: 'In-Progress Resume',
        status: 'in-progress'
      })
    );
  });

  it('should save a document as done', () => {
    component.existingDocId = null;
    component.documentTitle = 'Completed Resume';

    component.saveForm('done');

    expect(component.documentStatus).toBe('done');
    expect(documentServiceStub.createDocument).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: 'Completed Resume',
        status: 'done'
      })
    );
  });

  it('should update an existing document using DocumentService.updateDocument with status', () => {
    component.existingDocId = 'existing-doc-456';
    component.documentTitle = 'Updated Resume';

    component.saveForm('done');

    expect(documentServiceStub.updateDocument).toHaveBeenCalledWith(
      'existing-doc-456',
      jasmine.objectContaining({
        title: 'Updated Resume',
        status: 'done'
      })
    );
  });

  it('should migrate legacy document format with injectedItems seamlessly', () => {
    const legacyDoc = {
      _id: 'legacy-1',
      title: 'Old Resume',
      injectedItems: [
        { _id: 'i1', itemTitle: 'Old Job', category: 'Work Experience', itemDescription: 'Old work' },
        { _id: 'i2', itemTitle: 'Old Degree', category: 'Education', itemDescription: 'Old school' }
      ]
    };

    component.existingData = legacyDoc;

    expect(component.existingDocId).toBe('legacy-1');
    expect(component.documentTitle).toBe('Old Resume');
    expect(component.sections.length).toBeGreaterThanOrEqual(2);
    const expSec = component.sections.find(s => s.title === 'Work Experience');
    expect(expSec).toBeDefined();
    expect(expSec?.items[0].itemTitle).toBe('Old Job');
  });

  describe('exportPdf', () => {
    it('alerts when no content', async () => {
      spyOn<any>(component as any, 'buildCleanExportElement').and.returnValue(Promise.resolve(null));
      const alertSpy = spyOn(window, 'alert');

      await component.exportPdf();

      expect(alertSpy).toHaveBeenCalledWith('No document content available to export.');
    });

    it('builds clean export element when in editor mode (isPreviewMode = false)', async () => {
      component.isPreviewMode = false;
      component.documentHeader.fullName = 'Regular A. Person';
      component.documentHeader.summary = 'A summary';
      component.sections = [
        {
          id: 's1',
          title: 'Core Competencies',
          items: [
            {
              id: 'i1',
              itemTitle: 'MS Suite',
              category: 'Skills',
              itemDescription: 'Word, Excel'
            }
          ]
        }
      ];
      fixture.detectChanges();

      const el = await component.buildCleanExportElement();
      expect(el).toBeTruthy();
      expect(el?.textContent).toContain('Regular A. Person');
      expect(el?.textContent).toContain('Core Competencies');
      expect(el?.textContent).toContain('MS Suite');
      expect(el?.textContent).not.toContain('Skills');
    });

    it('preserves full URL link in certificate item description without truncation', async () => {
      const fullUrl = 'https://www.linkedin.com/learning/certificates/5248c993cddc0b6de5e7b2209c4b35781e732d1fd63d70a6b2d1229e206013d4';
      component.sections = [
        {
          id: 's-cert',
          title: 'Education & Certifications',
          items: [
            {
              id: 'cert-1',
              itemTitle: 'Web Design and Development',
              category: 'Certificates',
              itemDescription: `Introduction to Web Design and Development\n[${fullUrl}]`
            }
          ]
        }
      ];
      fixture.detectChanges();

      const el = await component.buildCleanExportElement();
      expect(el).toBeTruthy();
      expect(el?.textContent).toContain('Web Design and Development');
      expect(el?.textContent).toContain(fullUrl);
      expect(el?.textContent).toContain('206013d4');
    });
  });

  describe('exportWord', () => {
    it('alerts when no form data and no items', async () => {
      const alertSpy = spyOn(window, 'alert');

      component.items = [];
      component.injectedItems = [];
      component.sections = [];
      component.documentHeader = {
        fullName: '',
        titleOrRole: '',
        email: '',
        phone: '',
        location: '',
        summary: ''
      };

      await component.exportWord();

      expect(alertSpy).toHaveBeenCalledWith('No document content available to export.');
    });

    it('exports populated resume document without error', async () => {
      component.documentTitle = 'Software Engineer Resume';
      component.documentHeader = {
        fullName: 'Jane Doe',
        titleOrRole: 'Senior Developer',
        email: 'jane@example.com',
        phone: '555-0199',
        location: 'New York, NY',
        summary: 'Experienced developer.'
      };
      component.sections = [
        {
          id: 'sec-1',
          title: 'Work Experience',
          items: [
            {
              id: 'item-1',
              itemTitle: 'Software Engineer',
              category: 'work history',
              itemDate: '2026-01-10',
              itemDescription: 'Built scalable web applications.'
            }
          ]
        }
      ];

      await expectAsync(component.exportWord()).toBeResolved();
    });
  });
});