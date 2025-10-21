import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-index-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- your inline HTML here -->
  `,
  styles: [`
    /* your inline CSS here */
  `]
})
export class IndexPageComponent {}