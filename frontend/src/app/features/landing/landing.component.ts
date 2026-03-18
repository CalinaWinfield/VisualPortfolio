import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoginInlineComponent } from '../login-inline/login-inline.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, LoginInlineComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  openLogin() {
    const el = document.getElementById('inlineEmail');
    if (el) (el as HTMLInputElement).focus();
  }
}