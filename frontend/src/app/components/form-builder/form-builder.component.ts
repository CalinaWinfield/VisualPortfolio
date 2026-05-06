// frontend/src/app/form-builder/form-builder.component.ts
import { Component, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormeoDropzoneDirective } from '../../directives/formeo-dropzone.directive';
import { ItemService } from '../../services/item.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormeoDropzoneDirective],
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.css']
})
export class FormBuilderComponent implements AfterViewInit {

  @ViewChild('formeoContainer', { static: false })
  container!: ElementRef;

  @ViewChild('formeoRenderer', { static: false })
  rendererContainer!: ElementRef;

  private _existingData: any = null;

  private normalizeFormData(raw: any): any {
    if (raw == null) return raw;
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    }
    return raw;
  }

  private getEditorCanvasElement(): HTMLElement | null {
    const host = this.container?.nativeElement as HTMLElement | undefined;
    if (!host) return null;
    return (
      host.querySelector('.formeo-stage') ||
      host.querySelector('.frmb-stage')
    ) as HTMLElement | null;
  }

  private cleanupOrphanInjectedBlocks(): void {
    const host = this.container?.nativeElement as HTMLElement | undefined;
    if (!host) return;

    host.querySelectorAll('.injected-item-block').forEach((el) => {
      const inStage = !!(el as HTMLElement).closest('.formeo-stage, .frmb-stage');
      if (!inStage) {
        el.remove();
      }
    });

    // Remove injected text nodes that are not inside an actual Formeo field/control.
    host.querySelectorAll('[data-item-id]').forEach((el) => {
      const inField = !!(el as HTMLElement).closest('.formeo-field, .frmb-control');
      if (!inField) {
        el.remove();
      }
    });
  }

  private hideInternalFormeoSaveButton(): void {
    const host = this.container?.nativeElement as HTMLElement | undefined;
    if (!host) return;

    host.querySelectorAll('button').forEach((btn) => {
      const label = (btn.textContent || '').trim().toLowerCase();
      if (label === 'save') {
        (btn as HTMLElement).style.display = 'none';
      }
      if (label === 'clear') {
        const clearBtn = btn as HTMLElement;
        clearBtn.style.minWidth = '150.53px';
        clearBtn.style.width = '150.53px';
        clearBtn.style.justifyContent = 'center';
        clearBtn.style.borderRadius = '8px';
        clearBtn.style.padding = '8px 14px';

        // Keep Formeo "Clear" in sync with dropped item list.
        if (!clearBtn.dataset['boundClearSync']) {
          clearBtn.addEventListener('click', () => {
            this.injectedItems = [];
            this.removeAllInjectedItemNodes();
          });
          clearBtn.dataset['boundClearSync'] = 'true';
        }
      }
    });
  }

  private removeAllInjectedItemNodes(): void {
    const host = this.container?.nativeElement as HTMLElement | undefined;
    if (!host) return;
    host.querySelectorAll('[data-item-id], .injected-item-block').forEach((el) => el.remove());
  }

  @Input() set existingData(value: any) {
    this._existingData = value;
    // If editor is already initialized, reload with new data
    if (value && this.editor) {
      this.reloadWithData(value);
    }
  }

  get existingData(): any {
    return this._existingData;
  }

  private reloadWithData(data: any): void {
    // ✅ Restore state FIRST
    const incomingInjectedItems = data.injectedItems ?? data.sections ?? [];
    this.injectedItems = Array.isArray(incomingInjectedItems) ? [...incomingInjectedItems] : [];

    const container = this.container.nativeElement;
    container.querySelectorAll('.injected-item-block')
      .forEach((el: Element) => el.remove());

    const incomingFormData = this.normalizeFormData(data.formData ?? data.templateJson);
    if (incomingFormData && this.editor) {
      try {
        this.editor.formData = incomingFormData;
      } catch {
        this._existingData = data;
        this.initEditor();
        return;
      }
    }

    // Restore dropped items directly into the Formeo stage when loading a saved document.
    if (this.injectedItems.length) {
      this.waitForStageAndInject(this.injectedItems);
    }
  }

  editor: any;
  renderer: any;
  formData: any = null;

  isPreviewMode = false;

  items: any[] = [];
  draggedItem: any = null;
  injectedItems: any[] = [];

  get documentItems(): any[] {
    // Only render items that were explicitly dropped into the document.
    return this.injectedItems;
  }

  constructor(private http: HttpClient, private auth: AuthService, private itemService: ItemService) {}

  private getExportFileBaseName(): string {
    return (this._existingData?.title || 'document').replace(/[^\w\- ]/g, '').trim() || 'document';
  }

  private getExportSourceElement(): HTMLElement | null {
    if (this.isPreviewMode && this.rendererContainer?.nativeElement) {
      return this.rendererContainer.nativeElement as HTMLElement;
    }
    if (this.container?.nativeElement) {
      return this.container.nativeElement as HTMLElement;
    }
    return null;
  }

  private appendDocumentItemsHtml(target: HTMLElement): void {
    if (!this.documentItems.length) return;
    const itemHtml = this.documentItems.map((item) => `
      <p class="preview-item-desc">${item.itemDescription ?? ''}</p>
    `).join('');
    target.insertAdjacentHTML('beforeend', `<div class="preview-item-list">${itemHtml}</div>`);
  }

  private stripInteractiveEditorElements(root: HTMLElement): void {
    // Convert injected card blocks to plain text before stripping UI.
    root.querySelectorAll('.injected-item-block').forEach((card) => {
      const desc = (card.querySelector('.injected-desc') as HTMLElement | null)?.textContent?.trim() || '';
      if (desc) {
        const p = document.createElement('p');
        p.className = 'preview-item-desc';
        p.textContent = desc;
        card.replaceWith(p);
      } else {
        card.remove();
      }
    });

    const selectors = [
      '.injected-remove',
      '.drop-zone',
      '.component-handle',
      '.frmb-control',
      '.formeo-control',
      '.frmb-controls',
      '.formeo-controls',
      '.f-field-actions',
      'button',
      'input',
      'select',
      'textarea',
      'option'
    ];
    root.querySelectorAll(selectors.join(',')).forEach((el) => el.remove());

    // Remove any remaining builder/config UI nodes by class pattern.
    root.querySelectorAll('*').forEach((el) => {
      const className = (el as HTMLElement).className;
      if (typeof className !== 'string') return;
      const c = className.toLowerCase();
      if (
        c.includes('control') ||
        c.includes('toolbar') ||
        c.includes('menu') ||
        c.includes('handle') ||
        c.includes('action') ||
        c.includes('condition') ||
        c.includes('rule') ||
        c.includes('setting') ||
        c.includes('config')
      ) {
        el.remove();
      }
    });

    // Remove builder placeholder helper text.
    root.querySelectorAll('p, span, div').forEach((el) => {
      const text = (el.textContent || '').trim().toLowerCase();
      if (text === 'drop items here' || text === 'drop item here') {
        el.remove();
      }
    });

    // Remove common Formeo editor metadata labels that can leak into preview.
    const editorLabels = new Set([
      'stage',
      'row',
      'column',
      'field',
      'conditions',
      'attributes',
      'configuration',
      'tag',
      'class',
      'class name'
    ]);

    root.querySelectorAll('*').forEach((el) => {
      const text = (el.textContent || '').trim().toLowerCase();
      if (!text) return;
      const isSimpleLabel = el.children.length === 0 || text.split(/\s+/).length <= 2;
      if (isSimpleLabel && editorLabels.has(text)) {
        el.remove();
      }
    });

    // Remove leftover marker-only glyph nodes (bullets/squares) from editor tree UI.
    root.querySelectorAll('*').forEach((el) => {
      const text = (el.textContent || '').trim();
      if (!text) return;

      const hasReadableText = /[a-zA-Z0-9]/.test(text);
      const markerCharsOnly = /^[\s•◦▪▫·\-●○■□◆◇◉◌◘◙\u25A0\u25A1\u25AA\u25AB\u2219]+$/.test(text);
      const shortSymbolChunk = text.length <= 8 && !hasReadableText;
      if (markerCharsOnly || shortSymbolChunk) {
        el.remove();
      }
    });

    // Remove list items that are only visual markers and contain no readable text.
    root.querySelectorAll('li').forEach((li) => {
      const text = (li.textContent || '').trim();
      const hasReadableText = /[a-zA-Z0-9]/.test(text);
      if (!hasReadableText) {
        li.remove();
      }
    });

    // Hard-disable list marker rendering in the cleaned DOM.
    root.querySelectorAll('ul, ol').forEach((list) => {
      const el = list as HTMLElement;
      el.style.listStyle = 'none';
      el.style.marginLeft = '0';
      el.style.paddingLeft = '0';
    });
    root.querySelectorAll('li').forEach((li) => {
      const el = li as HTMLElement;
      el.style.listStyle = 'none';
      el.style.marginLeft = '0';
      el.style.paddingLeft = '0';
    });
  }

  private buildContentFromEditorDom(): HTMLElement | null {
    const stage = this.getEditorCanvasElement();
    if (!stage) return null;

    const clone = stage.cloneNode(true) as HTMLElement;
    this.stripInteractiveEditorElements(clone);
    this.flattenInjectedBlocks(clone);
    return clone;
  }

  private flattenInjectedBlocks(root: HTMLElement): void {
    const toFlatten = root.querySelectorAll('.injected-item-block, .preview-item-block');
    toFlatten.forEach((node) => {
      const el = node as HTMLElement;
      const desc =
        (el.querySelector('.injected-desc, .preview-item-desc') as HTMLElement | null)?.textContent?.trim() ||
        el.textContent?.trim() ||
        '';
      if (!desc) {
        el.remove();
        return;
      }
      const p = document.createElement('p');
      p.className = 'preview-item-desc';
      p.textContent = desc;
      el.replaceWith(p);
    });
  }

  private stripEditorUiElements(root: HTMLElement): void {
    const selectors = [
      'button',
      '.frmb-control',
      '.formeo-control',
      '.formeo-header',
      '.component-handle',
      '.drop-zone',
      '.injected-remove',
      '.frmb-controls',
      '.formeo-controls',
      '.f-field-actions'
    ];
    root.querySelectorAll(selectors.join(',')).forEach((el) => el.remove());
  }

  private async buildCleanExportElement(): Promise<HTMLElement | null> {
    const cleanRoot = document.createElement('div');
    cleanRoot.style.background = '#ffffff';
    cleanRoot.style.color = '#111827';
    cleanRoot.style.padding = '16px';
    cleanRoot.style.width = '900px';

    const editorDomContent = this.buildContentFromEditorDom();
    const usedEditorDom = !!editorDomContent;
    if (editorDomContent) {
      cleanRoot.innerHTML = editorDomContent.innerHTML;
    } else if (this.isPreviewMode && this.rendererContainer?.nativeElement) {
      cleanRoot.innerHTML = (this.rendererContainer.nativeElement as HTMLElement).innerHTML;
    } else {
      const f = (window as any).formeo;
      const rawData = this.normalizeFormData(this.editor?.formData);
      const hasFormeoData = Array.isArray(rawData)
        ? rawData.length > 0
        : !!rawData && Object.keys(rawData).length > 0;

      if (hasFormeoData && f?.FormeoRenderer) {
        const tmp = document.createElement('div');
        const renderer = new f.FormeoRenderer({ renderContainer: tmp });
        renderer.render(rawData);
        cleanRoot.innerHTML = tmp.innerHTML;
      }
    }

    // Only append dropped items as fallback when we could not use editor DOM.
    if (!usedEditorDom) {
      this.appendDocumentItemsHtml(cleanRoot);
    }
    this.stripEditorUiElements(cleanRoot);
    this.flattenInjectedBlocks(cleanRoot);
    // Hard-strip Formeo card/wrapper chrome at DOM level for reliable PDF output.
    cleanRoot
      .querySelectorAll('.formeo-field, .frmb-control, .frmb li, .stage-wrap, .formeo-stage, .frmb-stage, .frmb')
      .forEach((el) => {
        const node = el as HTMLElement;
        node.style.border = 'none';
        node.style.outline = 'none';
        node.style.boxShadow = 'none';
        node.style.background = 'transparent';
        node.style.borderRadius = '0';
      });
    cleanRoot.querySelectorAll('[class*="formeo"], [class*="frmb"]').forEach((el) => {
      const node = el as HTMLElement;
      node.style.boxShadow = 'none';
      node.style.border = node.style.border || 'none';
    });

    if (!cleanRoot.innerText.trim()) return null;
    return cleanRoot;
  }

  private sanitizeForWord(root: HTMLElement): void {
    // Word tends to re-apply bullets for list semantics; flatten lists to paragraphs.
    root.querySelectorAll('li').forEach((li) => {
      const text = (li.textContent || '').trim();
      if (!text) {
        li.remove();
        return;
      }
      const p = document.createElement('p');
      p.className = 'preview-item-desc';
      p.textContent = text;
      li.replaceWith(p);
    });

    root.querySelectorAll('ul, ol').forEach((list) => {
      const parent = list.parentNode;
      if (!parent) return;
      while (list.firstChild) parent.insertBefore(list.firstChild, list);
      list.remove();
    });

    // Remove standalone bullet/marker glyph chunks that can still leak into Word.
    root.querySelectorAll('*').forEach((el) => {
      const text = (el.textContent || '').trim();
      if (!text) return;
      const markerOnly = /^[\s•◦▪▫·\-●○■□◆◇◉◌◘◙\u25A0\u25A1\u25AA\u25AB\u2219]+$/.test(text);
      if (markerOnly) el.remove();
    });
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private extractWordLines(root: HTMLElement): string[] {
    const blockTags = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'DIV', 'LI']);
    let out = '';

    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        out += (node.textContent || '');
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const el = node as HTMLElement;
      const tag = el.tagName.toUpperCase();
      if (tag === 'BR') {
        out += '\n';
        return;
      }

      const isBlock = blockTags.has(tag);
      if (isBlock && !out.endsWith('\n')) out += '\n';
      el.childNodes.forEach(walk);
      if (isBlock && !out.endsWith('\n')) out += '\n';
    };

    walk(root);

    return out
      .split(/\r?\n+/)
      .map((line) => line.replace(/\s+/g, ' ').trim())
      .filter((line) => line.length > 0);
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
    document.body.appendChild(sourceEl);

    const canvas = await html2canvas(sourceEl, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Default PDF margins: 0.5 inch (~12.7 mm) on all sides
    const marginMm = 12.7;
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
    sourceEl.remove();
  }

  async exportWord(): Promise<void> {
    const exportRoot = await this.buildCleanExportElement();
    if (!exportRoot) {
      alert('No document content available to export.');
      return;
    }
    this.sanitizeForWord(exportRoot);
    exportRoot.querySelectorAll('style, script').forEach((el) => el.remove());
    const bodyHtml = exportRoot.innerHTML;

    const title = this._existingData?.title || 'Document';
    const html = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          @page { margin: 0.75in; }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            color: #111827 !important;
            background: #ffffff !important;
          }
          h1, h2, h3, h4, h5, h6 { margin: 0 0 0.45rem 0; font-weight: 700; line-height: 1.2; }
          p, div { margin: 0 0 0.55rem 0; line-height: 1.35; }
          body * {
            color: #111827 !important;
            background: transparent !important;
            border-color: #d1d5db !important;
          }
          ul, ol, li { list-style: none !important; margin-left: 0 !important; padding-left: 0 !important; }
          li::marker { content: '' !important; color: transparent !important; font-size: 0 !important; }
          .formeo-field, .frmb-control, .frmb li, .stage-wrap, .formeo-stage, .frmb-stage, .frmb {
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            background: transparent !important;
            border-radius: 0 !important;
          }
          [class*="formeo"], [class*="frmb"] {
            box-shadow: none !important;
          }
          .preview-item-block {
            border: none !important;
            border-radius: 0 !important;
            padding: 4px 0 !important;
            margin: 8px 0 !important;
          }
          .preview-item-block * {
            border: none !important;
            box-shadow: none !important;
          }
          .preview-item-title { font-weight: 700; }
          .preview-item-meta { color: #6b7280; font-size: 12px; }
          .preview-item-desc { margin: 4px 0 0; }
        </style>
      </head>
      <body>${bodyHtml}</body>
      </html>
    `;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
    saveAs(blob, `${this.getExportFileBaseName()}.doc`);
  }

  // changed to where only the logged-in user's items appear, rather than ALL items
  ngOnInit() {
    const email = this.auth.getUserEmail();
    if (!email) return;

    this.itemService.getItems(email).subscribe({
      next: (data) => { this.items = data; },
      error: (err) => console.error('Failed to load items:', err)
    });
  }

  onDragStart(event: DragEvent, item: any) {
    this.draggedItem = item;
    event.dataTransfer?.setData('text/plain', item.itemTitle);
    event.dataTransfer?.setData('application/json', JSON.stringify(item));
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  }

  private resolveDropField(event: DragEvent): HTMLElement | null {
    const pointTarget = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
    const target = (pointTarget || (event.target as HTMLElement | null));
    return target?.closest('.formeo-field, .frmb-control') as HTMLElement | null;
  }

  private ensureFieldKey(field: HTMLElement | null): string | null {
    if (!field) return null;
    const existing = field.getAttribute('data-inject-field-key');
    if (existing) return existing;
    const generated = `field-${Math.random().toString(36).slice(2, 10)}`;
    field.setAttribute('data-inject-field-key', generated);
    return generated;
  }

  private getFieldIndex(field: HTMLElement | null): number {
    if (!field || !this.container?.nativeElement) return -1;
    const fields = Array.from(
      this.container.nativeElement.querySelectorAll('.formeo-field, .frmb-control')
    ) as HTMLElement[];
    return fields.indexOf(field);
  }

  onDropToDocument(event: DragEvent): void {
    event.preventDefault();
    let droppedItem: any = this.draggedItem;

    const raw = event.dataTransfer?.getData('application/json');
    if (!droppedItem && raw) {
      try {
        droppedItem = JSON.parse(raw);
      } catch {
        droppedItem = null;
      }
    }

    if (!droppedItem) return;

    const dropField = this.resolveDropField(event);
    const fieldKey = this.ensureFieldKey(dropField);
    const fieldId = dropField?.id || dropField?.getAttribute('id') || null;
    const fieldIndex = this.getFieldIndex(dropField);

    // Allow same item to be dropped in multiple sections by keying on item+field.
    const placementKey = `${droppedItem?._id || 'item'}::${fieldKey || fieldId || fieldIndex || 'stage'}`;
    const alreadyAdded = this.injectedItems.some(
      i => `${i?._id || 'item'}::${i?.targetFieldKey || i?.targetFieldId || i?.targetFieldIndex || 'stage'}` === placementKey
    );

    if (!alreadyAdded) {
      const placedItem = {
        ...droppedItem,
        targetFieldKey: fieldKey,
        targetFieldId: fieldId,
        targetFieldIndex: fieldIndex
      };
      this.injectedItems.push(placedItem);
      this.injectItemBlock(placedItem);
    }
    this.draggedItem = null;
  }

  ngAfterViewInit() {
    this.initEditor();
  }

  dropItem(event: any) {
  console.log('Dropped item:', event);
  }

  private initEditor(): void {
    const f = (window as any).formeo;
    if (!f || !f.FormeoEditor) { console.error('Formeo not loaded'); return; }

    setTimeout(() => {
      // Prevent duplicate editor UIs when toggling preview/editor repeatedly.
      this.container.nativeElement.innerHTML = '';

      const options: any = {
        appendTo: this.container.nativeElement,
        editorContainer: this.container.nativeElement,
        controls: {
          groups: [], elements: [],
          disable: { groups: ['common', 'buttons'] }
        },
        events: {
          onChange: (data: any) => { this.formData = data; }
        }
      };

      // Load existing Formeo content if editing
      const existingFormData = this.normalizeFormData(
        this._existingData?.formData ?? this._existingData?.templateJson
      );
      if (existingFormData) {
        options.formData = existingFormData;
      }

      this.editor = new f.FormeoEditor(options);
      this.observeFormeoSections();
      this.cleanupOrphanInjectedBlocks();
      this.hideInternalFormeoSaveButton();

      // Restore dropped items from current in-session state first,
      // then fall back to persisted document data.
      const persistedInjectedItems = this._existingData?.injectedItems ?? this._existingData?.sections ?? [];
      const itemsToRestore = this.injectedItems.length ? this.injectedItems : persistedInjectedItems;
      if (itemsToRestore.length) {
        this.waitForStageAndInject(itemsToRestore);
      }

      console.log('Editor created:', this.editor);
    }, 0);
  }

  private initEditorWithData(formData: any): void {
    this._existingData = { ...this._existingData, formData };
    this.initEditor();
  }

  private waitForStageAndInject(items: any[], attempts: number = 0): void {
    const stage = this.getEditorCanvasElement();

    if (stage) {
      items.forEach(item => this.injectItemBlock(item, true)); // ✅ restore mode
    } else if (attempts < 20) {
      setTimeout(() => this.waitForStageAndInject(items, attempts + 1), 100);
    }
  }

  injectItemBlock(item: any, isRestoring: boolean = false): void {
    const stage = this.getEditorCanvasElement();
    if (!stage) return;

    const explicitFieldTarget = item?.targetFieldKey
      ? this.container?.nativeElement?.querySelector(`[data-inject-field-key="${item.targetFieldKey}"]`)
      : (item?.targetFieldId
          ? this.container?.nativeElement?.querySelector(`[id="${item.targetFieldId}"]`)
          : null);
    const indexedFieldTarget =
      Number.isInteger(item?.targetFieldIndex) && item.targetFieldIndex >= 0
        ? (this.container?.nativeElement?.querySelectorAll('.formeo-field, .frmb-control')?.[item.targetFieldIndex] as HTMLElement | undefined)
        : null;
    const firstFieldTarget =
      this.container?.nativeElement?.querySelector('.formeo-field, .frmb-control') as HTMLElement | null;
    const targetContainer = (explicitFieldTarget as HTMLElement | null) || indexedFieldTarget || firstFieldTarget;
    // Insert plain text content directly into the target field (no card UI).
    if (!targetContainer) return;

    const instanceId = `${item?._id || 'item'}::${item?.targetFieldKey || 'stage'}`;
    const alreadyInjected = targetContainer.querySelector(`[data-item-instance-id="${instanceId}"]`);
    if (alreadyInjected) return;

    const textEl = document.createElement('p');
    textEl.classList.add('injected-desc');
    textEl.setAttribute('data-item-id', item._id);
    textEl.setAttribute('data-item-instance-id', instanceId);
    textEl.textContent = item.itemDescription ?? '';
    targetContainer.appendChild(textEl);
  }

  removeInjectedItem(itemId: string): void {
    this.injectedItems = this.injectedItems.filter(i => i?._id !== itemId);

    const stage = this.container?.nativeElement as HTMLElement | undefined;
    if (!stage) return;
    stage
      .querySelectorAll(`[data-item-id="${itemId}"]`)
      .forEach((el: Element) => el.remove());
  }

  togglePreview(): void {
    if (!this.editor) return;
    this.isPreviewMode = !this.isPreviewMode;

    if (this.isPreviewMode) {
      setTimeout(() => {
        const previewEl = this.rendererContainer?.nativeElement as HTMLElement | undefined;
        if (!previewEl) return;
        previewEl.innerHTML = '';

        const domContent = this.buildContentFromEditorDom();
        if (domContent) {
          previewEl.innerHTML = domContent.innerHTML;
          this.flattenInjectedBlocks(previewEl);
        } else if (this.documentItems.length) {
          this.appendDocumentItemsHtml(previewEl);
          this.flattenInjectedBlocks(previewEl);
        } else {
          previewEl.innerHTML = '<p class="preview-empty">Nothing to preview yet. Add form fields or drop items into the editor.</p>';
        }
      }, 50);
    } else {
      // BACK TO EDITOR MODE
      if (this.rendererContainer?.nativeElement) {
        this.rendererContainer.nativeElement.innerHTML = '';
      }

      // 2. Re-initialize the editor with your existing formData
      this.initEditor();
    }
  }

  handleFormSubmit(formData: any): void {
    console.log('Processing form submission:', formData);

    this.http.post('/api/form-submissions', formData).subscribe({
      next: () => alert('Form submitted successfully!'),
      error: (err) => console.error('Submission error:', err)
    });
  }

  saveForm(): void {
    if (!this.editor) return;

    const data = this.editor.formData;
    const userEmail = this.auth.getUserEmail();

    if (!userEmail) {
      alert('You must be logged in to save.');
      return;
    }

    const isExisting = !!this._existingData?._id;
    let title = this._existingData?.title;

    if (!isExisting) {
      const promptedTitle = prompt('Enter a name for this document:');
      if (!promptedTitle?.trim()) return;
      title = promptedTitle.trim();
    }

    // Use canonical backend keys; include legacy aliases for compatibility.
    const payload = {
      userEmail,
      title: title,
      formData: data,
      injectedItems: this.injectedItems,
      templateJson: data,
      sections: this.injectedItems
    };

    if (isExisting) {
      this.http.put(`http://localhost:5001/api/documents/${this._existingData._id}`, payload)
        .subscribe({
          next: (res: any) => {
            this._existingData = res;
            alert('Update Successful!');
          },
          error: (err) => {
            console.error('Update Error:', err);
            alert('Failed to update. Check console.');
          }
        });
    } else {
      this.http.post('http://localhost:5001/api/documents', payload)
        .subscribe({
          next: (res: any) => {
            this._existingData = res; // Save the returned doc (with its new _id)
            alert('Save Successful!');
          },
          error: (err) => {
            console.error('Save Error:', err);
            alert('Failed to save. Check console.');
          }
        });
    }
  }

  loadAndRenderForm(formData: any): void {
    const f = (window as any).formeo;

    // Clear previous content
    this.rendererContainer.nativeElement.innerHTML = '';

    this.renderer = new f.FormeoRenderer({
      renderContainer: this.rendererContainer.nativeElement,
      // Note: Formeo handles submission via its own internal events
      events: {
        onPostReply: (data: any) => this.handleFormSubmit(data)
      }
    });

    this.renderer.render(this.normalizeFormData(formData));
    this.isPreviewMode = true;
  }

  private attachDropZones() {
    const fields = this.container.nativeElement.querySelectorAll('.formeo-field');

    fields.forEach((field: HTMLElement) => {
      if (field.querySelector('.drop-zone')) return;

      const dropZone = document.createElement('div');
      dropZone.classList.add('drop-zone');

      // ⭐ THIS IS THE MISSING LINE ⭐
      dropZone.setAttribute('formeoDropzone', '');

      dropZone.innerHTML = `<p class="drop-hint">Drop items here</p>`;

      field.appendChild(dropZone);
    });
  }

  private observeFormeoSections() {
    const target = this.container.nativeElement;

    const observer = new MutationObserver(() => {
      this.attachDropZones();
      this.hideInternalFormeoSaveButton();
    });

    observer.observe(target, {
      childList: true,
      subtree: true
    });
  }

  sectionMap: Record<string, any[]> = {};

  handleSectionDrop(event: { sectionId: string, item: any }) {
    if (!event.sectionId) return;

    if (!this.sectionMap[event.sectionId]) {
      this.sectionMap[event.sectionId] = [];
    }

    this.sectionMap[event.sectionId].push(event.item);

    console.log('Updated section map:', this.sectionMap);
  }
}