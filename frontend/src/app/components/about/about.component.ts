import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
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
}
``