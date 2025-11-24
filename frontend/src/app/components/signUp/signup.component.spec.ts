import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  const authStub = { signup: (v: any) => of({ token: 'abc' }) };
  const routerStub = { navigate: jasmine.createSpy('navigate') };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [FormBuilder],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.overrideComponent(SignupComponent as any, { set: { template: '<div></div>' } });
    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupComponent);
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
