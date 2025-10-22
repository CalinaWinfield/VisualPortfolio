import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.css']
})
export class GuideComponent {
  constructor(private location: Location) {}
  goBack(): void {
    this.location.back();
  }
  currentYear = new Date().getFullYear();
}