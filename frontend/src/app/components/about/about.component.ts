import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-about',
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {

  currentYear: number = new Date().getFullYear();

  teamMembers = [
    { name: 'Calina Winfield', role: 'Data Modeler & Documentation Lead' },
    { name: 'Aaron Matthews', role: 'Code Architecture & Lead Programmer' },
    { name: 'Erick Vale', role: 'Testing Lead & Project Manager' },
    { name: 'Whitney Branch', role: 'UI/UX Designer & Client Liaison' }
  ];

  technologies = [
    'Front-end: HTML/CSS, Angular, TypeScript & JavaScript',
    'Database: MongoDB Atlas & Mongoose'
  ];

  client = 'Dr. Anca Doloc-Mihu';

}
