import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentComponent } from './document.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ItemService } from '../../services/item.service';
import { DocumentService } from '../../services/document.service';
import { AuthService } from '../auth.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

describe('DocumentComponent', () => {
  let component: DocumentComponent;
  let fixture: ComponentFixture<DocumentComponent>;

  const items = [
    { _id: '1', userEmail: 'me@example.com', itemTitle: 'A' },
  ];

  const itemServiceStub = {
    getItems: (email: string) => of(items),
    deleteItem: (id: string) => of({}),
  };

  const documentServiceStub = {
    getDocumentById: (id: string) => of({ _id: id, title: 'Test Doc', formData: { sections: [] } }),
    createDocument: (doc: any) => of(doc),
    updateDocument: (id: string, doc: any) => of(doc)
  };

  const authServiceStub = {
    getUserEmail: () => 'me@example.com'
  };

  const activatedRouteStub = {
    snapshot: {
      paramMap: { get: () => null },
      queryParamMap: { get: () => null }
    },
    paramMap: of({ get: () => null }),
    queryParamMap: of({ get: () => null })
  };

  const httpStub = {
    get: () => of({}),
    post: () => of({})
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [DocumentComponent],
      providers: [
        { provide: ItemService, useValue: itemServiceStub },
        { provide: DocumentService, useValue: documentServiceStub },
        { provide: AuthService, useValue: authServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: HttpClient, useValue: httpStub }
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.overrideComponent(DocumentComponent as any, {
      set: { template: '<div></div>' }
    });

    await TestBed.compileComponents();
  });

  beforeEach(async () => {
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
    expect(component.items.length).toBe(1);
  });

  it('loadDocument should set existingFormData from DocumentService', () => {
    component.loadDocument('doc-123');
    expect(component.existingFormData).toBeDefined();
    expect(component.existingFormData._id).toBe('doc-123');
  });
});