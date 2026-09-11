import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CoverLetterTemplate, CoverLetter } from '../models/cover-letter.model';

@Injectable({
  providedIn: 'root'
})
export class CoverLetterService {
  private templates: Record<string, CoverLetterTemplate> = {
    template1: {
      name: 'Modern Red Accent',
      layoutKey: 'layout1',
      sender: {
        firstName: 'Nicolas',
        lastName: 'Park',
        address: 'Tucson, AZ 85706',
        phone: '555-555-5555',
        email: 'example@example.com'
      },
      recipient: {
        date: 'May 10, 2022',
        name: 'Susan Silverman',
        title: 'Store Manager',
        company: 'Kmart',
        address: '2489 Parkway Drive',
        cityStateZip: 'Tucson, AZ 85701'
      },
      content: {
        salutation: 'Dear Ms. Silverman,',
        intro: 'While viewing job ads online, I came across your request for a Cashier. I am very interested in this position and wanted to take this opportunity to introduce myself.',
        body: 'I am a fast learner and am skilled at learning new products quickly, processing payments, and assisting customers. I understand the value of time management and am great at getting things done quickly and effectively.\n\nIn my previous cashier position at 7-eleven, I assisted 50+ customers daily in various shifts: morning, afternoon, night, and graveyard. My adaptability allows me to work in many different environments, in addition to speaking with people from various backgrounds.',
        conclusion: "For further details of my qualifications, background, and contributions, please take a moment to review my enclosed resume. I believe that I can successfully be the Cashier you're seeking and I welcome the opportunity to speak with you at your earliest convenience.",
        signOff: 'Warm regards,',
        signatureName: 'Nicolas Park'
      },
      introduction: 'While viewing job ads online, I came across your request for a Cashier.',
      body: 'I am a fast learner and am skilled at learning new products quickly, processing payments, and assisting customers.',
      conclusion: "For further details of my qualifications, background, and contributions, please take a moment to review my enclosed resume."
    },
    template2: {
      name: 'Elegant Framed Serif',
      layoutKey: 'layout2',
      sender: {
        firstName: 'Marissa',
        lastName: 'Ruiz',
        address: 'Albuquerque, NM 87123',
        phone: '555-555-5555',
        email: 'example@example.com'
      },
      recipient: {
        date: 'August 30, 2022',
        name: 'Danny Johnson',
        title: '',
        company: 'Kaiser Permanente',
        address: 'Albuquerque, NM 87122',
        cityStateZip: '',
        phone: '555-555-5555',
        email: 'example@example.com'
      },
      content: {
        salutation: 'Dear Mr. Johnson,',
        intro: "I am applying for a position at Kaiser Permanente because your mission and vision align with my values. As you'll see from my resume, what motivates me is working for organizations, like yours, that serve a higher purpose. I would love to bring my skills and experience to support your cause.",
        body: 'With my focus on patient wellness and dedication to efficiently handling office needs, I know I can be a strong asset to your healthcare team. I love working with patients of all backgrounds and am efficient at building positive connections and trust using my warm nature and excellent communication skills. Just a few of the many qualities and qualifications I will bring to this position include:',
        bulletPoints: [
          'I am knowledgeable in medical billing and coding (ICD & CPT).',
          'I am effective in patient scheduling and coordinating smooth patient flow.',
          'I carefully follow all infection-control protocols when sanitizing rooms and equipment.'
        ],
        conclusion: 'You can count on my enthusiasm, high energy, and positive attitude, as well as my clinical knowledge and administrative expertise.\n\nI would greatly appreciate your review of my enclosed resume and outlined credentials. I believe that I can be a valuable addition to Kaiser Permanente and your business goals. At your convenience, I am available for an interview or further discussion. I look forward to your response.',
        signOff: 'Sincerely,',
        signatureName: 'Marissa Ruiz'
      },
      introduction: 'I am applying for a position at Kaiser Permanente because your mission and vision align with my values.',
      body: 'With my focus on patient wellness and dedication to efficiently handling office needs, I know I can be a strong asset.',
      conclusion: 'I would greatly appreciate your review of my enclosed resume and outlined credentials.'
    },
    template3: {
      name: 'Bold Navy Header',
      layoutKey: 'layout3',
      sender: {
        firstName: 'Evan',
        lastName: 'Rogers',
        address: 'Elk Grove Village, IL 60009',
        phone: '555-555-5555',
        email: 'example@example.com'
      },
      recipient: {
        date: 'August 16, 2022',
        name: 'Irene Clark',
        title: 'Senior Manager',
        company: "Macy's",
        address: '199 Smith Store St.',
        cityStateZip: 'Glenview, 60025'
      },
      content: {
        salutation: 'Dear Ms. Clark,',
        intro: "I am contacting you to express my interest in the Customer Service Representative opportunity with Macy's. After reviewing the position requirements, I believe that my qualifications and educational pursuits are a great fit for the kind of candidate your company is looking for.",
        body: "I am a highly results-oriented individual with over five years of experience in customer service. I thrive in team settings and work efficiently to solve customer problems while remaining cool under pressure. In my previous position at Kohl's, I was awarded the Top CSR Award for two consecutive years in 2020-2021. The qualities which I will bring to your team include:",
        bulletPoints: [
          'Problem-solving: I have a track record of solving all types of customer issues I am faced with in an effective and professional manner by listening and using proven techniques to de-escalate angry customers.',
          'Professional Attitude: As my references will attest, I have a knack for staying positive and upbeat, regardless of the situation.',
          'Communication: I have a true passion for customer service and take pride in making consumers happy. I take pride in providing great recommendations and solutions to maximize client retention.'
        ],
        conclusion: "I've attached my resume with more information about my background. I feel confident that I could make a great contribution as a Customer Service Representative with Macy's. Thank you for your time, and I look forward to hearing from you soon.",
        signOff: 'Sincerely,',
        signatureName: 'Evan Rogers'
      },
      introduction: "I am contacting you to express my interest in the Customer Service Representative opportunity with Macy's.",
      body: 'I am a highly results-oriented individual with over five years of experience in customer service.',
      conclusion: "I've attached my resume with more information about my background. Thank you for your time."
    }
  };

