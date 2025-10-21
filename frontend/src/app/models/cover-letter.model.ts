export interface CoverLetterTemplate {
  introduction: string;
  body: string;
  conclusion: string;
}

export interface CoverLetter {
  id?: string;
  template: number;
  introduction: string;
  body: string;
  conclusion: string;
  lastModified: Date;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
}