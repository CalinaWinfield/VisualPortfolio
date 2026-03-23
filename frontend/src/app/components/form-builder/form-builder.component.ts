import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-form-builder',
  standalone: true,
  template: `
    <div class="builder-shell">
      <h2>Document Builder</h2>
      <p class="builder-sub">Drag elements to build your document</p>

      <div #formeoContainer class="formeo-container"></div>

      <button (click)="saveForm()">Save Form</button>
    </div>
  `,
  styles: [`
    .builder-shell {
      background: #fff;
      padding: 2rem;
      border-radius: 16px;
      min-height: 700px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      text-align: center;
    }

    .builder-shell .formeo-controls {
      background: #fafafa !important;
    }

    .builder-sub {
      color: #777;
      margin-bottom: 1rem;
      font-size: 0.95rem;
    }

    .formeo-container {
      min-height: 600px;
      width: 100%;
    }
  `]
})
export class FormBuilderComponent implements AfterViewInit {

  @ViewChild('formeoContainer', { static: true })
  container!: ElementRef;

  editor: any; // ✅ store editor instance

  constructor(private http: HttpClient) {} // ✅ inject http

  ngAfterViewInit(): void {
    const f = (window as any).formeo;

    if (!f || !f.FormeoEditor) {
      console.error('Formeo not loaded');
      return;
    }

    setTimeout(() => {
      this.editor = new f.FormeoEditor({
        appendTo: this.container.nativeElement,
        editorContainer: this.container.nativeElement
      });

      console.log('Editor created:', this.editor);
    }, 0);
  }

  saveForm() { // ✅ NOW INSIDE CLASS
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
}

