// frontend/src/app/components/admin/admin-dashboard.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let routerSpy: { navigate: jasmine.Spy };

  // Stub the HTTP client so no real requests fire during tests
  const httpStub = {
    get: () => of({ totalUsers: 10, totalItems: 25, activeUsers: 8 }),
    patch: () => of({}),
    delete: () => of({ ok: true })
  };

  // Stub AuthService so token reads don't fail
  const authStub = {
    getAccessToken: () => 'fake-token',
    getUserEmail: () => 'admin@test.com',
    clear: jasmine.createSpy('clear')
  };

  beforeEach(async () => {
    routerSpy = { navigate: jasmine.createSpy('navigate') };

    TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        { provide: HttpClient, useValue: httpStub },
        { provide: AuthService, useValue: authStub },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA], // ignores unknown child components
    });

    // Override template so child components don't need to be resolved
    TestBed.overrideComponent(AdminDashboardComponent as any, {
      set: { template: '<div></div>' }
    });

    await TestBed.compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Basic creation ────────────────────────────────────────────────────────
  it('should create', () => expect(component).toBeTruthy());

  // ── Stats loading ─────────────────────────────────────────────────────────
  it('loadStats should populate totalUsers, totalItems, and activeUsers', () => {
    component.loadStats();
    expect(component.totalUsers).toBe(10);
    expect(component.totalItems).toBe(25);
    expect(component.activeUsers).toBe(8);
  });

  // ── Card toggle ───────────────────────────────────────────────────────────
  it('toggleCard should set activeCard', () => {
    component.toggleCard('users');
    expect(component.activeCard).toBe('users');
  });

  it('toggleCard should collapse card if already active', () => {
    component.activeCard = 'users';
    component.toggleCard('users');
    expect(component.activeCard).toBeNull();
  });

  // ── Delete modal ──────────────────────────────────────────────────────────
  it('openDeleteModal should set entityToDelete and show modal', () => {
    const fakeEvent = { stopPropagation: () => {} } as Event;
    const fakeUser = { _id: '123', name: 'Test User' };
    component.openDeleteModal(fakeUser, 'user', fakeEvent);
    expect(component.showDeleteModal).toBeTrue();
    expect(component.deleteType).toBe('user');
    expect(component.entityToDelete._id).toBe('123');
  });

  it('closeModal should reset modal state', () => {
    component.showDeleteModal = true;
    component.deleteType = 'user';
    component.entityToDelete = { _id: '123' };
    component.closeModal();
    expect(component.showDeleteModal).toBeFalse();
    expect(component.deleteType).toBeNull();
    expect(component.entityToDelete).toBeNull();
  });

  // ── promoteUser ───────────────────────────────────────────────────────────
  it('promoteUser should toggle role from user to admin', () => {
    const fakeUser = { _id: '123', role: 'user' };
    component.promoteUser(fakeUser);
    expect(fakeUser.role).toBe('admin');
  });

  it('promoteUser should toggle role from admin to user', () => {
    const fakeUser = { _id: '123', role: 'admin' };
    component.promoteUser(fakeUser);
    expect(fakeUser.role).toBe('user');
  });

  // ── Session error handling & navigation ──────────────────────────────────
  it('goToLogin should clear auth token and navigate to /login', () => {
    component.goToLogin();
    expect(authStub.clear).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('handleAuthError should set authError and appropriate message on 401', () => {
    (component as any).handleAuthError({ status: 401, error: { error: 'Token expired', expired: true } });
    expect(component.authError).toBeTrue();
    expect(component.errorMessage).toContain('expired');
  });

  // ── Search & role getters ────────────────────────────────────────────────
  it('clearSearch should reset searchTerm to empty string', () => {
    component.searchTerm = 'developer';
    component.clearSearch();
    expect(component.searchTerm).toBe('');
  });

  it('adminCount and regularUserCount should calculate role distributions', () => {
    component.allUsers = [
      { name: 'Admin One', role: 'admin' },
      { name: 'User One', role: 'user' },
      { name: 'User Two', role: 'user' }
    ];
    expect(component.adminCount).toBe(1);
    expect(component.regularUserCount).toBe(2);
  });

  it('search filter getters should filter users, items, and documents correctly', () => {
    component.allUsers = [
      { name: 'Alice Smith', email: 'alice@test.com', role: 'user' },
      { name: 'Bob Jones', email: 'bob@test.com', role: 'admin' }
    ];
    component.allItems = [
      { itemTitle: 'Angular Dev', category: 'Work', userEmail: 'alice@test.com' },
      { itemTitle: 'Graphic Design', category: 'Skills', userEmail: 'bob@test.com' }
    ];
    component.allDocuments = [
      { title: 'Resume 2026', userEmail: 'alice@test.com' },
      { title: 'CV Portfolio', userEmail: 'bob@test.com' }
    ];

    component.searchTerm = 'Alice';
    expect(component.filteredUsers.length).toBe(1);
    expect(component.filteredItems.length).toBe(1);
    expect(component.filteredDocuments.length).toBe(1);
  });

  it('section toggle helpers should update activeCard and visibility flags', () => {
    component.openViewUsers();
    expect(component.activeCard).toBe('users');
    expect(component.showUsersList).toBeTrue();

    component.closeViewUsers();
    expect(component.activeCard).toBeNull();
    expect(component.showUsersList).toBeFalse();

    component.openViewItems();
    expect(component.activeCard).toBe('allItems');
    expect(component.showItemsList).toBeTrue();

    component.openViewDocuments();
    expect(component.activeCard).toBe('allDocuments');
    expect(component.showDocumentsList).toBeTrue();
  });
});