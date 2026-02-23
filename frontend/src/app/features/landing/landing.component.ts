import { Component } from '@angular/core';
import { LoginInlineComponent } from '../login-inline/login-inline.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [LoginInlineComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'] // optional
})
export class LandingComponent {
  openLogin() {
    // If you later implement a modal, trigger it here.
    // For now, focus on inline login which is visible on the page.
    const el = document.getElementById('inlineEmail');
    if (el) (el as HTMLInputElement).focus();
  }
}