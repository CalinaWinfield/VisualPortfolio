// src/app/app.component.ts
import { Component, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { AuthService } from './auth.service';

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
     <div class="app-shell">

       <header *ngIf="showNavbar" class="site-header">
  <nav class="navbar navbar-expand-lg navbar-light bg-transparent">
    <div class="container-fluid nav-container">

      <a class="navbar-brand d-flex align-items-center" routerLink="/home">
        <img
          src="assets/img/foxIcon.png"
          alt="Visual Portfolio Logo"
          class="logo-img"
        />
        <span class="logo-text">Visual Portfolio</span>
      </a>

      <button class="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <!-- Admin gets both Admin panel and Dashboard -->
          <li class="nav-item" *ngIf="isAdmin"><a class="nav-link" routerLink="/admin" routerLinkActive="active">Admin</a></li>
          <li class="nav-item" *ngIf="isAdmin"><a class="nav-link" routerLink="/dashboard" routerLinkActive="active">Dashboard</a></li>

          <!-- Regular users only get Dashboard -->
          <li class="nav-item" *ngIf="!isAdmin"><a class="nav-link" routerLink="/dashboard" routerLinkActive="active">Dashboard</a></li>
          <li class="nav-item"><a class="nav-link" routerLink="/documents" routerLinkActive="active">Document Builder</a></li>
          <li class="nav-item"><a class="nav-link" routerLink="/guide" routerLinkActive="active">Guide</a></li>
          <li class="nav-item"><a class="nav-link" routerLink="/about" routerLinkActive="active">About</a></li>

          <li class="nav-item" *ngIf="isLoggedIn"><a class="nav-link logout-btn" (click)="logout()">Logout</a></li>
        </ul>
      </div>
    </div>
  </nav>
</header>


<div class="layout">
<button
    *ngIf="showBackButton"
    class="back-btn"
    (click)="goBack()">
    ←
  </button>
      <router-outlet></router-outlet>
    </div>
       <footer class="footer">
           <div class="footer-inner container">
             <p class="footer-copy">
               &copy; {{ currentYear }}
               Visual Portfolio. All rights reserved.
             </p>
           </div>
         </footer>
       </div>
  `,
})

export class AppComponent {
  currentYear: number = new Date().getFullYear();
  showBackButton = false;

  constructor(
    private router: Router,
    private location: Location,
    private auth: AuthService 
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showBackButton = event.urlAfterRedirects !== '/home';
      });
  }

  get isAdmin(): boolean {
    return this.auth.getUserRole() === 'admin';
  }

  goBack() {
    this.location.back();
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  get showNavbar(): boolean {
    const loggedIn = !!localStorage.getItem('accessToken');
    const currentRoute = this.router.url;

    // Hide navbar on login page always
    if (currentRoute.startsWith('/login')) return false;

    // Hide navbar on home page when logged out
    if (!loggedIn && currentRoute.startsWith('/home')) return false;

    return loggedIn;
  }
}
