// src/app/app.component.ts
import { Component, OnDestroy, HostListener } from '@angular/core';
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

      <a class="navbar-brand d-flex align-items-center" [routerLink]="isLoggedIn ? '/dashboard' : '/home'">
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
          <!-- Admin panel link -->
          <li class="nav-item" *ngIf="isAdmin"><a class="nav-link" routerLink="/admin" routerLinkActive="active">Admin</a></li>
          <li class="nav-item"><a class="nav-link" routerLink="/dashboard" routerLinkActive="active">Dashboard</a></li>
          <li class="nav-item"><a class="nav-link" routerLink="/documents" routerLinkActive="active">Resume Builder</a></li>
          <li class="nav-item"><a class="nav-link" routerLink="/cover-letter" routerLinkActive="active">Cover Letter Builder</a></li>
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
             <p class="footer-copy mb-0">
               &copy; {{ currentYear }}
               Visual Portfolio. All rights reserved.
             </p>
           </div>
         </footer>
       </div>
  `,
})
export class AppComponent implements OnDestroy {
  currentYear: number = new Date().getFullYear();
  showBackButton = false;
  authHistory: string[] = [];
  private navSub?: Subscription;

  constructor(
    private router: Router,
    private location: Location,
    private auth: AuthService 
  ) {
    // Initial state based on current router url
    this.updateBackButton(this.router.url || '');

    this.navSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = (event.urlAfterRedirects || event.url || '').split('?')[0].split('#')[0];
        this.updateBackButton(url);

        if (!this.isLoginRoute(url)) {
          if (this.authHistory.length === 0 || this.authHistory[this.authHistory.length - 1] !== url) {
            this.authHistory.push(url);
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  @HostListener('window:popstate')
  onPopState(forcedPath?: string): void {
    if (this.isLoggedIn) {
      const path = (forcedPath !== undefined ? forcedPath : (window.location.pathname || '')).split('?')[0].split('#')[0];
      if (this.isLoginRoute(path)) {
        const target = this.isAdmin ? '/admin' : '/dashboard';
        this.router.navigate([target], { replaceUrl: true });
      }
    }
  }

  updateBackButton(url: string): void {
    const cleanUrl = (url || '').split('?')[0].split('#')[0];
    const isRootLanding = cleanUrl === '/dashboard' || (cleanUrl === '/admin' && this.isAdmin);
    const isExcludedPage =
      cleanUrl.startsWith('/documents') ||
      cleanUrl.startsWith('/cover-letter') ||
      cleanUrl.startsWith('/guide') ||
      cleanUrl.startsWith('/about');
    this.showBackButton = this.isLoggedIn && !this.isLoginRoute(cleanUrl) && !isRootLanding && !isExcludedPage;
  }

  get isAdmin(): boolean {
    return this.auth.getUserRole() === 'admin';
  }

  goBack(): void {
    if (this.authHistory.length > 1) {
      this.authHistory.pop(); // remove current route
      const prevUrl = this.authHistory.pop(); // remove target route so it can be pushed anew
      if (prevUrl && !this.isLoginRoute(prevUrl)) {
        this.router.navigateByUrl(prevUrl);
        return;
      }
    }
    // Safe landing fallback for authenticated users
    const defaultLanding = this.isAdmin ? '/admin' : '/dashboard';
    this.router.navigate([defaultLanding], { replaceUrl: true });
  }

  get isLoggedIn(): boolean {
    return this.auth?.isLoggedIn ? this.auth.isLoggedIn() : !!localStorage.getItem('accessToken');
  }

  logout(): void {
    this.auth.clear();
    sessionStorage.clear();
    this.authHistory = [];
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  isLoginRoute(route: string): boolean {
    const cleanRoute = (route || '').split('?')[0].split('#')[0];
    return (
      cleanRoute === '' ||
      cleanRoute === '/' ||
      cleanRoute.startsWith('/home') ||
      cleanRoute.startsWith('/login') ||
      cleanRoute.startsWith('/mfa-login') ||
      cleanRoute.startsWith('/enroll-mfa') ||
      cleanRoute.startsWith('/signup')
    );
  }

  get showNavbar(): boolean {
    // Never show or allow access to the navbar on the login/auth screens
    if (this.isLoginRoute(this.router.url)) return false;

    // On other screens, only show navbar if user is logged in
    return this.isLoggedIn;
  }
}