  private currentLetterSubject = new BehaviorSubject<CoverLetter | null>(null);
  currentLetter$ = this.currentLetterSubject.asObservable();

  constructor() {
    const savedLetter = localStorage.getItem('coverLetter');
    if (savedLetter) {
      try {
        this.currentLetterSubject.next(JSON.parse(savedLetter));
      } catch (e) {
        console.error('Error parsing saved cover letter', e);
      }
    }
  }

  getTemplates(): Record<string, CoverLetterTemplate> {
    return this.templates;
  }

  getDefaultLetter(templateNumber: number): CoverLetter {
    const key = `template${templateNumber}`;
    const t = this.templates[key] || this.templates['template1'];
    return {
      title: `${t.name} Cover Letter`,
      template: templateNumber,
      sender: JSON.parse(JSON.stringify(t.sender)),
      recipient: JSON.parse(JSON.stringify(t.recipient)),
      content: JSON.parse(JSON.stringify(t.content)),
      status: 'in-progress',
      docType: 'cover-letter',
      introduction: t.content.intro,
      body: t.content.body,
      conclusion: t.content.conclusion,
      lastModified: new Date()
    };
  }

  loadTemplate(templateNumber: number): void {
    const letter = this.getDefaultLetter(templateNumber);
    this.currentLetterSubject.next(letter);
  }

  saveCoverLetter(letter: CoverLetter): void {
    letter.lastModified = new Date();
    localStorage.setItem('coverLetter', JSON.stringify(letter));
    this.currentLetterSubject.next(letter);
  }

  exportAsPDF(letter: CoverLetter): void {
    const content = `${letter.content?.intro || letter.introduction}\n\n${letter.content?.body || letter.body}\n\n${letter.content?.conclusion || letter.conclusion}`;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'cover-letter.txt');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}