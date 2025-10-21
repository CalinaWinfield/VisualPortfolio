import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CoverLetterTemplate, CoverLetter } from '../models/cover-letter.model';

@Injectable({
  providedIn: 'root'
})
export class CoverLetterService {
  private templates: Record<string, CoverLetterTemplate> = {
    template1: {
      introduction: `[Your Name]\n[Your Address] | [Your Phone Number] | [Your Email]\n\n[Date]\n\n[Hiring Manager's Name], [Job Title]\n[Company Name]\n[Company Address]\n\nDear [Hiring Manager's Name],\n\nWhile viewing job ads online, I came across your request for a [Job Title]. I am very interested in this position and wanted to take this opportunity to introduce myself.`,
      body: `I am a [describe your skills, e.g., fast learner, team player] and am skilled at [list key skills, e.g., learning new products quickly, processing payments, assisting customers]. I understand the value of [mention a key value, e.g., time management, customer satisfaction] and am great at getting things done quickly and effectively.\n\nIn my previous [Job Title] position at [Previous Company Name], I [describe a key achievement or responsibility, e.g., assisted 50+ customers daily in various shifts].`,
      conclusion: `For further details of my qualifications, background, and contributions, please take a moment to review my enclosed resume. I believe that I can successfully be the [Job Title] you're seeking and I welcome the opportunity to speak with you at your earliest convenience.\n\nWarm regards,\n\n[Your Name]`
    },
    template2: {
      introduction: `[Your Name]\n\n[Date] [Your Email]\n\n[Your Phone Number]\n\n[Hiring Manager's Name]\n[Company Name]\n[Company Address]\n\nDear [Hiring Manager's Name],\n\nI am applying for a position at [Company Name] because your mission and vision align with my values.`,
      body: `With my focus on [mention your focus] and dedication to efficiently handling [mention key responsibilities], I know I can be a strong asset. Just a few qualities I bring include:\n\n- [Skill 1]\n- [Skill 2]\n- [Skill 3]`,
      conclusion: `You can count on my enthusiasm, high energy, and positive attitude. I would greatly appreciate your review of my enclosed resume and am available for an interview at your convenience.\n\nSincerely,\n\n[Your Name]`
    },
    template3: {
      introduction: `[Your Name]\n\n[Your Email] | [Your Phone Number] | [Your Address]\n\n[Date]\n\n[Hiring Manager's Name], [Job Title]\n[Company Name]\n[Company Address]\n\nDear [Hiring Manager's Name],\n\nI am contacting you to express my interest in the [Job Title] opportunity with [Company Name].`,
      body: `I am a highly results-oriented individual with over [number] years of experience in [field]. I thrive in team settings and enjoy solving [key challenges].\n\n- [Key Quality 1]: [Details]\n- [Key Quality 2]: [Details]\n- [Key Quality 3]: [Details]`,
      conclusion: `I've attached my resume with more information. Thank you for your time, and I look forward to hearing from you.\n\nSincerely,\n\n[Your Name]`
    }
  };

  private currentLetterSubject = new BehaviorSubject<CoverLetter | null>(null);
  currentLetter$ = this.currentLetterSubject.asObservable();

  constructor() {
    // Try to load saved letter from localStorage
    const savedLetter = localStorage.getItem('coverLetter');
    if (savedLetter) {
      this.currentLetterSubject.next(JSON.parse(savedLetter));
    }
  }

  getTemplates(): Record<string, CoverLetterTemplate> {
    return this.templates;
  }

  loadTemplate(templateNumber: number): void {
    const template = this.templates[`template${templateNumber}`];
    if (template) {
      const letter: CoverLetter = {
        template: templateNumber,
        introduction: template.introduction,
        body: template.body,
        conclusion: template.conclusion,
        lastModified: new Date()
      };
      this.currentLetterSubject.next(letter);
    }
  }

  saveCoverLetter(letter: CoverLetter): void {
    letter.lastModified = new Date();
    localStorage.setItem('coverLetter', JSON.stringify(letter));
    this.currentLetterSubject.next(letter);
  }

  exportAsPDF(letter: CoverLetter): void {
    // This is a placeholder for PDF export functionality
    // You would typically use a library like jsPDF here
    const content = `${letter.introduction}\n\n${letter.body}\n\n${letter.conclusion}`;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'cover-letter.txt');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}