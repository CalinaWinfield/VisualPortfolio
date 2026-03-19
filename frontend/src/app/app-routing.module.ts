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

// ⭐ Add this import once you create the component
import { MfaEnrollmentComponent } from './components/mfa/mfa-enrollment.component';

const routes: Routes = [
  { path: '', component: LandingComponent, title: 'Welcome' },
  { path: 'home', component: LandingComponent, title: 'Home' },

  { path: 'about', component: AboutComponent, title: 'About' },
  { path: 'dashboard', component: DashboardComponent, title: 'Dashboard' },
  { path: 'documents', component: DocumentComponent, title: 'Documents' },

  // ⭐ Move MFA route ABOVE dynamic routes
  { path: 'enroll-mfa', component: MfaEnrollmentComponent, title: 'MFA Enrollment' },

  // dynamic route LAST
  { path: 'documents/:id', component: DocumentComponent },

  { path: 'cover-letter', component: CoverLetterComponent, title: 'Cover Letter' },
  { path: 'cover-letter/:id', component: CoverLetterComponent },
  { path: 'create-item', component: CreateItemComponent, title: 'Create Item' },
  { path: 'items', component: ItemsListComponent, title: 'Items' },
  { path: 'guide', component: GuideComponent, title: 'Guide' },
  { path: 'signup', component: SignUpComponent, title: 'Sign Up' },

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