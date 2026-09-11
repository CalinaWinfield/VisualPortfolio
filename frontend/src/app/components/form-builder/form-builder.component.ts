// frontend/src/app/components/form-builder/form-builder.component.ts
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { ItemService } from '../../services/item.service';
import { DocumentService } from '../../services/document.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType
} from 'docx';
import { ItemDatePipe, formatItemDate } from '../../pipes/item-date.pipe';

export interface ResumeItem {
  id: string;
  _id?: string;
  itemTitle: string;
  category?: string;
  itemDate?: string;
  itemDescription: string;
  isCustom?: boolean;
}

export interface ResumeSection {
  id: string;
  title: string;
  items: ResumeItem[];
}

export interface DocumentHeader {
  fullName: string;
  titleOrRole: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
}

export interface TemplateDefinition {
  name: string;
  description: string;
  title: string;
  header: Partial<DocumentHeader>;
  sections: { title: string; items?: any[] }[];
}

@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, ItemDatePipe],
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.css']
})
export class FormBuilderComponent implements OnInit, AfterViewInit {

  @ViewChild('formeoContainer', { static: false })
  container!: ElementRef;

  @ViewChild('formeoRenderer', { static: false })
  rendererContainer!: ElementRef;

  @ViewChild('printableContent', { static: false })
  printableContentRef!: ElementRef;

  // Document metadata
  documentTitle: string = 'My Resume';
  documentStatus: 'in-progress' | 'done' = 'in-progress';
  existingDocId: string | null = null;
  private _existingData: any = null;
  private _initialMode: string | null = null;

  // Document model
  documentHeader: DocumentHeader = {
    fullName: '',
    titleOrRole: '',
    email: '',
    phone: '',
    location: '',
    summary: ''
  };

  sections: ResumeSection[] = [];
  activeSectionId: string | null = null;

  // Sidebar items and filters
  items: any[] = [];
  draggedItem: any = null;
  searchQuery: string = '';
  selectedCategory: string = 'ALL';
  categories: string[] = ['ALL'];

  // Notification toast
  statusMessage: string = '';
  statusType: 'success' | 'error' | 'info' = 'success';
  statusTimeout: any = null;

  // Template modals
  showTemplateModal: boolean = false;
  showTemplateChoiceModal: boolean = false;
  selectedTemplateKey: string | null = null;

  // Modes
  isPreviewMode: boolean = false;

  // Compatibility properties for tests and legacy interfaces
  editor: any = { isReady: true, formData: {} };
  injectedItems: any[] = [];

