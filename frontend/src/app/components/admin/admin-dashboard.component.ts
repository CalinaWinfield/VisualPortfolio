// frontend/src/app/components/admin/admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

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

  // Items and Users list buttons
  showUsersList = false;
  showItemsList = false;
  showDocumentsList = false;

  private apiUrl = 'http://localhost:5001/api/admin';

  constructor(
    private http: HttpClient,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  // Attaches the JWT token to every admin request
  private authHeaders(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.auth.getAccessToken()}`
      })
    };
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  loadStats(): void {
    this.http.get<any>(`${this.apiUrl}/stats`, this.authHeaders()).subscribe({
      next: (data) => {
        this.totalUsers = data.totalUsers;
        this.totalItems = data.totalItems;
        this.totalDocuments = data.totalDocuments;
        this.activeUsers = data.activeUsers;
        
      },
      error: (err) => console.error('Failed to load stats:', err)
    });
  }

  // ── Users ──────────────────────────────────────────────────────────────────
  loadAllUsers(): void {
    this.http.get<any[]>(`${this.apiUrl}/users`, this.authHeaders()).subscribe({
      next: (data) => { this.allUsers = data; },
      error: (err) => console.error('Failed to load users:', err)
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
      error: (err) => console.error('Failed to update role:', err)
    });
  }

  // ── Items ──────────────────────────────────────────────────────────────────
  loadAllItems(): void {
    this.http.get<any[]>(`${this.apiUrl}/items`, this.authHeaders()).subscribe({
      next: (data) => { this.allItems = data; },
      error: (err) => console.error('Failed to load items:', err)
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
      next: (data) => { this.allDocuments = data; },
      error: (err) => console.error('Failed to load documents:', err)
    });
  }
  
  toggleAllDocuments() {
    this.showDocumentsList = !this.showDocumentsList;
    if (this.showDocumentsList && this.allDocuments.length === 0) {
      this.loadAllDocuments();
    }
  }

  // ── Card toggle ────────────────────────────────────────────────────────────
  toggleCard(card: string): void {
    const closing = this.activeCard === card;
    this.activeCard = closing ? null : card;

    if (closing) {
      // Hide the list when collapsing the card
      if (card === 'users') this.showUsersList = false;
      if (card === 'allItems') this.showItemsList = false;
      if (card === 'allDocuments') this.showDocumentsList = false;
    } else {
      // Show and load when opening the card
      if (card === 'users') this.toggleAllUsers();
      if (card === 'allItems') this.toggleAllItems();
      if (card === 'allDocuments') this.toggleAllDocuments();
    }
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
      error: (err) => console.error('Delete failed:', err)
    });
  }

  closeModal(): void {
    this.showDeleteModal = false;
    this.entityToDelete = null;
    this.deleteType = null;
  }
}