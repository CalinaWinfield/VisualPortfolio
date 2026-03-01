import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';

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
    { name: 'Whitney Branch', role: 'UX/UI Design & Programmer' },
    { name: 'Calina Winfield', role: 'Data Modeler & Documentation' },
    { name: 'Aaron Matthew', role: 'Programmer & Code Architecture' },
    { name: 'Erick Vale', role: 'Testing Lead & Project Manager' }
  ];
  technologies = [
    'Front-end: Angular',
    'Database: MongoDB'
  ];
  client = 'Dr. Anca Doloc-Mihu';
  constructor(private location: Location) {}
  goBack(): void {
    // Navigate back to the previous page in history. Falls back to root if no history.
    this.location.back();
  }
}
