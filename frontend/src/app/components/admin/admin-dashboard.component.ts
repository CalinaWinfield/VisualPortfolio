// frontend/src/app/components/admin/admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth.service';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { ItemDatePipe } from '../../pipes/item-date.pipe';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule, ItemDatePipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  // Auth session error state
  authError = false;
  errorMessage = '';

  // Stats
  totalUsers = 0;
  totalItems = 0;
  totalDocuments = 0;
  activeUsers = 0;

  // Data
  allUsers: any[] = [];
  allItems: any[] = [];
  allDocuments: any[] = [];

  searchTerm = '';

  get filteredUsers(): any[] {
    if (!this.searchTerm) return this.allUsers;
    const s = this.searchTerm.toLowerCase();
    return this.allUsers.filter(u =>
      u.name?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.role?.toLowerCase().includes(s)
    );
  }

  get filteredItems(): any[] {
    if (!this.searchTerm) return this.allItems;
    const s = this.searchTerm.toLowerCase();
    return this.allItems.filter(i =>
      i.itemTitle?.toLowerCase().includes(s) ||
      i.category?.toLowerCase().includes(s) ||
      i.userEmail?.toLowerCase().includes(s)
    );
  }

  get filteredDocuments(): any[] {
    if (!this.searchTerm) return this.allDocuments;
    const s = this.searchTerm.toLowerCase();
    return this.allDocuments.filter(d =>
      d.title?.toLowerCase().includes(s) ||
      d.userEmail?.toLowerCase().includes(s)
    );
  }

  // UI state
  activeCard: string | null = null;
  showDeleteModal = false;
  deleteType: 'item' | 'user' | 'document' | null = null;
  entityToDelete: any = null;

  // Items, Users, and Documents list visibility
  showUsersList = false;
  showItemsList = false;
  showDocumentsList = false;

  private apiUrl = 'http://localhost:5001/api/admin';

  constructor(
    private http: HttpClient,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadAllUsers();
    this.loadAllItems();
    this.loadAllDocuments();
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  get adminCount(): number {
    return this.allUsers.filter(u => u.role === 'admin').length;
  }

  get regularUserCount(): number {
    return this.allUsers.filter(u => u.role !== 'admin').length;
  }

  // Section toggle helpers
  openViewUsers(): void {
    this.toggleCard('users');
  }

  closeViewUsers(): void {
    if (this.activeCard === 'users') {
      this.toggleCard('users');
    }
  }

  openViewItems(): void {
    this.toggleCard('allItems');
  }

  closeViewItems(): void {
    if (this.activeCard === 'allItems') {
      this.toggleCard('allItems');
    }
  }

  openViewDocuments(): void {
    this.toggleCard('allDocuments');
  }

  closeViewDocuments(): void {
    if (this.activeCard === 'allDocuments') {
      this.toggleCard('allDocuments');
    }
  }

  // ── Card toggle ────────────────────────────────────────────────────────────
  toggleCard(card: string): void {
    const closing = this.activeCard === card;
    this.activeCard = closing ? null : card;

    this.showUsersList = (this.activeCard === 'users');
    this.showItemsList = (this.activeCard === 'allItems');
    this.showDocumentsList = (this.activeCard === 'allDocuments');

    if (this.showUsersList && this.allUsers.length === 0) this.loadAllUsers();
    if (this.showItemsList && this.allItems.length === 0) this.loadAllItems();
    if (this.showDocumentsList && this.allDocuments.length === 0) this.loadAllDocuments();
  }

  // Attaches the JWT token to every admin request
  private authHeaders(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.auth.getAccessToken()}`
      })
    };
  }

  private handleAuthError(err: any): void {
    if (err?.status === 401 || err?.status === 403) {
      this.authError = true;
      this.errorMessage = (err?.error?.error === 'Token expired' || err?.error?.expired)
        ? 'Your admin session has expired. Please log in again to restore access.'
        : 'Your admin session is unauthorized or invalid. Please log in again.';
    }
  }

  goToLogin(): void {
    this.auth.clear();
    this.router.navigate(['/login']);
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  loadStats(): void {
    this.http.get<any>(`${this.apiUrl}/stats`, this.authHeaders()).subscribe({
      next: (data) => {
        this.totalUsers = data.totalUsers;
        this.totalItems = data.totalItems;
        this.totalDocuments = data.totalDocuments;
        this.activeUsers = data.activeUsers;
        this.authError = false;
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
        this.handleAuthError(err);
      }
    });
  }

  // ── Users ──────────────────────────────────────────────────────────────────
  loadAllUsers(): void {
    this.http.get<any[]>(`${this.apiUrl}/users`, this.authHeaders()).subscribe({
      next: (data) => {
        this.allUsers = data;
        this.authError = false;
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.handleAuthError(err);
      }
    });
  }
  
  toggleAllUsers() {
    this.showUsersList = !this.showUsersList;
    if (this.showUsersList && this.allUsers.length === 0) {
      this.loadAllUsers();
    }
  }

  promoteUser(user: any): void {
    const currentEmail = this.auth.getUserEmail();
    if (user.email === currentEmail && user.role === 'admin') {
      alert('You cannot demote your own account.');
      return;
    }

    const newRole = user.role === 'admin' ? 'user' : 'admin';
    this.http.patch(
      `${this.apiUrl}/users/${user._id}/role`,
      { role: newRole },
      this.authHeaders()
    ).subscribe({
      next: () => { user.role = newRole; },
      error: (err) => {
        console.error('Failed to update role:', err);
        this.handleAuthError(err);
      }
    });
  }

  // ── Items ──────────────────────────────────────────────────────────────────
  loadAllItems(): void {
    this.http.get<any[]>(`${this.apiUrl}/items`, this.authHeaders()).subscribe({
      next: (data) => {
        this.allItems = data;
        this.authError = false;
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Failed to load items:', err);
        this.handleAuthError(err);
      }
    });
  }
  
  toggleAllItems() {
    this.showItemsList = !this.showItemsList;
    if (this.showItemsList && this.allItems.length === 0) {
      this.loadAllItems();
    }
  }

  // ── Documents ──────────────────────────────────────────────────────────────────
  loadAllDocuments(): void {
    this.http.get<any[]>(`${this.apiUrl}/documents`, this.authHeaders()).subscribe({
      next: (data) => {
        this.allDocuments = data;
        this.authError = false;
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Failed to load documents:', err);
        this.handleAuthError(err);
      }
    });
  }
  
  toggleAllDocuments() {
    this.showDocumentsList = !this.showDocumentsList;
    if (this.showDocumentsList && this.allDocuments.length === 0) {
      this.loadAllDocuments();
    }
  }

  getDocStatus(doc: any): 'in-progress' | 'done' {
    if (!doc) return 'in-progress';
    const status = (doc.status || doc.formData?.status || '').toString().toLowerCase().trim();
    return status === 'done' ? 'done' : 'in-progress';
  }

  isCoverLetter(doc: any): boolean {
    if (!doc) return false;
    const type = (doc.docType || doc.formData?.docType || '').toString().toLowerCase().trim();
    return type === 'cover-letter' || (doc.title || '').toString().toLowerCase().includes('cover letter');
  }

  getDocTypeLabel(doc: any): string {
    return this.isCoverLetter(doc) ? 'Cover Letter' : 'Resume';
  }

  // ── Delete modal ───────────────────────────────────────────────────────────
  openDeleteModal(entity: any, type: 'item' | 'user' | 'document', event: Event): void {
    event.stopPropagation();
    this.entityToDelete = { ...entity };
    this.deleteType = type;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.entityToDelete) return;

    let url: string;
    if (this.deleteType === 'user') {
      url = `${this.apiUrl}/users/${this.entityToDelete._id}`;
    } else if (this.deleteType === 'document') {
      url = `${this.apiUrl}/documents/${this.entityToDelete._id}`;
    } else {
      url = `${this.apiUrl}/items/${this.entityToDelete._id}`;
    }

    this.http.delete(url, this.authHeaders()).subscribe({
      next: () => {
        if (this.deleteType === 'user') {
          this.allUsers = this.allUsers.filter(u => u._id !== this.entityToDelete._id);
          this.totalUsers--;
        } else if (this.deleteType === 'document') {
          this.allDocuments = this.allDocuments.filter(d => d._id !== this.entityToDelete._id);
          this.totalDocuments--;
        } else {
          this.allItems = this.allItems.filter(i => i._id !== this.entityToDelete._id);
          this.totalItems--;
        }
        this.closeModal();
        this.loadStats();
      },
      error: (err) => {
        console.error('Delete failed:', err);
        this.handleAuthError(err);
      }
    });
  }

  closeModal(): void {
    this.showDeleteModal = false;
    this.entityToDelete = null;
    this.deleteType = null;
  }
}