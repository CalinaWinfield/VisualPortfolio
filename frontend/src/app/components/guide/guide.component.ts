import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-guide',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.css']
})
export class GuideComponent implements AfterViewInit {
  currentYear: number = new Date().getFullYear();

  steps = [
    {
      title: 'Navigating the Portfolio Dashboard',
      content: `
        <p>The <strong>Portfolio Dashboard</strong> is your central workspace for managing documents, tracking credentials, and organizing career records:</p>
        <ul>
          <li><strong>Live Statistics</strong>: View real-time counters for your saved documents, career catalog items, and active categories right at the top. Click any counter to jump straight to that section.</li>
          <li><strong>Instant Unified Search</strong>: Use the top search bar to search across all your saved documents and career catalog items simultaneously, with immediate filtering and direct edit links.</li>
          <li><strong>Quick-Action Cards</strong>: Directly create new documents, browse starter templates, or add new catalog items with dedicated one-click buttons.</li>
          <li><strong>Responsive Grids</strong>: View all your saved resumes, CVs, and records in organized card grids with one-click Edit and Delete controls.</li>
        </ul>
      `,
      open: false
    },
    {
      title: 'Managing Your Career & Academic Items',
      content: `
        <p>Build a centralized library of career achievements so you never have to retype credentials when tailoring a resume:</p>
        <ul>
          <li><strong>Create & Organize</strong>: Save work experiences, degrees, certifications, presentations, publications, and skills with dates and descriptions.</li>
          <li><strong>Category Tags</strong>: Group items by category (e.g., <em>Work History</em>, <em>Education</em>, <em>Skills</em>, <em>Projects</em>) for fast sorting.</li>
          <li><strong>Reusable Anywhere</strong>: Every item saved in your catalog is instantly accessible in the Document Builder sidebar to place directly into any document.</li>
          <li><strong>Safe Management</strong>: Easily update details or delete obsolete records with specific confirmation dialogs.</li>
        </ul>
      `,
      open: false
    },
    {
      title: 'Building Documents with the Document Builder',
      content: `
        <p>The <strong>Document Builder</strong> provides a modular, flexible workspace to craft tailored resumes, CVs, and portfolios:</p>
        <ul>
          <li><strong>Stable Two-Row Toolbar</strong>: The top toolbar keeps your document title input on top with a dedicated, zero-jitter notification slot, while action buttons (<em>Templates, Preview, Save Document, Export</em>) sit comfortably on their own row underneath.</li>
          <li><strong>Drag-and-Drop Placement</strong>: Drag items directly from the "Your Items" catalog on the left into any section on the page, or click the quick-add (<strong>+</strong>) button.</li>
          <li><strong>Custom Sections & Entries</strong>: Add new sections, rename section headers, and insert custom entries with inline editing of roles, dates, and bullet points.</li>
          <li><strong>Reorder Entries</strong>: Use the <strong>▲</strong> and <strong>▼</strong> arrow buttons to rearrange entries and sections effortlessly.</li>
          <li><strong>Live Preview</strong>: Switch to <strong>👁️ Preview</strong> mode at any time to inspect your document without editor controls.</li>
        </ul>
      `,
      open: false
    },
    {
      title: 'Choosing & Switching Starter Templates',
      content: `
        <p>Jumpstart your document with curated layouts by clicking <strong>📋 Templates</strong>:</p>
        <ul>
          <li><strong>Curated Formats</strong>: Choose between <em>Standard Professional Resume</em>, <em>Academic Curriculum Vitae (CV)</em>, <em>Skills-Focused / Functional Resume</em>, or a minimal <em>Custom Layout</em>.</li>
          <li><strong>Safe Template Choice</strong>: When choosing a template while editing, you are presented with a clear choice dialog:
            <ul>
              <li><strong>Create as New Document</strong>: Opens the template as a fresh document while leaving your existing document completely unchanged in your account.</li>
              <li><strong>Apply to Current Document</strong>: Replaces the sections of your current document in place.</li>
              <li><strong>Cancel</strong>: Closes the dialog without making any changes.</li>
            </ul>
          </li>
        </ul>
      `,
      open: false
    },
    {
      title: 'Exporting to PDF and Native Word (.docx)',
      content: `
        <p>Export your finalized documents in industry-standard formats ready for job applications, academic submissions, or archival:</p>
        <ul>
          <li><strong>📥 Export PDF</strong>: Generates a clean, print-ready PDF formatted with standard margins and professional typography, omitting all editor controls.</li>
          <li><strong>📝 Export Word (.docx)</strong>: Generates a true native Microsoft Word document using standard OpenXML formatting (headings, bulleted achievements, and bold role titles) fully optimized for Applicant Tracking Systems (ATS).</li>
        </ul>
      `,
      open: false
    }
  ];

  toggleStep(index: number): void {
    this.steps[index].open = !this.steps[index].open;
  }

  ngAfterViewInit(): void {
    const items = document.querySelectorAll('.guide-item');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const index = Array.from(items).indexOf(element);

          element.style.transitionDelay = `${index * 150}ms`;
          element.classList.add('reveal');
        }
      });
    }, { threshold: 0.15 });

    items.forEach(item => observer.observe(item));
  }
}
