// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LandingComponent } from './features/landing/landing.component';
import { AboutComponent } from './components/about/about.component';
import { CoverLetterComponent } from './components/cover-letter/cover-letter.component';
import { CreateItemComponent } from './components/create-item/create-item.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DocumentComponent } from './components/document/document.component';
import { GuideComponent } from './components/guide/guide.component';
import { SignUpComponent } from './components/signUp/signUp.component';
import { ItemsListComponent } from './components/create-item/items-list.component';

// ⭐ MFA components
import { MfaEnrollmentComponent } from './components/mfa/mfa-enrollment.component';
import { MfaLoginComponent } from './components/mfa/mfa-login.component';

// ⭐ Guards
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';
import { AdminGuard } from './guards/admin.guard';
import { AdminDashboardComponent } from './components/admin/admin-dashboard.component';

const routes: Routes = [
  // ── Public / Guest Login Routes (blocked if already logged in) ───────────
  { path: '', component: LandingComponent, title: 'Welcome', canActivate: [LoginGuard] },
  { path: 'home', component: LandingComponent, title: 'Home', canActivate: [LoginGuard] },
  { path: 'login', component: LandingComponent, title: 'Login', canActivate: [LoginGuard] },
  { path: 'signup', component: SignUpComponent, title: 'Sign Up', canActivate: [LoginGuard] },
  { path: 'enroll-mfa', component: MfaEnrollmentComponent, title: 'MFA Enrollment', canActivate: [LoginGuard] },
  { path: 'mfa-login', component: MfaLoginComponent, title: 'MFA Login', canActivate: [LoginGuard] },

  // ── Protected Application Routes (strictly require being logged in) ──────
  { path: 'dashboard', component: DashboardComponent, title: 'Dashboard', canActivate: [AuthGuard] },
  { path: 'documents', component: DocumentComponent, title: 'Documents', canActivate: [AuthGuard] },
  { path: 'documents/:id', component: DocumentComponent, canActivate: [AuthGuard] },
  { path: 'cover-letter', component: CoverLetterComponent, title: 'Cover Letter', canActivate: [AuthGuard] },
  { path: 'cover-letter/:id', component: CoverLetterComponent, canActivate: [AuthGuard] },
  { path: 'create-item', component: CreateItemComponent, title: 'Create Item', canActivate: [AuthGuard] },
  { path: 'items', component: ItemsListComponent, title: 'Items', canActivate: [AuthGuard] },
  { path: 'guide', component: GuideComponent, title: 'Guide', canActivate: [AuthGuard] },
  { path: 'about', component: AboutComponent, title: 'About', canActivate: [AuthGuard] },

  // ── Admin route — requires both logged in and admin role ─────────────────
  { path: 'admin', component: AdminDashboardComponent, title: 'Admin', canActivate: [AuthGuard, AdminGuard] },

  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}