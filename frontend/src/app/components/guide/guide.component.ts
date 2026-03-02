import { Component, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-guide',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.css']
})

export class GuideComponent implements AfterViewInit {
  constructor(private location: Location) {}
  goBack(): void {
    this.location.back();
}
steps = [
  {
    title: 'Login',
    content: 'Use your institutional credentials to access the EasyFolio application.\
              Upon successful login, you will be directed to your personalized Dashboard.',
    open: false
  },
  {
    title: 'Manage Academic Records',
    content: 'From the Dashboard, select Items to create, edit, or organize academic and professional records such as publications, certifications, presentations, and service activities.\
              All records are saved centrally and can be reused across multiple documents.',
    open: false
  },
  {
    title: 'Build Custom Documents',
    content: 'Navigate to Document Builder to assemble tailored documents using your saved records.\
              You may drag and drop components to structure resumes, CVs, or portfolios according to specific institutional or submission requirements.',
    open: false
  },
  {
    title: 'Export Reports',
    content: 'Once finalized, generate and export your customized document in the preferred format for submission, review, or archival purposes.',
    open: false
  },
  {
    title: 'Monitor Progress',
    content: 'Use the following sections to manage ongoing work:\
              Documents Builder – View and edit saved documents.\
              Items – View and edit created items.\
              My Documents – Monitor the status of submitted forms or reports.',
    open: false
  },
  {
    title: 'Log Out',
    content: 'When your session is complete, select Log Out from the top navigation menu to securely exit the application..',
    open: false
  }
];

toggleStep(index: number) {
  this.steps[index].open = !this.steps[index].open;
}

ngAfterViewInit() {
   const items = document.querySelectorAll('.guide-item');

   const observer = new IntersectionObserver(entries => {
     entries.forEach(entry => {
       if (entry.isIntersecting) {
         const element = entry.target as HTMLElement;


         const index = Array.from(items).indexOf(element);

         element.style.transitionDelay = `${index * 120}ms`;

         element.classList.add('reveal');
       }
     });
   }, { threshold: 0.15 });

   items.forEach(item => observer.observe(item));
 }
}
