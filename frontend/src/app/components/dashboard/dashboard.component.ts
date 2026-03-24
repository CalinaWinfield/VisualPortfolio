import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';
import { ItemsListComponent } from '../create-item/items-list.component';
import { CreateItemComponent } from '../create-item/create-item.component';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    CreateItemComponent,
    ItemsListComponent   // ✅ Now included
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

  activeCard: string | null = null;
  showForm = false;
  selectedItem: any = null;

  viewDocumentsMode = false;
  documents: any[] = [];
  selectedDocument: any = null;

  viewItemsMode = false;
  pagedItems: Item[] = [];

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  deleteType: 'item' | 'document' | null = null;
  entityToDelete: any = null;

  constructor(
    private location: Location,
    private itemService: ItemService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadItemsPreview();
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
    this.documents = this.documents.filter(d => d._id !== id);
    this.selectedDocument = null;
  }

  editDocument(doc: any) {
    this.router.navigate(['/documents'], {
      queryParams: { id: doc._id }
    });
  }

  loadDocuments() {
    this.documents = [
      {
        _id: '1',
        title: 'Resume Template',
        description: 'Professional resume layout',
        date: '2026-03-20'
      },
      {
        _id: '2',
        title: 'Cover Letter',
        description: 'Simple cover letter',
        date: '2026-03-18'
      }
    ];
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

    const email = localStorage.getItem('userEmail');

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
    const email = localStorage.getItem('userEmail');

    this.itemService.getItems(email!).subscribe(data => {
      this.totalItems = data.length;

      if (data.length > 10) {
        this.viewItemsMode = true;
      }

      this.totalPages = Math.ceil(data.length / this.itemsPerPage);

      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;

      this.pagedItems = data.slice(start, end);
    });
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