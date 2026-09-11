import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
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
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle
} from 'docx';

import { CoverLetter, CoverLetterTemplate } from '../../models/cover-letter.model';
import { CoverLetterService } from '../../services/cover-letter.service';
import { DocumentService } from '../../services/document.service';
import { AuthService } from '../auth.service';

@Component({
  standalone: true,
  selector: 'app-cover-letter',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cover-letter.component.html',
  styleUrls: ['./cover-letter.component.css']
})
export class CoverLetterComponent implements OnInit, OnDestroy {
  templates: Record<string, CoverLetterTemplate>;
  private subscription!: Subscription;

  existingDocId: string | null = null;
  documentTitle: string = 'Professional Cover Letter';
  documentStatus: 'in-progress' | 'done' = 'in-progress';
  selectedTemplate: number = 1;
  isPreviewMode: boolean = false;
  isSaving: boolean = false;

  statusMessage: string = '';
  statusType: 'success' | 'danger' | 'info' = 'success';
  private statusTimer: any = null;

  bulletPointsText: string = '';

  currentLetter: CoverLetter = {
    template: 1,
    sender: {
      firstName: '',
      lastName: '',
      address: '',
      phone: '',
      email: ''
    },
    recipient: {
      date: '',
      name: '',
      title: '',
      company: '',
      address: '',
      cityStateZip: '',
      phone: '',
      email: ''
    },
    content: {
      salutation: '',
      intro: '',
      body: '',
      bulletPoints: [],
      conclusion: '',
      signOff: '',
      signatureName: ''
    },
    status: 'in-progress',
    docType: 'cover-letter'
  };

  currentYear = new Date().getFullYear();

  constructor(
    private coverLetterService: CoverLetterService,
    private documentService: DocumentService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.templates = this.coverLetterService.getTemplates();
  }

  get userProfile() {
    return {
      name: `${this.currentLetter.sender.firstName} ${this.currentLetter.sender.lastName}`.trim() || 'User',
      email: this.currentLetter.sender.email || this.auth.getUserEmail() || ''
    };
  }

