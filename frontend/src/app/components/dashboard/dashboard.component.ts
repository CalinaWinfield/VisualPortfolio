import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  currentYear = new Date().getFullYear();

  sections = {
    documents: false,
    todo: false,
    activeForms: false
  };

  toggleSection(section: 'documents' | 'todo' | 'activeForms') {
    this.sections[section] = !this.sections[section];
  }
}