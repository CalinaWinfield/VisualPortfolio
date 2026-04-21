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

      <!-- LEFT SIDE: Draggable Items -->
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
  `,
  styles: [`
    
  /* ============================
     DRAGGABLE ITEM CARDS
     ============================ */
  .item-card {
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 0.75rem;
    cursor: grab;
    transition: background 0.2s ease;
  }

  /* ============================
     FORCE BUILDER LAYOUT OVERRIDES
     ============================ */

  /* Override global height rules */
  :host ::ng-deep .form-builder-page,
  :host ::ng-deep .form-builder-page .builder-layout {
    height: auto !important;
    min-height: 100vh !important;
  }

  /* Force the two-column layout */
  :host ::ng-deep .builder-layout {
    display: flex !important;
    flex-direction: row !important;
    align-items: flex-start !important;
    gap: 1.5rem !important;
    width: 100% !important;
    overflow: hidden !important;
  }

  /* Sidebar */
  :host ::ng-deep .item-panel {
    width: 280px !important;
    min-width: 280px !important;
    max-height: calc(100vh - 150px) !important;
    overflow-y: auto !important;
    background: #ffffff !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 12px !important;
    padding: 1rem !important;
    box-sizing: border-box !important;
  }

  /* Builder shell */
  :host ::ng-deep .builder-shell {
    flex: 1 !important;
    min-height: calc(100vh - 150px) !important;
    overflow: hidden !important;
    background: #f8fafc;
    padding: 2rem;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                0 2px 4px -1px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    text-align: center;
    width: 100%;
  }

  /* Header section */
  .header-section {
    margin-bottom: 1.5rem;
  }

  .builder-sub {
    color: #64748b;
    margin: 0;
    font-size: 0.95rem;
    font-weight: 400;
  }

  /* Action Bar */
  .action-bar {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
  }

  /* Buttons */
  .btn {
    padding: 0.6rem 1.25rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    border: 1px solid transparent;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    outline: none;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    filter: grayscale(100%);
  }

  /* Formeo container */
  .formeo-container {
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    min-height: 900px;
    width: 100%;
    padding: 1rem;
    box-sizing: border-box;
    text-align: left;
    position: relative;
    overflow: hidden;
  }

  .formeo-renderer {
    min-height: 900px;
    background: #fff;
    padding: 1rem;
    border: 2px solid #eee;
  }


   .builder-shell {
       background: #f8fafc; /* Light slate background */
       padding: 2rem;
       border-radius: 16px;
       min-height: 750px;
       box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
       display: flex;
       flex-direction: column;
       text-align: center;
       width: 100%;
     }

     .header-section {
       margin-bottom: 1.5rem;
     }

     .header-content h2 {
       margin: 0 0 0.5rem 0;
       color: #1e293b;
       font-size: 1.75rem;
       font-weight: 700;
     }

     .builder-sub {
       color: #64748b;
       margin: 0;
       font-size: 0.95rem;
       font-weight: 400;
     }

     /* --- Action Bar --- */
     .action-bar {
       display: flex;
       justify-content: center;
       gap: 1rem;
       margin-top: 1.5rem;
       padding-bottom: 1.5rem;
       border-bottom: 1px solid #e2e8f0;
     }

     /* --- Buttons --- */
     .btn {
       padding: 0.6rem 1.25rem;
       border-radius: 8px;
       font-weight: 600;
       font-size: 0.95rem;
       cursor: pointer;
       transition: all 0.2s ease-in-out;
       border: 1px solid transparent;
       display: flex;
       align-items: center;
       gap: 0.5rem;
       outline: none;
     }

     .btn:disabled {
       opacity: 0.5;
       cursor: not-allowed;
       filter: grayscale(100%);
     }

     /* Preview Button (Secondary/Outline) */
     .btn-preview {
       background-color: #ffffff;
       color: #475569;
       border-color: #cbd5e1;
     }

     .btn-preview:hover:not(:disabled) {
       background-color: #f1f5f9;
       border-color: #94a3b8;
       color: #0f172a;
     }

     .btn-preview.btn-active {
       background-color: #e0e7ff;
       color: #4338ca;
       border-color: #4338ca;
     }

     /* Save Button (Primary) */
     .btn-save {
       background-color: #4f46e5; /* Indigo 600 */
       color: #ffffff;
       box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
     }

     .btn-save:hover:not(:disabled) {
       background-color: #4338ca; /* Indigo 700 */
       transform: translateY(-1px);
       box-shadow: 0 6px 8px -1px rgba(79, 70, 229, 0.3);
     }

     .btn-save:active:not(:disabled) {
       transform: translateY(0);
     }

     /* --- Form Containers --- */
     .formeo-container {
       background: #ffffff;
       border-radius: 12px;
       border: 1px solid #e2e8f0;
       min-height: 900px;
       width: 100%;
       padding: 1rem; /* Breathing room inside the card */
       box-sizing: border-box;
       text-align: left; /* Formeo renders left-aligned */
       position: relative;
       overflow: hidden;
     }

     /* Optional: Specific style for preview mode to distinguish it */
     .renderer-mode {
       border-color: #bfdbfe; /* Light blue border for preview */
       background-color: #fafbff;
     }
.formeo-renderer {
  min-height: 900px;
  background: #fff;
  padding: 1rem;
  border: 2px solid #eee;
}
     /* Ensure Formeo icons/text align nicely */
     .icon {
       font-size: 1.1rem;
       line-height: 1;
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
