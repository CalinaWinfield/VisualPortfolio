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
import { ItemDatePipe } from '../../pipes/item-date.pipe';

export interface StarterTemplate {
  id: string;
  name: string;
  type: 'resume' | 'cover-letter';
  typeLabel: string;
  icon: string;
  badge: string;
  badgeClass: string;
  description: string;
  features: string[];
  targetRoute: string;
  queryParams?: Record<string, any>;
}

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    CreateItemComponent,
    ItemDatePipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  userName = '';
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
      (d.status || '').toLowerCase().includes(s) ||
      (d.docType || '').toLowerCase().includes(s)
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

  // Toggle / templates
  viewTemplatesMode = false;
  selectedTemplateCategory: 'all' | 'resume' | 'cover-letter' = 'all';

  starterTemplates: StarterTemplate[] = [
    {
      id: 'standard',
      name: 'Standard Industry Resume',
      type: 'resume',
      typeLabel: 'Resume',
      icon: '💼',
      badge: 'Popular',
      badgeClass: 'badge-blue',
      description: 'A balanced, professional layout tailored for corporate and industry roles. Focuses on impactful work experience, measurable accomplishments, and core skills.',
      features: ['ATS Friendly', 'Work Experience', 'Skills Matrix', 'Clean Typography'],
      targetRoute: '/documents',
      queryParams: { mode: 'template', template: 'standard' }
    },
    {
      id: 'academic',
      name: 'Academic & Research CV',
      type: 'resume',
      typeLabel: 'CV / Academic',
      icon: '🎓',
      badge: 'Research',
      badgeClass: 'badge-purple',
      description: 'A comprehensive multi-section structure built for higher education, research grants, publications, conferences, and teaching fellowships.',
      features: ['Publications', 'Teaching & Grants', 'Education History', 'Formal Serif Layout'],
      targetRoute: '/documents',
      queryParams: { mode: 'template', template: 'academic' }
    },
    {
      id: 'skills',
      name: 'Technical & Engineering',
      type: 'resume',
      typeLabel: 'Technical',
      icon: '⚡',
      badge: 'High Impact',
      badgeClass: 'badge-amber',
      description: 'Compact, skills-first format emphasizing software engineering, technical projects, frameworks, tooling, and system architecture.',
      features: ['Tech Stack Highlights', 'Project Portfolio', 'Compact Spacing', 'Modern Header'],
      targetRoute: '/documents',
      queryParams: { mode: 'template', template: 'skills' }
    },
    {
      id: 'blank',
      name: 'Custom / Blank Canvas',
      type: 'resume',
      typeLabel: 'Resume',
      icon: '📝',
      badge: 'Flexible',
      badgeClass: 'badge-gray',
      description: 'A clean slate with modular sections allowing you to drag, reorder, and design your own unique layout from scratch.',
      features: ['Full Flexibility', 'Modular Sections', 'Custom Categories', 'Quick Start'],
      targetRoute: '/documents',
      queryParams: {}
    },
    {
      id: 'cover-1',
      name: 'Modern Red Accent',
      type: 'cover-letter',
      typeLabel: 'Cover Letter',
      icon: '🔴',
      badge: 'Modern',
      badgeClass: 'badge-red',
      description: 'Bold dual-tone uppercase header with a crimson dividing rule, clean contact block, modern sans-serif body, and cursive signature.',
      features: ['Dual-Tone Header', 'Red Accent Rule', 'Clean Paragraphs', 'Cursive Signature'],
      targetRoute: '/cover-letter',
      queryParams: { template: 1 }
    },
    {
      id: 'cover-2',
      name: 'Executive Framed Serif',
      type: 'cover-letter',
      typeLabel: 'Cover Letter',
      icon: '🏛️',
      badge: 'Classic',
      badgeClass: 'badge-slate',
      description: 'Traditional double-lined page border, centered formal typography, elegant spacing, and traditional small-caps printed sign-off.',
      features: ['Double-Line Border', 'Formal Serif Type', 'Centered Header', 'Executive Style'],
      targetRoute: '/cover-letter',
      queryParams: { template: 2 }
    },
    {
      id: 'cover-3',
      name: 'Bold Navy Banner',
      type: 'cover-letter',
      typeLabel: 'Cover Letter',
      icon: '🔷',
      badge: 'Executive',
      badgeClass: 'badge-navy',
      description: 'High-contrast full-width navy table banner with white text, amber accent border, and sleek sans-serif typography.',
      features: ['Full-Width Navy Banner', 'Amber Accent Line', 'Modern Tech Feel', 'High Contrast'],
      targetRoute: '/cover-letter',
      queryParams: { template: 3 }
    }
  ];

  get filteredTemplates(): StarterTemplate[] {
    if (this.selectedTemplateCategory === 'all') return this.starterTemplates;
    return this.starterTemplates.filter(t => t.type === this.selectedTemplateCategory);
  }

  get resumeTemplatesCount(): number {
    return this.starterTemplates.filter(t => t.type === 'resume').length;
  }

  get coverLetterTemplatesCount(): number {
    return this.starterTemplates.filter(t => t.type === 'cover-letter').length;
  }

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
    this.initUserGreeting();
    this.loadItemsPreview();
    this.loadDocuments();
    this.loadPagedItems();
  }

  initUserGreeting(): void {
    const cachedName = this.auth?.getUserName ? this.auth.getUserName() : null;
    if (cachedName && this.isValidName(cachedName)) {
      this.userName = cachedName.trim();
    } else {
      // Never fall back to username or email prefix
      this.userName = '';
    }

    if (this.auth?.getCurrentUser) {
      this.auth.getCurrentUser().subscribe({
        next: (res: any) => {
          const rawName = res?.name || res?.user?.name;
          if (rawName && typeof rawName === 'string' && rawName.trim() && this.isValidName(rawName)) {
            const validName = rawName.trim();
            this.userName = validName;
            if (this.auth?.setUserName) {
              this.auth.setUserName(validName);
            }
          }
        },
        error: () => {}
      });
    }
  }

  isValidName(name: string): boolean {
    if (!name || !name.trim()) return false;
    const email = this.auth?.getUserEmail ? this.auth.getUserEmail() : null;
    const emailPrefix = email ? email.split('@')[0].toLowerCase() : '';
    const clean = name.trim().toLowerCase();
    // Reject email addresses, usernames that match email prefix, or placeholder handles
    if (clean.includes('@') || (emailPrefix && clean === emailPrefix)) {
      return false;
    }
    return true;
  }

  toggleCard(card: string) {
    if (this.activeCard !== card) {
      this.activeCard = card;

      this.selectedItem = null;
      this.selectedDocument = null;

      this.viewItemsMode = false;
      this.viewDocumentsMode = false;
      this.viewTemplatesMode = false;
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
    this.viewTemplatesMode = false;
    this.selectedItem = null;

    this.loadDocuments();
  }

  closeViewDocuments() {
    this.viewDocumentsMode = false;
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
    if (this.isCoverLetter(doc)) {
      this.router.navigate(['/cover-letter'], {
        queryParams: { id: doc._id }
      });
    } else {
      this.router.navigate(['/documents'], {
        queryParams: { id: doc._id }
      });
    }
  }

  isCoverLetter(doc: any): boolean {
    if (!doc) return false;
    const type = (doc.docType || doc.formData?.docType || '').toString().toLowerCase().trim();
    return type === 'cover-letter' || (doc.title || '').toString().toLowerCase().includes('cover letter');
  }

  getDocTypeLabel(doc: any): string {
    return this.isCoverLetter(doc) ? 'Cover Letter' : 'Resume';
  }

  onCreateCoverLetter() {
    this.router.navigate(['/cover-letter']);
  }

  getDocStatus(doc: any): 'in-progress' | 'done' {
    if (!doc) return 'in-progress';
    const status = (doc.status || doc.formData?.status || '').toString().toLowerCase().trim();
    return status === 'done' ? 'done' : 'in-progress';
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
    this.openViewTemplates();
  }

  openViewTemplates(category: 'all' | 'resume' | 'cover-letter' = 'all') {
    this.viewTemplatesMode = true;
    this.viewDocumentsMode = false;
    this.viewItemsMode = false;
    this.showForm = false;
    this.selectedItem = null;
    this.selectedTemplateCategory = category;
  }

  closeViewTemplates() {
    this.viewTemplatesMode = false;
  }

  useTemplate(template: StarterTemplate) {
    if (template.queryParams && Object.keys(template.queryParams).length > 0) {
      this.router.navigate([template.targetRoute], {
        queryParams: template.queryParams
      });
    } else {
      this.router.navigate([template.targetRoute]);
    }
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
    this.viewTemplatesMode = false;
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
    this.selectedItem = null;
  }

  openCreateItemForm(): void {
    this.selectedItem = null;
    this.showForm = true;
    this.viewItemsMode = false;
    this.viewDocumentsMode = false;
    this.viewTemplatesMode = false;
  }

  prefillItem(item: any) {
    this.selectedItem = item;
    this.showForm = true;
    this.viewItemsMode = false;
    this.viewDocumentsMode = false;
    this.viewTemplatesMode = false;
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
