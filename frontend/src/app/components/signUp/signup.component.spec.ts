import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignUpComponent } from './signUp.component';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;
  const authStub = { signup: (v: any) => of({ token: 'abc' }) };
  const routerStub = { navigate: jasmine.createSpy('navigate') };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [SignUpComponent],
      providers: [FormBuilder],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.overrideComponent(SignUpComponent as any, { set: { template: '<div></div>' } });
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    (component as any).auth = authStub;
    (component as any).router = routerStub;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('onSubmit should call auth.signup and navigate when form valid', () => {
    component.form.setValue({ name: 'A', email: 'a@b.com', password: '123456' });
    component.onSubmit();
    expect(routerStub.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
