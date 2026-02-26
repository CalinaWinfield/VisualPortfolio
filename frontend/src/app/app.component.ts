// src/app/app.component.ts
import { Component, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  template: `
    <header class="site-header">
      <nav class="navbar navbar-expand-lg navbar-light">
        <div class="container">
          <a class="navbar-brand" routerLink="/home">Visual Portfolio</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
              <li class="nav-item">
                <a class="nav-link" routerLink="/home" routerLinkActive="active">Home</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/documents" routerLinkActive="active">Documents</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/cover-letter" routerLinkActive="active">Cover Letter</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/guide" routerLinkActive="active">Guide</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/about" routerLinkActive="active">About</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>

    <!-- IMPORTANT: Only ONE router-outlet, no container wrapper -->
    <router-outlet></router-outlet>
  `,
  styles: [`
    .navbar { margin-bottom: 20px; }
    .nav-link.active { font-weight: bold; color: #007bff !important; }
  `]
})
export class AppComponent implements OnDestroy {
  private sub: Subscription | undefined;

  constructor(private router: Router) {
    this.sub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: NavigationEnd) => {

      // remove all page classes used by global.css
      document.body.classList.remove(
        'index-page',
        'dashboard-page',
        'create-item-page',
        'coverLetter-page',
        'document-page'
      );

      const url = e.urlAfterRedirects || (e as any).url || '/';

      if (url === '/' || url.startsWith('/home')) {
        document.body.classList.add('index-page');
      } else if (url.startsWith('/dashboard')) {
        document.body.classList.add('dashboard-page');
      } else if (url.startsWith('/create-item')) {
        document.body.classList.add('create-item-page');
      } else if (url.startsWith('/cover-letter')) {
        document.body.classList.add('coverLetter-page');
      } else if (url.startsWith('/documents')) {
        document.body.classList.add('document-page');
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}