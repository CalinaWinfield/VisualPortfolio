export interface CoverLetterSender {
  firstName: string;
  lastName: string;
  title?: string;
  address: string;
  phone: string;
  email: string;
}

export interface CoverLetterRecipient {
  date: string;
  name: string;
  title: string;
  company: string;
  address: string;
  cityStateZip: string;
  phone?: string;
  email?: string;
}

export interface CoverLetterContent {
  salutation: string;
  intro: string;
  body: string;
  bulletPoints?: string[];
  conclusion: string;
  signOff: string;
  signatureName: string;
}

export interface CoverLetterTemplate {
  name: string;
  layoutKey: 'layout1' | 'layout2' | 'layout3';
  sender: CoverLetterSender;
  recipient: CoverLetterRecipient;
  content: CoverLetterContent;
  // Backwards compatibility properties
  introduction?: string;
  body?: string;
  conclusion?: string;
}

export interface CoverLetter {
  id?: string;
  _id?: string;
  title?: string;
  template: number; // 1, 2, or 3
  sender: CoverLetterSender;
  recipient: CoverLetterRecipient;
  content: CoverLetterContent;
  status: 'in-progress' | 'done';
  docType: 'cover-letter';
  lastModified?: Date;
  // Backwards compatibility properties
  introduction?: string;
  body?: string;
  conclusion?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
}