import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { FormBuilderComponent } from './form-builder.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth.service';
import { ItemService } from '../../services/item.service';

describe('FormBuilderComponent (export functions)', () => {
  let fixture: ComponentFixture<FormBuilderComponent>;
  let component: FormBuilderComponent;

  const httpStub = {
    post: jasmine.createSpy('post').and.returnValue(of({})),
    put: jasmine.createSpy('put').and.returnValue(of({})),
  };

  const authStub = {
    getUserEmail: jasmine.createSpy('getUserEmail').and.returnValue('user@example.com'),
  };

  const itemServiceStub = {
    getItems: jasmine.createSpy('getItems').and.returnValue(of([])),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormBuilderComponent],
      providers: [
        { provide: HttpClient, useValue: httpStub },
        { provide: AuthService, useValue: authStub },
        { provide: ItemService, useValue: itemServiceStub },
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

  describe('exportPdf', () => {
    it('alerts when no content', async () => {
      spyOn<any>(component as any, 'buildCleanExportElement').and.returnValue(Promise.resolve(null));
      const alertSpy = spyOn(window, 'alert');

      await component.exportPdf();

      expect(alertSpy).toHaveBeenCalledWith('No document content available to export.');
    });
  });

  describe('exportWord', () => {
    it('alerts when no form data and no items', async () => {
      const alertSpy = spyOn(window, 'alert');

      component.items = [];
      component.injectedItems = [];

      await component.exportWord();

      expect(alertSpy).toHaveBeenCalledWith('No document content available to export.');
    });
  });
});