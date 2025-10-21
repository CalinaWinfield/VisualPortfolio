import { Component, OnInit } from '@angular/core';
import { CoverLetter, CoverLetterTemplate } from '../../models/cover-letter.model';
import { CoverLetterService } from '../../services/cover-letter.service';

@Component({
  selector: 'app-cover-letter',
  templateUrl: './cover-letter.component.html',
  styleUrls: ['./cover-letter.component.css']
})
export class CoverLetterComponent implements OnInit {
  templates: Record<string, CoverLetterTemplate>;
  currentLetter: CoverLetter = {
    template: 0,
    introduction: '',
    body: '',
    conclusion: '',
    lastModified: new Date()
  };
  templateStatus = '';
  currentYear = new Date().getFullYear();
  
  userProfile = {
    name: 'User Name',
    email: 'user@example.com'
  };

  constructor(private coverLetterService: CoverLetterService) {
    this.templates = this.coverLetterService.getTemplates();
  }

  ngOnInit(): void {
    this.coverLetterService.currentLetter$.subscribe(letter => {
      if (letter) {
        this.currentLetter = letter;
      }
    });
  }

  loadTemplate(templateNumber: number): void {
    this.coverLetterService.loadTemplate(templateNumber);
    this.templateStatus = `Template ${templateNumber} loaded!`;
  }

  saveLetter(): void {
    this.coverLetterService.saveCoverLetter(this.currentLetter);
    this.templateStatus = 'Cover letter saved successfully!';
  }

  previewLetter(): void {
    const content = `${this.currentLetter.introduction}\n\n${this.currentLetter.body}\n\n${this.currentLetter.conclusion}`;
    const previewWindow = window.open();
    if (previewWindow) {
      previewWindow.document.write(`
        <html><head><title>Preview</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        </head><body><div class="container">
        <h1>Cover Letter Preview</h1>
        <p>${content.replace(/\n/g, "<br>")}</p>
        </div></body></html>`);
      previewWindow.document.close();
    }
  }

  exportLetter(): void {
    this.coverLetterService.exportAsPDF(this.currentLetter);
  }
}