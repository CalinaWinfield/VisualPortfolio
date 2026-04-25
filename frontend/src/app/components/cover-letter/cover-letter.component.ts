import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { CoverLetter, CoverLetterTemplate } from '../../models/cover-letter.model';
import { CoverLetterService } from '../../services/cover-letter.service';

@Component({
  standalone: true,
  selector: 'app-cover-letter',
  imports: [CommonModule, FormsModule],
  templateUrl: './cover-letter.component.html',
  styleUrls: ['./cover-letter.component.css']
})
export class CoverLetterComponent implements OnInit, OnDestroy {

  templates: Record<string, CoverLetterTemplate>;
  private subscription!: Subscription;

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
    this.subscription = this.coverLetterService.currentLetter$
      .subscribe(letter => {
        if (letter) {
          this.currentLetter = letter;
        }
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  loadTemplate(templateNumber: number): void {
    this.coverLetterService.loadTemplate(templateNumber);
    this.templateStatus = `Template ${templateNumber} loaded!`;

    setTimeout(() => this.templateStatus = '', 2500);
  }

  saveLetter(): void {
    this.coverLetterService.saveCoverLetter(this.currentLetter);
    this.templateStatus = 'Cover letter saved successfully!';

    setTimeout(() => this.templateStatus = '', 2500);
  }

  previewLetter(): void {
    const content = `
      ${this.currentLetter.introduction}

      ${this.currentLetter.body}

      ${this.currentLetter.conclusion}
    `;

    const previewWindow = window.open('', '_blank');

    if (!previewWindow) return;

    previewWindow.document.open();
    previewWindow.document.write(`
      <html>
        <head>
          <title>Cover Letter Preview</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body class="p-4">
          <div class="container">
            <h2 class="mb-4">Cover Letter Preview</h2>
            <div style="white-space: pre-line;">
              ${content}
            </div>
          </div>
        </body>
      </html>
    `);
    previewWindow.document.close();
  }

  exportLetter(): void {
    this.coverLetterService.exportAsPDF(this.currentLetter);
  }
}
