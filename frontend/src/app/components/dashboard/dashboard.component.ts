import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor(private location: Location) {}
  currentYear = new Date().getFullYear();

  sections = {
    documents: false,
    todo: false,
    activeForms: false
  };

  toggleSection(section: 'documents' | 'todo' | 'activeForms') {
    this.sections[section] = !this.sections[section];
  }

  goBack(): void {
    this.location.back();
  }
}