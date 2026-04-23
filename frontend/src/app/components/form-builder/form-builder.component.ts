import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormeoDropzoneDirective } from '../../directives/formeo-dropzone.directive';


@Component({
  selector: 'app-form-builder',
  standalone: true,
   imports: [CommonModule, DragDropModule, FormeoDropzoneDirective],
  template: `
  <div class="form-builder-page">
    <div class="builder-layout">
      <div
        class="item-panel"
        cdkDropList
        [cdkDropListData]="items"
        (cdkDropListDropped)="dropItem($event)"
      >
        <h3>Your Items</h3>

        <div
          class="item-card"
          *ngFor="let item of items"
          cdkDrag
        >
          {{ item.itemTitle }}
        </div>
      </div>

    <div class="builder-shell">
      <div class="header-section">
        <h2>Document Builder</h2>
        <p class="builder-sub">Drag elements to build your document</p>

        <div class="action-bar">
          <button
            class="btn"
            (click)="togglePreview()"
            [disabled]="!editor"
          >
            {{ isPreviewMode ? '✏️ Back to Editor' : '👁️ Preview' }}
          </button>

          <button
            class="btn"
            (click)="saveForm()"
            [disabled]="!editor"
          >
            💾 Save Form
          </button>
        </div>
      </div>

   <div
    *ngIf="!isPreviewMode"
    #formeoContainer
    class="formeo-container"
    formeoDropzone
    (itemDropped)="handleSectionDrop($event)"
  ></div>
   <div *ngIf="isPreviewMode" #formeoRenderer class="formeo-renderer"></div>
    </div>
    </div>
    </div>
  `,
  styles: [`

  /* ============================
     DRAGGABLE ITEM CARDS
     ============================ */
  .item-card {
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 0.75rem;
    cursor: grab;
    transition: background 0.2s ease;
  }

 /* ============================
    MAIN LAYOUT
    ============================ */
 .form-builder-page {
    max-width: 1400px; /* Use max-width instead of width for flexibility */
      width: 140%;
   min-height: 100vh;
   background-color: #f8fafc;
   overflow-x: hidden;
   padding: 2rem;
   box-sizing: border-box;
       margin-left: -150px;

 }

 .builder-layout {
   display: flex;
   flex-direction: row;
   align-items: flex-start;
   gap: 1rem;
   max-width: 1600px; /* Optional: keeps it from getting too wide on ultrawides */
   margin: 0 auto;
   width: 100%;

 }

 /* ============================
    SIDEBAR (ITEM PANEL)
    ============================ */
 .item-panel {
   width: 320px;
   flex-shrink: 0; /* Prevents sidebar from squishing */
   background: #ffffff;
   border: 1px solid #e2e8f0;
   border-radius: 12px;
   padding: 1.5rem;
   box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
   position: sticky;
   top: 2rem;
 }

 .item-card {
   background: #f1f5f9;
   border: 1px solid #cbd5e1;
   padding: 0.75rem;
   border-radius: 8px;
   margin-bottom: 0.75rem;
   cursor: grab;
   transition: all 0.2s ease;
 }

 .item-card:hover {
   background: #e2e8f0;
 }

 /* ============================
    BUILDER MAIN AREA (SHELL)
    ============================ */
 .builder-shell {
   flex: 1; /* This fills the remaining space */
   display: flex;
   flex-direction: column;
   background: #ffffff;
   border-radius: 16px;
   padding: 2rem;
   box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
   min-height: 800px;

 }

 /* --- Action Bar & Buttons --- */
 .header-section {
   text-align: center;
   margin-bottom: 2rem;
 }

 .action-bar {
   display: flex;
   justify-content: center;
   gap: 1rem;
   margin-top: 1.5rem;
   padding-bottom: 1.5rem;
   border-bottom: 1px solid #e2e8f0;
 }

 .btn {
   padding: 0.6rem 1.25rem;
   border-radius: 8px;
   font-weight: 600;
   cursor: pointer;
   display: flex;
   align-items: center;
   gap: 0.5rem;
   transition: all 0.2s ease;
   border: 1px solid #cbd5e1;
   background: white;
 }

 .btn-save {
   background-color: #4f46e5;
   color: white;
   border: none;
 }

 .btn:disabled {
   opacity: 0.5;
   cursor: not-allowed;
 }

 /* ============================
    FORMEO CONTAINERS
    ============================ */
 .formeo-container,
 .formeo-renderer {
   width: 100%;
   min-height: 600px;
   background: #ffffff;
   border-radius: 12px;
   border: 1px solid #e2e8f0;
   padding: 1.5rem;
   margin-top: 1.5rem;
   text-align: left;
 }

 .formeo-renderer {
   border: 2px solid #bfdbfe; /* Distinguish preview mode */
   background-color: #fafbff;
 }

 /* Angular Specific Overrides (Keep if needed for Formeo internals) */
 :host ::ng-deep .formeo-container * {
   box-sizing: border-box;
 }



  `]

})
export class FormBuilderComponent implements AfterViewInit {

  @ViewChild('formeoContainer', { static: false })
  container!: ElementRef;

  @ViewChild('formeoRenderer', { static: false })
  rendererContainer!: ElementRef;

  editor: any;
  renderer: any;
  formData: any = null;

  isPreviewMode = false;

  items: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get('/api/items').subscribe((data: any) => {
      console.log('Loaded items from API:', data);
      this.items = data;
    });
  }

  ngAfterViewInit() {
    this.initEditor();
  }

  dropItem(event: any) {
  console.log('Dropped item:', event);
  }


  private initEditor(): void {
    const f = (window as any).formeo;


    if (!f || !f.FormeoEditor) {
      console.error('Formeo not loaded');
      return;
    }

    setTimeout(() => {
      this.editor = new f.FormeoEditor({
        appendTo: this.container.nativeElement,
        editorContainer: this.container.nativeElement,



        controls: {
                groups: [],
                elements: [],
                disable: {
                  groups: ['common', 'buttons']
                }
              },


        events: {
            onChange: (data: any) => {
              console.log('Live form data:', data);
              this.formData = data;
            }
          }

      });
      this.observeFormeoSections();

      console.log('Editor created:', this.editor);
    }, 0);
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
    if (!this.editor) {
      console.error('Editor not initialized');
      return;
    }

    const data = this.editor.formData;
    console.log('FORM JSON:', data);

    this.http.post('/api/documents', {
      title: 'My Form',
      formData: data
    }).subscribe({
      next: () => console.log('Saved successfully'),
      error: (err) => console.error(err)
    });
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
