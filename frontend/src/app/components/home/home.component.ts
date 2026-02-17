import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  template: `
    <div class="home-container">
      <h1>Welcome to Visual Portfolio</h1>
      <p class="lead">Create and manage your professional portfolio with ease</p>
      
      <div class="features-grid">
        <div class="feature-card" (click)="navigate('/documents')">
          <h3>Document Management</h3>
          <p class="feature-sum">Upload and organize your professional documents</p>
        </div>
        
        <div class="feature-card" (click)="navigate('/cover-letter')">
          <h3>Cover Letters</h3>
          <p class="feature-sum">Create and customize cover letters for your applications</p>
        </div>
        
        <div class="feature-card" (click)="navigate('/dashboard')">
          <h3>Portfolio Dashboard</h3>
          <p class="feature-sum">Manage your portfolio items and track your progress</p>
        </div>
        
        <div class="feature-card" (click)="navigate('/guide')">
          <h3>Getting Started</h3>
          <p class="feature-sum">Learn how to make the most of Visual Portfolio</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      text-align: center;
      padding: 2rem;
    }
    
    .lead {
      font-size: 1.25rem;
      margin-bottom: 3rem;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-top: 3rem;
    }
    
    .feature-card {
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .feature-sum {
      color: grey;
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    h3 {
      color: #007bff;
      margin-bottom: 1rem;
    }
  `]
})
export class HomeComponent {
  constructor(private router: Router) {}

  navigate(path: string): void {
    this.router.navigate([path]);
  }
}