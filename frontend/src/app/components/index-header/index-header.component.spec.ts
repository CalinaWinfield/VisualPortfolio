import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexHeaderComponent } from './index-header.component';

describe('IndexHeaderComponent', () => {
  let component: IndexHeaderComponent;
  let fixture: ComponentFixture<IndexHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndexHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndexHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