  ngOnInit(): void {
    // 1. Initialize with template 1 by default
    this.loadTemplate(1, false);

    // 2. Prefill user email if available
    const userEmail = this.auth.getUserEmail();
    if (userEmail && !this.currentLetter.sender.email) {
      this.currentLetter.sender.email = userEmail;
    }

    // 3. Listen to route params & query params for document id
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadDocument(id);
      }
    });

    this.route.queryParamMap.subscribe(queryParams => {
      const id = queryParams.get('id');
      const tpl = queryParams.get('template');
      if (tpl) {
        const num = parseInt(tpl, 10);
        if ([1, 2, 3].includes(num)) {
          this.loadTemplate(num, false);
        }
      }
      if (id && !this.route.snapshot.paramMap.get('id')) {
        this.loadDocument(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    if (this.statusTimer) {
      clearTimeout(this.statusTimer);
    }
  }

  loadDocument(id: string): void {
    this.documentService.getDocumentById(id).subscribe({
      next: (doc) => {
        if (!doc) return;
        this.existingDocId = doc._id;
        this.documentTitle = doc.title || 'Cover Letter';
        this.documentStatus = (doc.status === 'done' ? 'done' : 'in-progress');

        const data = doc.formData || {};
        if (data.sender) {
          this.currentLetter = {
            _id: doc._id,
            id: doc._id,
            title: doc.title,
            template: data.template || 1,
            sender: { ...data.sender },
            recipient: { ...data.recipient },
            content: { ...data.content },
            status: this.documentStatus,
            docType: 'cover-letter'
          };
          this.selectedTemplate = data.template || 1;
          this.syncBulletPointsFromModel();
        } else if (doc.formData?.currentLetter) {
          this.currentLetter = { ...doc.formData.currentLetter };
          this.selectedTemplate = this.currentLetter.template || 1;
          this.syncBulletPointsFromModel();
        }
        this.showNotification('Cover letter loaded successfully!', 'info');
      },
      error: (err) => {
        console.error('Failed to load cover letter', err);
        this.showNotification('Failed to load saved document.', 'danger');
      }
    });
  }

  loadTemplate(templateNumber: number, showNotify: boolean = true): void {
    this.selectedTemplate = templateNumber;
    const defaultData = this.coverLetterService.getDefaultLetter(templateNumber);
    this.currentLetter = defaultData;
    this.documentTitle = defaultData.title || `Cover Letter (Template ${templateNumber})`;
    this.syncBulletPointsFromModel();

    if (showNotify) {
      this.showNotification(`Template ${templateNumber} (${defaultData.sender.firstName} ${defaultData.sender.lastName} layout) loaded!`, 'info');
    }
  }

  onBulletsChange(): void {
    const lines = this.bulletPointsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    this.currentLetter.content.bulletPoints = lines;
  }

  private syncBulletPointsFromModel(): void {
    if (this.currentLetter.content.bulletPoints && this.currentLetter.content.bulletPoints.length > 0) {
      this.bulletPointsText = this.currentLetter.content.bulletPoints.join('\n');
    } else {
      this.bulletPointsText = '';
    }
  }

  saveLetter(status: 'in-progress' | 'done' = this.documentStatus): void {
    const userEmail = this.auth.getUserEmail() || this.currentLetter.sender.email;
    if (!userEmail) {
      this.showNotification('You must be logged in to save your cover letter.', 'danger');
      return;
    }

    this.documentStatus = status;
    this.currentLetter.status = status;
    this.currentLetter.title = this.documentTitle;
    this.currentLetter.template = this.selectedTemplate;
    this.isSaving = true;

    // Save copy to local storage
    this.coverLetterService.saveCoverLetter(this.currentLetter);

    const payload = {
      title: this.documentTitle || 'My Cover Letter',
      userEmail,
      status,
      docType: 'cover-letter',
      formData: {
        ...this.currentLetter,
        docType: 'cover-letter',
        status
      },
      injectedItems: []
    };

    if (this.existingDocId) {
      this.documentService.updateDocument(this.existingDocId, payload).subscribe({
        next: (updated) => {
          this.isSaving = false;
          this.showNotification(`Cover letter updated as ${status}!`, 'success');
        },
        error: (err) => {
          console.error('Update error:', err);
          this.isSaving = false;
          this.showNotification('Failed to update cover letter.', 'danger');
        }
      });
    } else {
      this.documentService.createDocument(payload).subscribe({
        next: (created) => {
          this.isSaving = false;
          this.existingDocId = created._id;
          this.showNotification(`Cover letter saved as ${status}!`, 'success');
        },
        error: (err) => {
          console.error('Create error:', err);
          this.isSaving = false;
          this.showNotification('Failed to save cover letter.', 'danger');
        }
      });
    }
  }

  togglePreview(): void {
    this.isPreviewMode = !this.isPreviewMode;
  }

  previewLetter(): void {
    this.togglePreview();
  }

  exportLetter(): void {
    this.exportPdf();
  }

  async exportPdf(): Promise<void> {
    const paperEl = document.getElementById('coverLetterPaper');
    if (!paperEl) {
      alert('Cover letter paper content not found.');
      return;
    }

    this.showNotification('Generating high-resolution PDF...', 'info');

    try {
      const canvas = await html2canvas(paperEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const marginMm = 10;
      const contentWidth = pageWidth - marginMm * 2;
      const contentHeight = pageHeight - marginMm * 2;

      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', marginMm, marginMm, imgWidth, Math.min(imgHeight, contentHeight));
      const fileName = `${(this.documentTitle || 'cover-letter').toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`;
      pdf.save(fileName);
      this.showNotification('PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error('Failed to export PDF:', err);
      this.showNotification('Failed to generate PDF.', 'danger');
    }
  }

  async exportWord(): Promise<void> {
    const s = this.currentLetter.sender;
    const r = this.currentLetter.recipient;
    const c = this.currentLetter.content;
    const template = this.selectedTemplate || 1;

    try {
      let docx: DocxDocument;

      if (template === 2) {
        docx = this.buildTemplate2Word(s, r, c);
      } else if (template === 3) {
        docx = this.buildTemplate3Word(s, r, c);
      } else {
        docx = this.buildTemplate1Word(s, r, c);
      }

      const blob = await Packer.toBlob(docx);
      const fileName = `${(this.documentTitle || 'cover-letter').toLowerCase().replace(/[^a-z0-9]/g, '-')}.docx`;
      saveAs(blob, fileName);
      this.showNotification('Word document downloaded successfully!', 'success');
    } catch (err) {
      console.error('Word export error:', err);
      this.showNotification('Failed to generate Word document.', 'danger');
    }
  }

  private buildTemplate1Word(s: any, r: any, c: any): DocxDocument {
    const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim();
    const children: (Paragraph | Table)[] = [];

    // Header: Modern Red Accent
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: (s.firstName || '').toUpperCase(),
            size: 42,
            color: 'DC2626',
            font: 'Arial'
          }),
          new TextRun({
            text: s.lastName ? ` ${s.lastName.toUpperCase()}` : '',
            size: 42,
            bold: true,
            color: '991B1B',
            font: 'Arial'
          })
        ],
        spacing: { after: 60 }
      })
    );

    // Red solid accent line
    children.push(
      new Paragraph({
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 16, color: 'DC2626' }
        },
        spacing: { after: 120 }
      })
    );

    // Contact bar
    const contactParts = [s.address, s.phone, s.email].filter(Boolean).join('  |  ');
    if (contactParts) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: contactParts,
              size: 20,
              color: '334155',
              font: 'Arial'
            })
          ],
          spacing: { after: 260 }
        })
      );
    } else {
      children.push(new Paragraph({ spacing: { after: 200 } }));
    }

    // Date
    if (r.date) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: r.date,
              size: 21,
              color: '0F172A',
              font: 'Arial'
            })
          ],
          spacing: { after: 200 }
        })
      );
    }

    // Recipient
    const recipientParts = [
      r.name ? `${r.name}${r.title ? ', ' + r.title : ''}` : '',
      r.company,
      r.address,
      r.cityStateZip
    ].filter(Boolean);

    recipientParts.forEach(p => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: p,
              size: 21,
              color: '0F172A',
              font: 'Arial'
            })
          ],
          spacing: { after: 40 }
        })
      );
    });

    if (recipientParts.length > 0) {
      children.push(new Paragraph({ spacing: { after: 180 } }));
    }

    // Salutation
    if (c.salutation) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: c.salutation,
              size: 21,
              color: '0F172A',
              font: 'Arial'
            })
          ],
          spacing: { after: 180 }
        })
      );
    }

    // Intro
    if (c.intro) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: c.intro,
              size: 20,
              color: '1E293B',
              font: 'Arial'
            })
          ],
          spacing: { after: 160 }
        })
      );
    }

    // Body
    if (c.body) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: c.body,
              size: 20,
              color: '1E293B',
              font: 'Arial'
            })
          ],
          spacing: { after: 160 }
        })
      );
    }

    // Bullets
    if (c.bulletPoints && c.bulletPoints.length > 0) {
      c.bulletPoints.forEach((pt: string) => {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: pt,
                size: 20,
                color: '1E293B',
                font: 'Arial'
              })
            ],
            spacing: { after: 80 }
          })
        );
      });
      children.push(new Paragraph({ spacing: { after: 80 } }));
    }

    // Conclusion
    if (c.conclusion) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: c.conclusion,
              size: 20,
              color: '1E293B',
              font: 'Arial'
            })
          ],
          spacing: { after: 220 }
        })
      );
    }

    // Sign-off
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: c.signOff || 'Warm regards,',
            size: 21,
            color: '0F172A',
            font: 'Arial'
          })
        ],
        spacing: { after: 80 }
      })
    );

    // Blue Cursive Signature
    const sigName = c.signatureName || fullName;
    if (sigName) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: sigName,
              italics: true,
              size: 42,
              color: '1E40AF',
              font: 'Brush Script MT'
            })
          ],
          spacing: { after: 80 }
        })
      );

      // Printed Name
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: sigName,
              size: 20,
              color: '0F172A',
              font: 'Arial'
            })
          ]
        })
      );
    }

    return new DocxDocument({
      sections: [{
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 }
          }
        },
        children
      }]
    });
  }

  private buildTemplate2Word(s: any, r: any, c: any): DocxDocument {
    const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim();
    const children: (Paragraph | Table)[] = [];

    // Spaced centered header name: M A R I S S A   R U I Z
    const spacedName = fullName.split('').join(' ').toUpperCase();
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: spacedName || 'SENDER NAME',
            bold: true,
            size: 32,
            color: '1E293B',
            font: 'Georgia'
          })
        ],
        spacing: { after: 80 }
      })
    );

    // Centered contact line
    const contactParts = [s.address, s.phone, s.email].filter(Boolean).join('   •   ');
    if (contactParts) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: contactParts,
              size: 19,
              color: '475569',
              font: 'Georgia'
            })
          ],
          spacing: { after: 120 }
        })
      );
    }

    // Subtle centered divider
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: '94A3B8' }
        },
        spacing: { after: 240 }
      })
    );

    // Date
    if (r.date) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: r.date,
              size: 21,
              color: '1E293B',
              font: 'Georgia'
            })
          ],
          spacing: { after: 180 }
        })
      );
    }

    // Recipient
    const recipientParts = [
      r.name ? `${r.name}${r.title ? ', ' + r.title : ''}` : '',
      r.company,
      r.address,
      r.cityStateZip
    ].filter(Boolean);

    recipientParts.forEach(p => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: p,
              size: 21,
              color: '1E293B',
              font: 'Georgia'
            })
          ],
          spacing: { after: 40 }
        })
      );
    });

    if (recipientParts.length > 0) {
      children.push(new Paragraph({ spacing: { after: 180 } }));
    }

    // Salutation
    if (c.salutation) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: c.salutation,
              size: 21,
              color: '1E293B',
              font: 'Georgia'
            })
          ],
          spacing: { after: 180 }
        })
      );
    }

    // Intro
    if (c.intro) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: c.intro,
              size: 21,
              color: '1E293B',
              font: 'Georgia'
            })
          ],
          spacing: { after: 160 }
        })
      );
    }

    // Body
    if (c.body) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: c.body,
              size: 21,
              color: '1E293B',
              font: 'Georgia'
            })
          ],
          spacing: { after: 160 }
        })
      );
    }

    // Bullets
    if (c.bulletPoints && c.bulletPoints.length > 0) {
      c.bulletPoints.forEach((pt: string) => {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: pt,
                size: 21,
                color: '1E293B',
                font: 'Georgia'
              })
            ],
            spacing: { after: 80 }
          })
        );
      });
      children.push(new Paragraph({ spacing: { after: 80 } }));
    }

    // Conclusion
    if (c.conclusion) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: c.conclusion,
              size: 21,
              color: '1E293B',
              font: 'Georgia'
            })
          ],
          spacing: { after: 220 }
        })
      );
    }

    // Sign-off
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: c.signOff || 'Sincerely,',
            size: 21,
            color: '1E293B',
            font: 'Georgia'
          })
        ],
        spacing: { after: 80 }
      })
    );

    // Blue Cursive Signature
    const sigName = c.signatureName || fullName;
    if (sigName) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: sigName,
              italics: true,
              size: 42,
              color: '1E40AF',
              font: 'Brush Script MT'
            })
          ],
          spacing: { after: 80 }
        })
      );

      // Printed Name (in classic small caps)
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: sigName,
              size: 21,
              color: '1E293B',
              font: 'Georgia',
              smallCaps: true
            })
          ]
        })
      );
    }

    return new DocxDocument({
      sections: [{
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
            borders: {
              pageBorderTop: { style: BorderStyle.DOUBLE, size: 12, color: '334155' },
              pageBorderBottom: { style: BorderStyle.DOUBLE, size: 12, color: '334155' },
              pageBorderLeft: { style: BorderStyle.DOUBLE, size: 12, color: '334155' },
              pageBorderRight: { style: BorderStyle.DOUBLE, size: 12, color: '334155' }
            }
          }
        },
        children
      }]
    });
  }

  private buildTemplate3Word(s: any, r: any, c: any): DocxDocument {
    const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim();
    const children: (Paragraph | Table)[] = [];

    const borderless = {
      top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' }
    };

    const contactParts = [s.email, s.phone, s.address].filter(Boolean);

    // Full-width navy header banner with amber accent bottom border
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          ...borderless,
          bottom: { style: BorderStyle.SINGLE, size: 18, color: 'D97706' }
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 60, type: WidthType.PERCENTAGE },
                shading: { fill: '1A365D' },
                margins: { top: 260, bottom: 260, left: 260, right: 120 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: (fullName || 'SENDER NAME').toUpperCase(),
                        bold: true,
                        size: 34,
                        color: 'FFFFFF',
                        font: 'Segoe UI'
                      })
                    ]
                  })
                ]
              }),
              new TableCell({
                width: { size: 40, type: WidthType.PERCENTAGE },
                shading: { fill: '1A365D' },
                margins: { top: 260, bottom: 260, left: 120, right: 260 },
                children: contactParts.map((cp, idx) =>
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({
                        text: cp,
                        size: 18,
                        color: 'E2E8F0',
                        font: 'Segoe UI'
                      })
                    ],
                    spacing: { after: idx === contactParts.length - 1 ? 0 : 30 }
                  })
                )
              })
            ]
          })
        ]
      })
    );

    children.push(new Paragraph({ spacing: { after: 240 } }));

    // Date
    if (r.date) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: r.date,
              size: 21,
              color: '1E293B',
              font: 'Segoe UI'
            })
          ],
          spacing: { after: 180 }
        })
      );
    }

    // Recipient
    const recipientParts = [
      r.name ? `${r.name}${r.title ? ', ' + r.title : ''}` : '',
      r.company,
      r.address,
      r.cityStateZip
    ].filter(Boolean);

    recipientParts.forEach(p => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: p,
              size: 21,
              color: '1E293B',
              font: 'Segoe UI'
            })
          ],
          spacing: { after: 40 }
        })
      );
    });

    if (recipientParts.length > 0) {
      children.push(new Paragraph({ spacing: { after: 180 } }));
    }

    // Salutation
    if (c.salutation) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: c.salutation,
              bold: true,
              size: 21,
              color: '1E293B',
              font: 'Segoe UI'
            })
          ],
          spacing: { after: 180 }
        })
      );
    }

    // Intro
    if (c.intro) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: c.intro,
              size: 20,
              color: '334155',
              font: 'Segoe UI'
            })
          ],
          spacing: { after: 160 }
        })
      );
    }

    // Body
    if (c.body) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: c.body,
              size: 20,
              color: '334155',
              font: 'Segoe UI'
            })
          ],
          spacing: { after: 160 }
        })
      );
    }

    // Bullets
    if (c.bulletPoints && c.bulletPoints.length > 0) {
      c.bulletPoints.forEach((pt: string) => {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: pt,
                size: 20,
                color: '334155',
                font: 'Segoe UI'
              })
            ],
            spacing: { after: 80 }
          })
        );
      });
      children.push(new Paragraph({ spacing: { after: 80 } }));
    }

    // Conclusion
    if (c.conclusion) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: c.conclusion,
              size: 20,
              color: '334155',
              font: 'Segoe UI'
            })
          ],
          spacing: { after: 220 }
        })
      );
    }

    // Sign-off
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: c.signOff || 'Best regards,',
            size: 21,
            color: '1E293B',
            font: 'Segoe UI'
          })
        ],
        spacing: { after: 80 }
      })
    );

    // Blue Cursive Signature
    const sigName = c.signatureName || fullName;
    if (sigName) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: sigName,
              italics: true,
              size: 42,
              color: '1E40AF',
              font: 'Brush Script MT'
            })
          ],
          spacing: { after: 80 }
        })
      );

      // Printed Name
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: sigName,
              size: 20,
              color: '1E293B',
              font: 'Segoe UI'
            })
          ]
        })
      );
    }

    return new DocxDocument({
      sections: [{
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 }
          }
        },
        children
      }]
    });
  }

  showNotification(msg: string, type: 'success' | 'danger' | 'info' = 'success'): void {
    this.statusMessage = msg;
    this.statusType = type;
    if (this.statusTimer) clearTimeout(this.statusTimer);
    this.statusTimer = setTimeout(() => {
      this.statusMessage = '';
    }, 3500);
  }
}
