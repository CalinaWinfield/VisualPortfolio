// frontend/src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';
import { CreateItemComponent } from '../create-item/create-item.component';
import { AuthService } from '../auth.service';
import { DocumentService } from '../../services/document.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    CreateItemComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  totalItems = 0;
  showDeleteModal = false;

  sections = {
    documents: false,
    todo: false,
    activeForms: false,
  };

  itemsPreview: Item[] = [];
  loadingItems = false;
  itemsError?: string;

  categories: string[] = [];

  searchTerm = '';

  get filteredDocuments(): any[] {
    if (!this.searchTerm.trim()) return this.documents;
    const s = this.searchTerm.toLowerCase().trim();
    return this.documents.filter(d =>
      (d.title || '').toLowerCase().includes(s) ||
      (d.date || '').toLowerCase().includes(s)
    );
  }

  get filteredPagedItems(): Item[] {
    if (!this.searchTerm.trim()) return this.pagedItems;
    const s = this.searchTerm.toLowerCase().trim();
    return this.pagedItems.filter(i =>
      (i.itemTitle || '').toLowerCase().includes(s) ||
      (i.category || '').toLowerCase().includes(s) ||
      (i.itemDescription || '').toLowerCase().includes(s)
    );
  }

  get filteredItemsPreview(): Item[] {
    if (!this.searchTerm.trim()) return this.itemsPreview;
    const s = this.searchTerm.toLowerCase().trim();
    return this.itemsPreview.filter(i =>
      (i.itemTitle || '').toLowerCase().includes(s) ||
      (i.category || '').toLowerCase().includes(s)
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  activeCard: string | null = null;
  showForm = false;
  selectedItem: any = null;

  // Toggle / documents
  viewDocumentsMode = false;
  documents: any[] = [];
  selectedDocument: any = null;
  loadingDocuments = false;

  viewItemsMode = false;
  pagedItems: Item[] = [];

  currentPage = 1;
  itemsPerPage = 9;
  totalPages = 1;

  deleteType: 'item' | 'document' | null = null;
  entityToDelete: any = null;

  constructor(
    private location: Location,
    private itemService: ItemService,
    private documentService: DocumentService,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadItemsPreview();
    this.loadDocuments();
    this.loadPagedItems();
  }

  toggleCard(card: string) {
    if (this.activeCard !== card) {
      this.activeCard = card;

      this.selectedItem = null;
      this.selectedDocument = null;

      this.viewItemsMode = false;
      this.viewDocumentsMode = false;
      this.showForm = false;
    } else {
      this.activeCard = null;
    }
  }

  // -----------------------------
  // DOCUMENTS
  // -----------------------------

  openViewDocuments() {
    this.viewDocumentsMode = true;
    this.showForm = false;
    this.viewItemsMode = false;
    this.selectedItem = null;

    this.loadDocuments();
  }

  closeViewDocuments() {
    this.viewDocumentsMode = false;
    this.viewItemsMode = false;
    this.selectedDocument = null;
  }

  selectDocument(doc: any) {
    this.selectedDocument = doc;
  }

  deleteDocument(id: string) {
    this.documentService.deleteDocument(id).subscribe({
      next: () => {
        this.documents = this.documents.filter(d => d._id !== id);
        this.selectedDocument = null;
      },
      error: (err) => {
        console.error('Failed to delete document:', err);
      }
    });
  }

  editDocument(doc: any) {
    this.router.navigate(['/documents'], {
      queryParams: { id: doc._id }
    });
  }

  loadDocuments() {
    const email = this.auth.getUserEmail();
    this.documentService.getDocuments(email!).subscribe({
      next: (data) => {
        this.documents = data;
      },
      error: (err) => {
        console.error('Failed to load documents:', err);
      }
    });
  }

  toggleSection(section: 'documents' | 'todo' | 'activeForms'): void {
    this.sections[section] = !this.sections[section];
  }

  onCreateDocument() {
    this.router.navigate(['/documents']);
  }

  onCopyTemplate() {
    this.router.navigate(['/documents'], {
      queryParams: { mode: 'template' }
    });
  }

  // -----------------------------
  // ITEMS PREVIEW
  // -----------------------------

  loadItemsPreview(): void {
    this.loadingItems = true;

    const email = this.auth.getUserEmail();

    this.itemService.getItems(email!).subscribe({
      next: (data) => {
        this.itemsPreview = data.slice(0, 5);
        this.totalItems = data.length;

        const uniqueCategories = new Set(
          data
            .map(item => item.category)
            .filter((cat): cat is string => !!cat)
        );

        this.categories = Array.from(uniqueCategories);

        this.loadingItems = false;
      },
      error: (err) => {
        this.itemsError = err?.message ?? 'Failed to load items';
        this.loadingItems = false;
      },
    });
  }

  onItemCreated() {
    this.showForm = false;
    this.viewItemsMode = true;
    this.selectedItem = null;
    this.currentPage = 1;

    this.loadItemsPreview();
    this.loadPagedItems();
  }

  toggleForm() {
    this.showForm = !this.showForm;

    if (!this.showForm) {
      this.selectedItem = null;
    }

    this.viewItemsMode = false;
    this.viewDocumentsMode = false;
  }

  closeForm() {
    this.showForm = false;
    this.selectedItem = null;
  }

  // -----------------------------
  // VIEW ITEMS
  // -----------------------------

  openViewItems() {
    this.viewDocumentsMode = false;
    this.viewItemsMode = true;
    this.showForm = false;
    this.currentPage = 1;

    this.loadPagedItems();
  }

  loadPagedItems() {
    const email = this.auth.getUserEmail();
    if (!email) return;

    this.itemService.getItems(email).subscribe(data => {
      const list = data || [];
      this.totalItems = list.length;
      this.totalPages = Math.max(1, Math.ceil(list.length / this.itemsPerPage));

      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;

      this.pagedItems = list.slice(start, end);
    });
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPagedItems();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPagedItems();
    }
  }

  closeViewItems() {
    this.viewItemsMode = false;
    this.viewDocumentsMode = false;
    this.selectedItem = null;
  }

  openCreateItemForm(): void {
    this.selectedItem = null;
    this.showForm = true;
    this.viewItemsMode = false;
    this.viewDocumentsMode = false;
  }

  prefillItem(item: any) {
    this.selectedItem = item;
    this.showForm = true;
    this.viewItemsMode = false;
  }

  deleteItem(id: string) {
    this.itemService.deleteItem(id).subscribe(() => {
      this.loadPagedItems();
      this.loadItemsPreview();
      this.selectedItem = null;
    });
  }

  // -----------------------------
  // DELETE MODAL
  // -----------------------------

  openDeleteModal(entity: any, type: 'item' | 'document', event: Event) {
    event.stopPropagation();

    if (!entity) {
      console.warn('Entity is null');
      return;
    }

    this.entityToDelete = { ...entity };
    this.deleteType = type;
    this.showDeleteModal = true;

    console.log('MODAL ENTITY:', this.entityToDelete);
  }

  confirmDelete() {
    console.log('CONFIRM DELETE CLICKED', this.entityToDelete, this.deleteType);

    if (!this.entityToDelete) return;

    if (this.deleteType === 'item') {
      this.deleteItem(this.entityToDelete._id);
    } else if (this.deleteType === 'document') {
      this.deleteDocument(this.entityToDelete._id);
    }

    this.closeModal();
  }

  closeModal() {
    this.showDeleteModal = false;
    this.entityToDelete = null;
    this.deleteType = null;
  }

  selectItem(item: any) {
    this.selectedItem = item;
  }

}
