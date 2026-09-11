// frontend/src/app/components/cover-letter/cover-letter.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoverLetterComponent } from './cover-letter.component';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoverLetterService } from '../../services/cover-letter.service';
import { DocumentService } from '../../services/document.service';
import { AuthService } from '../auth.service';

describe('CoverLetterComponent', () => {
  let component: CoverLetterComponent;
  let fixture: ComponentFixture<CoverLetterComponent>;

  const getMockDefaultLetter = (num: number = 1) => ({
    title: `Cover Letter Template ${num}`,
    template: num,
    sender: {
      firstName: 'Nicolas',
      lastName: 'Park',
      address: 'Tucson, AZ 85706',
      phone: '555-555-5555',
      email: ''
    },
    recipient: {
      date: 'May 10, 2022',
      name: 'Susan Silverman',
      title: 'Store Manager',
      company: 'Kmart',
      address: '2489 Parkway Drive',
      cityStateZip: 'Tucson, AZ 85701'
    },
    content: {
      salutation: 'Dear Ms. Silverman,',
      intro: 'While viewing job ads online...',
      body: 'I am a fast learner...',
      bulletPoints: ['Skill A', 'Skill B'],
      conclusion: 'For further details...',
      signOff: 'Warm regards,',
      signatureName: 'Nicolas Park'
    },
    status: 'in-progress' as const,
    docType: 'cover-letter' as const
  });

  const coverLetterServiceStub = {
    getTemplates: jasmine.createSpy('getTemplates').and.returnValue({}),
    getDefaultLetter: jasmine.createSpy('getDefaultLetter').and.callFake((num: number) => getMockDefaultLetter(num)),
    saveCoverLetter: jasmine.createSpy('saveCoverLetter')
  };

  const documentServiceStub = {
    getDocumentById: jasmine.createSpy('getDocumentById').and.returnValue(
      of({
        _id: 'cl-123',
        title: 'Saved Job Letter',
        status: 'done',
        formData: {
          template: 2,
          sender: { firstName: 'Marissa', lastName: 'Ruiz', email: 'marissa@example.com' },
          recipient: { name: 'Danny Johnson', company: 'Kaiser' },
          content: { salutation: 'Dear Mr. Johnson,', intro: 'Intro', body: 'Body', bulletPoints: ['Item 1'], conclusion: 'End' }
        }
      })
    ),
    createDocument: jasmine.createSpy('createDocument').and.returnValue(
      of({ _id: 'new-cl-456', title: 'New Cover Letter' })
    ),
    updateDocument: jasmine.createSpy('updateDocument').and.returnValue(
      of({ _id: 'cl-123', title: 'Updated Job Letter' })
    )
  };

  const authStub = {
    getUserEmail: jasmine.createSpy('getUserEmail').and.returnValue('test@example.com')
  };

  const routerStub = {
    navigate: jasmine.createSpy('navigate')
  };

  const activatedRouteStub = {
    snapshot: {
      paramMap: { get: () => null },
      queryParamMap: { get: () => null }
    },
    paramMap: of({ get: () => null }),
    queryParamMap: of({ get: () => null })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoverLetterComponent],
      providers: [
        { provide: CoverLetterService, useValue: coverLetterServiceStub },
        { provide: DocumentService, useValue: documentServiceStub },
        { provide: AuthService, useValue: authStub },
        { provide: Router, useValue: routerStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(CoverLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with template 1 and prefill email on init', () => {
    expect(component.selectedTemplate).toBe(1);
    expect(component.currentLetter.sender.email).toBe('test@example.com');
  });

  it('should load template 2 and update model', () => {
    component.loadTemplate(2);
    expect(component.selectedTemplate).toBe(2);
    expect(component.currentLetter.template).toBe(2);
    expect(component.statusMessage).toContain('Template 2'); 
  });

  it('should load template 3 and update model', () => {
    component.loadTemplate(3);
    expect(component.selectedTemplate).toBe(3);
    expect(component.currentLetter.template).toBe(3);
  });

  it('should parse bullet points from multiline text in onBulletsChange', () => {
    component.bulletPointsText = 'Line 1\nLine 2\n\nLine 3  ';
    component.onBulletsChange();
    expect(component.currentLetter.content.bulletPoints).toEqual(['Line 1', 'Line 2', 'Line 3']);
  });

  it('should toggle preview mode', () => {
    expect(component.isPreviewMode).toBeFalse();
    component.togglePreview();
    expect(component.isPreviewMode).toBeTrue();
    component.togglePreview();
    expect(component.isPreviewMode).toBeFalse();
  });

  it('should save new cover letter via documentService.createDocument', () => {
    component.existingDocId = null as any;
    component.saveLetter('in-progress');
    expect(documentServiceStub.createDocument).toHaveBeenCalled();
    expect(component.existingDocId as any).toBe('new-cl-456');
    expect(component.statusMessage).toContain('saved as in-progress');
  });

  it('should update existing cover letter via documentService.updateDocument when existingDocId is present', () => {
    component.existingDocId = 'cl-123';
    component.saveLetter('done');
    expect(documentServiceStub.updateDocument).toHaveBeenCalledWith(
      'cl-123',
      jasmine.objectContaining({ status: 'done', docType: 'cover-letter' })
    );
    expect(component.statusMessage).toContain('updated as done');
  });

  it('should load existing document via loadDocument', () => {
    component.loadDocument('cl-123');
    expect(documentServiceStub.getDocumentById).toHaveBeenCalledWith('cl-123');
    expect(component.existingDocId).toBe('cl-123');
    expect(component.documentTitle).toBe('Saved Job Letter');
    expect(component.documentStatus).toBe('done');
    expect(component.selectedTemplate).toBe(2);
    expect(component.currentLetter.sender.firstName).toBe('Marissa');
  });

  it('userProfile should return sender name and email', () => {
    component.currentLetter.sender.firstName = 'Jane';
    component.currentLetter.sender.lastName = 'Doe';
    component.currentLetter.sender.email = 'jane@example.com';
    expect(component.userProfile.name).toBe('Jane Doe');
    expect(component.userProfile.email).toBe('jane@example.com');
  });

  describe('exportWord', () => {
    it('should export Word document for template 1 without error', async () => {
      component.selectedTemplate = 1;
      await expectAsync(component.exportWord()).toBeResolved();
    });

    it('should export Word document for template 2 without error', async () => {
      component.selectedTemplate = 2;
      await expectAsync(component.exportWord()).toBeResolved();
    });

    it('should export Word document for template 3 without error', async () => {
      component.selectedTemplate = 3;
      await expectAsync(component.exportWord()).toBeResolved();
    });
  });
});
