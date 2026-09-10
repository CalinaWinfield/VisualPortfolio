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
  BorderStyle
} from 'docx';

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
  imports: [CommonModule, FormsModule],
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
    return {
      id: it.id || it._id || this.generateId(),
      _id: it._id,
      itemTitle: it.itemTitle || it.title || 'Untitled Entry',
      category: it.category || '',
      itemDate: it.itemDate || it.date || '',
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
    const newItem: ResumeItem = {
      id: this.generateId(),
      _id: rawItem._id,
      itemTitle: rawItem.itemTitle || 'Untitled Item',
      category: rawItem.category || section.title,
      itemDate: rawItem.itemDate || 'Present',
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

  saveForm(): void {
    const userEmail = this.auth.getUserEmail();
    if (!userEmail) {
      alert('You must be logged in to save.');
      return;
    }

    const title = (this.documentTitle || '').trim() || 'Untitled Resume';
    this.documentTitle = title;
    this.syncCompatibilityItems();

    const payload = {
      userEmail,
      title,
      formData: {
        header: this.documentHeader,
        sections: this.sections
      },
      injectedItems: this.injectedItems,
      templateJson: {
        header: this.documentHeader,
        sections: this.sections
      },
      sections: this.sections
    };

    if (this.existingDocId) {
      this.documentService.updateDocument(this.existingDocId, payload).subscribe({
        next: (res: any) => {
          this._existingData = res;
          this.showNotification('Document updated successfully!', 'success');
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
          this.showNotification('Document saved successfully!', 'success');
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
      (this.documentHeader.summary && this.documentHeader.summary.trim()) ||
      this.sections.some(s => s.items.length > 0 || (s.title && s.title.trim())) ||
      (this.injectedItems && this.injectedItems.length > 0)
    );

    if (!hasContent) {
      return null;
    }

    const previewEl = document.getElementById('printableResumeContent');
    if (previewEl) {
      const clone = previewEl.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('button, input, textarea, .no-print').forEach(el => el.remove());
      return clone;
    }

    return null;
  }

  async exportPdf(): Promise<void> {
    const sourceEl = await this.buildCleanExportElement();
    if (!sourceEl) {
      alert('No document content available to export.');
      return;
    }

    sourceEl.style.position = 'fixed';
    sourceEl.style.left = '-10000px';
    sourceEl.style.top = '0';
    sourceEl.style.width = '800px';
    sourceEl.style.background = '#ffffff';
    sourceEl.style.padding = '30px 36px';
    sourceEl.style.boxSizing = 'border-box';
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
      (this.documentHeader.summary && this.documentHeader.summary.trim()) ||
      this.sections.some(s => s.items.length > 0) ||
      (this.injectedItems && this.injectedItems.length > 0)
    );

    if (!hasContent) {
      alert('No document content available to export.');
      return;
    }

    try {
      const docChildren: Paragraph[] = [];

      // 1. Header: Name & Title
      const name = this.documentHeader.fullName.trim() || this.documentTitle;
      docChildren.push(
        new Paragraph({
          text: name,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 }
        })
      );

      if (this.documentHeader.titleOrRole.trim()) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: this.documentHeader.titleOrRole.trim(),
                bold: true,
                color: '4F46E5',
                size: 24
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
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
            children: [
              new TextRun({
                text: contactPieces.join('   |   '),
                color: '64748B',
                size: 20
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 }
          })
        );
      }

      // 3. Summary
      if (this.documentHeader.summary.trim()) {
        docChildren.push(
          new Paragraph({
            text: 'Professional Summary',
            heading: HeadingLevel.HEADING_2,
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 8, color: 'CBD5E1' }
            },
            spacing: { before: 240, after: 120 }
          })
        );
        docChildren.push(
          new Paragraph({
            text: this.documentHeader.summary.trim(),
            spacing: { after: 200 }
          })
        );
      }

      // 4. Sections & Entries
      for (const sec of this.sections) {
        if (!sec.title.trim() && sec.items.length === 0) continue;

        docChildren.push(
          new Paragraph({
            text: sec.title.trim() || 'Section',
            heading: HeadingLevel.HEADING_2,
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 8, color: 'CBD5E1' }
            },
            spacing: { before: 280, after: 140 }
          })
        );

        for (const item of sec.items) {
          const itemTitle = item.itemTitle || 'Position / Entry';
          const metaParts = [item.category, item.itemDate].filter(p => !!p && p.trim());
          const metaText = metaParts.length > 0 ? `  (${metaParts.join('  •  ')})` : '';

          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: itemTitle, bold: true, size: 22 }),
                new TextRun({ text: metaText, italics: true, color: '64748B', size: 20 })
              ],
              spacing: { before: 120, after: 60 }
            })
          );

          if (item.itemDescription && item.itemDescription.trim()) {
            const lines = item.itemDescription
              .split(/\r?\n+/)
              .map(l => l.trim().replace(/^[-•*]\s*/, ''))
              .filter(l => l.length > 0);

            for (const line of lines) {
              docChildren.push(
                new Paragraph({
                  text: line,
                  bullet: { level: 0 },
                  spacing: { after: 60 }
                })
              );
            }
          }
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