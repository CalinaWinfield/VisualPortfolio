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
    { name: 'Angelica Jones', role: 'UX/UI Design & Project Manager' },
    { name: 'Sebastian Londono', role: 'Data Modeler & Documentation' },
    { name: 'Travis Mounsy', role: 'Programmer & Code Architecture' },
    { name: 'Jordan Laudun', role: 'Testing Lead & Client Liaison' }
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
