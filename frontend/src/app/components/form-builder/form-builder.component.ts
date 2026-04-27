// frontend/src/app/form-builder/form-builder.component.ts
import { Component, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormeoDropzoneDirective } from '../../directives/formeo-dropzone.directive';
import { ItemService } from '../../services/item.service';


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
    this.injectedItems = data.injectedItems ? [...data.injectedItems] : [];

    const container = this.container.nativeElement;
    container.querySelectorAll('.injected-item-block')
      .forEach((el: Element) => el.remove());

    if (data.formData && this.editor) {
      try {
        this.editor.formData = data.formData;
      } catch {
        this._existingData = data;
        this.initEditor();
        return;
      }
    }

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

  constructor(private http: HttpClient, private auth: AuthService, private itemService: ItemService) {}

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
      if (this._existingData?.formData) {
        options.formData = this._existingData.formData;
      }

      this.editor = new f.FormeoEditor(options);
      this.observeFormeoSections();

      // Attach native drop listeners
      const container = this.container.nativeElement;
      container.addEventListener('dragover', (e: DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      });
      container.addEventListener('drop', (e: DragEvent) => {
        e.preventDefault();
        if (!this.draggedItem) return;
        this.injectItemBlock(this.draggedItem);
        this.draggedItem = null;
      });

      // ✅ Wait for stage AFTER editor is created, only one call
      if (this._existingData?.injectedItems?.length) {
        this.waitForStageAndInject(this._existingData.injectedItems);
      }

      console.log('Editor created:', this.editor);
    }, 0);
  }

  private initEditorWithData(formData: any): void {
    this._existingData = { ...this._existingData, formData };
    this.initEditor();
  }

  private waitForStageAndInject(items: any[], attempts: number = 0): void {
    const stage = this.container.nativeElement.querySelector('.formeo-stage');

    if (stage) {
      items.forEach(item => this.injectItemBlock(item, true)); // ✅ restore mode
    } else if (attempts < 20) {
      setTimeout(() => this.waitForStageAndInject(items, attempts + 1), 100);
    }
  }

  injectItemBlock(item: any, isRestoring: boolean = false): void {
    const stage = this.container.nativeElement.querySelector('.formeo-stage');
    if (!stage) {
      setTimeout(() => this.injectItemBlock(item, isRestoring), 100);
      return;
    }

    const block = document.createElement('div');
    block.classList.add('injected-item-block');
    block.setAttribute('data-item-id', item._id);

    block.innerHTML = `
      <div class="injected-item-inner">
        <span class="injected-category">${item.category ?? ''}</span>
        <strong class="injected-title">${item.itemTitle}</strong>
        <p class="injected-desc">${item.itemDescription ?? ''}</p>
        <button class="injected-remove" title="Remove">✕</button>
      </div>
    `;

    block.querySelector('.injected-remove')?.addEventListener('click', () => {
      block.remove();
      this.injectedItems = this.injectedItems.filter(i => i._id !== item._id);
    });

    stage.appendChild(block);

    // ✅ ONLY push if it's a NEW drop
    if (!isRestoring) {
      this.injectedItems.push(item);
    }
  }

  togglePreview(): void {
    if (!this.editor) return;
    const f = (window as any).formeo;
    this.isPreviewMode = !this.isPreviewMode;

    if (this.isPreviewMode) {
      // Small delay to ensure the [hidden] or *ngIf container is in the DOM
      setTimeout(() => {

        const rawData = this.editor.formData;

        // 1. Initialize with the container target
        const renderer = new f.FormeoRenderer({
          renderContainer: this.rendererContainer.nativeElement,
        });

        // 2. Call render with the data
        renderer.render(rawData);
      }, 50);
    } else {
      // BACK TO EDITOR MODE
      this.rendererContainer.nativeElement.innerHTML = '';

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

    // CRITICAL: We must match the backend route's expected keys
    const payload = {
      ownerEmail: userEmail,      // Backend expects 'ownerEmail', not 'userEmail'
      title: title,
      templateJson: data,         // Backend expects 'templateJson', not 'formData'
      sections: this.injectedItems // Backend expects 'sections', not 'injectedItems'
    };

    if (isExisting) {
      this.http.put(`http://localhost:5001/api/documents/${this._existingData._id}`, payload)
        .subscribe({
          next: (res) => alert('Update Successful!'), 
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

    this.renderer.render(formData);
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