  readonly templates: Record<string, TemplateDefinition> = {
    standard: {
      name: 'Standard Professional Resume',
      description: 'Ideal for industry roles, emphasizing experience, education, and technical competencies.',
      title: 'Professional Resume',
      header: {
        titleOrRole: 'Professional Summary',
        summary: 'Results-driven professional with proven expertise in collaborative problem-solving, project leadership, and continuous improvement.'
      },
      sections: [
        { title: 'Work Experience', items: [] },
        { title: 'Education', items: [] },
        { title: 'Skills & Competencies', items: [] },
        { title: 'Key Projects', items: [] }
      ]
    },
    academic: {
      name: 'Academic Curriculum Vitae (CV)',
      description: 'Tailored for faculty, scholars, and researchers focusing on publications, appointments, and teaching.',
      title: 'Academic CV',
      header: {
        titleOrRole: 'Academic Profile',
        summary: 'Dedicated faculty member and researcher with a commitment to student mentorship, scholarly publishing, and service.'
      },
      sections: [
        { title: 'Education', items: [] },
        { title: 'Academic Appointments', items: [] },
        { title: 'Publications & Presentations', items: [] },
        { title: 'Teaching Experience', items: [] },
        { title: 'Grants, Honors & Awards', items: [] },
        { title: 'Institutional Service', items: [] }
      ]
    },
    skills: {
      name: 'Skills-Focused / Functional Resume',
      description: 'Emphasizes key capability clusters and technical expertise for project-based roles.',
      title: 'Technical Resume',
      header: {
        titleOrRole: 'Technical Profile',
        summary: 'Versatile specialist adept at architecting high-quality solutions, modern tooling, and cross-functional collaboration.'
      },
      sections: [
        { title: 'Core Competencies', items: [] },
        { title: 'Selected Projects', items: [] },
        { title: 'Work Experience', items: [] },
        { title: 'Education & Certifications', items: [] }
      ]
    },
    blank: {
      name: 'Clean / Custom Document',
      description: 'A minimal starting layout with a custom section ready for full customization.',
      title: 'Custom Document',
      header: {
        titleOrRole: '',
        summary: ''
      },
      sections: [
        { title: 'Main Section', items: [] }
      ]
    }
  };

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private itemService: ItemService,
    private documentService: DocumentService,
    private router: Router
  ) {}

  @Input() set existingData(value: any) {
    if (!value) return;
    this._existingData = value;
    this.loadDocumentData(value);
  }

  get existingData(): any {
    return this._existingData;
  }

  @Input() set initialMode(mode: string | null) {
    this._initialMode = mode;
    if (mode === 'template' && !this.existingDocId) {
      this.showTemplateModal = true;
    }
  }

  get initialMode(): string | null {
    return this._initialMode;
  }

  get filteredItems(): any[] {
    let list = this.items || [];
    if (this.selectedCategory && this.selectedCategory !== 'ALL') {
      list = list.filter(i => (i.category || '').toLowerCase() === this.selectedCategory.toLowerCase());
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(i =>
        (i.itemTitle || '').toLowerCase().includes(q) ||
        (i.itemDescription || '').toLowerCase().includes(q) ||
        (i.category || '').toLowerCase().includes(q)
      );
    }
    return list;
  }

  ngOnInit(): void {
    this.loadUserItems();

    // Default template if brand new document and not yet populated
    if (!this._existingData && this.sections.length === 0) {
      this.applyTemplate('standard', false);
    }

    // Pre-populate user name and email from session if empty
    const email = this.auth.getUserEmail();
    if (email && !this.documentHeader.email) {
      this.documentHeader.email = email;
      const namePart = email.split('@')[0].replace(/[._-]/g, ' ');
      this.documentHeader.fullName = this.capitalizeWords(namePart);
    }
  }

  ngAfterViewInit(): void {
    // Check initial mode after view init
    if (this._initialMode === 'template' && !this.existingDocId) {
      setTimeout(() => {
        this.showTemplateModal = true;
      }, 200);
    }
  }

  private capitalizeWords(str: string): string {
    return str
      .split(' ')
      .filter(w => w.length > 0)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  loadUserItems(): void {
    const email = this.auth.getUserEmail();
    if (!email) return;

    this.itemService.getItems(email).subscribe({
      next: (data) => {
        this.items = data || [];
        const cats = new Set<string>();
        this.items.forEach(i => {
          if (i.category && i.category.trim()) {
            cats.add(i.category.trim());
          }
        });
        this.categories = ['ALL', ...Array.from(cats)];
      },
      error: (err) => console.error('Failed to load items:', err)
    });
  }

  // ==========================================
  // DOCUMENT RESTORATION & COMPATIBILITY
  // ==========================================

  private loadDocumentData(doc: any): void {
    this.existingDocId = doc._id || null;
    if (doc.title) {
      this.documentTitle = doc.title;
    }

    const rawForm = doc.formData ?? doc.templateJson;
    const normalized = typeof rawForm === 'string' ? this.tryParseJson(rawForm) : rawForm;
    this.documentStatus = doc.status || normalized?.status || 'in-progress';

    // 1. Check for modern structured format: { header, sections }
    if (normalized && Array.isArray(normalized.sections) && normalized.sections.length > 0) {
      this.sections = normalized.sections.map((s: any) => ({
        id: s.id || this.generateId(),
        title: s.title || 'Section',
        items: (s.items || []).map((it: any) => this.normalizeItem(it))
      }));

      if (normalized.header) {
        this.documentHeader = {
          fullName: normalized.header.fullName || '',
          titleOrRole: normalized.header.titleOrRole || '',
          email: normalized.header.email || '',
          phone: normalized.header.phone || '',
          location: normalized.header.location || '',
          summary: normalized.header.summary || ''
        };
      }

      this.syncCompatibilityItems();
      return;
    }

    // 2. Check for legacy injectedItems or sections array
    const legacyItems = doc.injectedItems ?? doc.sections ?? [];
    if (Array.isArray(legacyItems) && legacyItems.length > 0) {
      this.migrateLegacyItems(legacyItems);
      this.syncCompatibilityItems();
      return;
    }

    // 3. Fallback: if no sections found, initialize default template
    if (this.sections.length === 0) {
      this.applyTemplate('standard', false);
    }
    this.syncCompatibilityItems();
  }

  private tryParseJson(str: string): any {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  }

  private normalizeItem(it: any): ResumeItem {
    const rawDate = it.itemDate || it.date || '';
    return {
      id: it.id || it._id || this.generateId(),
      _id: it._id,
      itemTitle: it.itemTitle || it.title || 'Untitled Entry',
      category: it.category || '',
      itemDate: formatItemDate(rawDate) || rawDate,
      itemDescription: it.itemDescription || it.description || '',
      isCustom: !!it.isCustom
    };
  }

  private migrateLegacyItems(rawItems: any[]): void {
    const grouped: Record<string, ResumeItem[]> = {};

    rawItems.forEach(raw => {
      const item = this.normalizeItem(raw);
      const cat = (item.category && item.category.trim()) || 'Work Experience';
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(item);
    });

    const newSections: ResumeSection[] = [];
    Object.keys(grouped).forEach(catName => {
      newSections.push({
        id: this.generateId(),
        title: catName,
        items: grouped[catName]
      });
    });

    // Ensure Education or Skills exists if missing
    if (!grouped['Education']) {
      newSections.push({ id: this.generateId(), title: 'Education', items: [] });
    }
    if (!grouped['Skills']) {
      newSections.push({ id: this.generateId(), title: 'Skills & Competencies', items: [] });
    }

    this.sections = newSections;
  }

  private syncCompatibilityItems(): void {
    this.injectedItems = this.sections.flatMap(s => s.items);
    this.editor.formData = {
      header: this.documentHeader,
      sections: this.sections
    };
  }

  generateId(): string {
    return 'sec-' + Math.random().toString(36).substring(2, 9);
  }

  // ==========================================
  // TEMPLATES
  // ==========================================

  onSelectTemplate(templateKey: string): void {
    if (this.hasExistingContent()) {
      this.selectedTemplateKey = templateKey;
      this.showTemplateChoiceModal = true;
    } else {
      this.applyTemplate(templateKey, 'current');
    }
  }

  hasExistingContent(): boolean {
    return !!(
      this.existingDocId ||
      this.sections.some(s => s.items.length > 0) ||
      (this.documentHeader.summary && this.documentHeader.summary.trim().length > 0)
    );
  }

  applyTemplate(
    templateKey: string,
    modeOrNotice: 'current' | 'new' | boolean = 'current',
    showNotice: boolean = true
  ): void {
    let mode: 'current' | 'new' = 'current';
    let notice = showNotice;

    if (typeof modeOrNotice === 'boolean') {
      notice = modeOrNotice;
      mode = 'current';
    } else if (modeOrNotice === 'new' || modeOrNotice === 'current') {
      mode = modeOrNotice;
    }

    const tpl = this.templates[templateKey] || this.templates['standard'];

    if (mode === 'new') {
      // Clear document ID and cache so it is treated as a brand new document without modifying the current document
      this.existingDocId = null;
      this._existingData = null;
      // Clear ?id= query param from browser URL to detach from the existing document
      window.history.replaceState(null, '', '/documents');
    }

    this.documentTitle = tpl.title;
    this.documentHeader = {
      ...this.documentHeader,
      titleOrRole: tpl.header.titleOrRole || '',
      summary: tpl.header.summary || ''
    };

    this.sections = tpl.sections.map(s => ({
      id: this.generateId(),
      title: s.title,
      items: (s.items || []).map(it => this.normalizeItem(it))
    }));

    this.showTemplateModal = false;
    this.showTemplateChoiceModal = false;
    this.selectedTemplateKey = null;
    this.syncCompatibilityItems();

    if (notice) {
      if (mode === 'new') {
        this.showNotification(`Created new document with template: ${tpl.name}`, 'success');
      } else {
        this.showNotification(`Applied template "${tpl.name}" to current document`, 'info');
      }
    }
  }

  // ==========================================
  // DRAG & DROP AND ITEM PLACEMENT
  // ==========================================

  onDragStart(event: DragEvent, item: any): void {
    this.draggedItem = item;
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', item.itemTitle || '');
      event.dataTransfer.setData('application/json', JSON.stringify(item));
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  onDropToSection(event: DragEvent, section: ResumeSection): void {
    event.preventDefault();
    event.stopPropagation();

    const item = this.getDroppedItem(event);
    if (!item) return;

    this.addItemToSectionObject(section, item);
  }

  onDropToCanvas(event: DragEvent): void {
    event.preventDefault();

    const item = this.getDroppedItem(event);
    if (!item) return;

    // Try finding matching section by category
    const cat = (item.category || '').toLowerCase();
    let targetSection = this.sections.find(s => s.title.toLowerCase().includes(cat));

    if (!targetSection && this.sections.length > 0) {
      targetSection = this.sections[0];
    }

    if (!targetSection) {
      targetSection = {
        id: this.generateId(),
        title: item.category || 'Work Experience',
        items: []
      };
      this.sections.push(targetSection);
    }

    this.addItemToSectionObject(targetSection, item);
  }

  private getDroppedItem(event: DragEvent): any {
    if (this.draggedItem) {
      const it = this.draggedItem;
      this.draggedItem = null;
      return it;
    }

    const raw = event.dataTransfer?.getData('application/json');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return null;
  }

  addItemToSection(sectionId: string | null, rawItem: any): void {
    let section: ResumeSection | undefined;
    if (sectionId) {
      section = this.sections.find(s => s.id === sectionId);
    }
    if (!section && this.sections.length > 0) {
      section = this.sections[0];
    }
    if (!section) {
      section = {
        id: this.generateId(),
        title: rawItem.category || 'Experience',
        items: []
      };
      this.sections.push(section);
    }

    this.addItemToSectionObject(section, rawItem);
  }

  private addItemToSectionObject(section: ResumeSection, rawItem: any): void {
    const rawDate = rawItem.itemDate || '';
    const formattedDate = formatItemDate(rawDate) || rawDate || 'Present';

    const newItem: ResumeItem = {
      id: this.generateId(),
      _id: rawItem._id,
      itemTitle: rawItem.itemTitle || 'Untitled Item',
      category: rawItem.category || section.title,
      itemDate: formattedDate,
      itemDescription: rawItem.itemDescription || '',
      isCustom: false
    };

    section.items.push(newItem);
    this.syncCompatibilityItems();
    this.showNotification(`Added "${newItem.itemTitle}" to ${section.title}`, 'success');
  }

  // ==========================================
  // IN-DOCUMENT ITEM REORDERING & EDITING
  // ==========================================

  moveItemUp(section: ResumeSection, index: number): void {
    if (index <= 0) return;
    const temp = section.items[index];
    section.items[index] = section.items[index - 1];
    section.items[index - 1] = temp;
    this.syncCompatibilityItems();
  }

  moveItemDown(section: ResumeSection, index: number): void {
    if (index >= section.items.length - 1) return;
    const temp = section.items[index];
    section.items[index] = section.items[index + 1];
    section.items[index + 1] = temp;
    this.syncCompatibilityItems();
  }

  removeItem(section: ResumeSection, index: number): void {
    section.items.splice(index, 1);
    this.syncCompatibilityItems();
  }

  removeInjectedItem(itemId: string): void {
    for (const section of this.sections) {
      const idx = section.items.findIndex(it => (it._id === itemId || it.id === itemId));
      if (idx !== -1) {
        section.items.splice(idx, 1);
        break;
      }
    }
    this.syncCompatibilityItems();
  }

  addCustomItem(section: ResumeSection): void {
    const customItem: ResumeItem = {
      id: this.generateId(),
      itemTitle: 'Position Title / Degree / Honor',
      category: section.title,
      itemDate: 'Month Year – Present',
      itemDescription: 'Key achievements, responsibilities, and quantified impact...',
      isCustom: true
    };
    section.items.push(customItem);
    this.syncCompatibilityItems();
  }

  // ==========================================
  // SECTION MANAGEMENT
  // ==========================================

  addSection(): void {
    const newSection: ResumeSection = {
      id: this.generateId(),
      title: 'New Section',
      items: []
    };
    this.sections.push(newSection);
    this.syncCompatibilityItems();
  }

  moveSectionUp(index: number): void {
    if (index <= 0) return;
    const temp = this.sections[index];
    this.sections[index] = this.sections[index - 1];
    this.sections[index - 1] = temp;
    this.syncCompatibilityItems();
  }

  moveSectionDown(index: number): void {
    if (index >= this.sections.length - 1) return;
    const temp = this.sections[index];
    this.sections[index] = this.sections[index + 1];
    this.sections[index + 1] = temp;
    this.syncCompatibilityItems();
  }

  removeSection(index: number): void {
    const sec = this.sections[index];
    if (sec.items.length > 0) {
      if (!confirm(`Delete section "${sec.title}" and its ${sec.items.length} item(s)?`)) {
        return;
      }
    }
    this.sections.splice(index, 1);
    this.syncCompatibilityItems();
  }

  // ==========================================
  // SAVING / UPDATING
  // ==========================================

  saveForm(status: 'in-progress' | 'done' = this.documentStatus || 'in-progress'): void {
    const userEmail = this.auth.getUserEmail();
    if (!userEmail) {
      alert('You must be logged in to save.');
      return;
    }

    this.documentStatus = status;
    const title = (this.documentTitle || '').trim() || 'Untitled Resume';
    this.documentTitle = title;
    this.syncCompatibilityItems();

    const payload = {
      userEmail,
      title,
      status,
      formData: {
        header: this.documentHeader,
        sections: this.sections,
        status
      },
      injectedItems: this.injectedItems,
      templateJson: {
        header: this.documentHeader,
        sections: this.sections,
        status
      },
      sections: this.sections
    };

    const statusLabel = status === 'done' ? 'done' : 'in-progress';

    if (this.existingDocId) {
      this.documentService.updateDocument(this.existingDocId, payload).subscribe({
        next: (res: any) => {
          this._existingData = res;
          this.showNotification(`Document updated as ${statusLabel}!`, 'success');
        },
        error: (err: any) => {
          console.error('Update Error:', err);
          this.showNotification('Failed to update document.', 'error');
        }
      });
    } else {
      this.documentService.createDocument(payload).subscribe({
        next: (res: any) => {
          this._existingData = res;
          this.existingDocId = res._id;
          this.showNotification(`Document saved as ${statusLabel}!`, 'success');
          // Update URL query param so subsequent saves or refreshes keep document context
          window.history.replaceState(null, '', `/documents?id=${res._id}`);
        },
        error: (err: any) => {
          console.error('Save Error:', err);
          this.showNotification('Failed to save document.', 'error');
        }
      });
    }
  }

  showNotification(msg: string, type: 'success' | 'error' | 'info' = 'success'): void {
    this.statusMessage = msg;
    this.statusType = type;
    if (this.statusTimeout) clearTimeout(this.statusTimeout);
    this.statusTimeout = setTimeout(() => {
      this.statusMessage = '';
    }, 3500);
  }

  togglePreview(): void {
    this.isPreviewMode = !this.isPreviewMode;
  }

  // ==========================================
  // EXPORTING (PDF & WORD)
  // ==========================================

  getExportFileBaseName(): string {
    return (this.documentTitle || 'document').replace(/[^\w\- ]/g, '').trim() || 'document';
  }

  async buildCleanExportElement(): Promise<HTMLElement | null> {
    const hasContent = !!(
      (this.documentHeader.fullName && this.documentHeader.fullName.trim()) ||
      (this.documentHeader.titleOrRole && this.documentHeader.titleOrRole.trim()) ||
      (this.documentHeader.email && this.documentHeader.email.trim()) ||
      (this.documentHeader.summary && this.documentHeader.summary.trim()) ||
      this.sections.some(s => s.items.length > 0 || (s.title && s.title.trim())) ||
      (this.injectedItems && this.injectedItems.length > 0)
    );

    if (!hasContent) {
      return null;
    }

    const previewEl = document.getElementById('printableResumeContent') ||
                      document.getElementById('printableResumeContentOffscreen');
    if (previewEl) {
      const clone = previewEl.cloneNode(true) as HTMLElement;
      clone.id = 'cleanResumeExportElement';
      clone.querySelectorAll('button, input, textarea, .no-print').forEach(el => el.remove());
      return clone;
    }

    return this.createProgrammaticExportElement();
  }

  private createProgrammaticExportElement(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'printable-resume';
    container.style.width = '100%';
    container.style.maxWidth = '840px';
    container.style.background = '#ffffff';
    container.style.padding = '40px 48px';
    container.style.boxSizing = 'border-box';
    container.style.color = '#111827';
    container.style.wordBreak = 'break-word';
    container.style.overflowWrap = 'anywhere';
    container.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

    // Header
    const header = document.createElement('header');
    header.className = 'resume-print-header';
    header.style.textAlign = 'center';
    header.style.borderBottom = '2px solid #111827';
    header.style.paddingBottom = '16px';
    header.style.marginBottom = '24px';

    const h1 = document.createElement('h1');
    h1.className = 'print-name';
    h1.style.fontSize = '26px';
    h1.style.fontWeight = '800';
    h1.style.margin = '0 0 6px 0';
    h1.style.color = '#111827';
    h1.textContent = this.documentHeader.fullName || this.documentTitle || 'Resume';
    header.appendChild(h1);

    if (this.documentHeader.titleOrRole) {
      const pTitle = document.createElement('p');
      pTitle.className = 'print-title';
      pTitle.style.fontSize = '15px';
      pTitle.style.fontWeight = '600';
      pTitle.style.color = '#4f46e5';
      pTitle.style.margin = '0 0 8px 0';
      pTitle.textContent = this.documentHeader.titleOrRole;
      header.appendChild(pTitle);
    }

    const contacts = [this.documentHeader.email, this.documentHeader.phone, this.documentHeader.location].filter(Boolean);
    if (contacts.length > 0) {
      const pContacts = document.createElement('div');
      pContacts.className = 'print-contacts';
      pContacts.style.fontSize = '13px';
      pContacts.style.color = '#4b5563';
      pContacts.style.display = 'flex';
      pContacts.style.justifyContent = 'center';
      pContacts.style.gap = '8px';
      pContacts.style.marginBottom = '10px';
      pContacts.textContent = contacts.join(' • ');
      header.appendChild(pContacts);
    }

    if (this.documentHeader.summary) {
      const pSummary = document.createElement('p');
      pSummary.className = 'print-summary';
      pSummary.style.fontSize = '13.5px';
      pSummary.style.lineHeight = '1.55';
      pSummary.style.color = '#374151';
      pSummary.style.textAlign = 'left';
      pSummary.style.margin = '12px 0 0 0';
      pSummary.textContent = this.documentHeader.summary;
      header.appendChild(pSummary);
    }
    container.appendChild(header);

    // Sections
    const secContainer = document.createElement('div');
    secContainer.className = 'print-sections';
    secContainer.style.display = 'flex';
    secContainer.style.flexDirection = 'column';
    secContainer.style.gap = '20px';

    for (const sec of this.sections) {
      if ((!sec.items || sec.items.length === 0) && (!sec.title || !sec.title.trim())) continue;

      const sectionEl = document.createElement('section');
      sectionEl.className = 'print-section';

      const h2 = document.createElement('h2');
      h2.className = 'print-section-title';
      h2.style.fontSize = '15px';
      h2.style.fontWeight = '800';
      h2.style.textTransform = 'uppercase';
      h2.style.color = '#111827';
      h2.style.borderBottom = '1.5px solid #cbd5e1';
      h2.style.paddingBottom = '4px';
      h2.style.margin = '0 0 12px 0';
      h2.textContent = sec.title;
      sectionEl.appendChild(h2);

      const entries = document.createElement('div');
      entries.className = 'print-entries';
      entries.style.display = 'flex';
      entries.style.flexDirection = 'column';
      entries.style.gap = '14px';

      for (const it of sec.items) {
        const article = document.createElement('article');
        article.className = 'print-entry';

        const entryHeader = document.createElement('div');
        entryHeader.className = 'print-entry-header';
        entryHeader.style.display = 'flex';
        entryHeader.style.justifyContent = 'space-between';

        const entryTitle = document.createElement('span');
        entryTitle.className = 'print-entry-title';
        entryTitle.style.fontSize = '14.5px';
        entryTitle.style.fontWeight = '700';
        entryTitle.style.color = '#111827';
        entryTitle.textContent = it.itemTitle;
        entryHeader.appendChild(entryTitle);

        if (it.itemDate) {
          const entryDate = document.createElement('span');
          entryDate.className = 'print-entry-date';
          entryDate.style.fontSize = '13px';
          entryDate.style.fontStyle = 'italic';
          entryDate.style.color = '#6b7280';
          entryDate.textContent = formatItemDate(it.itemDate);
          entryHeader.appendChild(entryDate);
        }
        article.appendChild(entryHeader);

        if (it.itemDescription) {
          const desc = document.createElement('div');
          desc.className = 'print-entry-desc';
          desc.style.marginTop = '6px';
          desc.style.wordBreak = 'break-word';
          desc.style.overflowWrap = 'anywhere';
          for (const line of it.itemDescription.split('\n')) {
            if (!line.trim()) continue;
            const p = document.createElement('p');
            p.className = 'print-desc-line';
            p.style.fontSize = '13.5px';
            p.style.lineHeight = '1.5';
            p.style.color = '#374151';
            p.style.margin = '3px 0';
            p.style.wordBreak = 'break-word';
            p.style.overflowWrap = 'anywhere';
            p.textContent = line;
            desc.appendChild(p);
          }
          article.appendChild(desc);
        }

        entries.appendChild(article);
      }

      sectionEl.appendChild(entries);
      secContainer.appendChild(sectionEl);
    }

    container.appendChild(secContainer);
    return container;
  }

  async exportPdf(): Promise<void> {
    const sourceEl = await this.buildCleanExportElement();
    if (!sourceEl) {
      alert('No document content available to export.');
      return;
    }

    this.showNotification('Generating high-resolution PDF...', 'info');

    sourceEl.style.position = 'fixed';
    sourceEl.style.left = '-10000px';
    sourceEl.style.top = '0';
    sourceEl.style.width = '800px';
    sourceEl.style.background = '#ffffff';
    sourceEl.style.padding = '30px 36px';
    sourceEl.style.boxSizing = 'border-box';
    sourceEl.style.wordBreak = 'break-word';
    sourceEl.style.overflowWrap = 'anywhere';
    document.body.appendChild(sourceEl);

    try {
      const canvas = await html2canvas(sourceEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const marginMm = 12.7; // 0.5 in
      const contentWidth = pageWidth - marginMm * 2;
      const contentHeight = pageHeight - marginMm * 2;

      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', marginMm, marginMm + position, imgWidth, imgHeight);
      heightLeft -= contentHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', marginMm, marginMm + position, imgWidth, imgHeight);
        heightLeft -= contentHeight;
      }

      pdf.save(`${this.getExportFileBaseName()}.pdf`);
      this.showNotification('PDF exported successfully!', 'success');
    } catch (err) {
      console.error('PDF Export Error:', err);
      alert('An error occurred during PDF generation.');
    } finally {
      sourceEl.remove();
    }
  }

  async exportWord(): Promise<void> {
    const hasContent = !!(
      (this.documentHeader.fullName && this.documentHeader.fullName.trim()) ||
      (this.documentHeader.titleOrRole && this.documentHeader.titleOrRole.trim()) ||
      (this.documentHeader.email && this.documentHeader.email.trim()) ||
      (this.documentHeader.summary && this.documentHeader.summary.trim()) ||
      this.sections.some(s => s.items.length > 0) ||
      (this.injectedItems && this.injectedItems.length > 0)
    );

    if (!hasContent) {
      alert('No document content available to export.');
      return;
    }

    try {
      const docChildren: (Paragraph | Table)[] = [];

      const borderless = {
        top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' }
      };

      // 1. Header: Name & Title
      const name = this.documentHeader.fullName.trim() || this.documentTitle;
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: (name || 'RESUME').toUpperCase(),
              bold: true,
              size: 36, // 18pt
              color: '111827',
              font: 'Calibri'
            })
          ],
          spacing: { after: 60 }
        })
      );

      if (this.documentHeader.titleOrRole.trim()) {
        docChildren.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: this.documentHeader.titleOrRole.trim(),
                bold: true,
                color: '4F46E5',
                size: 24, // 12pt
                font: 'Calibri'
              })
            ],
            spacing: { after: 80 }
          })
        );
      }

      // 2. Contact details line
      const contactPieces = [
        this.documentHeader.email,
        this.documentHeader.phone,
        this.documentHeader.location
      ].filter(p => !!p && p.trim());

      if (contactPieces.length > 0) {
        docChildren.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: contactPieces.join('   •   '),
                color: '64748B',
                size: 20, // 10pt
                font: 'Calibri'
              })
            ],
            spacing: { after: 140 }
          })
        );
      }

      // Header Divider Line (matching resume builder)
      docChildren.push(
        new Paragraph({
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 14, color: '111827' }
          },
          spacing: { after: 180 }
        })
      );

      // 3. Summary
      if (this.documentHeader.summary.trim()) {
        docChildren.push(
          new Paragraph({
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 10, color: '4F46E5' }
            },
            children: [
              new TextRun({
                text: 'PROFESSIONAL SUMMARY',
                bold: true,
                size: 22,
                color: '111827',
                font: 'Calibri'
              })
            ],
            spacing: { before: 180, after: 100 }
          })
        );
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: this.documentHeader.summary.trim(),
                size: 20,
                color: '374151',
                font: 'Calibri'
              })
            ],
            spacing: { after: 200 }
          })
        );
      }

      // 4. Sections & Entries
      for (const sec of this.sections) {
        if (!sec.title.trim() && sec.items.length === 0) continue;

        docChildren.push(
          new Paragraph({
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 10, color: '4F46E5' }
            },
            children: [
              new TextRun({
                text: (sec.title.trim() || 'SECTION').toUpperCase(),
                bold: true,
                size: 22,
                color: '111827',
                font: 'Calibri'
              })
            ],
            spacing: { before: 220, after: 120 }
          })
        );

        for (const item of sec.items) {
          const itemTitle = item.itemTitle || 'Position / Entry';
          const formattedDate = formatItemDate(item.itemDate);

          // 2-column header table for entry: Title & Company on left, Date on right
          const leftCellParagraphs: Paragraph[] = [
            new Paragraph({
              children: [
                new TextRun({
                  text: itemTitle,
                  bold: true,
                  size: 21,
                  color: '111827',
                  font: 'Calibri'
                })
              ]
            })
          ];

          docChildren.push(
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: borderless,
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 75, type: WidthType.PERCENTAGE },
                      children: leftCellParagraphs
                    }),
                    new TableCell({
                      width: { size: 25, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.RIGHT,
                          children: [
                            new TextRun({
                              text: formattedDate,
                              italics: true,
                              size: 19,
                              color: '64748B',
                              font: 'Calibri'
                            })
                          ]
                        })
                      ]
                    })
                  ]
                })
              ]
            })
          );

          if (item.itemDescription && item.itemDescription.trim()) {
            const lines = item.itemDescription
              .split(/\r?\n+/)
              .map(l => l.trim().replace(/^[-•*■]\s*/, ''))
              .filter(l => l.length > 0);

            for (const line of lines) {
              docChildren.push(
                new Paragraph({
                  bullet: { level: 0 },
                  children: [
                    new TextRun({
                      text: line,
                      size: 20,
                      color: '374151',
                      font: 'Calibri'
                    })
                  ],
                  spacing: { after: 40 }
                })
              );
            }
          }

          docChildren.push(new Paragraph({ spacing: { after: 120 } }));
        }
      }

      const doc = new DocxDocument({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 720,    // 0.5 in
                  right: 720,
                  bottom: 720,
                  left: 720
                }
              }
            },
            children: docChildren
          }
        ]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${this.getExportFileBaseName()}.docx`);
      this.showNotification('Word document exported successfully!', 'success');
    } catch (err) {
      console.error('Word Export Error:', err);
      alert('An error occurred during Word document generation.');
    }
  }
}