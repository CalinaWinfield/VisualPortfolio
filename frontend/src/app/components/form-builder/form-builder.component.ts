// frontend/src/app/components/form-builder/form-builder.component.ts
import { Component, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.css']
})

export class FormBuilderComponent implements AfterViewInit {

  @ViewChild('formeoContainer', { static: false })
  container!: ElementRef;

  @ViewChild('formeoRenderer', { static: false })
  rendererContainer!: ElementRef;

  @Input() existingData: any = null;

  editor: any;
  renderer: any;
  formData: any = null;

  isPreviewMode = false;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngAfterViewInit() {
    this.initEditor();
  }

  private initEditor(): void {
    const f = (window as any).formeo;
    if (!f || !f.FormeoEditor) { console.error('Formeo not loaded'); return; }

    setTimeout(() => {
      const options: any = {
        appendTo: this.container.nativeElement,
        editorContainer: this.container.nativeElement,
        controls: {
          groups: [],
          elements: [],
          disable: { groups: ['common', 'buttons'] }
        },
        events: {
          onChange: (data: any) => { this.formData = data; }
        }
      };

      // ✅ If editing an existing doc, load its saved data
      if (this.existingData) {
        options.formData = this.existingData;
      }

      this.editor = new f.FormeoEditor(options);
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
    if (!data) {
      alert('Nothing to save yet.');
      return;
    }

    // Prompt user for a document title
    const title = prompt('Enter a name for this document:');
    if (!title?.trim()) {
      alert('A title is required to save.');
      return;
    }

    const userEmail = this.auth.getUserEmail();
    if (!userEmail) {
      alert('You must be logged in to save.');
      return;
    }

    this.http.post('http://localhost:5001/api/documents', {
      title: title.trim(),
      userEmail,
      formData: data
    }).subscribe({
      next: () => alert('Document saved successfully!'),
      error: (err) => console.error('Save failed:', err)
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
}
